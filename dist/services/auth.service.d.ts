import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
export declare class AuthService {
    private readonly employeeUserRepo;
    private emailService;
    private jwtService;
    private readonly config;
    constructor(employeeUserRepo: Repository<EmployeeUsers>, emailService: EmailService, jwtService: JwtService, config: ConfigService);
    login({ userName, password }: {
        userName: any;
        password: any;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        employeeUserId: string;
        employeeUserCode: string;
        userName: string;
        password: string;
        firstName: string;
        lastName: string;
        email: string;
        contactNo: string;
        accessGranted: boolean;
        invitationCode: string;
        dateCreated: Date;
        lastUpdatedAt: Date;
        hasActiveSession: boolean;
        active: boolean;
        employeeUserActivityLogs: import("../db/entities/EmployeeUserActivityLogs").EmployeeUserActivityLogs[];
        createdBy: EmployeeUsers;
        employeeUsers: EmployeeUsers[];
        role: import("../db/entities/Roles").Roles;
        updatedBy: EmployeeUsers;
        employeeUsers2: EmployeeUsers[];
        locations: import("../db/entities/Locations").Locations[];
        locations2: import("../db/entities/Locations").Locations[];
        models: import("../db/entities/Model").Model[];
        models2: import("../db/entities/Model").Model[];
        roles: import("../db/entities/Roles").Roles[];
        roles2: import("../db/entities/Roles").Roles[];
        scanners: import("../db/entities/Scanner").Scanner[];
        scanners2: import("../db/entities/Scanner").Scanner[];
        scanners3: import("../db/entities/Scanner").Scanner[];
        unitLogs: import("../db/entities/UnitLogs").UnitLogs[];
        units: import("../db/entities/Units").Units[];
        units2: import("../db/entities/Units").Units[];
    }>;
    verify({ email, hashCode }: {
        email: any;
        hashCode: any;
    }): Promise<EmployeeUsers>;
    refresh(employeeUserId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    issueTokens(employeeUserId: string, email: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getNewAccessAndRefreshToken(refreshToken: string, employeeUserId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logOut(employeeUserId: string): Promise<void>;
}
