"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const system_config_service_1 = require("./system-config.service");
describe('SystemConfigService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [system_config_service_1.SystemConfigService],
        }).compile();
        service = module.get(system_config_service_1.SystemConfigService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=system-config.service.spec.js.map