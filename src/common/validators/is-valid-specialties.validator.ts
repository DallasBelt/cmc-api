import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { specialties } from 'src/constants/specialties';

@ValidatorConstraint({ async: false })
export class IsValidSpecialtiesConstraint implements ValidatorConstraintInterface {
  validate(value: string, _args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    const validIds = specialties.map((s) => s.id);
    return validIds.includes(value);
  }

  defaultMessage(): string {
    return 'Invalid specialty.';
  }
}

export function IsValidSpecialties(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidSpecialtiesConstraint,
    });
  };
}
