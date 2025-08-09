import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { extname } from "path";
import { LOGIN_ERROR_PASSWORD_INCORRECT } from "src/common/constant/auth-error.constant";
import { ROLE_ERROR_NOT_FOUND } from "src/common/constant/role.constant";
import {
  columnDefToTypeORMCondition,
  hash,
  generateIndentityCode,
  compare,
  generateOTP,
  getDate,
} from "src/common/utils/utils";
import {
  ProfileResetPasswordDto,
  UpdateUserPasswordDto,
} from "src/core/dto/auth/reset-password.dto";
import { UpdateProfilePictureDto } from "src/core/dto/employee-user/employee-user-base.dto";
import { CreateEmployeeUserDto } from "src/core/dto/employee-user/employee-user.create.dto";
import {
  UpdateEmployeeUserDto,
  UpdateEmployeeUserProfileDto,
} from "src/core/dto/employee-user/employee-user.update.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository, In } from "typeorm";
import {
  EMPLOYEE_EMAIL_ERROR_USER_DUPLICATE,
  EMPLOYEE_USER_ERROR_USER_DUPLICATE,
  EMPLOYEE_USER_ERROR_USER_NOT_FOUND,
} from "src/common/constant/employee-user-error.constant";
import { Roles } from "src/db/entities/Roles";
import { EmailService } from "./email.service";

