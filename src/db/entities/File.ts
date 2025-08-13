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
@Index("File_PublicId_idx", ["publicId"], { unique: true })
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

  @Column("integer", { name: "Width", nullable: true })
  width: number | null;

  @Column("integer", { name: "Height", nullable: true })
  height: number | null;

  @OneToMany(() => EmployeeUsers, (employeeUsers) => employeeUsers.pictureFile)
  employeeUsers: EmployeeUsers[];

  @OneToMany(() => Model, (model) => model.thumbnailFile)
  models: Model[];
}
