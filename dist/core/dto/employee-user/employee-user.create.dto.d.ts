import { DefaultEmployeeUserDto } from "./employee-user-base.dto";
export declare class CreateEmployeeUserDto extends DefaultEmployeeUserDto {
    password: string;
    roleCode: string;
}
