import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { ENTITIES } from './entities';

dotenv.config();

const dbPath = process.env.DB_PATH || 'data/pulseforge.db';
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'sqljs',
  database: dbPath,
  location: dbPath,
  autoSave: true,
  useLocalForage: false,
  entities: ENTITIES,
  synchronize: true,
  logging: false,
});