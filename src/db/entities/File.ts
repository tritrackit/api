import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Model } from "./Model";

@Index("pk_files_901578250", ["fileId"], { unique: true })
@Entity("File", { schema: "dbo" })
export class File {
  @PrimaryGeneratedColumn({ type: "bigint", name: "FileId" })
  fileId: string;

  @Column("text", { name: "FileName" })
  fileName: string;

  @Column("text", { name: "Url", nullable: true })
  url: string | null;

  @Column("text", { name: "GUID" })
  guid: string;

  @OneToMany(() => Model, (model) => model.thumbnailFile)
  models: Model[];
}
