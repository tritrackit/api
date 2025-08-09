import { Module } from "@nestjs/common";
import { UnitsController } from "./units.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Units } from "src/db/entities/Units";
import { UnitsService } from "src/services/units.service";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { PusherService } from "src/services/pusher.service";

@Module({
  imports: [FirebaseProviderModule, TypeOrmModule.forFeature([Units])],
  controllers: [UnitsController],
  providers: [UnitsService, PusherService],
  exports: [UnitsService, PusherService],
})
export class UnitsModule {}
