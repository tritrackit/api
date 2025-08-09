import * as admin from "firebase-admin";
import { ConfigService } from "@nestjs/config";
export declare class FirebaseProvider {
    private readonly config;
    app: admin.app.App;
    constructor(config: ConfigService);
}
