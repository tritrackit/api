import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeeUsers } from "./EmployeeUsers";

@Index("EmployeeUserActivityLogs_pkey", ["employeeUserActivityLogId"], {
  unique: true,
})
@Entity("EmployeeUserActivityLogs", { schema: "dbo" })
export class EmployeeUserActivityLogs {
  @PrimaryGeneratedColumn({
    type: "integer",
    name: "EmployeeUserActivityLogId",
  })
  employeeUserActivityLogId: number;

  @Column("character varying", { name: "Action", nullable: true, length: 255 })
  action: string | null;

  @Column("timestamp with time zone", {
    name: "Timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  timestamp: Date;

  @ManyToOne(
    () => EmployeeUsers,
    (employeeUsers) => employeeUsers.employeeUserActivityLogs
  )
  @JoinColumn([
    { name: "EmployeeUserId", referencedColumnName: "employeeUserId" },
  ])
  employeeUser: EmployeeUsers;
}
