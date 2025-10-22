import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'studydash',
  process.env.DB_USER || 'studydash_user',
  process.env.DB_PASSWORD || 'studydash_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mariadb',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export default { sequelize, testConnection };
