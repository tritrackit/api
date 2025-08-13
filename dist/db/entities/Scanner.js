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
exports.Scanner = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
const Locations_1 = require("./Locations");
const Status_1 = require("./Status");
let Scanner = class Scanner {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "ScannerId" }),
    __metadata("design:type", String)
], Scanner.prototype, "scannerId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "ScannerCode" }),
    __metadata("design:type", String)
], Scanner.prototype, "scannerCode", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Name" }),
    __metadata("design:type", String)
], Scanner.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", { name: "LocationId" }),
    __metadata("design:type", String)
], Scanner.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Scanner.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], Scanner.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], Scanner.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.scanners),
    (0, typeorm_1.JoinColumn)([
        { name: "AssignedEmployeeUserId", referencedColumnName: "employeeUserId" },
    ]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Scanner.prototype, "assignedEmployeeUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.scanners2),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Scanner.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Locations_1.Locations, (locations) => locations.scanners),
    (0, typeorm_1.JoinColumn)([{ name: "LocationId", referencedColumnName: "locationId" }]),
    __metadata("design:type", Locations_1.Locations)
], Scanner.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Status_1.Status, (status) => status.scanners),
    (0, typeorm_1.JoinColumn)([{ name: "StatusId", referencedColumnName: "statusId" }]),
    __metadata("design:type", Status_1.Status)
], Scanner.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.scanners3),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Scanner.prototype, "updatedBy", void 0);
Scanner = __decorate([
    (0, typeorm_1.Index)("Scanner_Name_LocationId_Active_idx", ["active", "locationId", "name"], {
        unique: true,
    }),
    (0, typeorm_1.Index)("Scanner_Name_Active_idx", ["active", "name"], { unique: true }),
    (0, typeorm_1.Index)("Scanner_ScannerCode_Active_idx", ["active", "scannerCode"], {
        unique: true,
    }),
    (0, typeorm_1.Index)("Scanner_pkey", ["scannerId"], { unique: true }),
    (0, typeorm_1.Entity)("Scanner", { schema: "dbo" })
], Scanner);
exports.Scanner = Scanner;
//# sourceMappingURL=Scanner.js.map