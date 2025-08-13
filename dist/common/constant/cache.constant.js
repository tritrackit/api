"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = void 0;
exports.CacheKeys = {
    scanner: {
        byId: (id) => `scanner:id:${id}`,
        byCode: (code) => `scanner:code:${code}`,
        list: (page, size, order, filter) => `scanner:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "scanner:",
    },
    roles: {
        byId: (id) => `roles:id:${id}`,
        byCode: (code) => `roles:code:${code}`,
        list: (page, size, order, filter) => `roles:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "roles:",
    },
    units: {
        byId: (id) => `units:id:${id}`,
        byCode: (code) => `units:code:${code}`,
        list: (page, size, order, filter) => `units:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        byRfid: (rfid) => `units:rfid:${rfid}`,
        prefix: "units:",
    },
    unitLogs: {
        lastByRfid: (rfid) => `unitlog:last:${rfid}`,
        prefix: "unitlog:last:",
    },
    locations: {
        byId: (id) => `locations:id:${id}`,
        byCode: (code) => `locations:code:${code}`,
        list: (page, size, order, filter) => `locations:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "locations:",
    },
    model: {
        byId: (id) => `model:id:${id}`,
        byCode: (code) => `model:code:${code}`,
        byMultipleIds: (code) => `model:code:${code}`,
        list: (page, size, order, filter) => `model:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "model:",
    },
    employeeUsers: {
        byId: (id) => `employeeUsers:id:${id}`,
        byCode: (code) => `employeeUsers:code:${code}`,
        byUserName: (userName) => `employeeUsers:userName:${userName}`,
        byEmail: (email) => `employeeUsers:email:${email}`,
        byToken: (id, token) => `employeeUsers:id:${id}:token:${token}`,
        list: (page, size, order, filter) => `employeeUsers:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "employeeUsers:",
    },
    status: {
        byId: (id) => `status:id:${id}`,
        byCode: (code) => `status:code:${code}`,
        list: (page, size, order, filter) => `status:list:p${page}:s${size}:o${order !== null && order !== void 0 ? order : ""}:f${filter !== null && filter !== void 0 ? filter : ""}`,
        prefix: "status:",
    },
};
//# sourceMappingURL=cache.constant.js.map