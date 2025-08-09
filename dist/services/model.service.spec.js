"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const model_service_1 = require("./model.service");
describe('ModelService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [model_service_1.ModelService],
        }).compile();
        service = module.get(model_service_1.ModelService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=model.service.spec.js.map