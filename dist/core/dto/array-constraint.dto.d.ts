import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from "class-validator";
export declare class IsArrayOfArraysConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsArrayOfArrays(validationOptions?: ValidationOptions): (object: any, propertyName: string) => void;
