"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const statistics_service_1 = require("./statistics.service");
describe('StatisticsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [statistics_service_1.StatisticsService],
        }).compile();
        service = module.get(statistics_service_1.StatisticsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=statistics.service.spec.js.map