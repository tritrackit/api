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
exports.Units = void 0;
const typeorm_1 = require("typeorm");
const UnitLogs_1 = require("./UnitLogs");
const EmployeeUsers_1 = require("./EmployeeUsers");
const Locations_1 = require("./Locations");
const Model_1 = require("./Model");
const Status_1 = require("./Status");
let Units = class Units {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "UnitId" }),
    __metadata("design:type", String)
], Units.prototype, "unitId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "UnitCode", nullable: true }),
    __metadata("design:type", String)
], Units.prototype, "unitCode", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "RFID" }),
    __metadata("design:type", String)
], Units.prototype, "rfid", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "ChassisNo" }),
    __metadata("design:type", String)
], Units.prototype, "chassisNo", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "ModelId" }),
    __metadata("design:type", String)
], Units.prototype, "modelId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Color" }),
    __metadata("design:type", String)
], Units.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "Description" }),
    __metadata("design:type", String)
], Units.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Units.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], Units.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], Units.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnitLogs_1.UnitLogs, (unitLogs) => unitLogs.unit),
    __metadata("design:type", Array)
], Units.prototype, "unitLogs", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.units),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Units.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Locations_1.Locations, (locations) => locations.units),
    (0, typeorm_1.JoinColumn)([{ name: "LocationId", referencedColumnName: "locationId" }]),
    __metadata("design:type", Locations_1.Locations)
], Units.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Model_1.Model, (model) => model.units),
    (0, typeorm_1.JoinColumn)([{ name: "ModelId", referencedColumnName: "modelId" }]),
    __metadata("design:type", Model_1.Model)
], Units.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Status_1.Status, (status) => status.units),
    (0, typeorm_1.JoinColumn)([{ name: "StatusId", referencedColumnName: "statusId" }]),
    __metadata("design:type", Status_1.Status)
], Units.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.units2),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Units.prototype, "updatedBy", void 0);
Units = __decorate([
    (0, typeorm_1.Index)("Units_ModelId_Active_idx", ["active", "modelId"], { unique: true }),
    (0, typeorm_1.Index)("Units_RFID_Active_idx", ["active", "rfid"], { unique: true }),
    (0, typeorm_1.Index)("Units_pkey", ["unitId"], { unique: true }),
    (0, typeorm_1.Entity)("Units", { schema: "dbo" })
], Units);
exports.Units = Units;
//# sourceMappingURL=Units.js.map