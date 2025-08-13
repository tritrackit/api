// src/common/cache/cache.module.ts
import { Global, Module } from "@nestjs/common";
import { CacheService } from "src/services/cache.service";

@Global()
@Module({
  providers: [CacheService], // one singleton
  exports: [CacheService],
})
export class CacheModule {}
