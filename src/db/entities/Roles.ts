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

@Index("Role_Name_Active_idx", ["active", "name"], { unique: true })
@Index("Role_pkey", ["roleId"], { unique: true })
@Entity("Roles", { schema: "dbo" })
export class Roles {
  @PrimaryGeneratedColumn({ type: "bigint", name: "RoleId" })
  roleId: string;

  @Column("character varying", { name: "RoleCode", nullable: true })
  roleCode: string | null;

  @Column("character varying", { name: "Name" })
  name: string;

  @Column("jsonb", { name: "AccessPages", default: [] })
  accessPages: object;

  @Column("timestamp with time zone", {
    name: "DateCreated",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateCreated: Date;

  @Column("timestamp with time zone", { name: "LastUpdatedAt", nullable: true })
  lastUpdatedAt: Date | null;

  @Column("boolean", { name: "Active", default: () => "true" })
  active: boolean;

  @OneToMany(() => EmployeeUsers, (employeeUsers) => employeeUsers.role)
  employeeUsers: EmployeeUsers[];

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.roles)
  @JoinColumn([{ name: "CreatedBy", referencedColumnName: "employeeUserId" }])
  createdBy: EmployeeUsers;

  @ManyToOne(() => EmployeeUsers, (employeeUsers) => employeeUsers.roles2)
  @JoinColumn([{ name: "UpdatedBy", referencedColumnName: "employeeUserId" }])
  updatedBy: EmployeeUsers;
}
