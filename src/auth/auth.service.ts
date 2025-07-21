import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { AssistantInfo } from 'src/assistant-info/entities/assistant-info.entity';
import { RoleDto, UserDto, LoginDto, UpdatePasswordDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidRoles, UserStatus } from './enums';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AssistantInfo)
    private readonly assistantInfoRepository: Repository<AssistantInfo>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: UserDto) {
    try {
      const { password, ...userData } = createUserDto;

      // Hash the password and set default role and status
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        role: ValidRoles.User, // Default role assigned on user creation
        status: UserStatus.Pending, // Default status to pending
      });

      await this.userRepository.save(user);
      delete user.password;

      // Return user data along with JWT token
      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        password: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Revise sus credenciales.');
    }

    // If user is assistant, verify if assigned to a medic
    if (user.role === ValidRoles.Assistant) {
      const assigned = await this.assistantInfoRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['medic'],
      });
      if (!assigned || !assigned.medic) {
        throw new UnauthorizedException('Aún no se le ha asigado un médico.');
      }
    }

    if (user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Usuario inactivo.');
    }

    if (user.role === ValidRoles.User) {
      throw new UnauthorizedException('Usuario sin rol.');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Revise sus credenciales.');
    }

    return {
      id: user.id,
      role: user.role,
      status: user.status,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    // Count total active users
    const totalUsers = await this.userRepository.count();

    const lastPage = Math.ceil(totalUsers / limit);

    const users = await this.userRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { email: 'ASC' },
    });

    return {
      data: users,
      meta: {
        total: totalUsers,
        page,
        lastPage,
      },
    };
  }

  async findAllMedics() {
    // Fetch active medics with userInfo relations
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userInfo', 'userInfo')
      .where('user.status = :status', { status: UserStatus.Active })
      .andWhere('user.role = :role', { role: ValidRoles.Medic })
      .select([
        'user.id',
        'user.email',
        'user.status',
        'user.role',
        'userInfo.firstName',
        'userInfo.lastName',
        'userInfo.dni',
      ])
      .getMany();
  }

  async findAllAssistants() {
    // Fetch active assistants
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: UserStatus.Active })
      .andWhere('user.role = :role', { role: ValidRoles.Assistant })
      .getMany();
  }

  async assignRole(data: RoleDto) {
    const { email, role } = data;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    if (![ValidRoles.Medic, ValidRoles.Assistant].includes(role)) {
      throw new BadRequestException(`Role ${role} is not valid.`);
    }

    if (user.role !== ValidRoles.User) {
      throw new BadRequestException('User already has a role assigned.');
    }

    // Only set status to Active if role is Medic, otherwise keep current status
    const updatedUser = await this.userRepository.preload({
      id: user.id,
      role,
      status: role === ValidRoles.Medic ? UserStatus.Active : user.status,
    });

    await this.userRepository.save(updatedUser);

    return updatedUser;
  }

  async toggleStatus(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado.`);
    }

    user.status = user.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;

    await this.userRepository.save(user);

    return user;
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto): Promise<{ message: string }> {
    const { currentPassword, password: newPassword } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // Verify that the current password is OK
    const isMatchCurrent = await bcrypt.compare(currentPassword, user.password);
    if (!isMatchCurrent) {
      throw new UnauthorizedException('Contraseña actual incorrecta.');
    }

    // Verify that the new password is not the same as the current password
    const isMatchNew = await bcrypt.compare(newPassword, user.password);
    if (isMatchNew) {
      throw new BadRequestException(
        'La nueva contraseña no puede ser igual a la contraseña actual.',
      );
    }

    // Update the password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada exitosamente.' };
  }

  private getJwtToken(payload: JwtPayload) {
    // Generate JWT token with given payload
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    // Handle database errors (e.g. duplicate entries)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Error interno del servidor.');
  }
}
