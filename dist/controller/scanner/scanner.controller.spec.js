"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const scanner_controller_1 = require("./scanner.controller");
describe("ScannerController", () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [scanner_controller_1.ScannerController],
        }).compile();
        controller = module.get(scanner_controller_1.ScannerController);
    });
    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=scanner.controller.spec.js.map