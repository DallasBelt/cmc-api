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
import { RoleDto, UserDto, LoginDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ValidRoles } from './interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dtos';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: UserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        role: ValidRoles.user, // Default role
      });
      await this.userRepository.save(user);
      delete user.password;
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
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        errorCode: 'USER_INACTIVE',
        message: 'Usuario inactivo.',
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException({
        errorCode: 'BAD_CREDENTIALS',
        message: 'Credenciales incorrectas.',
      });
    }

    return {
      id: user.id,
      role: user.role,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.userRepository.count({
      where: { isActive: true },
    });

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.userRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  async findAllMedics() {
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userInfo', 'userInfo')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.role = :role', { role: ValidRoles.medic })
      .select([
        'user.id',
        'user.email',
        'user.isActive',
        'user.role',
        'userInfo.firstName',
        'userInfo.lastName',
        'userInfo.dni',
      ])
      .getMany();
  }

  async findAllAssistants() {
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.role = :role', { role: ValidRoles.assistant })
      .getMany();
  }

  async changeRole(data: RoleDto) {
    const { email, role } = data;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `No se encontró el usuario con email: ${email}`,
      );
    }

    if (![ValidRoles.medic, ValidRoles.assistant].includes(role)) {
      throw new NotFoundException(`El rol ${role} no es válido.`);
    }

    const userUpdated = await this.userRepository.preload({
      id: user.id,
      role,
    });

    await this.userRepository.save(userUpdated);
    return userUpdated;
  }

  async softDelete(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado.`);
    }

    const userUpdate = await this.userRepository.preload({
      id: user.id,
      isActive: !user.isActive,
    });

    await this.userRepository.save(userUpdate);
    return userUpdate;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado.`);
    }

    await this.userRepository.remove(user);
    return { message: `El usuario ${user.email} fue eliminado.` };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado. Ver logs.');
  }
}
