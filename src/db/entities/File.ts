import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeeUsers } from "./EmployeeUsers";
import { Model } from "./Model";

@Index("pk_files_901578250", ["fileId"], { unique: true })
@Entity("File", { schema: "dbo" })
export class File {
  @PrimaryGeneratedColumn({ type: "bigint", name: "FileId" })
  fileId: string;

  @Column("text", { name: "FileName" })
  fileName: string;

  @Column("text", { name: "PublicId" })
  publicId: string;

  @Column("text", { name: "SecureUrl" })
  secureUrl: string;

  @Column("bigint", { name: "Bytes", nullable: true })
  bytes: string | null;

  @Column("character varying", { name: "Format", nullable: true })
  format: string | null;

  @Column("bigint", { name: "Width", nullable: true })
  width: string | null;

  @Column("bigint", { name: "Height", nullable: true })
  height: string | null;

  @OneToMany(() => EmployeeUsers, (employeeUsers) => employeeUsers.pictureFile)
  employeeUsers: EmployeeUsers[];

  @OneToMany(() => Model, (model) => model.thumbnailFile)
  models: Model[];
}
