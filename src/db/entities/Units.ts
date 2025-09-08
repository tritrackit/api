import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UnitLogs } from "./UnitLogs";
import { EmployeeUsers } from "./EmployeeUsers";
import { Locations } from "./Locations";
import { Model } from "./Model";
import { Status } from "./Status";

@Index("Units_RFID_ModelId_Active_idx", ["active", "modelId", "rfid"], {
  unique: true,
})
@Index("Units_RFID_Active_idx", ["active", "rfid"], { unique: true })
@Index("Units_pkey", ["unitId"], { unique: true })
@Entity("Units", { schema: "dbo" })
export class Units {
  @PrimaryGeneratedColumn({ type: "bigint", name: "UnitId" })
  unitId: string;

  @Column("character varying", { name: "UnitCode", nullable: true })
  unitCode: string | null;

  @Column("character varying", { name: "RFID" })
  rfid: string;

  @Column("character varying", { name: "ChassisNo" })
  chassisNo: string;

  @Column("bigint", { name: "ModelId" })
  modelId: string;

  @Column("character varying", { name: "Color" })
  color: string;

  @Column("text", { name: "Description" })
  description: string;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @OneToMany(() => UnitLogs, (unitLogs) => unitLogs.unit)
  unitLogs: UnitLogs[];

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.units)
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @ManyToOne(() => Locations, (locations) => locations.units)
  @JoinColumn([{ name: "LocationId", referencedColumnName: "locationId" }])
  location: Locations;

  @ManyToOne(() => Model, (model) => model.units)
  @JoinColumn([{ name: "ModelId", referencedColumnName: "modelId" }])
  model: Model;

  @ManyToOne(() => Status, (status) => status.units)
  @JoinColumn([{ name: "StatusId", referencedColumnName: "statusId" }])
  status: Status;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.units2)
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;
}
