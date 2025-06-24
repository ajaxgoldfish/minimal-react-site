import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./Order";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    clerkId!: string;

    @Column({ nullable: true })
    name!: string;

    @Column({ nullable: true })
    age!: number;

    @OneToMany('Order', (order: Order) => order.user)
    orders!: Order[];
} 