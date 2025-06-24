import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "varchar",
    length: 20,
    default: "pending", // 'pending', 'paid', 'cancelled'
  })
  status!: string;

  @Column("decimal")
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne('User', (user: User) => user.orders)
  user!: User;

  @ManyToOne(() => Product)
  product!: Product;
} 