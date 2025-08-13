"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cache_service_1 = require("./cache.service");
describe('CacheService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [cache_service_1.CacheService],
        }).compile();
        service = module.get(cache_service_1.CacheService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=cache.service.spec.js.map