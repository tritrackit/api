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
exports.LogsDto = exports.ScannerLogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ScannerLogDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        type: Date,
        description: "The timestamp of the log",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], ScannerLogDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: String,
        description: "The RFID of the scanned item",
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ScannerLogDto.prototype, "rfid", void 0);
exports.ScannerLogDto = ScannerLogDto;
class LogsDto {
    constructor() {
        this.data = [];
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({
        isArray: true,
        type: ScannerLogDto,
        description: "Array of scanner logs",
        example: [
            {
                rfid: "ABC1234567",
                timestamp: "2025-08-06T14:00:00Z",
            },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ScannerLogDto),
    __metadata("design:type", Array)
], LogsDto.prototype, "data", void 0);
exports.LogsDto = LogsDto;
//# sourceMappingURL=unit-logs.dto.js.map