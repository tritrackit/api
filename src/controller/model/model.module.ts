import { Module } from "@nestjs/common";
import { ModelController } from "./model.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Model } from "src/db/entities/Model";
import { ModelService } from "src/services/model.service";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";

@Module({
  imports: [FirebaseProviderModule, TypeOrmModule.forFeature([Model])],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
