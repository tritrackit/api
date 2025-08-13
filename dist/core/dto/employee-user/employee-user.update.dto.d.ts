import { DefaultEmployeeUserDto } from "./employee-user-base.dto";
export declare class UpdateEmployeeUserDto extends DefaultEmployeeUserDto {
    roleCode: string;
}
export declare class UpdateEmployeeUserProfileDto extends DefaultEmployeeUserDto {
    pictureFile: any;
}
