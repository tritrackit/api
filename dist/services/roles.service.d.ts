import { CreateRoleDto } from "src/core/dto/roles/roles.create.dto";
import { UpdateRoleDto } from "src/core/dto/roles/roles.update.dto";
import { Roles } from "src/db/entities/Roles";
import { Repository } from "typeorm";
import { CacheService } from "./cache.service";
export declare class RoleService {
    private readonly roleRepo;
    private readonly cacheService;
    constructor(roleRepo: Repository<Roles>, cacheService: CacheService);
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: Roles[];
        total: number;
    }>;
    getByCode(roleCode: any): Promise<Roles>;
    create(dto: CreateRoleDto, createdByUserId: string): Promise<Roles>;
    update(roleCode: any, dto: UpdateRoleDto, updatedByUserId: string): Promise<Roles>;
    delete(roleCode: any, updatedByUserId: any): Promise<Roles>;
}
