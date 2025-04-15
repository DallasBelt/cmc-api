import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidTimeSlot', async: false })
export class IsValidTimeSlotConstraint implements ValidatorConstraintInterface {
  validate(time: string, args: ValidationArguments): boolean {
    const isCheckIn = args.property === 'checkIn';
    const allowedHours = isCheckIn
      ? { min: 6, max: 19 } // 06:00 a 19:00
      : { min: 7, max: 20 }; // 07:00 a 20:00

    const match = /^([01]\d|2[0-3]):(00|30)$/.exec(time);
    if (!match) return false;

    const hour = parseInt(match[1], 10);
    return hour >= allowedHours.min && hour <= allowedHours.max;
  }

  defaultMessage(args: ValidationArguments): string {
    const isCheckIn = args.property === 'checkIn';
    const [start, end] = isCheckIn ? ['06:00', '19:00'] : ['07:00', '20:00'];
    return `${args.property} must be in 30-minute intervals between ${start} and ${end}.`;
  }
}

export function IsValidTimeSlot(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidTimeSlot',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidTimeSlotConstraint,
    });
  };
}
