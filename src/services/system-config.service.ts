import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { SystemConfig } from "src/db/entities/SystemConfig";
import { Repository } from "typeorm";
import { File } from "src/db/entities/File";
import { v4 as uuid } from "uuid";
import { extname } from "path";
import moment from "moment";

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepo: Repository<SystemConfig>,
    private readonly config: ConfigService
  ) {}

  async getAll() {
    const results = await this.systemConfigRepo.find();

    const keys = [
      "MAXIM_LOCATION_SERVICE_URL",
      "MAXIM_LOCATION_SERVICE_API_KEY",
    ];
    const values = keys.map((key) => {
      return {
        key,
        value: this.config.get<string>(key),
      };
    });
    return [...results, ...values];
  }
  async save({ key, value }) {
    return await this.systemConfigRepo.manager.transaction(
      async (entityManager) => {
        const systemConfig = await entityManager.findOne(SystemConfig, {
          where: { key },
        });

        if (!systemConfig) {
          throw new Error("No system config found");
        }

        systemConfig.value = value;
        await entityManager.save(SystemConfig, systemConfig);

        return await entityManager.find(SystemConfig);
      }
    );
  }
}
