import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'ep-sparkling-truth-a145t3wy-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  username: 'neondb_owner',
  password: '4GpuRjAck1ad',
  database: 'neondb',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Make sure this path includes all entities
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});
