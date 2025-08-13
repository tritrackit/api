import { OnApplicationBootstrap } from "@nestjs/common";
import { CacheService } from "./services/cache.service";
export declare class AppModule implements OnApplicationBootstrap {
    private readonly cache;
    constructor(cache: CacheService);
    onApplicationBootstrap(): void;
}
