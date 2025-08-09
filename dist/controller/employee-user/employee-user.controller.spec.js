"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const employee_user_controller_1 = require("./employee-user.controller");
describe("EmployeeUserController", () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [employee_user_controller_1.EmployeeUserController],
        }).compile();
        controller = module.get(employee_user_controller_1.EmployeeUserController);
    });
    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=employee-user.controller.spec.js.map