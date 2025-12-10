import { filter } from "rxjs";
import { type } from "os";
import nodemailer from "nodemailer";
import { readFile } from "fs/promises"; // ES6 import for file system access

/* eslint-disable @typescript-eslint/no-var-requires */
import {
  getConnectionOptions,
  getConnection,
  Between,
  ILike,
  Raw,
  Not,
  ArrayOverlap,
  In,
  IsNull,
  LessThan,
} from "typeorm";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";
import { Transform } from "class-transformer";
import { randomInt } from "crypto";
import { TypeOrmConfigService } from "src/db/typeorm/typeorm.service";
import moment from "moment-timezone";

export const toPromise = <T>(data: T): Promise<T> => {
  return new Promise<T>((resolve) => {
    resolve(data);
  });
};

export const getDbConnectionOptions = async (connectionName = "default") => {
  const options = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );
  return {
    ...options,
    name: connectionName,
  };
};

export const getDbConnection = async (connectionName = "default") => {
  return await getConnection(connectionName);
};

export const runDbMigrations = async (connectionName = "default") => {
  const conn = await getDbConnection(connectionName);
  await conn.runMigrations();
};

export const hash = async (value) => {
  return await bcrypt.hash(value, 10);
};

export const compare = async (plainText, hashedValue) => {
  // 🔥 FIX: Correct parameter order - bcrypt.compare(plainText, hash)
  return await bcrypt.compare(plainText, hashedValue);
};

export const getAge = async (birthDate: Date) => {
  const timeDiff = Math.abs(Date.now() - birthDate.getTime());
  return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
};

export const addHours = (numOfHours, date: Date) => {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  return date;
};

export const round = (number) => {
  return Math.round((number + Number.EPSILON) * 100);
};

export function getEnvPath(dest: string): string {
  // const env: string | undefined = process.env.NODE_ENV;
  const env: string | undefined = process.env["NODE" + "_ENV"];
  const fallback: string = path.resolve(`${dest}/.env`);
  const filename: string = env ? `${env}.env` : "development.env";
  let filePath: string = path.resolve(`${dest}/${filename}`);

  if (!fs.existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}

export function ToBoolean(): (target: any, key: string) => void {
  return Transform((value: any) => value.obj[value.key]);
}

export function formatId(value: any, args?: any): unknown {
  let s = value + "";
  while (s.length < args) {
    s = "0" + s;
  }
  return s;
}

export const convertColumnNotationToObject = (notation, nestedValue) => {
  const object = {};
  let pointer = object;
  notation.split(".").map((key, index, arr) => {
    pointer = pointer[key] = index == arr.length - 1 ? nestedValue : {};
  });
  return object;
};

export const getFullName = (
  firstName: string,
  middleName = "",
  lastName: string
) => {
  if (middleName && middleName !== "") {
    return `${firstName} ${middleName} ${lastName}`;
  } else {
    return `${firstName} ${lastName}`;
  }
};

export const columnDefToTypeORMCondition = (columnDef) => {
  const conditionMapping = [];
  for (var col of columnDef) {
    if (col.type === "date") {
      if (
        moment(new Date(col.filter), "MMM DD, YYYY", true).isValid() ||
        moment(new Date(col.filter), "MMMM DD, YYYY", true).isValid() ||
        moment(new Date(col.filter), "YYYY-MM-DD", true).isValid()
      ) {
        conditionMapping.push(
          convertColumnNotationToObject(
            col.apiNotation,
            moment(new Date(col.filter), "YYYY-MM-DD")
          )
        );
      }
    } else if (col.type === "date-less-than") {
      if (
        moment(new Date(col.filter), "MMM DD, YYYY", true).isValid() ||
        moment(new Date(col.filter), "MMMM DD, YYYY", true).isValid() ||
        moment(new Date(col.filter), "YYYY-MM-DD", true).isValid()
      ) {
        conditionMapping.push(
          convertColumnNotationToObject(
            col.apiNotation,
            LessThan(moment(new Date(col.filter)).format("YYYY-MM-DD hh:mm:ss"))
          )
        );
      }
    } else if (col.type === "date-range") {
      const range: any[] =
        col.filter && col.filter.split(",").length > 0
          ? col.filter.split(",").filter((x) => x)
          : [];
      range[1] = range.length === 1 ? range[0] : range[1];
      if (
        moment(new Date(range[0]), "YYYY-MM-DD", true).isValid() &&
        moment(new Date(range[1]), "YYYY-MM-DD", true).isValid()
      ) {
        conditionMapping.push(
          convertColumnNotationToObject(
            col.apiNotation,
            Between(range[0], range[1])
          )
        );
      }
    } else if (col.type === "option-yes-no") {
      if (
        col.filter &&
        col.filter !== "" &&
        ["yes", "no"].some(
          (x) =>
            x.toString().toLowerCase() ===
            col.filter.toString().toLowerCase().trim()
        )
      ) {
        const value = col.filter.toString().toLowerCase().trim() === "yes";
        conditionMapping.push(
          convertColumnNotationToObject(col.apiNotation, value)
        );
      }
    } else if (col.type === "number-range") {
      // 🔥 FIX: Added null check before split
      if (!col.filter || typeof col.filter !== 'string') {
        continue; // Skip invalid filter
      }
      const range = col.filter.split("-").map((x) => x?.trim());

      conditionMapping.push(
        convertColumnNotationToObject(
          col.apiNotation,
          Between(Number(range[0]), Number(range[1]))
        )
      );
    } else if (col.type === "number") {
      // 🔥 FIX: Validate filter exists and is a valid number before processing
      if (col.filter !== null && col.filter !== undefined && col.filter !== "") {
        const numValue = Number(col.filter);
        if (!isNaN(numValue)) {
          // 🔥 FIX: Handle relation fields (statusId, locationId) - use relation path
          let apiNotation = col.apiNotation;
          if (apiNotation === "statusId") {
            apiNotation = "status.statusId";
          } else if (apiNotation === "locationId") {
            apiNotation = "location.locationId";
          }
          // modelId is a direct column, so no change needed
          
      conditionMapping.push(
            convertColumnNotationToObject(apiNotation, numValue)
      );
        }
        // If invalid number, skip this filter (don't fall through to ILike)
      }
      // If filter is empty/null, skip this filter
    } else if (col.type === "precise") {
      if (col.filter !== null && col.filter !== undefined && col.filter !== "") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, col.filter)
      );
      }
    } else if (col.type === "not" || col.type === "except") {
      if (col.filter !== null && col.filter !== undefined && col.filter !== "") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, ArrayOverlap(col.filter))
      );
      }
    } else if (col.type === "in" || col.type === "includes") {
      if (col.filter !== null && col.filter !== undefined && col.filter !== "") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, In(col.filter))
      );
      }
    } else if (col.type === "null") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, IsNull())
      );
    } else {
      // 🔥 FIX: Only use ILike for string types, and validate filter exists
      // Check if the column is likely a numeric field (ends with 'Id' or is a known numeric field)
      const isNumericField = col.apiNotation && (
        col.apiNotation.toLowerCase().endsWith('id') ||
        col.apiNotation.toLowerCase() === 'modelid' ||
        col.apiNotation.toLowerCase() === 'locationid' ||
        col.apiNotation.toLowerCase() === 'statusid'
      );
      
      if (col.filter !== null && col.filter !== undefined && col.filter !== "") {
        if (isNumericField) {
          // For numeric fields, use exact match instead of ILike
          const numValue = Number(col.filter);
          if (!isNaN(numValue)) {
            // 🔥 FIX: Handle relation fields (statusId, locationId) - use relation path
            let apiNotation = col.apiNotation;
            if (apiNotation === "statusId") {
              apiNotation = "status.statusId";
            } else if (apiNotation === "locationId") {
              apiNotation = "location.locationId";
            }
            // modelId is a direct column, so no change needed
            
            conditionMapping.push(
              convertColumnNotationToObject(apiNotation, numValue)
            );
          }
        } else {
          // For string fields, use ILike
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, ILike(`%${col.filter}%`))
      );
        }
      }
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
    } else {
      newArr.push(item);
    }
  }
  return Object.assign({}, ...newArr);
};

