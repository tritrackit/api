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
exports.UnitLogs = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
const Locations_1 = require("./Locations");
const Status_1 = require("./Status");
const Units_1 = require("./Units");
let UnitLogs = class UnitLogs {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "bigint", name: "UnitLogId" }),
    __metadata("design:type", String)
], UnitLogs.prototype, "unitLogId", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "Timestamp",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], UnitLogs.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.unitLogs),
    (0, typeorm_1.JoinColumn)([
        { name: "EmployeeUserId", referencedColumnName: "employeeUserId" },
    ]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], UnitLogs.prototype, "employeeUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Locations_1.Locations, (locations) => locations.unitLogs),
    (0, typeorm_1.JoinColumn)([{ name: "LocationId", referencedColumnName: "locationId" }]),
    __metadata("design:type", Locations_1.Locations)
], UnitLogs.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Status_1.Status, (status) => status.unitLogs),
    (0, typeorm_1.JoinColumn)([{ name: "PrevStatusId", referencedColumnName: "statusId" }]),
    __metadata("design:type", Status_1.Status)
], UnitLogs.prototype, "prevStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Status_1.Status, (status) => status.unitLogs2),
    (0, typeorm_1.JoinColumn)([{ name: "StatusId", referencedColumnName: "statusId" }]),
    __metadata("design:type", Status_1.Status)
], UnitLogs.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Units_1.Units, (units) => units.unitLogs),
    (0, typeorm_1.JoinColumn)([{ name: "UnitId", referencedColumnName: "unitId" }]),
    __metadata("design:type", Units_1.Units)
], UnitLogs.prototype, "unit", void 0);
UnitLogs = __decorate([
    (0, typeorm_1.Index)("UnitLogs_pkey", ["unitLogId"], { unique: true }),
    (0, typeorm_1.Entity)("UnitLogs", { schema: "dbo" })
], UnitLogs);
exports.UnitLogs = UnitLogs;
//# sourceMappingURL=UnitLogs.js.map