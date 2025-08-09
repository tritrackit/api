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
exports.Locations = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
const Scanner_1 = require("./Scanner");
const UnitLogs_1 = require("./UnitLogs");
const Units_1 = require("./Units");
let Locations = class Locations {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "LocationId" }),
    __metadata("design:type", String)
], Locations.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "LocationCode" }),
    __metadata("design:type", String)
], Locations.prototype, "locationCode", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Name" }),
    __metadata("design:type", String)
], Locations.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Locations.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], Locations.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], Locations.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.locations),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Locations.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.locations2),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Locations.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Scanner_1.Scanner, (scanner) => scanner.location),
    __metadata("design:type", Array)
], Locations.prototype, "scanners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnitLogs_1.UnitLogs, (unitLogs) => unitLogs.location),
    __metadata("design:type", Array)
], Locations.prototype, "unitLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Units_1.Units, (units) => units.location),
    __metadata("design:type", Array)
], Locations.prototype, "units", void 0);
Locations = __decorate([
    (0, typeorm_1.Index)("Locations_Name_Active_idx", ["active", "name"], { unique: true }),
    (0, typeorm_1.Index)("Locations_pkey", ["locationId"], { unique: true }),
    (0, typeorm_1.Entity)("Locations", { schema: "dbo" })
], Locations);
exports.Locations = Locations;
//# sourceMappingURL=Locations.js.map