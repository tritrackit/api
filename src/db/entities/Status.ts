import { Column, Entity, Index, OneToMany } from "typeorm";
import { Scanner } from "./Scanner";
import { UnitLogs } from "./UnitLogs";
import { Units } from "./Units";

@Index("Status_pkey", ["statusId"], { unique: true })
@Entity("Status", { schema: "dbo" })
export class Status {
  @Column("bigint", { primary: true, name: "StatusId" })
  statusId: string;

  @Column("character varying", { name: "Name" })
  name: string;

  @OneToMany(() => Scanner, (scanner) => scanner.status)
  scanners: Scanner[];

  @OneToMany(() => UnitLogs, (unitLogs) => unitLogs.prevStatus)
  unitLogs: UnitLogs[];

  @OneToMany(() => UnitLogs, (unitLogs) => unitLogs.status)
  unitLogs2: UnitLogs[];

  @OneToMany(() => Units, (units) => units.status)
  units: Units[];
}
