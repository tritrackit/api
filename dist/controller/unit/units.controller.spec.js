"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const units_controller_1 = require("./units.controller");
describe("UnitsController", () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [units_controller_1.UnitsController],
        }).compile();
        controller = module.get(units_controller_1.UnitsController);
    });
    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=units.controller.spec.js.map