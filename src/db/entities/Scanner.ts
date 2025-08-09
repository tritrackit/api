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

@Index("Scanner_ScannerCode_Active_idx", ["active", "scannerCode"], {
  unique: true,
})
@Index("Scanner_Name_Active_idx", ["active", "name"], { unique: true })
@Index("Scanner_Name_LocationId_Active_idx", ["active", "locationId", "name"], {
  unique: true,
})
@Index("Scanner_pkey", ["scannerId"], { unique: true })
@Entity("Scanner", { schema: "dbo" })
export class Scanner {
  @PrimaryGeneratedColumn({ type: "bigint", name: "ScannerId" })
  scannerId: string;

  @Column("character varying", { name: "ScannerCode" })
  scannerCode: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @Column("bigint", { name: "LocationId" })
  locationId: string;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.scanners)
  @JoinColumn([
    { name: "AssignedEmployeeUserId", referencedColumnName: "employeeUserId" },
  ])
  assignedEmployeeUser: EmployeeUsers;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.scanners2)
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @ManyToOne(() => Locations, (locations) => locations.scanners)
  @JoinColumn([{ name: "LocationId", referencedColumnName: "locationId" }])
  location: Locations;

  @ManyToOne(() => Status, (status) => status.scanners)
  @JoinColumn([{ name: "StatusId", referencedColumnName: "statusId" }])
  status: Status;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.scanners3)
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;
}
