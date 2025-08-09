import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { CreateRoleDto } from "src/core/dto/roles/roles.create.dto";
import { UpdateRoleDto } from "src/core/dto/roles/roles.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Roles } from "src/db/entities/Roles";
import { RoleService } from "src/services/roles.service";
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    getDetails(roleCode: string): Promise<ApiResponseModel<Roles>>;
    getPaginated(params: PaginationParamsDto): Promise<ApiResponseModel<{
        results: Roles[];
        total: number;
    }>>;
    create(accessDto: CreateRoleDto, userId: string): Promise<ApiResponseModel<Roles>>;
    update(roleCode: string, dto: UpdateRoleDto, userId: string): Promise<ApiResponseModel<Roles>>;
    delete(roleCode: string, userId: string): Promise<ApiResponseModel<Roles>>;
}
