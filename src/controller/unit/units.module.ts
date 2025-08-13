import { Module } from "@nestjs/common";
import { UnitsController } from "./units.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Units } from "src/db/entities/Units";
import { UnitsService } from "src/services/units.service";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";
import { PusherService } from "src/services/pusher.service";
import { ApiKeyScannerGuard } from "src/core/auth/api-key-scanner.guard";
import { ScannerService } from "src/services/scanner.service";
import { Scanner } from "src/db/entities/Scanner";

@Module({
  imports: [FirebaseProviderModule, TypeOrmModule.forFeature([Units, Scanner])],
  controllers: [UnitsController],
  providers: [UnitsService, PusherService, ScannerService, ApiKeyScannerGuard],
  exports: [UnitsService, PusherService],
})
export class UnitsModule {}
