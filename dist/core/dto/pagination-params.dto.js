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
exports.PaginationParamsDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PaginationParamsDto {
    constructor() {
        this.order = {};
        this.columnDef = [];
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        default: 10,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumberString)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        return obj[key].toString();
    }),
    __metadata("design:type", String)
], PaginationParamsDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        default: 0,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumberString)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        return obj[key].toString();
    }),
    __metadata("design:type", String)
], PaginationParamsDto.prototype, "pageIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({}),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], PaginationParamsDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        isArray: true,
        default: [],
        description: "An array of arrays containing arbitrary objects.",
    }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], PaginationParamsDto.prototype, "columnDef", void 0);
exports.PaginationParamsDto = PaginationParamsDto;
//# sourceMappingURL=pagination-params.dto.js.map