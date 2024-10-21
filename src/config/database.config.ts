import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { parse } from 'pg-connection-string';

dotenv.config();

const dbConfig = parse(process.env.DATABASE_URL);

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: dbConfig.host, // Extracted host
  port: Number(dbConfig.port) || 5432, // Extracted port or default to 5432
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: {
    rejectUnauthorized: false, // Important for SSL connections
  },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
};
