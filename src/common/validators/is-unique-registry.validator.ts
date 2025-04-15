import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { InjectRepository } from '@nestjs/typeorm';
import { MedicInfo } from 'src/medic-info/entities/medic-info.entity';
import { Repository } from 'typeorm';

@ValidatorConstraint({ async: true })
export class IsUniqueRegistryConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(MedicInfo)
    private readonly medicInfoRepository: Repository<MedicInfo>,
  ) {}

  async validate(
    registry: string,
    _args: ValidationArguments,
  ): Promise<boolean> {
    const existing = await this.medicInfoRepository.findOne({
      where: { registry },
    });
    return !existing;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Registry already exists. Please choose a different one.';
  }
}

export function IsUniqueRegistry(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueRegistryConstraint,
    });
  };
}
