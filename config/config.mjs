import * as dotenv from "dotenv";
import { resolve } from "path";

const rawEnv = (process.env.NODE_ENV || "").toLowerCase();
const stage =
    rawEnv === "prod" || rawEnv === "production"
        ? "production"
        : rawEnv === "dev" || rawEnv === "development"
          ? "development"
          : "development";

const envPath =
    stage === "production"
        ? resolve(process.cwd(), ".env.production")
        : resolve(process.cwd(), ".env.development");

dotenv.config({ path: envPath });

const must = key => {
    const v = process.env[key];
    if (v === undefined || v === null || v === "") {
        throw new Error(`[sequelize-cli] Missing required env: ${key}`);
    }
    return String(v);
};

const base = {
    username: must("POSTGRES_USER"),
    password: must("POSTGRES_PASSWORD"),
    database: must("POSTGRES_DB"),
    host: must("POSTGRES_HOST"),
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    dialect: "postgres",
    logging: false,
    dialectOptions:
        (process.env.POSTGRES_SSL || "").toString().toLowerCase() === "true"
            ? { ssl: { require: true } }
            : {},
};

export default {
    development: { ...base },
    production: { ...base },
};
