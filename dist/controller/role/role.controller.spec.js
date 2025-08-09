"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const role_controller_1 = require("./role.controller");
describe("RoleController", () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [role_controller_1.RoleController],
        }).compile();
        controller = module.get(role_controller_1.RoleController);
    });
    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=role.controller.spec.js.map