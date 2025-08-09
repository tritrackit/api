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

export const compare = async (newValue, hashedValue) => {
  return await bcrypt.compare(hashedValue, newValue);
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
      const range = col.filter.split("-").map((x) => x?.trim());

      conditionMapping.push(
        convertColumnNotationToObject(
          col.apiNotation,
          Between(Number(range[0]), Number(range[1]))
        )
      );
    } else if (col.type === "number") {
      const value = !isNaN(Number(col.filter)) ? Number(col.filter) : 0;
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, value)
      );
    } else if (col.type === "precise") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, col.filter)
      );
    } else if (col.type === "not" || col.type === "except") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, ArrayOverlap(col.filter))
      );
    } else if (col.type === "in" || col.type === "includes") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, In(col.filter))
      );
    } else if (col.type === "null") {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, IsNull())
      );
    } else {
      conditionMapping.push(
        convertColumnNotationToObject(col.apiNotation, ILike(`%${col.filter}%`))
      );
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
// Generate a 6-digit OTP with low probability of repeating
export const generateOTP = () => {
  let otp;
  const uniqueOTPs = new Set();

  // Ensure the OTP is not a duplicate with 1 in 1000 odds
  do {
    otp = randomInt(100000, 1000000).toString(); // Generate a 6-digit OTP
  } while (uniqueOTPs.has(otp));

  // Store the OTP to track uniqueness within the 1000 scope
  uniqueOTPs.add(otp);

  // If we exceed 1000 unique OTPs, clear the set to maintain the odds
  if (uniqueOTPs.size > 1000) {
    uniqueOTPs.clear();
  }

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