import { ConfigService } from "@nestjs/config";
import { SystemConfig } from "src/db/entities/SystemConfig";
import { Repository } from "typeorm";
export declare class SystemConfigService {
    private readonly systemConfigRepo;
    private readonly config;
    constructor(systemConfigRepo: Repository<SystemConfig>, config: ConfigService);
    getAll(): Promise<SystemConfig[]>;
    save({ key, value }: {
        key: any;
        value: any;
    }): Promise<SystemConfig[]>;
}
