import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Use connection pool for better performance in serverless/long-running
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema, mode: "default" });
