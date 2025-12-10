import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";
export declare class PusherService {
    private readonly config;
    private readonly logger;
    pusher: any;
    constructor(config: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
    triggerAsync(channel: string, event: string, data: any): void;
    reSync(type: string, data: any): void;
    reSyncAwait(type: string, data: any): Promise<void>;
    sendTriggerRegister(employeeUserCode: string, data: {
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
    }): void;
    sendTriggerRegisterAwait(employeeUserCode: string, data: {
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
    }): Promise<void>;
}
