import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { CreateEmployeeUserDto } from "src/core/dto/employee-user/employee-user.create.dto";
import { UpdateEmployeeUserDto, UpdateEmployeeUserProfileDto } from "src/core/dto/employee-user/employee-user.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { EmployeeUserService } from "src/services/employee-user.service";
export declare class EmployeeUserController {
    private readonly employeeUserService;
    constructor(employeeUserService: EmployeeUserService);
    getByCode(employeeUserCode: string): Promise<ApiResponseModel<EmployeeUsers>>;
    getPagination(paginationParams: PaginationParamsDto): Promise<ApiResponseModel<{
        results: EmployeeUsers[];
        total: number;
    }>>;
    create(dto: CreateEmployeeUserDto, userId: string): Promise<ApiResponseModel<EmployeeUsers>>;
    resendInvitation(dto?: {
        employeeUserCode: string;
    }): Promise<ApiResponseModel<EmployeeUsers>>;
    updateProfile(userId: string, dto: UpdateEmployeeUserProfileDto): Promise<ApiResponseModel<EmployeeUsers>>;
    update(employeeUserCode: string, dto: UpdateEmployeeUserDto, userId: string): Promise<ApiResponseModel<EmployeeUsers>>;
    updatePassword(employeeUserCode: string, params: {
        password: string;
    }, updatedBy: string): Promise<ApiResponseModel<EmployeeUsers>>;
    delete(employeeUserCode: string, userId: string): Promise<ApiResponseModel<EmployeeUsers>>;
}
