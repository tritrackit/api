import { ConfigService } from "@nestjs/config";
export declare class CloudinaryService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    uploadDataUri(dataUri: string, fileName?: string, folder?: string): Promise<any>;
    deleteByPublicId(publicId: string): Promise<{
        result: string;
    }>;
}
