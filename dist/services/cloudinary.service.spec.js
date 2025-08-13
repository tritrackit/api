"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const cloudinary_service_1 = require("./cloudinary.service");
describe('CloudinaryService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [cloudinary_service_1.CloudinaryService],
        }).compile();
        service = module.get(cloudinary_service_1.CloudinaryService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=cloudinary.service.spec.js.map