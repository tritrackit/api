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
exports.Status = void 0;
const typeorm_1 = require("typeorm");
const Scanner_1 = require("./Scanner");
const UnitLogs_1 = require("./UnitLogs");
const Units_1 = require("./Units");
let Status = class Status {
};
__decorate([
    (0, typeorm_1.Column)("bigint", { primary: true, name: "StatusId" }),
    __metadata("design:type", String)
], Status.prototype, "statusId", void 0);
__decorate([
    (0, typeorm_1.Column)("character varying", { name: "Name" }),
    __metadata("design:type", String)
], Status.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Scanner_1.Scanner, (scanner) => scanner.status),
    __metadata("design:type", Array)
], Status.prototype, "scanners", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnitLogs_1.UnitLogs, (unitLogs) => unitLogs.prevStatus),
    __metadata("design:type", Array)
], Status.prototype, "unitLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => UnitLogs_1.UnitLogs, (unitLogs) => unitLogs.status),
    __metadata("design:type", Array)
], Status.prototype, "unitLogs2", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Units_1.Units, (units) => units.status),
    __metadata("design:type", Array)
], Status.prototype, "units", void 0);
Status = __decorate([
    (0, typeorm_1.Index)("Status_pkey", ["statusId"], { unique: true }),
    (0, typeorm_1.Entity)("Status", { schema: "dbo" })
], Status);
exports.Status = Status;
//# sourceMappingURL=Status.js.map