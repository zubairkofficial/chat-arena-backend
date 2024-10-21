import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + `/../**/*.entity.${isDevelopment ? 'ts' : 'js'}`], // .ts for development, .js for production
  migrations: [__dirname + `/../migrations/*.${isDevelopment ? 'ts' : 'js'}`], // Same for migrations
  synchronize: false, // Always use migrations in production
  ssl: {
    rejectUnauthorized: false, // Important for connecting securely to Neon DB
  },
  logging: true, // Enable for debugging, but disable in production
});
