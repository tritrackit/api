import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
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
import { Repository, In, ILike } from "typeorm";
import {
  EMPLOYEE_EMAIL_ERROR_USER_DUPLICATE,
  EMPLOYEE_USER_ERROR_USER_DUPLICATE,
  EMPLOYEE_USER_ERROR_USER_NOT_FOUND,
} from "src/common/constant/employee-user-error.constant";
import { Roles } from "src/db/entities/Roles";
import { EmailService } from "./email.service";
import { CloudinaryService } from "./cloudinary.service";
import { File } from "src/db/entities/File";
import { CacheService } from "./cache.service";
import { CacheKeys } from "src/common/constant/cache.constant";
// 🔥 FIX: Removed unused 'last' import from rxjs

@Injectable()
export class EmployeeUserService {
  private readonly logger = new Logger(EmployeeUserService.name);

  constructor(
    @InjectRepository(EmployeeUsers)
    private readonly employeeUserRepo: Repository<EmployeeUsers>,
    private readonly emailService: EmailService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.employeeUsers.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{
      results: EmployeeUsers[];
      total: number;
    }>(key);
    if (cached) return cached;
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const nameFilter = (columnDef as any[]).find(
      (x) => x.apiNotation === "name"
    );
    const condition = columnDefToTypeORMCondition(columnDef);
    if (nameFilter) {
      delete condition["name"];
    }

    // Build WHERE condition
    let whereCondition: any;
    if (nameFilter) {
      // OR condition for firstName and lastName
      whereCondition = [
        {
          ...condition,
          active: true,
          firstName: ILike(`%${nameFilter?.filter ?? ""}%`),
        },
        {
          ...condition,
          active: true,
          lastName: ILike(`%${nameFilter?.filter ?? ""}%`),
        },
        {
          ...condition,
          active: true,
          firstName:
            nameFilter?.filter?.length > 0
              ? ILike(`%${nameFilter?.filter.split(" ")[0] ?? ""}%`)
              : ILike(`%${nameFilter?.filter ?? ""}%`)
        },
        {
          ...condition,
          active: true,
          lastName:
            nameFilter?.filter?.length > 0
              ? ILike(`%${nameFilter?.filter.split(" ")[0] ?? ""}%`)
              : ILike(`%${nameFilter?.filter ?? ""}%`)
        },
      ];
    } else {
      whereCondition = {
        ...condition,
        active: true,
      };
    }

    const [results, total] = await Promise.all([
      this.employeeUserRepo.find({
        where: whereCondition,
        relations: {
          role: true,
        },
        skip,
        take,
        order,
      }),
      this.employeeUserRepo.count({
        where: whereCondition,
      }),
    ]);

    const response = {
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
    this.cacheService.set(key, response);
    return response;
  }

  async getByCode(employeeUserCode) {
    const key = CacheKeys.employeeUsers.byCode(employeeUserCode);
    const cached = this.cacheService.get<EmployeeUsers>(key);
    if (cached) return cached;

    const res = await this.employeeUserRepo.findOne({
      where: {
        employeeUserCode,
        active: true,
      },
      relations: {
        role: true,
        createdBy: true,
        updatedBy: true,
        pictureFile: true,
      },
    });

    if (!res) {
      throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
    }
    this.cacheService.set(key, res);
    const response = {
      ...res,
    };
    delete response?.password;
    delete response?.refreshToken;
    delete response?.createdBy?.password;
    delete response?.createdBy?.refreshToken;
    delete response?.updatedBy?.password;
    delete response?.updatedBy?.refreshToken;
    return response;
  }

  async getById(employeeUserId) {
    const key = CacheKeys.employeeUsers.byId(employeeUserId);
    const cached = this.cacheService.get<EmployeeUsers>(key);
    if (cached) return cached;
    const res = await this.employeeUserRepo.findOne({
      where: {
        employeeUserId,
        active: true,
      },
      relations: {
        role: true,
        createdBy: true,
        updatedBy: true,
        pictureFile: true,
      },
    });

    if (!res) {
      throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
    }
    this.cacheService.set(key, res);
    const response = {
      ...res,
    };
    delete response?.password;
    delete response?.refreshToken;
    delete response?.createdBy?.password;
    delete response?.createdBy?.refreshToken;
    delete response?.updatedBy?.password;
    delete response?.updatedBy?.refreshToken;
    return response;
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

          // Generate OTP and hash it before storing (similar to password)
          const plainOTP = generateOTP();
          employeeUser.invitationCode = await hash(plainOTP);
          if (dto.roleCode) {
            const roleKey = CacheKeys.roles.byCode(dto.roleCode);
            let role = this.cacheService.get<Roles>(roleKey);
            if (!role) {
              role = await entityManager.findOne(Roles, {
                where: {
                  roleCode: dto.roleCode,
                  active: true,
                },
                relations: {
                  createdBy: true,
                  updatedBy: true,
                },
              });
              this.cacheService.set(roleKey, role);
            }

            if (!role) {
              throw Error(ROLE_ERROR_NOT_FOUND);
            }
            employeeUser.role = role;
          }

          const createdByKey = CacheKeys.employeeUsers.byId(createdByUserId);
          let createdBy = this.cacheService.get<EmployeeUsers>(createdByKey);
          if (!createdBy) {
            createdBy = await entityManager.findOne(EmployeeUsers, {
              where: {
                employeeUserId: createdByUserId,
                active: true,
              },
              relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
              },
            });
            this.cacheService.set(createdByKey, createdBy);
          }
          if (!createdBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          employeeUser.createdBy = createdBy;
          employeeUser.createdBy = {
            ...createdBy,
          };
          employeeUser.createdBy.createdBy;
          employeeUser.createdBy.updatedBy;
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
          // Pass plain OTP to email service (it will hash it for the URL)
          const sendEmailResult = await this.emailService.sendEmailVerification(
            employeeUser.email,
            plainOTP
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
          this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
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
        const employeeUserKey =
          CacheKeys.employeeUsers.byCode(employeeUserCode);
        let employeeUser =
          this.cacheService.get<EmployeeUsers>(employeeUserKey);
        if (!employeeUser) {
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
        }
        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        if (employeeUser.accessGranted) {
          throw new HttpException(
            "Employee user already has access granted!",
            HttpStatus.BAD_REQUEST
          );
        }
        // Generate OTP and hash it before storing (similar to password)
        const plainOTP = generateOTP();
        employeeUser.invitationCode = await hash(plainOTP);
        employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
        // Pass plain OTP to email service (it will hash it for the URL)
        const sendEmailResult = await this.emailService.sendEmailVerification(
          employeeUser.email,
          plainOTP
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
        this.cacheService.del(
          CacheKeys.employeeUsers.byId(employeeUser?.employeeUserId)
        );
        this.cacheService.del(
          CacheKeys.employeeUsers.byCode(employeeUser?.employeeUserCode)
        );
        this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
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
        const employeeUserKey = CacheKeys.employeeUsers.byId(employeeUserId);
        let employeeUser =
          this.cacheService.get<EmployeeUsers>(employeeUserKey);
        if (!employeeUser) {
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
        }
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
        let uploaded: File | undefined;
        if (dto.pictureFile) {
          if (employeeUser.pictureFile) {
            try {
              await this.cloudinaryService.deleteByPublicId(
                employeeUser.pictureFile?.publicId
              );
            } catch (ex) {
              this.logger.warn(`Failed to delete old picture file: ${ex.message}`, ex.stack);
            }
          }
          uploaded = await this.cloudinaryService.uploadDataUri(
            dto.pictureFile.data,
            dto.pictureFile.fileName,
            "model"
          );
        }
        if (uploaded) {
          uploaded.fileId = employeeUser.pictureFile?.fileId;
          employeeUser.pictureFile = await entityManager.save(File, uploaded);
        }
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
        this.cacheService.del(
          CacheKeys.employeeUsers.byId(employeeUser?.employeeUserId)
        );
        this.cacheService.del(
          CacheKeys.employeeUsers.byCode(employeeUser?.employeeUserCode)
        );
        this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
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
          const employeeUserKey =
            CacheKeys.employeeUsers.byCode(employeeUserCode);
          let employeeUser =
            this.cacheService.get<EmployeeUsers>(employeeUserKey);
          if (!employeeUser) {
            employeeUser = await entityManager.findOne(EmployeeUsers, {
              where: {
                employeeUserCode,
                active: true,
              },
              relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
              },
            });
          }

          if (!employeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }

          employeeUser.userName = dto.email;
          employeeUser.email = dto.email;
          employeeUser.contactNo = dto.contactNo;
          employeeUser.firstName = dto.firstName;
          employeeUser.lastName = dto.lastName;
          if (dto.roleCode) {
            const roleKey = CacheKeys.roles.byCode(dto.roleCode);
            let role = this.cacheService.get<Roles>(roleKey);
            if (!role) {
              role = await entityManager.findOne(Roles, {
                where: {
                  roleCode: dto.roleCode,
                  active: true,
                },
                relations: {
                  createdBy: true,
                  updatedBy: true,
                },
              });
              this.cacheService.set(roleKey, role);
            }

            if (!role) {
              throw Error(ROLE_ERROR_NOT_FOUND);
            }
            employeeUser.role = role;
          }
          employeeUser.accessGranted = true;
          employeeUser.lastUpdatedAt = await getDate();
          const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
          let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
          if (!updatedBy) {
            updatedBy = await entityManager.findOne(EmployeeUsers, {
              where: {
                employeeUserId: updatedByUserId,
                active: true,
              },
              relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
              },
            });
            this.cacheService.set(updatedByKey, updatedBy);
          }
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
          this.cacheService.del(
            CacheKeys.employeeUsers.byId(employeeUser?.employeeUserId)
          );
          this.cacheService.del(
            CacheKeys.employeeUsers.byCode(employeeUser?.employeeUserCode)
          );
          this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
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
        const employeeUserKey =
          CacheKeys.employeeUsers.byCode(employeeUserCode);
        let employeeUser =
          this.cacheService.get<EmployeeUsers>(employeeUserKey);
        if (!employeeUser) {
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
        }

        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }

        employeeUser.active = false;
        employeeUser.lastUpdatedAt = await getDate();
        const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
        let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
        if (!updatedBy) {
          updatedBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: updatedByUserId,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
          this.cacheService.set(updatedByKey, updatedBy);
        }
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
        this.cacheService.del(
          CacheKeys.employeeUsers.byId(employeeUser?.employeeUserId)
        );
        this.cacheService.del(
          CacheKeys.employeeUsers.byCode(employeeUser?.employeeUserCode)
        );
        this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
        return employeeUser;
      }
    );
  }

  async updatePassword(employeeUserCode, password, updatedByUserId) {
    return await this.employeeUserRepo.manager.transaction(
      async (entityManager) => {
        const employeeUserKey =
          CacheKeys.employeeUsers.byCode(employeeUserCode);
        let employeeUser =
          this.cacheService.get<EmployeeUsers>(employeeUserKey);
        if (!employeeUser) {
          employeeUser = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserCode,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
        }

        if (!employeeUser) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }

        employeeUser.lastUpdatedAt = await getDate();
        employeeUser.password = await hash(password);
        const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
        let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
        if (!updatedBy) {
          updatedBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: updatedByUserId,
              active: true,
            },
            relations: {
              role: true,
              createdBy: true,
              updatedBy: true,
              pictureFile: true,
            },
          });
          this.cacheService.set(updatedByKey, updatedBy);
        }
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        employeeUser.updatedBy = updatedBy;
        employeeUser = await entityManager.save(EmployeeUsers, employeeUser);
        delete employeeUser.createdBy;
        delete employeeUser.updatedBy;
        delete employeeUser.password;
        this.cacheService.del(
          CacheKeys.employeeUsers.byId(employeeUser?.employeeUserId)
        );
        this.cacheService.del(
          CacheKeys.employeeUsers.byCode(employeeUser?.employeeUserCode)
        );
        this.cacheService.delByPrefix(CacheKeys.employeeUsers.prefix);
        return employeeUser;
      }
    );
  }
}
