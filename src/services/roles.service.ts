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

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Roles)
    private readonly roleRepo: Repository<Roles>
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
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
    return {
      results: results.map((x) => {
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }),
      total,
    };
  }

  async getByCode(roleCode) {
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
    });
    if (!result) {
      throw Error(ROLE_ERROR_NOT_FOUND);
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    return result;
  }

  async create(dto: CreateRoleDto, createdByUserId: string) {
    return await this.roleRepo.manager.transaction(async (entityManager) => {
      try {
        let role = new Roles();
        role.name = dto.name;
        role.accessPages = dto.accessPages;
        role.dateCreated = await getDate();
        const createdBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: createdByUserId,
            active: true,
          },
        });
        if (!createdBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        role.createdBy = createdBy;
        role = await entityManager.save(role);
        role.roleCode = generateIndentityCode(role.roleId);
        role = await entityManager.save(Roles, role);
        delete role?.createdBy?.password;
        delete role?.createdBy?.refreshToken;
        delete role?.updatedBy?.password;
        delete role?.updatedBy?.refreshToken;
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
        let role = await entityManager.findOne(Roles, {
          where: {
            roleCode,
            active: true,
          },
        });
        if (!role) {
          throw Error(ROLE_ERROR_NOT_FOUND);
        }
        role.name = dto.name;
        role.accessPages = dto.accessPages;
        role.lastUpdatedAt = await getDate();
        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        role.updatedBy = updatedBy;
        role = await entityManager.save(Roles, role);
        delete role?.createdBy?.password;
        delete role?.createdBy?.refreshToken;
        delete role?.updatedBy?.password;
        delete role?.updatedBy?.refreshToken;
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
      let role = await entityManager.findOne(Roles, {
        where: {
          roleCode,
          active: true,
        },
      });
      if (!role) {
        throw Error(ROLE_ERROR_NOT_FOUND);
      }
      role.active = false;
      role.lastUpdatedAt = await getDate();
      const updatedBy = await entityManager.findOne(EmployeeUsers, {
        where: {
          employeeUserId: updatedByUserId,
          active: true,
        },
      });
      if (!updatedBy) {
        throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      }
      role.updatedBy = updatedBy;
      role = await entityManager.save(Roles, role);
      delete role?.createdBy?.password;
      delete role?.createdBy?.refreshToken;
      delete role?.updatedBy?.password;
      delete role?.updatedBy?.refreshToken;
      return role;
    });
  }
}
