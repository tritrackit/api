import { Module } from "@nestjs/common";
import { EmployeeUserController } from "./employee-user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeUserService } from "src/services/employee-user.service";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { EmailService } from "src/services/email.service";
import { CloudinaryService } from "src/services/cloudinary.service";

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeUsers])],
  controllers: [EmployeeUserController],
  providers: [EmployeeUserService, EmailService, CloudinaryService],
  exports: [EmployeeUserService, EmailService],
})
export class EmployeeUserModule {}
