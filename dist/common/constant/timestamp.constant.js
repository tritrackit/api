"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextMonth = exports.getNextWeek = exports.getNextDateTime = exports.getNextDate = exports.getDateByTImeZone = exports.CONST_QUERYCURRENT_TIMESTAMP = void 0;
exports.CONST_QUERYCURRENT_TIMESTAMP = "select (now() AT TIME ZONE 'Asia/Manila'::text) as timestamp";
const getDateByTImeZone = (currentDate) => {
    `select ('${currentDate}' AT TIME ZONE 'Asia/Manila'::text)::date as timestamp`;
};
exports.getDateByTImeZone = getDateByTImeZone;
const getNextDate = (currentDate, numberOfDays) => {
    return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + ${numberOfDays.toString()}) as nextdate`;
};
exports.getNextDate = getNextDate;
const getNextDateTime = (currentDate, numberOfDays) => {
    return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + ${numberOfDays.toString()})::timestamp as dateTime`;
};
exports.getNextDateTime = getNextDateTime;
const getNextWeek = (currentDate) => {
    return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + interval '1 week')::date as nextweek`;
};
exports.getNextWeek = getNextWeek;
const getNextMonth = (currentDate) => {
    return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + interval '1 month')::date as nextmonth`;
};
exports.getNextMonth = getNextMonth;
//# sourceMappingURL=timestamp.constant.js.map