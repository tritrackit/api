"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        const cloudName = this.config.get("CLOUDINARY_CLOUD_NAME");
        const apiKey = this.config.get("CLOUDINARY_API_KEY");
        const apiSecret = this.config.get("CLOUDINARY_API_SECRET");
        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.warn("Cloudinary configuration is incomplete. File uploads may not work. " +
                "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
        }
        else {
            if (cloudName !== cloudName.toLowerCase()) {
                this.logger.warn(`Cloudinary cloud_name "${cloudName}" contains uppercase letters. ` +
                    `Cloudinary cloud names are case-sensitive and typically lowercase. ` +
                    `Please verify your cloud name in the Cloudinary dashboard.`);
            }
        }
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
        if (cloudName && apiKey && apiSecret) {
            this.logger.log(`Cloudinary initialized for cloud: ${cloudName}`);
        }
    }
    async uploadDataUri(dataUri, fileName, folder) {
        var _a;
        try {
            this.logger.debug('Cloudinary upload attempt', {
                hasDataUri: !!dataUri,
                dataUriLength: dataUri === null || dataUri === void 0 ? void 0 : dataUri.length,
                dataUriPrefix: dataUri === null || dataUri === void 0 ? void 0 : dataUri.substring(0, 100),
                fileName,
                folder
            });
            const options = {
                folder: folder || "models",
                use_filename: !!fileName,
                unique_filename: !fileName,
                overwrite: false,
                resource_type: "auto",
            };
            const result = await cloudinary_1.v2.uploader.upload(dataUri, options);
            this.logger.debug('Cloudinary upload successful', {
                publicId: result.public_id,
                url: result.secure_url
            });
            return {
                fileName,
                publicId: result.public_id,
                secureUrl: result.secure_url,
                bytes: (_a = result.bytes) === null || _a === void 0 ? void 0 : _a.toString(),
                format: result.format,
                width: result.width,
                height: result.height,
            };
        }
        catch (e) {
            const errorMessage = e.message || String(e);
            this.logger.error('Cloudinary upload error', {
                error: errorMessage,
                stack: e.stack,
                dataUriLength: dataUri === null || dataUri === void 0 ? void 0 : dataUri.length,
                fileName,
                cloudName: this.config.get("CLOUDINARY_CLOUD_NAME")
            });
            if (errorMessage.includes("Invalid cloud_name")) {
                throw new common_1.InternalServerErrorException(`Cloudinary upload failed: Invalid cloud_name. ` +
                    `Please check your CLOUDINARY_CLOUD_NAME in environment variables. ` +
                    `Cloud names are case-sensitive and typically lowercase. ` +
                    `Current value: "${this.config.get("CLOUDINARY_CLOUD_NAME")}"`);
            }
            throw new common_1.InternalServerErrorException(`Cloudinary upload failed: ${errorMessage}`);
        }
    }
    async deleteByPublicId(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: "image",
                invalidate: true,
            });
            return { result: result.result };
        }
        catch (e) {
            this.logger.error(`Cloudinary delete error: ${e.message}`, e.stack);
            throw new common_1.InternalServerErrorException("Cloudinary delete failed");
        }
    }
};
CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map