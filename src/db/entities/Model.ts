import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeeUsers } from "./EmployeeUsers";
import { File } from "./File";
import { Units } from "./Units";

@Index("Model_ModelName_Active_idx", ["active", "modelName"], { unique: true })
@Index("Model_pkey", ["modelId"], { unique: true })
@Entity("Model", { schema: "dbo" })
export class Model {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ModelId" })
  modelId: string;

  @Column("bigint", { name: "SequenceId", default: () => "0" })
  sequenceId: string;

  @Column("character varying", { name: "ModelName" })
  modelName: string;

  @Column("character varying", { name: "Description", nullable: true })
  description: string | null;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.models)
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @ManyToOne(() => File, (file) => file.models)
  @JoinColumn([{ name: "ThumbnailFileId", referencedColumnName: "fileId" }])
  thumbnailFile: File;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.models2)
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;

  @OneToMany(() => Units, (units) => units.model)
  units: Units[];
}
