import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
export declare class TypeOrmConfigService implements TypeOrmOptionsFactory {
    static dataSource: DataSource;
    private readonly config;
    createTypeOrmOptions(): TypeOrmModuleOptions;
}
