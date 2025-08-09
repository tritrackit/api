import { UnitLogs } from "./UnitLogs";
import { EmployeeUsers } from "./EmployeeUsers";
import { Locations } from "./Locations";
import { Model } from "./Model";
import { Status } from "./Status";
export declare class Units {
    unitId: string;
    unitCode: string | null;
    rfid: string;
    chassisNo: string;
    modelId: string;
    color: string;
    description: string;
    dateCreated: Date;
    lastUpdatedAt: Date | null;
    active: boolean;
    unitLogs: UnitLogs[];
    createdBy: EmployeeUsers;
    location: Locations;
    model: Model;
    status: Status;
    updatedBy: EmployeeUsers;
}
