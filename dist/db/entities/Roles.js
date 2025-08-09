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
exports.Roles = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
let Roles = class Roles {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "RoleId" }),
    __metadata("design:type", String)
], Roles.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "RoleCode", nullable: true }),
    __metadata("design:type", String)
], Roles.prototype, "roleCode", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Name" }),
    __metadata("design:type", String)
], Roles.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { name: "AccessPages", default: [] }),
    __metadata("design:type", Object)
], Roles.prototype, "accessPages", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "DateCreated",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Roles.prototype, "dateCreated", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", { name: "LastUpdatedAt", nullable: true }),
    __metadata("design:type", Date)
], Roles.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)("boolean", { name: "Active", default: () => "true" }),
    __metadata("design:type", Boolean)
], Roles.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.role),
    __metadata("design:type", Array)
], Roles.prototype, "employeeUsers", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.roles),
    (0, typeorm_1.JoinColumn)([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Roles.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.roles2),
    (0, typeorm_1.JoinColumn)([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], Roles.prototype, "updatedBy", void 0);
Roles = __decorate([
    (0, typeorm_1.Index)("Role_Name_Active_idx", ["active", "name"], { unique: true }),
    (0, typeorm_1.Index)("Role_pkey", ["roleId"], { unique: true }),
    (0, typeorm_1.Entity)("Roles", { schema: "dbo" })
], Roles);
exports.Roles = Roles;
//# sourceMappingURL=Roles.js.map