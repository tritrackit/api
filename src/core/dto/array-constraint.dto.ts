import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

// Custom Validator
@ValidatorConstraint({ async: false })
export class IsArrayOfArraysConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!Array.isArray(value)) {
      return false; // Not an array
    }

    // Check if every element is an array
    for (const innerArray of value) {
      if (!Array.isArray(innerArray)) {
        return false; // Not an array of arrays
      }

      // Check if each element of the inner array is an object
      for (const obj of innerArray) {
        if (typeof obj !== "object" || obj === null) {
          return false; // Not an object
        }
      }
    }

    return true; // Passed all checks
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be an array of arrays, where each inner array contains objects.`;
  }
}

// Decorator
export function IsArrayOfArrays(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayOfArraysConstraint,
    });
  };
}
