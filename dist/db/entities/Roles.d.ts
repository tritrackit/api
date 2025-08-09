import { EmployeeUsers } from "./EmployeeUsers";
export declare class Roles {
    roleId: string;
    roleCode: string | null;
    name: string;
    accessPages: object;
    dateCreated: Date;
    lastUpdatedAt: Date | null;
    active: boolean;
    employeeUsers: EmployeeUsers[];
    createdBy: EmployeeUsers;
    updatedBy: EmployeeUsers;
}
