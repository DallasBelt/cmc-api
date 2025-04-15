import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidDaysConstraint implements ValidatorConstraintInterface {
  validate(days: string[]): boolean {
    const validDays = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    return days.every((day) => validDays.includes(day.toLowerCase()));
  }

  defaultMessage(): string {
    return "Days must be one of: 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', or 'sunday'.";
  }
}

export function IsValidDays(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDaysConstraint,
    });
  };
}
