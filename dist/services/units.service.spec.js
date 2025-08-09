"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const units_service_1 = require("./units.service");
describe("UnitsService", () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [units_service_1.UnitsService],
        }).compile();
        service = module.get(units_service_1.UnitsService);
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=units.service.spec.js.map