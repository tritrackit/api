import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
declare const RefreshTokenStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    private readonly config;
    constructor(config: ConfigService);
    validate(req: any, payload: any): any;
}
export {};
