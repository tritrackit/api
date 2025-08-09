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
exports.EmployeeUserActivityLogs = void 0;
const typeorm_1 = require("typeorm");
const EmployeeUsers_1 = require("./EmployeeUsers");
let EmployeeUserActivityLogs = class EmployeeUserActivityLogs {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        type: "integer",
        name: "EmployeeUserActivityLogId",
    }),
    __metadata("design:type", Number)
], EmployeeUserActivityLogs.prototype, "employeeUserActivityLogId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Action", nullable: true, length: 255 }),
    __metadata("design:type", String)
], EmployeeUserActivityLogs.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)("timestamp with time zone", {
        name: "Timestamp",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], EmployeeUserActivityLogs.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmployeeUsers_1.EmployeeUsers, (employeeUsers) => employeeUsers.employeeUserActivityLogs),
    (0, typeorm_1.JoinColumn)([
        { name: "EmployeeUserId", referencedColumnName: "employeeUserId" },
    ]),
    __metadata("design:type", EmployeeUsers_1.EmployeeUsers)
], EmployeeUserActivityLogs.prototype, "employeeUser", void 0);
EmployeeUserActivityLogs = __decorate([
    (0, typeorm_1.Index)("EmployeeUserActivityLogs_pkey", ["employeeUserActivityLogId"], {
        unique: true,
    }),
    (0, typeorm_1.Entity)("EmployeeUserActivityLogs", { schema: "dbo" })
], EmployeeUserActivityLogs);
exports.EmployeeUserActivityLogs = EmployeeUserActivityLogs;
//# sourceMappingURL=EmployeeUserActivityLogs.js.map