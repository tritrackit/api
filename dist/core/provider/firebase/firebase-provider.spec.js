"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const firebase_provider_1 = require("./firebase-provider");
describe("FirebaseProvider", () => {
    let provider;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [firebase_provider_1.FirebaseProvider],
        }).compile();
        provider = module.get(firebase_provider_1.FirebaseProvider);
    });
    it("should be defined", () => {
        expect(provider).toBeDefined();
    });
});
//# sourceMappingURL=firebase-provider.spec.js.map