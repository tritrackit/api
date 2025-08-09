import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, Inject } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Roles } from "../entities/Roles";
import { SystemConfig } from "../entities/SystemConfig";
import { EmployeeUsers } from "../entities/EmployeeUsers";
import { EmployeeUserActivityLogs } from "../entities/EmployeeUserActivityLogs";
import { Locations } from "../entities/Locations";
import { Model } from "../entities/Model";
import { Scanner } from "../entities/Scanner";
import { UnitLogs } from "../entities/UnitLogs";
import { Units } from "../entities/Units";
import { Status } from "../entities/Status";
import { File } from "../entities/File";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  static dataSource: DataSource; // ✅ add this

  @Inject(ConfigService)
  private readonly config: ConfigService;

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    const ssl = this.config.get<string>("SSL");
    const config: TypeOrmModuleOptions = {
      type: "postgres",
      host: this.config.get<string>("DATABASE_HOST"),
      port: Number(this.config.get<number>("DATABASE_PORT")),
      database: this.config.get<string>("DATABASE_NAME"),
      username: this.config.get<string>("DATABASE_USER"),
      password: this.config.get<string>("DATABASE_PASSWORD"),
      entities: [
        EmployeeUsers,
        Roles,
        SystemConfig,
        File,
        EmployeeUserActivityLogs,
        Locations,
        Model,
        Scanner,
        Status,
        UnitLogs,
        Units,
      ],
      synchronize: false, // never use TRUE in production!
      ssl: ssl.toLocaleLowerCase().includes("true"),
      extra: {
        timezone: "UTC", // or use "UTC" if you prefer UTC normalization
      },
    };
    if (config.ssl) {
      config.extra.ssl = {
        require: true,
        rejectUnauthorized: false,
      };
    }
    return config;
  }
}
