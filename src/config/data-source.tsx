import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Event } from "../entities/Event";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || "your-username",
    password: process.env.DB_PASSWORD || "your-password",
    database: process.env.DB_NAME || "nextjs_db",
    entities: [User, Event],
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
});
