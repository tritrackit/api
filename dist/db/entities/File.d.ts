import { EmployeeUsers } from "./EmployeeUsers";
import { Model } from "./Model";
export declare class File {
    fileId: string;
    fileName: string;
    publicId: string;
    secureUrl: string;
    bytes: string | null;
    format: string | null;
    width: string | null;
    height: string | null;
    employeeUsers: EmployeeUsers[];
    models: Model[];
}
