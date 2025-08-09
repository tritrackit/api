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
exports.Model = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
const File_1 = require("./File");
const Units_1 = require("./Units");
let Model = class Model {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "ModelId" }),
    __metadata("design:type", String)
], Model.prototype, "modelId", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "SequenceId", default: () => "0" }),
    __metadata("design:type", String)
], Model.prototype, "sequenceId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "ModelName" }),
    __metadata("design:type", String)
], Model.prototype, "modelName", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Description", nullable: true }),
    __metadata("design:type", String)
], Model.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Model.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], Model.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], Model.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.models),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Model.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => File_1.File, (file) => file.models),
    (0, typeorm_1.JoinColumn)([{ name: "ThumbnailFileId", referencedColumnName: "fileId" }]),
    __metadata("design:type", File_1.File)
], Model.prototype, "thumbnailFile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.models2),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Model.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Units_1.Units, (units) => units.model),
    __metadata("design:type", Array)
], Model.prototype, "units", void 0);
Model = __decorate([
    (0, typeorm_1.Index)("Model_ModelName_Active_idx", ["active", "modelName"], { unique: true }),
    (0, typeorm_1.Index)("Model_pkey", ["modelId"], { unique: true }),
    (0, typeorm_1.Entity)("Model", { schema: "dbo" })
], Model);
exports.Model = Model;
//# sourceMappingURL=Model.js.map