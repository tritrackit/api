"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsArrayOfArrays = exports.IsArrayOfArraysConstraint = void 0;
const class_validator_1 = require("class-validator");
let IsArrayOfArraysConstraint = class IsArrayOfArraysConstraint {
    validate(value, args) {
        if (!Array.isArray(value)) {
            return false;
        }
        for (const innerArray of value) {
            if (!Array.isArray(innerArray)) {
                return false;
            }
            for (const obj of innerArray) {
                if (typeof obj !== "object" || obj === null) {
                    return false;
                }
            }
        }
        return true;
    }
    defaultMessage(args) {
        return `${args.property} must be an array of arrays, where each inner array contains objects.`;
    }
};
IsArrayOfArraysConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], IsArrayOfArraysConstraint);
exports.IsArrayOfArraysConstraint = IsArrayOfArraysConstraint;
function IsArrayOfArrays(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsArrayOfArraysConstraint,
        });
    };
}
exports.IsArrayOfArrays = IsArrayOfArrays;
//# sourceMappingURL=array-constraint.dto.js.map