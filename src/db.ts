import { Sequelize } from 'sequelize';
import Logger from './utils/logger';
import dotenv from 'dotenv';
dotenv.config()


if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_HOST) {
   throw new Error("Missing environment variables: DB_NAME, DB_USER, or DB_PASS");
}


const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    dialect: 'mariadb',
    host: process.env.DB_HOST,
    logging: false
  })
  
async function connect() {
  try {
    await db.authenticate();
    Logger.logSuccess('Database connection has been established successfully.');
  } catch (error) {
    Logger.logError('Unable to connect to the database: ' + error);
    return;
  }
}

export { db, connect };