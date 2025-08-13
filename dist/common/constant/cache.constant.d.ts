export declare const CacheKeys: {
    scanner: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
    roles: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
    units: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        byRfid: (rfid: string) => string;
        prefix: string;
    };
    unitLogs: {
        lastByRfid: (rfid: string) => string;
        prefix: string;
    };
    locations: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
    model: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        byMultipleIds: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
    employeeUsers: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        byUserName: (userName: string) => string;
        byEmail: (email: string) => string;
        byToken: (id: string, token: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
    status: {
        byId: (id: string | number) => string;
        byCode: (code: string) => string;
        list: (page: number, size: number, order?: string, filter?: string) => string;
        prefix: string;
    };
};
