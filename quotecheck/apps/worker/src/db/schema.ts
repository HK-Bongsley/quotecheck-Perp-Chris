import type { Env } from '../handler';
import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';

export const schema = {
  categories: sql`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  areas: sql`
    CREATE TABLE areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      postcode_pattern TEXT,
      pricing_multiplier DECIMAL(3,2) DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  pricing_table: sql`
    CREATE TABLE pricing_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      version INTEGER DEFAULT 1,
      base_low INTEGER NOT NULL,
      base_typical INTEGER NOT NULL,
      base_high INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (area_id) REFERENCES areas(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `,

  estimate_runs: sql`
    CREATE TABLE estimate_runs (
      id TEXT PRIMARY KEY,
      category_id INTEGER NOT NULL,
      area_id INTEGER NOT NULL,
      answers JSON NOT NULL,
      photo_keys TEXT[],
      low INTEGER NOT NULL,
      typical INTEGER NOT NULL,
      high INTEGER NOT NULL,
      confidence TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (area_id) REFERENCES areas(id)
    )
  `,

  uploaded_photos: sql`
    CREATE TABLE uploaded_photos (
      id TEXT PRIMARY KEY,
      estimate_id TEXT NOT NULL,
      r2_key TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (estimate_id) REFERENCES estimate_runs(id)
    )
  `
};