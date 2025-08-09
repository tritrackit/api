import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as fs from "fs";
import * as path from "path";
import {
  compare,
  generateIndentityCode,
  generateOTP,
  getFullName,
  hash,
  getDate
} from "src/common/utils/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, In, Repository } from "typeorm";
import moment from "moment";
import {
  LOGIN_ERROR_PASSWORD_INCORRECT,
  LOGIN_ERROR_PENDING_ACCESS_REQUEST,
  LOGIN_ERROR_USER_NOT_FOUND,
  VERFICATION_ERROR_CODE_INCORRECT,
} from "src/common/constant/auth-error.constant";
import { RegisterCustomerUserDto } from "src/core/dto/auth/register.dto";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import e from "express";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmployeeUsers)
    private readonly employeeUserRepo: Repository<EmployeeUsers>,
    private emailService: EmailService,
    private jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  async getUserByCredentials({ userName, password }) {
    try {
      const employeeUser = await this.employeeUserRepo.findOne({
        where: {
          userName,
          active: true,
        },
        relations: {
          role: true,
        },
      });
      if (!employeeUser) {
        throw Error(LOGIN_ERROR_USER_NOT_FOUND);
      }

      const passwordMatch = await compare(employeeUser.password, password);
      if (!passwordMatch) {
        throw Error(LOGIN_ERROR_PASSWORD_INCORRECT);
      }
      if (!employeeUser.accessGranted) {
        throw Error(LOGIN_ERROR_PENDING_ACCESS_REQUEST);
      }

      const { accessToken, refreshToken } = await this.issueTokens(
        employeeUser.employeeUserId,
        employeeUser.email
      );
      delete employeeUser.password;
      delete employeeUser.invitationCode;
      return {
        ...employeeUser,
        accessToken,
        refreshToken,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async verify({ email, hashCode }) {
    try {
      const employeeUser = await this.employeeUserRepo.findOne({
        where: {
          email: email,
          active: true,
        },
      });
      if (!employeeUser) {
        throw Error(LOGIN_ERROR_USER_NOT_FOUND);
      }
      if (employeeUser.accessGranted) {
        throw Error("The user has already been granted access!");
      }
      const codeMatch = await compare(hashCode, employeeUser.invitationCode);
      if (!codeMatch) {
        throw Error(VERFICATION_ERROR_CODE_INCORRECT);
      }
      employeeUser.accessGranted = true;
      await this.employeeUserRepo.save(employeeUser);
      return employeeUser;
    } catch (ex) {
      throw ex;
    }
  }

  async refresh(employeeUserId: string, refreshToken: string) {
    const employeeUser = await this.employeeUserRepo.findOne({
      where: {
        employeeUserId,
        active: true,
      },
      relations: {
        role: true,
      },
    });
    if (!employeeUser || employeeUser.refreshToken !== refreshToken) {
      throw new ForbiddenException("Invalid token");
    }
    return await this.issueTokens(
      employeeUser.employeeUserId,
      employeeUser.email
    );
  }

  async issueTokens(employeeUserId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: employeeUserId, email },
      { secret: this.config.get<string>("ACCESS_SECRET"), expiresIn: "15m" }
    );
    const refreshToken = this.jwtService.sign(
      { sub: employeeUserId },
      { secret: this.config.get<string>("REFRESH_SECRET"), expiresIn: "7d" }
    );

    const employeeUser = await this.employeeUserRepo.findOne({
      where: {
        employeeUserId,
        active: true,
      },
      relations: {
        role: true,
      },
    });
    if (!employeeUser) {
      throw new ForbiddenException("User not found");
    }
    employeeUser.updatedBy = employeeUser; // Assuming the user is updating their own session
    employeeUser.lastUpdatedAt = await getDate();
    employeeUser.refreshToken = refreshToken;
    await this.employeeUserRepo.save(employeeUser);
    return { accessToken, refreshToken };
  }
}
