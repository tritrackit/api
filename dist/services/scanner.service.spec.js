"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const scanner_service_1 = require("./scanner.service");
describe("ScannerService", () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [scanner_service_1.ScannerService],
        }).compile();
        service = module.get(scanner_service_1.ScannerService);
    });
    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=scanner.service.spec.js.map