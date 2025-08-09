export declare const CONST_QUERYCURRENT_TIMESTAMP = "select (now() AT TIME ZONE 'Asia/Manila'::text) as timestamp";
export declare const getDateByTImeZone: (currentDate: string) => void;
export declare const getNextDate: (currentDate: string, numberOfDays: number) => string;
export declare const getNextDateTime: (currentDate: string, numberOfDays: number) => string;
export declare const getNextWeek: (currentDate: string) => string;
export declare const getNextMonth: (currentDate: string) => string;
