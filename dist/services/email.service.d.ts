import { ConfigService } from "@nestjs/config";
export declare class EmailService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    sendEmailVerification(recipient: any, otp: any): Promise<boolean>;
    sendResetPasswordOtp(recipient: any, userCode: any, otp: any): Promise<boolean>;
}
