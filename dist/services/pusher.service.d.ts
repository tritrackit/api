import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";
export declare class PusherService {
    private readonly config;
    pusher: any;
    constructor(config: ConfigService);
    trigger(channel: any, event: any, data: any): Promise<void>;
    reSync(type: string, data: any): Promise<void>;
    sendTriggerRegister(employeeUserCode: string, data: {
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
    }): Promise<void>;
}