export const generateIndentityCode = (id) => {
  return String(id).padStart(6, "0");
};

export const monthDiff = (d1: Date, d2: Date) => {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

export const weeksDiff = (d1, d2) =>
  Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000));

export const daysDiff = (d1, d2) => {
  const dueDateTime = new Date(d1).getTime();
  const currentDateTime = new Date(d2).getTime();
  const overdueMilliseconds = Math.max(0, currentDateTime - dueDateTime);
  const overdueDays = Math.ceil(overdueMilliseconds / (1000 * 60 * 60 * 24));
  return overdueDays;
};

const calculateOverdueCharge = (dueAmount, overdueDays) => {
  const overdueChargeRate = 0.02; // 2% per day
  const overdueCharge = dueAmount * overdueChargeRate * overdueDays;
  return overdueCharge;
};

export const getBill = (dueAmount: number, dueDate: Date) => {
  // Calculate overdue months
  const overdueMonths = monthDiff(
    dueDate,
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  // Calculate overdue weeks
  const overdueWeeks = weeksDiff(
    dueDate,
    new Date(new Date().setDate(new Date().getDate() + 1))
  );

  // Calculate overdue days
  const overdueDays = daysDiff(
    dueDate,
    new Date(new Date().setDate(new Date().getDate() + 1))
  );

  // Calculate overdue charge
  const overdueCharge = calculateOverdueCharge(
    Number(dueAmount),
    overdueDays > 1 ? overdueDays - 1 : 0
  );

  // Calculate total amount
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
// Generate a 6-digit OTP
// Note: Each call generates a fresh random OTP (function-scoped Set ensures uniqueness per call)
export const generateOTP = () => {
  // Generate a random 6-digit OTP (100000 to 999999)
  const otp = randomInt(100000, 1000000).toString();
  return otp;
};

export const toCamelCase = (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};
export const toPascalCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getDate = async () => {
  const dataSource = TypeOrmConfigService.dataSource;
  if (!dataSource) throw new Error("DataSource not initialized yet");

  const timestamp = await dataSource.manager
    .query("SELECT now() as timestamp") // always returns UTC
    .then((res) => res[0]["timestamp"]);

  const manilaTime = moment.utc(timestamp).tz("Asia/Manila").format(); // convert to Manila time
  return manilaTime as any;
};