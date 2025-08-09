import { Module } from "@nestjs/common";
import { ScannerController } from "./scanner.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Scanner } from "src/db/entities/Scanner";
import { ScannerService } from "src/services/scanner.service";
import { FirebaseProviderModule } from "src/core/provider/firebase/firebase-provider.module";

@Module({
  imports: [FirebaseProviderModule, TypeOrmModule.forFeature([Scanner])],
  controllers: [ScannerController],
  providers: [ScannerService],
  exports: [ScannerService],
})
export class ScannerModule {}
