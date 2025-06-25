import { DataSource } from "typeorm";
import path from 'path';

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    
    logging: true,
    entities: [path.join(__dirname, '/entity/*.{js,ts}')],
    subscribers: [],
    migrations: [],
}); 