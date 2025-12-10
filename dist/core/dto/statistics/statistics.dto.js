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
exports.StatisticsFilterDto = exports.TimeframeDto = exports.TimeframeType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TimeframeType;
(function (TimeframeType) {
    TimeframeType["DAILY"] = "DAILY";
    TimeframeType["WEEKLY"] = "WEEKLY";
    TimeframeType["MONTHLY"] = "MONTHLY";
    TimeframeType["QUARTERLY"] = "QUARTERLY";
    TimeframeType["YEARLY"] = "YEARLY";
    TimeframeType["CUSTOM"] = "CUSTOM";
})(TimeframeType = exports.TimeframeType || (exports.TimeframeType = {}));
class TimeframeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: TimeframeType,
        default: TimeframeType.DAILY,
        example: TimeframeType.DAILY
    }),
    (0, class_validator_1.IsEnum)(TimeframeType),
    __metadata("design:type", String)
], TimeframeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        example: "2025-12-01",
        description: 'Required only when type is CUSTOM'
    }),
    (0, class_validator_1.ValidateIf)(o => o.type === TimeframeType.CUSTOM),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TimeframeDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        example: "2025-12-31",
        description: 'Required only when type is CUSTOM'
    }),
    (0, class_validator_1.ValidateIf)(o => o.type === TimeframeType.CUSTOM),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TimeframeDto.prototype, "endDate", void 0);
exports.TimeframeDto = TimeframeDto;
class StatisticsFilterDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: TimeframeDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TimeframeDto),
    __metadata("design:type", TimeframeDto)
], StatisticsFilterDto.prototype, "timeframe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        example: ["WAREHOUSE_5"]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StatisticsFilterDto.prototype, "locationIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        example: ["1", "2"]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StatisticsFilterDto.prototype, "modelIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        example: ["DELIVERED", "HOLD"]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StatisticsFilterDto.prototype, "statusNames", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        type: [String],
        example: ["WHITE", "BLACK"]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StatisticsFilterDto.prototype, "colors", void 0);
exports.StatisticsFilterDto = StatisticsFilterDto;
//# sourceMappingURL=statistics.dto.js.map