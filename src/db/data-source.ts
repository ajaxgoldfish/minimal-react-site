import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
}); 