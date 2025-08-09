"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLocationsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DefaultLocationsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Must start with an uppercase letter or number. Can only include letters, numbers, underscore (_) or dash (-). No spaces. Max 15 characters.",
        example: "A1_MainBranch",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(15, { message: "locationCode must not exceed 15 characters" }),
    (0, class_validator_1.MinLength)(3, { message: "locationCode must be at least 3 characters" }),
    (0, class_validator_1.Matches)(/^(?=.{1,15}$)([A-Z][A-Za-z0-9_-]*|[0-9][A-Za-z0-9_-]*)$/, {
        message: "locationCode must start with an uppercase letter or a number, and only contain letters, numbers, underscore (_) or dash (-) with no spaces, max 15 characters",
    }),
    __metadata("design:type", String)
], DefaultLocationsDto.prototype, "locationCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DefaultLocationsDto.prototype, "name", void 0);
exports.DefaultLocationsDto = DefaultLocationsDto;
//# sourceMappingURL=locations-base.dto.js.map