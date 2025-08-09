"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const employee_user_service_1 = require("./employee-user.service");
describe("EmployeeUserService", () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [employee_user_service_1.EmployeeUserService],
        }).compile();
        service = module.get(employee_user_service_1.EmployeeUserService);
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=employee-user.service.spec.js.map