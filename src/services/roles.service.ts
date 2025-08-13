import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EMPLOYEE_USER_ERROR_USER_NOT_FOUND } from "src/common/constant/employee-user-error.constant";
import {
  ROLE_ERROR_DUPLICATE,
  ROLE_ERROR_NOT_FOUND,
} from "src/common/constant/role.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
  getDate,
} from "src/common/utils/utils";
import { CreateRoleDto } from "src/core/dto/roles/roles.create.dto";
import { UpdateRoleDto } from "src/core/dto/roles/roles.update.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Roles } from "src/db/entities/Roles";
import { Repository } from "typeorm";
import { CacheService } from "./cache.service";
import { CacheKeys } from "src/common/constant/cache.constant";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Roles)
    private readonly roleRepo: Repository<Roles>,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.roles.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{ results: Roles[]; total: number }>(
      key
    );
    if (cached) return cached;

    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.roleRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          createdBy: true,
          updatedBy: true,
        },
        skip,
        take,
        order,
      }),
      this.roleRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    const response = {
      results: results.map((x) => {
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

  async getByCode(roleCode) {
    const key = CacheKeys.roles.byCode(roleCode);
    const cached = this.cacheService.get<Roles>(key);
    if (cached) return cached;
    const result = await this.roleRepo.findOne({
      select: {
        roleId: true,
        roleCode: true,
        name: true,
        accessPages: true,
      } as any,
      where: {
        roleCode,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
    if (!result) {
      throw Error(ROLE_ERROR_NOT_FOUND);
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
    return result;
  }

  async create(dto: CreateRoleDto, createdByUserId: string) {
    return await this.roleRepo.manager.transaction(async (entityManager) => {
      try {
        let role = new Roles();
        role.name = dto.name;
        role.accessPages = dto.accessPages;
        role.dateCreated = await getDate();
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
        role.createdBy = createdBy;
        role = await entityManager.save(role);
        role.roleCode = generateIndentityCode(role.roleId);
        role = await entityManager.save(Roles, role);
        delete role?.createdBy?.password;
        delete role?.createdBy?.refreshToken;
        delete role?.updatedBy?.password;
        delete role?.updatedBy?.refreshToken;
        // Invalidate caches
        this.cacheService.delByPrefix(CacheKeys.roles.prefix);
        return role;
      } catch (ex) {
        if (ex.message.includes("duplicate")) {
          throw new HttpException(ROLE_ERROR_DUPLICATE, HttpStatus.BAD_REQUEST);
        } else {
          throw ex;
        }
      }
    });
  }

  async update(roleCode, dto: UpdateRoleDto, updatedByUserId: string) {
    return await this.roleRepo.manager.transaction(async (entityManager) => {
      try {
        const key = CacheKeys.roles.byCode(roleCode);
        let role = this.cacheService.get<Roles>(key);
        if (!role) {
          role = await entityManager.findOne(Roles, {
            where: {
              roleCode,
              active: true,
            },
            relations: {
              createdBy: true,
              updatedBy: true,
            },
          });
        }
        if (!role) {
          throw Error(ROLE_ERROR_NOT_FOUND);
        }
        role.name = dto.name;
        role.accessPages = dto.accessPages;
        role.lastUpdatedAt = await getDate();
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
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        role.updatedBy = updatedBy;
        role = await entityManager.save(Roles, role);
        delete role?.createdBy?.password;
        delete role?.createdBy?.refreshToken;
        delete role?.updatedBy?.password;
        delete role?.updatedBy?.refreshToken;
        // Invalidate caches
        this.cacheService.del(CacheKeys.roles.byId(role?.roleId));
        this.cacheService.del(CacheKeys.roles.byCode(role.roleCode));
        this.cacheService.delByPrefix(CacheKeys.roles.prefix);
        return role;
      } catch (ex) {
        if (ex.message.includes("duplicate")) {
          throw new HttpException(ROLE_ERROR_DUPLICATE, HttpStatus.BAD_REQUEST);
        } else {
          throw ex;
        }
      }
    });
  }

  async delete(roleCode, updatedByUserId) {
    return await this.roleRepo.manager.transaction(async (entityManager) => {
      const key = CacheKeys.roles.byCode(roleCode);
      let role = this.cacheService.get<Roles>(key);
      if (!role) {
        role = await entityManager.findOne(Roles, {
          where: {
            roleCode,
            active: true,
          },
          relations: {
            createdBy: true,
            updatedBy: true,
          },
        });
      }
      if (!role) {
        throw Error(ROLE_ERROR_NOT_FOUND);
      }
      role.active = false;
      role.lastUpdatedAt = await getDate();
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
      role.updatedBy = updatedBy;
      role = await entityManager.save(Roles, role);
      delete role?.createdBy?.password;
      delete role?.createdBy?.refreshToken;
      delete role?.updatedBy?.password;
      delete role?.updatedBy?.refreshToken;
      // Invalidate caches
      this.cacheService.del(CacheKeys.roles.byId(role?.roleId));
      this.cacheService.del(CacheKeys.roles.byCode(role.roleCode));
      this.cacheService.delByPrefix(CacheKeys.roles.prefix);
      return role;
    });
  }
}
