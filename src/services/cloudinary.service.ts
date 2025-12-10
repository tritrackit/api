import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { File } from "src/db/entities/File";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        "Cloudinary configuration is incomplete. File uploads may not work. " +
        "Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables."
      );
    } else {
      if (cloudName !== cloudName.toLowerCase()) {
        this.logger.warn(
          `Cloudinary cloud_name "${cloudName}" contains uppercase letters. ` +
          `Cloudinary cloud names are case-sensitive and typically lowercase. ` +
          `Please verify your cloud name in the Cloudinary dashboard.`
        );
      }
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    if (cloudName && apiKey && apiSecret) {
      this.logger.log(`Cloudinary initialized for cloud: ${cloudName}`);
    }
  }

  async uploadDataUri(dataUri: string, fileName?: string, folder?: string) {
    try {
      this.logger.debug('Cloudinary upload attempt', {
        hasDataUri: !!dataUri,
        dataUriLength: dataUri?.length,
        dataUriPrefix: dataUri?.substring(0, 100),
        fileName,
        folder
      });

      const options: UploadApiOptions = {
        folder: folder || "models",
        use_filename: !!fileName,
        unique_filename: !fileName,
        overwrite: false,
        resource_type: "auto",
      };

      const result = await cloudinary.uploader.upload(dataUri, options);
      
      this.logger.debug('Cloudinary upload successful', {
        publicId: result.public_id,
        url: result.secure_url
      });

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
      const errorMessage = e.message || String(e);
      this.logger.error('Cloudinary upload error', {
        error: errorMessage,
        stack: e.stack,
        dataUriLength: dataUri?.length,
        fileName,
        cloudName: this.config.get<string>("CLOUDINARY_CLOUD_NAME")
      });
      
      if (errorMessage.includes("Invalid cloud_name")) {
        throw new InternalServerErrorException(
          `Cloudinary upload failed: Invalid cloud_name. ` +
          `Please check your CLOUDINARY_CLOUD_NAME in environment variables. ` +
          `Cloud names are case-sensitive and typically lowercase. ` +
          `Current value: "${this.config.get<string>("CLOUDINARY_CLOUD_NAME")}"`
        );
      }
      
      throw new InternalServerErrorException(`Cloudinary upload failed: ${errorMessage}`);
    }
  }

  async deleteByPublicId(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
      return { result: result.result };
    } catch (e) {
      this.logger.error(`Cloudinary delete error: ${e.message}`, e.stack);
      throw new InternalServerErrorException("Cloudinary delete failed");
    }
  }
}