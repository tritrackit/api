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
exports.File = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
const Model_1 = require("./Model");
let File = class File {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "FileId" }),
    __metadata("design:type", String)
], File.prototype, "fileId", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "FileName" }),
    __metadata("design:type", String)
], File.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "PublicId" }),
    __metadata("design:type", String)
], File.prototype, "publicId", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "SecureUrl" }),
    __metadata("design:type", String)
], File.prototype, "secureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "Bytes", nullable: true }),
    __metadata("design:type", String)
], File.prototype, "bytes", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Format", nullable: true }),
    __metadata("design:type", String)
], File.prototype, "format", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "Width", nullable: true }),
    __metadata("design:type", String)
], File.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "Height", nullable: true }),
    __metadata("design:type", String)
], File.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.pictureFile),
    __metadata("design:type", Array)
], File.prototype, "employeeUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Model_1.Model, (model) => model.thumbnailFile),
    __metadata("design:type", Array)
], File.prototype, "models", void 0);
File = __decorate([
    (0, typeorm_1.Index)("pk_files_901578250", ["fileId"], { unique: true }),
    (0, typeorm_1.Entity)("File", { schema: "dbo" })
], File);
exports.File = File;
//# sourceMappingURL=File.js.map