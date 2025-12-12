import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";
export declare class PusherService {
    private readonly config;
    private readonly logger;
    pusher: any;
    private batchQueue;
    private batchTimers;
    private readonly BATCH_DELAY_MS;
    constructor(config: ConfigService);
    trigger(channel: string, event: string, data: any): Promise<void>;
    triggerAsync(channel: string, event: string, data: any): void;
    reSync(type: string, data: any, urgent?: boolean): void;
    private flushBatch;
    reSyncAwait(type: string, data: any): Promise<void>;
    sendTriggerRegister(employeeUserCode: string, data: {
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
    }): void;
    sendRegistrationEventImmediate(data: {
        rfid: string;
        scannerCode: string;
        timestamp: Date | string;
        location?: Locations | {
            name: string;
            locationId: string;
        };
        scannerType?: string;
        employeeUser?: EmployeeUsers;
    }): Promise<void>;
    sendRegistrationUrgent(data: any): void;
    sendTriggerRegisterAwait(employeeUserCode: string, data: {
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
    }): Promise<void>;
}
