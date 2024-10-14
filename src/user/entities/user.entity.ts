import { EntityBase } from "../../base/entityBase";
import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";


@Entity({ name: "user" })
export class User extends EntityBase {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id: string;

  @Column({ name: "name", type: "varchar", nullable: false })
  name: string;

  @Column({ name: "user_name", type: "varchar", nullable: false,unique:true })
  username: string;

  @Column({ name: "email", type: "varchar", unique: true })
  email: string;

  @Column({ name: "phone_number", type: "varchar", nullable: true })
  phoneNumber: string;

  @Column({ name: "password", type: "varchar", nullable: true })
  password: string;

  @Column({ name: "is_active", type: "boolean", default: false })
  isActive: boolean;

  @Column({ name: "is_admin", type: "boolean", default: false })
  isAdmin: boolean;

}
