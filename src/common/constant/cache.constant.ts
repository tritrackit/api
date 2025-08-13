export const CacheKeys = {
  scanner: {
    byId: (id: string | number) => `scanner:id:${id}`,
    byCode: (code: string) => `scanner:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `scanner:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "scanner:",
  },
  roles: {
    byId: (id: string | number) => `roles:id:${id}`,
    byCode: (code: string) => `roles:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `roles:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "roles:",
  },
  units: {
    byId: (id: string | number) => `units:id:${id}`,
    byCode: (code: string) => `units:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `units:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    byRfid: (rfid: string) => `units:rfid:${rfid}`,
    prefix: "units:",
  },
  unitLogs: {
    lastByRfid: (rfid: string) => `unitlog:last:${rfid}`,
    prefix: "unitlog:last:",
  },
  locations: {
    byId: (id: string | number) => `locations:id:${id}`,
    byCode: (code: string) => `locations:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `locations:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "locations:",
  },
  model: {
    byId: (id: string | number) => `model:id:${id}`,
    byCode: (code: string) => `model:code:${code}`,
    byMultipleIds: (code: string) => `model:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `model:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "model:",
  },
  employeeUsers: {
    byId: (id: string | number) => `employeeUsers:id:${id}`,
    byCode: (code: string) => `employeeUsers:code:${code}`,
    byUserName: (userName: string) => `employeeUsers:userName:${userName}`,
    byEmail: (email: string) => `employeeUsers:email:${email}`,
    byToken: (id: string, token: string) =>
      `employeeUsers:id:${id}:token:${token}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `employeeUsers:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "employeeUsers:",
  },
  status: {
    byId: (id: string | number) => `status:id:${id}`,
    byCode: (code: string) => `status:code:${code}`,
    list: (page: number, size: number, order?: string, filter?: string) =>
      `status:list:p${page}:s${size}:o${order ?? ""}:f${filter ?? ""}`,
    prefix: "status:",
  },
};
