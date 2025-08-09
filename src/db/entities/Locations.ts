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
import { Scanner } from "./Scanner";
import { UnitLogs } from "./UnitLogs";
import { Units } from "./Units";

@Index("Locations_Name_Active_idx", ["active", "name"], { unique: true })
@Index("Locations_pkey", ["locationId"], { unique: true })
@Entity("Locations", { schema: "dbo" })
export class Locations {
  @PrimaryGeneratedColumn({ type: "bigint", name: "LocationId" })
  locationId: string;

  @Column("character varying", { name: "LocationCode" })
  locationCode: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.locations)
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.locations2)
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;

  @OneToMany(() => Scanner, (scanner) => scanner.location)
  scanners: Scanner[];

  @OneToMany(() => UnitLogs, (unitLogs) => unitLogs.location)
  unitLogs: UnitLogs[];

  @OneToMany(() => Units, (units) => units.location)
  units: Units[];
}
