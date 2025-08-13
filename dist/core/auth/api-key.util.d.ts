export declare function generateScannerApiKey(): {
    raw: string;
    prefix: string;
    hash: string;
};
export declare function sha256Base64(s: string): string;
export declare function tryExtractPrefix(raw: string): string;
