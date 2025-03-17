import { Sequelize } from 'sequelize';
import Logger from './utils/logger';
import dotenv from 'dotenv';
dotenv.config()

let DB_NAME = process.env.DB_NAME || "";
let DB_USER = process.env.DB_USER || "";
let DB_PASS = process.env.DB_PASS || "";

if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
  Logger.logError("Missing environment variables: DB_NAME, DB_USER, or DB_PASS");
}


const db = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    dialect: 'mariadb',
    host: '127.0.0.1',
    logging: false
  })
  
async function connect() {
  try {
    await db.authenticate();
    Logger.logSuccess('Database connection has been established successfully.');
  } catch (error) {
    Logger.logError('Unable to connect to the database: ' + error);
  }
}

export { db, connect };