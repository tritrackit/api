import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { File } from "src/db/entities/File";

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async uploadDataUri(dataUri: string, fileName?: string, folder?: string) {
    try {
      const options: UploadApiOptions = {
        folder: folder || "models",
        use_filename: !!fileName,
        unique_filename: !fileName,
        overwrite: false,
        resource_type: "image",
      };

      const result = await cloudinary.uploader.upload(dataUri, options);

      return {
        fileName,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        bytes: result.bytes?.toString(),
        format: result.format,
        width: result.width,
        height: result.height,
      } as any;
    } catch (e) {
      throw new InternalServerErrorException("Cloudinary upload failed");
    }
  }

  async deleteByPublicId(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
      return { result: result.result }; // 'ok', 'not found', etc.
    } catch (e) {
      throw new InternalServerErrorException("Cloudinary delete failed");
    }
  }
}
