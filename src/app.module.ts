import { Module, OnApplicationBootstrap, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./db/typeorm/typeorm.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./controller/auth/auth.module";
import { getEnvPath } from "./common/utils/utils";
import { RoleModule } from "./controller/role/role.module";
import { EmployeeUserModule } from "./controller/employee-user/employee-user.module";
import { ModelModule } from "./controller/model/model.module";
import { ScannerModule } from "./controller/scanner/scanner.module";
import { LocationsModule } from "./controller/locations/locations.module";
import { UnitsModule } from "./controller/unit/units.module";
import { StatisticsModule } from "./controller/statistics/statistics.module";
import { CacheService } from "./services/cache.service";
import { CacheModule } from "./core/cache/cache.module";
import { PerformanceMiddleware } from "./core/middleware/performance.middleware";
import { RfidGateway } from "./gateways/rfid.gateway";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `envs/${process.env.NODE_ENV || 'development'}.env`,
        'envs/.env',
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    EmployeeUserModule,
    RoleModule,
    ModelModule,
    ScannerModule,
    LocationsModule,
    UnitsModule,
    StatisticsModule,
    CacheModule
  ],
  providers: [AppService, CacheService, RfidGateway],
  controllers: [],
})
export class AppModule implements NestModule, OnApplicationBootstrap {
  constructor(private readonly cache: CacheService) {}
  
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PerformanceMiddleware)
      .forRoutes('units');
  }
  
  onApplicationBootstrap() {
    if (process.env.NODE_ENV !== "production") {
    }
  }
}
