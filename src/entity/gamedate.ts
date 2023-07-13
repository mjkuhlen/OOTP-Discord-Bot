import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GameDate {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    date!: string;
}