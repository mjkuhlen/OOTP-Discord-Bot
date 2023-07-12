import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;
    
    @Column({ default: false })
    ready!: boolean;

    @Column({nullable: true})
    gameDate!: string;
}