"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDate = exports.toPascalCase = exports.toCamelCase = exports.generateOTP = exports.getBill = exports.daysDiff = exports.weeksDiff = exports.monthDiff = exports.generateIndentityCode = exports.columnDefToTypeORMCondition = exports.getFullName = exports.convertColumnNotationToObject = exports.formatId = exports.ToBoolean = exports.getEnvPath = exports.round = exports.addHours = exports.getAge = exports.compare = exports.hash = exports.runDbMigrations = exports.getDbConnection = exports.getDbConnectionOptions = exports.toPromise = void 0;
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const class_transformer_1 = require("class-transformer");
const crypto_1 = require("crypto");
const typeorm_service_1 = require("../../db/typeorm/typeorm.service");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const toPromise = (data) => {
    return new Promise((resolve) => {
        resolve(data);
    });
};
exports.toPromise = toPromise;
const getDbConnectionOptions = async (connectionName = "default") => {
    const options = await (0, typeorm_1.getConnectionOptions)(process.env.NODE_ENV || "development");
    return Object.assign(Object.assign({}, options), { name: connectionName });
};
exports.getDbConnectionOptions = getDbConnectionOptions;
const getDbConnection = async (connectionName = "default") => {
    return await (0, typeorm_1.getConnection)(connectionName);
};
exports.getDbConnection = getDbConnection;
const runDbMigrations = async (connectionName = "default") => {
    const conn = await (0, exports.getDbConnection)(connectionName);
    await conn.runMigrations();
};
exports.runDbMigrations = runDbMigrations;
const hash = async (value) => {
    return await bcrypt.hash(value, 10);
};
exports.hash = hash;
const compare = async (newValue, hashedValue) => {
    return await bcrypt.compare(hashedValue, newValue);
};
exports.compare = compare;
const getAge = async (birthDate) => {
    const timeDiff = Math.abs(Date.now() - birthDate.getTime());
    return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
};
exports.getAge = getAge;
const addHours = (numOfHours, date) => {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
    return date;
};
exports.addHours = addHours;
const round = (number) => {
    return Math.round((number + Number.EPSILON) * 100);
};
exports.round = round;
function getEnvPath(dest) {
    const env = process.env["NODE" + "_ENV"];
    const fallback = path.resolve(`${dest}/.env`);
    const filename = env ? `${env}.env` : "development.env";
    let filePath = path.resolve(`${dest}/${filename}`);
    if (!fs.existsSync(filePath)) {
        filePath = fallback;
    }
    return filePath;
}
exports.getEnvPath = getEnvPath;
function ToBoolean() {
    return (0, class_transformer_1.Transform)((value) => value.obj[value.key]);
}
exports.ToBoolean = ToBoolean;
function formatId(value, args) {
    let s = value + "";
    while (s.length < args) {
        s = "0" + s;
    }
    return s;
}
exports.formatId = formatId;
const convertColumnNotationToObject = (notation, nestedValue) => {
    const object = {};
    let pointer = object;
    notation.split(".").map((key, index, arr) => {
        pointer = pointer[key] = index == arr.length - 1 ? nestedValue : {};
    });
    return object;
};
exports.convertColumnNotationToObject = convertColumnNotationToObject;
const getFullName = (firstName, middleName = "", lastName) => {
    if (middleName && middleName !== "") {
        return `${firstName} ${middleName} ${lastName}`;
    }
    else {
        return `${firstName} ${lastName}`;
    }
};
exports.getFullName = getFullName;
const columnDefToTypeORMCondition = (columnDef) => {
    const conditionMapping = [];
    for (var col of columnDef) {
        if (col.type === "date") {
            if ((0, moment_timezone_1.default)(new Date(col.filter), "MMM DD, YYYY", true).isValid() ||
                (0, moment_timezone_1.default)(new Date(col.filter), "MMMM DD, YYYY", true).isValid() ||
                (0, moment_timezone_1.default)(new Date(col.filter), "YYYY-MM-DD", true).isValid()) {
                conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, moment_timezone_1.default)(new Date(col.filter), "YYYY-MM-DD")));
            }
        }
        else if (col.type === "date-less-than") {
            if ((0, moment_timezone_1.default)(new Date(col.filter), "MMM DD, YYYY", true).isValid() ||
                (0, moment_timezone_1.default)(new Date(col.filter), "MMMM DD, YYYY", true).isValid() ||
                (0, moment_timezone_1.default)(new Date(col.filter), "YYYY-MM-DD", true).isValid()) {
                conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.LessThan)((0, moment_timezone_1.default)(new Date(col.filter)).format("YYYY-MM-DD hh:mm:ss"))));
            }
        }
        else if (col.type === "date-range") {
            const range = col.filter && col.filter.split(",").length > 0
                ? col.filter.split(",").filter((x) => x)
                : [];
            range[1] = range.length === 1 ? range[0] : range[1];
            if ((0, moment_timezone_1.default)(new Date(range[0]), "YYYY-MM-DD", true).isValid() &&
                (0, moment_timezone_1.default)(new Date(range[1]), "YYYY-MM-DD", true).isValid()) {
                conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.Between)(range[0], range[1])));
            }
        }
        else if (col.type === "option-yes-no") {
            if (col.filter &&
                col.filter !== "" &&
                ["yes", "no"].some((x) => x.toString().toLowerCase() ===
                    col.filter.toString().toLowerCase().trim())) {
                const value = col.filter.toString().toLowerCase().trim() === "yes";
                conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, value));
            }
        }
        else if (col.type === "number-range") {
            const range = col.filter.split("-").map((x) => x === null || x === void 0 ? void 0 : x.trim());
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.Between)(Number(range[0]), Number(range[1]))));
        }
        else if (col.type === "number") {
            const value = !isNaN(Number(col.filter)) ? Number(col.filter) : 0;
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, value));
        }
        else if (col.type === "precise") {
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, col.filter));
        }
        else if (col.type === "not" || col.type === "except") {
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.ArrayOverlap)(col.filter)));
        }
        else if (col.type === "in" || col.type === "includes") {
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.In)(col.filter)));
        }
        else if (col.type === "null") {
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.IsNull)()));
        }
        else {
            conditionMapping.push((0, exports.convertColumnNotationToObject)(col.apiNotation, (0, typeorm_1.ILike)(`%${col.filter}%`)));
        }
    }
    const newArr = [];
    for (const item of conditionMapping) {
        const name = Object.keys(item)[0];
        if (newArr.some((x) => x[name])) {
            const index = newArr.findIndex((x) => x[name]);
            const res = Object.keys(newArr[index]).map((key) => newArr[index][key]);
            res.push(item[name]);
            newArr[index] = {
                [name]: Object.assign({}, ...res),
            };
            res.push(newArr[index]);
        }
        else {
            newArr.push(item);
        }
    }
    return Object.assign({}, ...newArr);
};
exports.columnDefToTypeORMCondition = columnDefToTypeORMCondition;
const generateIndentityCode = (id) => {
    return String(id).padStart(6, "0");
};
exports.generateIndentityCode = generateIndentityCode;
const monthDiff = (d1, d2) => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
};
exports.monthDiff = monthDiff;
const weeksDiff = (d1, d2) => Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));
exports.weeksDiff = weeksDiff;
const daysDiff = (d1, d2) => {
    const dueDateTime = new Date(d1).getTime();
    const currentDateTime = new Date(d2).getTime();
    const overdueMilliseconds = Math.max(0, currentDateTime - dueDateTime);
    const overdueDays = Math.ceil(overdueMilliseconds / (1000 * 60 * 60 * 24));
    return overdueDays;
};
exports.daysDiff = daysDiff;
const calculateOverdueCharge = (dueAmount, overdueDays) => {
    const overdueChargeRate = 0.02;
    const overdueCharge = dueAmount * overdueChargeRate * overdueDays;
    return overdueCharge;
};
const getBill = (dueAmount, dueDate) => {
    const overdueMonths = (0, exports.monthDiff)(dueDate, new Date(new Date().setDate(new Date().getDate() + 1)));
    const overdueWeeks = (0, exports.weeksDiff)(dueDate, new Date(new Date().setDate(new Date().getDate() + 1)));
    const overdueDays = (0, exports.daysDiff)(dueDate, new Date(new Date().setDate(new Date().getDate() + 1)));
    const overdueCharge = calculateOverdueCharge(Number(dueAmount), overdueDays > 1 ? overdueDays - 1 : 0);
    const totalDueAmount = Number(dueAmount) + overdueCharge;
    return {
        dueAmount: Number(dueAmount).toFixed(2),
        overdueDays: overdueDays > 0 ? overdueDays - 1 : 0,
        overdueWeeks,
        overdueMonths,
        overdueCharge: Number(overdueCharge).toFixed(2),
        totalDueAmount: Number(totalDueAmount).toFixed(2),
    };
};
exports.getBill = getBill;
const generateOTP = () => {
    let otp;
    const uniqueOTPs = new Set();
    do {
        otp = (0, crypto_1.randomInt)(100000, 1000000).toString();
    } while (uniqueOTPs.has(otp));
    uniqueOTPs.add(otp);
    if (uniqueOTPs.size > 1000) {
        uniqueOTPs.clear();
    }
    return otp;
};
exports.generateOTP = generateOTP;
const toCamelCase = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
};
exports.toCamelCase = toCamelCase;
const toPascalCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.toPascalCase = toPascalCase;
const getDate = async () => {
    const dataSource = typeorm_service_1.TypeOrmConfigService.dataSource;
    if (!dataSource)
        throw new Error("DataSource not initialized yet");
    const timestamp = await dataSource.manager
        .query("SELECT now() as timestamp")
        .then((res) => res[0]["timestamp"]);
    const manilaTime = moment_timezone_1.default.utc(timestamp).tz("Asia/Manila").format();
    return manilaTime;
};
exports.getDate = getDate;
//# sourceMappingURL=utils.js.map