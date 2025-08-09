import { ApiResponseModel } from "src/core/models/api-response.model";
import { SystemConfig } from "src/db/entities/SystemConfig";
import { SystemConfigService } from "src/services/system-config.service";
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    getAll(): Promise<ApiResponseModel<SystemConfig[]>>;
    save(dto: {
        key: string;
        value: string;
    }): Promise<ApiResponseModel<SystemConfig[]>>;
}
