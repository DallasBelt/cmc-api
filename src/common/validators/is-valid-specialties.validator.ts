import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { specialties } from 'src/constants/specialties';

@ValidatorConstraint({ async: false })
export class IsValidSpecialtiesConstraint
  implements ValidatorConstraintInterface
{
  validate(values: string[], _args: ValidationArguments): boolean {
    const validIds = specialties.map((s) => s.id);
    return values.every((val) => validIds.includes(val));
  }

  defaultMessage(): string {
    return 'One or more specialties are invalid.';
  }
}

export function IsValidSpecialties(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidSpecialtiesConstraint,
    });
  };
}
