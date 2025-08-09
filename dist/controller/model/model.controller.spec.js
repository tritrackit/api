"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const model_controller_1 = require("./model.controller");
describe("ModelController", () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [model_controller_1.ModelController],
        }).compile();
        controller = module.get(model_controller_1.ModelController);
    });
    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=model.controller.spec.js.map