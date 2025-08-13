import { File } from "src/db/entities/File";
export declare class CloudinaryService {
    constructor();
    uploadDataUri(dataUri: string, fileName?: string, folder?: string): Promise<File>;
    deleteByPublicId(publicId: string): Promise<{
        result: string;
    }>;
}
