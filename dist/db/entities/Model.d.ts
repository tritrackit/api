import { EmployeeUsers } from "./EmployeeUsers";
import { File } from "./File";
import { Units } from "./Units";
export declare class Model {
    modelId: string;
    sequenceId: string;
    modelName: string;
    description: string | null;
    dateCreated: Date;
    lastUpdatedAt: Date | null;
    active: boolean;
    createdBy: EmployeeUsers;
    thumbnailFile: File;
    updatedBy: EmployeeUsers;
    units: Units[];
}
