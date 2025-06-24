import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    
    logging: true,
    entities: [User, Product],
    subscribers: [],
    migrations: [],
}); 