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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });
    }
    async uploadDataUri(dataUri, fileName, folder) {
        var _a;
        try {
            const options = {
                folder: folder || "models",
                use_filename: !!fileName,
                unique_filename: !fileName,
                overwrite: false,
                resource_type: "image",
            };
            const result = await cloudinary_1.v2.uploader.upload(dataUri, options);
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
            throw new common_1.InternalServerErrorException("Cloudinary upload failed");
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
            throw new common_1.InternalServerErrorException("Cloudinary delete failed");
        }
    }
};
CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map