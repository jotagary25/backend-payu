import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  referenceCode!: string;

  @Column()
  transactionId!: string;

  @Column()
  status!: string;

  @Column()
  value!: string;

  @Column()
  currency!: string;

  @Column()
  buyerEmail!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
