import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ENTITIES } from './entities';

dotenv.config();

const dbType = (process.env.DB_TYPE || 'sqljs').toLowerCase();

export function buildDataSourceOptions(): DataSourceOptions {
  if (dbType === 'postgres' || dbType === 'postgresql') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'pulseforge',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pulseforge',
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    };
  }

  const dbPath = process.env.DB_PATH || 'data/pulseforge.db';
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  return {
    type: 'sqljs',
    location: dbPath,
    autoSave: true,
    useLocalForage: false,
    entities: ENTITIES,
    synchronize: true,
    logging: false,
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());
