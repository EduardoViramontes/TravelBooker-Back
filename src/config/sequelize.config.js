require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    username: process.env.DB_USERNAME_DEVELOPMENT,
    password: process.env.DB_PASSWORD_DEVELOPMENT,
    database: process.env.DB_DATABASE_DEVELOPMENT,
    host: process.env.DB_HOST_DEVELOPMENT,
    dialect: process.env.DB_DIALECT_DEVELOPMENT || 'postgres',
    timezone: '-06:00',
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    database: process.env.DB_DATABASE_TEST,
    host: process.env.DB_HOST_TEST,
    dialect: process.env.DB_DIALECT_TEST || 'postgres',
    timezone: '-06:00',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME_PRODUCTION,
    password: process.env.DB_PASSWORD_PRODUCTION,
    database: process.env.DB_DATABASE_PRODUCTION,
    host: process.env.DB_HOST_PRODUCTION,
    dialect: process.env.DB_DIALECT_PRODUCTION || 'postgres',
    timezone: '-06:00',
    logging: false,
  },
};

module.exports = configs[env];
