import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeeUsers } from "./EmployeeUsers";
import { Locations } from "./Locations";
import { Status } from "./Status";
import { Units } from "./Units";

@Index("UnitLogs_pkey", ["unitLogId"], { unique: true })
@Entity("UnitLogs", { schema: "dbo" })
export class UnitLogs {
  @PrimaryGeneratedColumn({ type: "bigint", name: "UnitLogId" })
  unitLogId: string;

  @Column("timestamp with time zone", {
    name: "Timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  timestamp: Date;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.unitLogs)
  @JoinColumn([
    { name: "EmployeeUserId", referencedColumnName: "employeeUserId" },
  ])
  employeeUser: EmployeeUsers;

  @ManyToOne(() => Locations, (locations) => locations.unitLogs)
  @JoinColumn([{ name: "LocationId", referencedColumnName: "locationId" }])
  location: Locations;

  @ManyToOne(() => Status, (status) => status.unitLogs)
  @JoinColumn([{ name: "PrevStatusId", referencedColumnName: "statusId" }])
  prevStatus: Status;

  @ManyToOne(() => Status, (status) => status.unitLogs2)
  @JoinColumn([{ name: "StatusId", referencedColumnName: "statusId" }])
  status: Status;

  @ManyToOne(() => Units, (units) => units.unitLogs)
  @JoinColumn([{ name: "UnitId", referencedColumnName: "unitId" }])
  unit: Units;
}
