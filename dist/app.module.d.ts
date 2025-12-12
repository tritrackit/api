import { OnApplicationBootstrap, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { CacheService } from "./services/cache.service";
export declare class AppModule implements NestModule, OnApplicationBootstrap {
    private readonly cache;
    constructor(cache: CacheService);
    configure(consumer: MiddlewareConsumer): void;
    onApplicationBootstrap(): void;
}
