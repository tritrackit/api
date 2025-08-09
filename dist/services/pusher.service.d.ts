import { ConfigService } from "@nestjs/config";
export declare class PusherService {
    private readonly config;
    pusher: any;
    constructor(config: ConfigService);
    trigger(channel: any, event: any, data: any): void;
    reSync(type: string, data: any): Promise<void>;
    sendTriggerRegister(userId: string, data: any): Promise<void>;
}
