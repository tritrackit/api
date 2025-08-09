import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

// Custom validation constraint to check if the number is non-negative
@ValidatorConstraint({ name: "isNonNegative", async: false })
export class IsNonNegativeConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return Number(value) >= 0; // Ensures the number is not negative
  }

  defaultMessage(args: ValidationArguments) {
    return `The value must not be negative.`;
  }
}