@Injectable()
export class EmployeeUserService {
  constructor(
    @InjectRepository(EmployeeUsers)
    private readonly employeeUserRepo: Repository<EmployeeUsers>,
    private emailService: EmailService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);
    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.employeeUserRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          role: true
        },
        skip,
        take,
        order,
      }),
      this.employeeUserRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    return {
      results: results.map((x) => {
        delete x?.password;
        delete x?.refreshToken;
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }),
      total,
    };
  }

  async getByCode(employeeUserCode) {
    const res = await this.employeeUserRepo.findOne({
      where: {
        employeeUserCode,
        active: true,
      },
      relations: {
        role: true,
      },
    });

    if (!res) {
      throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
    }
    delete res?.password;
    delete res?.refreshToken;
    delete res?.createdBy?.password;
    delete res?.createdBy?.refreshToken;
    delete res?.updatedBy?.password;
    delete res?.updatedBy?.refreshToken;
    return res;
  }

  async getById(employeeUserId) {
    const res = await this.employeeUserRepo.findOne({
      where: {
        employeeUserId,
        active: true,
      },
      relations: {
        role: true,
      },
    });

    if (!res) {
      throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
    }
    delete res?.password;
    delete res?.refreshToken;
    delete res?.createdBy?.password;
    delete res?.createdBy?.refreshToken;
    delete res?.updatedBy?.password;
    delete res?.updatedBy?.refreshToken;
    return res;
  }

  async create(dto: CreateEmployeeUserDto, createdByUserId: string) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        try {
          let employeeUser = new EmployeeUsers();
          employeeUser.userName = dto.email;
          employeeUser.email = dto.email;
          employeeUser.contactNo = dto.contactNo;
          employeeUser.password = await hash(dto.password);

          employeeUser.firstName = dto.firstName ?? "";
          employeeUser.lastName = dto.lastName ?? "";

          employeeUser.invitationCode = generateOTP();
          if (dto.roleCode) {
            const access = await entityManager.findOne(Roles, {
              where: {
                roleCode: dto.roleCode,
                active: true,
              },
            });

            if (!access) {
              throw Error(ROLE_ERROR_NOT_FOUND);
            }
            employeeUser.role = access;
          }

          const createdBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: createdByUserId,
              active: true,
            },
          });
          if (!createdBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          employeeUser.createdBy = createdBy;
          employeeUser.dateCreated = await getDate();
          employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
          employeeUser.employeeUserCode = generateIndentityCode(
            employeeUser.employeeUserId
          );
          employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode: employeeUser.employeeUserCode,
              active: true,
            },
            relations: {},
          });
          delete employeeUser.password;
          delete employeeUser.refreshToken;
          const sendEmailResult = await this.emailService.sendEmailVerification(
            employeeUser.email,
            employeeUser.invitationCode
          );
          if (!sendEmailResult) {
            throw new Error("Error sending email verification!");
          }
          delete employeeUser?.password;
          delete employeeUser?.refreshToken;
          delete employeeUser?.createdBy?.password;
          delete employeeUser?.createdBy?.refreshToken;
          delete employeeUser?.updatedBy?.password;
          delete employeeUser?.updatedBy?.refreshToken;
          return employeeUser;
        } catch (ex) {
          if (
            ex.message.includes("duplicate") &&
            ex.message.toLowerCase().includes("username")
          ) {
            throw new HttpException(
              EMPLOYEE_USER_ERROR_USER_DUPLICATE,
              HttpStatus.BAD_REQUEST
            );
          } else if (
            ex.message.includes("duplicate") &&
            ex.message.toLowerCase().includes("email")
          ) {
            throw new HttpException(
              EMPLOYEE_EMAIL_ERROR_USER_DUPLICATE,
              HttpStatus.BAD_REQUEST
            );
          } else {
            throw ex;
          }
        }
      }
    );
  }

  async resendInvitation(employeeUserCode: string) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        let employeeUser = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserCode,
            active: true,
          },
          relations: {},
        });
        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        if (employeeUser.accessGranted) {
          throw new HttpException(
            "Employee user already has access granted!",
            HttpStatus.BAD_REQUEST
          );
        }
        employeeUser.invitationCode = generateOTP();
        employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
        const sendEmailResult = await this.emailService.sendEmailVerification(
          employeeUser.email,
          employeeUser.invitationCode
        );
        if (!sendEmailResult) {
          throw new Error("Error sending email verification!");
        }
        delete employeeUser?.password;
        delete employeeUser?.refreshToken;
        delete employeeUser?.createdBy?.password;
        delete employeeUser?.createdBy?.refreshToken;
        delete employeeUser?.updatedBy?.password;
        delete employeeUser?.updatedBy?.refreshToken;
        return employeeUser;
      }
    );
  }

  async updateProfile(
    employeeUserId: string,
    dto: UpdateEmployeeUserProfileDto
  ) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        let employeeUser = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId,
            active: true,
          },
          relations: {},
        });

        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }

        employeeUser.userName = dto.email;
        employeeUser.email = dto.email;
        employeeUser.contactNo = dto.contactNo;
        employeeUser.firstName = dto.firstName ?? "";
        employeeUser.lastName = dto.lastName ?? "";

        employeeUser.updatedBy = employeeUser;
        employeeUser.lastUpdatedAt = await getDate();
        employeeUser = await entityManager.save(EmployeeUsers, employeeUser);

        employeeUser = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId,
            active: true,
          },
          relations: {},
        });
        delete employeeUser?.password;
        delete employeeUser?.refreshToken;
        delete employeeUser?.createdBy?.password;
        delete employeeUser?.createdBy?.refreshToken;
        delete employeeUser?.updatedBy?.password;
        delete employeeUser?.updatedBy?.refreshToken;
        return employeeUser;
      }
    );
  }

  async update(
    employeeUserCode,
    dto: UpdateEmployeeUserDto,
    updatedByUserId: string
  ) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        try {
          let employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode,
              active: true,
            },
            relations: {},
          });

          if (!employeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }

          employeeUser.userName = dto.email;
          employeeUser.email = dto.email;
          employeeUser.contactNo = dto.contactNo;
          employeeUser.firstName = dto.firstName;
          employeeUser.lastName = dto.lastName;
          if (dto.roleCode) {
            const role = await entityManager.findOne(Roles, {
              where: {
                roleCode: dto.roleCode,
                active: true,
              },
            });

            if (!role) {
              throw Error(ROLE_ERROR_NOT_FOUND);
            }
            employeeUser.role = role;
          }
          employeeUser.accessGranted = true;
          employeeUser.lastUpdatedAt = await getDate();
          const updatedBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: updatedByUserId,
              active: true,
            },
          });
          if (!updatedBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          employeeUser.updatedBy = updatedBy;
          employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode,
              active: true,
            },
            relations: {},
          });
          delete employeeUser?.password;
          delete employeeUser?.refreshToken;
          delete employeeUser?.createdBy?.password;
          delete employeeUser?.createdBy?.refreshToken;
          delete employeeUser?.updatedBy?.password;
          delete employeeUser?.updatedBy?.refreshToken;
          return employeeUser;
        } catch (ex) {
          if (ex.message.includes("duplicate")) {
            throw new HttpException(
              EMPLOYEE_USER_ERROR_USER_DUPLICATE,
              HttpStatus.BAD_REQUEST
            );
          } else {
            throw ex;
          }
        }
      }
    );
  }

  async delete(employeeUserCode, updatedByUserId) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        let employeeUser = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserCode,
            active: true,
          },
          relations: {},
        });

        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }

        employeeUser.active = false;
        employeeUser.lastUpdatedAt = await getDate();
        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        employeeUser.updatedBy = updatedBy;
        employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
        delete employeeUser?.password;
        delete employeeUser?.refreshToken;
        delete employeeUser?.createdBy?.password;
        delete employeeUser?.createdBy?.refreshToken;
        delete employeeUser?.updatedBy?.password;
        delete employeeUser?.updatedBy?.refreshToken;
        return employeeUser;
      }
    );
  }
}
