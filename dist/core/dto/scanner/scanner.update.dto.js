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
exports.UpdateScannerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateScannerDto {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Scanner code must be a string" }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "scannerCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Scanner name must be a string" }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['LOCATION', 'REGISTRATION'],
        description: "Scanner type: LOCATION or REGISTRATION"
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['LOCATION', 'REGISTRATION'], {
        message: "Scanner type must be either 'LOCATION' or 'REGISTRATION'"
    }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "scannerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Location ID must be a string" }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Status ID must be a string" }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Assigned employee user ID must be a string" }),
    __metadata("design:type", String)
], UpdateScannerDto.prototype, "assignedEmployeeUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Active status" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateScannerDto.prototype, "active", void 0);
exports.UpdateScannerDto = UpdateScannerDto;
//# sourceMappingURL=scanner.update.dto.js.map