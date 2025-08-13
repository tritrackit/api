import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeeUserActivityLogs } from "./EmployeeUserActivityLogs";
import { File } from "./File";
import { Roles } from "./Roles";
import { Locations } from "./Locations";
import { Model } from "./Model";
import { Scanner } from "./Scanner";
import { UnitLogs } from "./UnitLogs";
import { Units } from "./Units";

@Index("EmployeeUsers_UserName_Active_idx", ["active", "userName"], {
  unique: true,
})
@Index("EmployeeUsers_Email_Active_idx", ["active", "email"], { unique: true })
@Index("EmployeeUsers_pkey", ["employeeUserId"], { unique: true })
@Entity("EmployeeUsers", { schema: "dbo" })
export class EmployeeUsers {
  @PrimaryGeneratedColumn({ type: "bigint", name: "EmployeeUserId" })
  employeeUserId: string;

  @Column("character varying", { name: "EmployeeUserCode", nullable: true })
  employeeUserCode: string | null;

  @Column("character varying", { name: "UserName" })
  userName: string;

  @Column("character varying", { name: "Password" })
  password: string;

  @Column("character varying", { name: "FirstName" })
  firstName: string;

  @Column("character varying", { name: "LastName" })
  lastName: string;

  @Column("character varying", { name: "Email" })
  email: string;

  @Column("character varying", { name: "ContactNo" })
  contactNo: string;

  @Column("boolean", { name: "AccessGranted", default: () => "false" })
  accessGranted: boolean;

  @Column("text", { name: "InvitationCode" })
  invitationCode: string;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("character varying", { name: "RefreshToken", nullable: true })
  refreshToken: string | null;

  @Column("boolean", { name: "HasActiveSession", default: () => "false" })
  hasActiveSession: boolean;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @OneToMany(
    () => EmployeeUserActivityLogs,
    (employeeUserActivityLogs) => employeeUserActivityLogs.employeeUser
  )
  employeeUserActivityLogs: EmployeeUserActivityLogs[];

  @ManyToOne(
    () => EmployeeUsers,
    (employeeUsers) => employeeUsers.employeeUsers
  )
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @OneToMany(() => EmployeeUsers, (employeeUsers) => employeeUsers.createdBy)
  employeeUsers: EmployeeUsers[];

  @ManyToOne(() => File, (file) => file.employeeUsers)
  @JoinColumn([{ name: "PictureFileId", referencedColumnName: "fileId" }])
  pictureFile: File;

  @ManyToOne(() => Roles, (roles) => roles.employeeUsers)
  @JoinColumn([{ name: "RoleId", referencedColumnName: "roleId" }])
  role: Roles;

  @ManyToOne(
    () => EmployeeUsers,
    (employeeUsers) => employeeUsers.employeeUsers2
  )
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;

  @OneToMany(() => EmployeeUsers, (employeeUsers) => employeeUsers.updatedBy)
  employeeUsers2: EmployeeUsers[];

  @OneToMany(() => Locations, (locations) => locations.createdBy)
  locations: Locations[];

  @OneToMany(() => Locations, (locations) => locations.updatedBy)
  locations2: Locations[];

  @OneToMany(() => Model, (model) => model.createdBy)
  models: Model[];

  @OneToMany(() => Model, (model) => model.updatedBy)
  models2: Model[];

  @OneToMany(() => Roles, (roles) => roles.createdBy)
  roles: Roles[];

  @OneToMany(() => Roles, (roles) => roles.updatedBy)
  roles2: Roles[];

  @OneToMany(() => Scanner, (scanner) => scanner.assignedEmployeeUser)
  scanners: Scanner[];

  @OneToMany(() => Scanner, (scanner) => scanner.createdBy)
  scanners2: Scanner[];

  @OneToMany(() => Scanner, (scanner) => scanner.updatedBy)
  scanners3: Scanner[];

  @OneToMany(() => UnitLogs, (unitLogs) => unitLogs.employeeUser)
  unitLogs: UnitLogs[];

  @OneToMany(() => Units, (units) => units.createdBy)
  units: Units[];

  @OneToMany(() => Units, (units) => units.updatedBy)
  units2: Units[];
}
