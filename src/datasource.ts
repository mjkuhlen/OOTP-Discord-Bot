import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "db.sql",
    logging: false,
    entities: ['dist/entity/*.{ts,js}'],
    synchronize: true,
});