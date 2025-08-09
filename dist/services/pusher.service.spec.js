"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pusher_service_1 = require("./pusher.service");
describe('PusherService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [pusher_service_1.PusherService],
        }).compile();
        service = module.get(pusher_service_1.PusherService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=pusher.service.spec.js.map