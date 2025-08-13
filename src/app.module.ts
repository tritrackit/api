import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./db/typeorm/typeorm.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./controller/auth/auth.module";
import * as Joi from "@hapi/joi";
import { getEnvPath } from "./common/utils/utils";
import { RoleModule } from "./controller/role/role.module";
import { EmployeeUserModule } from "./controller/employee-user/employee-user.module";
import { ModelModule } from "./controller/model/model.module";
import { ScannerModule } from "./controller/scanner/scanner.module";
import { LocationsModule } from "./controller/locations/locations.module";
import { UnitsModule } from "./controller/unit/units.module";
import { CacheService } from "./services/cache.service";
import { CacheModule } from "./core/cache/cache.module";
const envFilePath: string = getEnvPath(`${__dirname}/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
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
    CacheModule
  ],
  providers: [AppService, CacheService],
  controllers: [],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly cache: CacheService) {}
  onApplicationBootstrap() {
    if (process.env.NODE_ENV !== "production") {
      // this.cache.flushAll();
    }
  }
}
