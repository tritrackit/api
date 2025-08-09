export const CONST_QUERYCURRENT_TIMESTAMP =
  "select (now() AT TIME ZONE 'Asia/Manila'::text) as timestamp";
export const getDateByTImeZone = (currentDate: string) => {
  `select ('${currentDate}' AT TIME ZONE 'Asia/Manila'::text)::date as timestamp`;
};
export const getNextDate = (currentDate: string, numberOfDays: number) => {
  return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + ${numberOfDays.toString()}) as nextdate`;
};
export const getNextDateTime = (currentDate: string, numberOfDays: number) => {
  return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + ${numberOfDays.toString()})::timestamp as dateTime`;
};

export const getNextWeek = (currentDate: string) => {
  return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + interval '1 week')::date as nextweek`;
};

export const getNextMonth = (currentDate: string) => {
  return `select (('${currentDate}'AT TIME ZONE 'Asia/Manila'::text)::date + interval '1 month')::date as nextmonth`;
};
