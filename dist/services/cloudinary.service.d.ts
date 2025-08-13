export declare class CloudinaryService {
    constructor();
    uploadDataUri(dataUri: string, fileName?: string, folder?: string): Promise<any>;
    deleteByPublicId(publicId: string): Promise<{
        result: string;
    }>;
}
