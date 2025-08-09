import { CreateEmployeeUserDto } from "src/core/dto/employee-user/employee-user.create.dto";
import { UpdateEmployeeUserDto, UpdateEmployeeUserProfileDto } from "src/core/dto/employee-user/employee-user.update.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository } from "typeorm";
import { EmailService } from "./email.service";
export declare class EmployeeUserService {
    private readonly employeeUserRepo;
    private emailService;
    constructor(employeeUserRepo: Repository<EmployeeUsers>, emailService: EmailService);
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: EmployeeUsers[];
        total: number;
    }>;
    getByCode(employeeUserCode: any): Promise<EmployeeUsers>;
    getById(employeeUserId: any): Promise<EmployeeUsers>;
    create(dto: CreateEmployeeUserDto, createdByUserId: string): Promise<EmployeeUsers>;
    resendInvitation(employeeUserCode: string): Promise<EmployeeUsers>;
    updateProfile(employeeUserId: string, dto: UpdateEmployeeUserProfileDto): Promise<EmployeeUsers>;
    update(employeeUserCode: any, dto: UpdateEmployeeUserDto, updatedByUserId: string): Promise<EmployeeUsers>;
    delete(employeeUserCode: any, updatedByUserId: any): Promise<EmployeeUsers>;
}
