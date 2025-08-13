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
var EmployeeUsers_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeUsers = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUserActivityLogs_1 = require("./EmployeeUserActivityLogs");
const File_1 = require("./File");
const Roles_1 = require("./Roles");
const Locations_1 = require("./Locations");
const Model_1 = require("./Model");
const Scanner_1 = require("./Scanner");
const UnitLogs_1 = require("./UnitLogs");
const Units_1 = require("./Units");
let EmployeeUsers = EmployeeUsers_1 = class EmployeeUsers {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "EmployeeUserId" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "employeeUserId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "EmployeeUserCode", nullable: true }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "employeeUserCode", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "UserName" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Password" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "FirstName" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "LastName" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Email" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "ContactNo" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "contactNo", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "AccessGranted", default: () => "false" }),
    __metadata("design:type", Boolean)
], EmployeeUsers.prototype, "accessGranted", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { name: "InvitationCode" }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "invitationCode", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], EmployeeUsers.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], EmployeeUsers.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "RefreshToken", nullable: true }),
    __metadata("design:type", String)
], EmployeeUsers.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "HasActiveSession", default: () => "false" }),
    __metadata("design:type", Boolean)
], EmployeeUsers.prototype, "hasActiveSession", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], EmployeeUsers.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmployeeUserActivityLogs_1.EmployeeUserActivityLogs, (employeeUserActivityLogs) => employeeUserActivityLogs.employeeUser),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "employeeUserActivityLogs", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1, (employeeUsers) => employeeUsers.employeeUsers),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers)
], EmployeeUsers.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmployeeUsers_1, (employeeUsers) => employeeUsers.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "employeeUsers", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => File_1.File, (file) => file.employeeUsers),
    (0, typeorm_1.JoinColumn)([{ name: "PictureFileId", referencedColumnName: "fileId" }]),
    __metadata("design:type", File_1.File)
], EmployeeUsers.prototype, "pictureFile", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Roles_1.Roles, (roles) => roles.employeeUsers),
    (0, typeorm_1.JoinColumn)([{ name: "RoleId", referencedColumnName: "roleId" }]),
    __metadata("design:type", Roles_1.Roles)
], EmployeeUsers.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1, (employeeUsers) => employeeUsers.employeeUsers2),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers)
], EmployeeUsers.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmployeeUsers_1, (employeeUsers) => employeeUsers.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "employeeUsers2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Locations_1.Locations, (locations) => locations.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "locations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Locations_1.Locations, (locations) => locations.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "locations2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Model_1.Model, (model) => model.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "models", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Model_1.Model, (model) => model.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "models2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Roles_1.Roles, (roles) => roles.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Roles_1.Roles, (roles) => roles.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "roles2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Scanner_1.Scanner, (scanner) => scanner.assignedEmployeeUser),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "scanners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Scanner_1.Scanner, (scanner) => scanner.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "scanners2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Scanner_1.Scanner, (scanner) => scanner.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "scanners3", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnitLogs_1.UnitLogs, (unitLogs) => unitLogs.employeeUser),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "unitLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Units_1.Units, (units) => units.createdBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "units", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Units_1.Units, (units) => units.updatedBy),
    __metadata("design:type", Array)
], EmployeeUsers.prototype, "units2", void 0);
EmployeeUsers = EmployeeUsers_1 = __decorate([
    (0, typeorm_1.Index)("EmployeeUsers_UserName_Active_idx", ["active", "userName"], {
        unique: true,
    }),
    (0, typeorm_1.Index)("EmployeeUsers_Email_Active_idx", ["active", "email"], { unique: true }),
    (0, typeorm_1.Index)("EmployeeUsers_pkey", ["employeeUserId"], { unique: true }),
    (0, typeorm_1.Entity)("EmployeeUsers", { schema: "dbo" })
], EmployeeUsers);
exports.EmployeeUsers = EmployeeUsers;
//# sourceMappingURL=EmployeeUsers.js.map