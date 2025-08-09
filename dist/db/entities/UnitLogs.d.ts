import { EmployeeUsers } from "./EmployeeUsers";
import { Locations } from "./Locations";
import { Status } from "./Status";
import { Units } from "./Units";
export declare class UnitLogs {
    unitLogId: string;
    timestamp: Date;
    employeeUser: EmployeeUsers;
    location: Locations;
    prevStatus: Status;
    status: Status;
    unit: Units;
}
