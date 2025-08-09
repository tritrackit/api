"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseProvider = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const config_1 = require("@nestjs/config");
let FirebaseProvider = class FirebaseProvider {
    constructor(config) {
        this.config = config;
        const firebaseConfig = {
            type: this.config.get("FIREBASE_TYPE"),
            projectId: this.config.get("FIREBASE_PROJECT_ID"),
            privateKeyId: this.config.get("FIREBASE_PRIVATE_KEY_ID"),
            privateKey: this.config
                .get("FIREBASE_PRIVATE_KEY")
                .split(String.raw `\n`)
                .join("\n"),
            clientEmail: this.config.get("FIREBASE_CLIENT_EMAIL"),
            clientId: this.config.get("FIREBASE_CLIENT_ID"),
            authUri: this.config.get("FIREBASE_AUTH_URI"),
            tokenUri: this.config.get("FIREBASE_TOKEN_URI"),
            authProviderX509CertUrl: this.config.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
            clientC509CertUrl: this.config.get("FIREBASE_CLIENT_X509_CERT_URL"),
        };
        this.app = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            storageBucket: this.config.get("FIREBASE_BUCKET"),
        });
    }
};
FirebaseProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseProvider);
exports.FirebaseProvider = FirebaseProvider;
//# sourceMappingURL=firebase-provider.js.map