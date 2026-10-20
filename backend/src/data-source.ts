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
  const dir = path.dirname(dbPath);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Read-only filesystem (e.g. Vercel): fall back to the committed db path's directory if present.
  }

  // Only enable auto-save when the target directory is actually writable.
  let autoSave = true;
  try {
    fs.accessSync(dir, fs.constants.W_OK);
  } catch {
    autoSave = false;
  }

  // Pre-load the sql.js WebAssembly binary so Vercel's file tracer includes it
  // and we don't depend on a (possibly missing) node_modules file at runtime.
  let wasmBinary: Buffer | undefined;
  try {
    wasmBinary = fs.readFileSync(path.join(__dirname, '..', 'data', 'sql-wasm.wasm'));
  } catch {
    try {
      wasmBinary = fs.readFileSync(path.join(process.cwd(), 'data', 'sql-wasm.wasm'));
    } catch {
      wasmBinary = undefined;
    }
  }

  return {
    type: 'sqljs',
    location: dbPath,
    autoSave,
    useLocalForage: false,
    sqlJsConfig: wasmBinary ? { wasmBinary } : undefined,
    entities: ENTITIES,
    synchronize: true,
    logging: false,
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());
