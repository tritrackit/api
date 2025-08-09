import { EmployeeUsers } from "./EmployeeUsers";
import { Scanner } from "./Scanner";
import { UnitLogs } from "./UnitLogs";
import { Units } from "./Units";
export declare class Locations {
    locationId: string;
    locationCode: string;
    name: string;
    dateCreated: Date;
    lastUpdatedAt: Date | null;
    active: boolean;
    createdBy: EmployeeUsers;
    updatedBy: EmployeeUsers;
    scanners: Scanner[];
    unitLogs: UnitLogs[];
    units: Units[];
}
