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
    // Prefer a full connection string (e.g. Neon's DATABASE_URL) when present,
    // falling back to the individual DB_* variables for local Postgres.
    let host = process.env.DB_HOST || 'localhost';
    let port = parseInt(process.env.DB_PORT || '5432', 10);
    let username = process.env.DB_USER || 'pulseforge';
    let password = process.env.DB_PASSWORD || '';
    let database = process.env.DB_NAME || 'pulseforge';
    let sslMode = (process.env.DB_SSLMODE || '').toLowerCase();

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const u = new URL(databaseUrl);
        host = u.hostname || host;
        port = parseInt(u.port || String(port), 10);
        username = decodeURIComponent(u.username || username);
        password = decodeURIComponent(u.password || password);
        database = (u.pathname || '').replace(/^\//, '') || database;
        if (!sslMode) sslMode = (u.searchParams.get('sslmode') || '').toLowerCase();
      } catch {
        // Fall back to DB_* variables if the URL cannot be parsed.
      }
    }

    const ssl =
      sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full' || host.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined;

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      ssl,
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
