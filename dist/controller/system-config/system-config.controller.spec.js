"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const system_config_controller_1 = require("./system-config.controller");
describe('SystemConfigController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [system_config_controller_1.SystemConfigController],
        }).compile();
        controller = module.get(system_config_controller_1.SystemConfigController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=system-config.controller.spec.js.map