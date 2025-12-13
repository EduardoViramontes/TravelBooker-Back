import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";


interface DBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: any;
  timezone: string;
  logging: boolean;
}

const configs: Record<string, DBConfig> = {
  development: {
    username: process.env.DB_USERNAME_DEVELOPMENT!,
    password: process.env.DB_PASSWORD_DEVELOPMENT!,
    database: process.env.DB_DATABASE_DEVELOPMENT!,
    host: process.env.DB_HOST_DEVELOPMENT!,
    dialect: process.env.DB_DIALECT_DEVELOPMENT!,
    timezone: "-06:00",
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME_TEST!,
    password: process.env.DB_PASSWORD_TEST!,
    database: process.env.DB_DATABASE_TEST!,
    host: process.env.DB_HOST_TEST!,
    dialect: process.env.DB_DIALECT_TEST!,
    timezone: "-06:00",
    logging: false,
  },
  producction: {
    username: process.env.DB_USERNAME_PRODUCCTION!,
    password: process.env.DB_PASSWORD_PRODUCCTION!,
    database: process.env.DB_DATABASE_PRODUCCTION!,
    host: process.env.DB_HOST_PRODUCCTION!,
    dialect: process.env.DB_DIALECT_PRODUCCTION!,
    timezone: "-06:00",
    logging: false,
  },
};

const config = configs[env];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const db: any = {
  models: {}
};

// Cargar todos los modelos .ts
const modelsPath = path.join(__dirname, "models");

fs.readdirSync(modelsPath).filter((file) => {
  return (
    file.indexOf(".") !== 0 && file !== basename && (file.slice(-3) === ".ts" || file.slice(-3) === ".js") && !file.endsWith(".test.ts"));
}).forEach((file) => {
  if (file !== "relaciones.ts") {
     const modelImport = require(path.join(modelsPath, file));
      const model = modelImport.initModel ? modelImport.initModel(sequelize) : null;
      if (model) {
        db.models[model.name] = model;
      }
  }
});

// Relaciones
Object.keys(db.models).forEach((modelName) => {
  if (db.models[modelName].associate) {
    db.models[modelName].associate(db.models);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
