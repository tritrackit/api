"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const email_service_1 = require("./email.service");
describe('EmailService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [email_service_1.EmailService],
        }).compile();
        service = module.get(email_service_1.EmailService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=email.service.spec.js.map