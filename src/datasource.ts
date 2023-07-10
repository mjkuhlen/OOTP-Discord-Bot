import "reflect-metadata"
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "db.sql",
    logging: false,
    entities: ['entity/*.{ts,js}'],
    synchronize: true,
});