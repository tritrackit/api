import { EmployeeUsers } from "./EmployeeUsers";
import { Locations } from "./Locations";
import { Status } from "./Status";
export declare class Scanner {
    scannerId: string;
    scannerCode: string;
    name: string;
    locationId: string;
    dateCreated: Date;
    lastUpdatedAt: Date | null;
    active: boolean;
    assignedEmployeeUser: EmployeeUsers;
    createdBy: EmployeeUsers;
    location: Locations;
    status: Status;
    updatedBy: EmployeeUsers;
}
