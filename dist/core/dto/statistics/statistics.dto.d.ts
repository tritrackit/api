export declare enum TimeframeType {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}
export declare class TimeframeDto {
    type: TimeframeType;
    startDate?: string;
    endDate?: string;
}
export declare class StatisticsFilterDto {
    timeframe: TimeframeDto;
    locationIds?: string[];
    modelIds?: string[];
    statusNames?: string[];
    colors?: string[];
}
