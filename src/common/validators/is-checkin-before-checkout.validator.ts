import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsCheckInBeforeCheckOut', async: false })
export class IsCheckInBeforeCheckOutConstraint
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as { checkIn: string; checkOut: string };
    if (!object.checkIn || !object.checkOut) {
      return false;
    }
    return object.checkIn < object.checkOut;
  }

  defaultMessage(_: ValidationArguments): string {
    return 'checkIn must be earlier than checkOut — they cannot be equal.';
  }
}

export function IsCheckInBeforeCheckOut(validationOptions?: ValidationOptions) {
  return function (object: object, _propertyName: string) {
    registerDecorator({
      name: 'IsCheckInBeforeCheckOut',
      target: object.constructor,
      propertyName: _propertyName,
      options: validationOptions,
      validator: IsCheckInBeforeCheckOutConstraint,
    });
  };
}
