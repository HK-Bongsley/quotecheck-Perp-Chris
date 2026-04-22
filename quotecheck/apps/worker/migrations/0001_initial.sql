-- QuoteCheck v1 Database Schema for Cloudflare D1

-- Pricing Versions (audit trail)
CREATE TABLE IF NOT EXISTS pricing_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Job Categories
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  example_use TEXT,
  display_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Geographic Areas (US ZIP codes initially)
CREATE TABLE IF NOT EXISTS area_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_code TEXT NOT NULL UNIQUE,
  area_name TEXT NOT NULL,
  state_code TEXT,
  country_code TEXT DEFAULT 'US',
  cost_index REAL DEFAULT 1.0,
  population_tier TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Base Pricing Table
CREATE TABLE IF NOT EXISTS pricing_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pricing_version_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  area_id INTEGER NOT NULL,
  base_low REAL NOT NULL,
  base_typical REAL NOT NULL,
  base_high REAL NOT NULL,
  confidence_boost REAL DEFAULT 1.0,
  notes TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pricing_version_id) REFERENCES pricing_versions(id),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (area_id) REFERENCES area_profiles(id),
  UNIQUE(pricing_version_id, category_id, area_id)
);

-- Dynamic Question Sets
CREATE TABLE IF NOT EXISTS question_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  display_order INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Individual Questions
CREATE TABLE IF NOT EXISTS question_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_set_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  help_text TEXT,
  required BOOLEAN DEFAULT 1,
  display_order INTEGER,
  options TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_set_id) REFERENCES question_sets(id)
);

-- Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  condition_field TEXT,
  condition_value TEXT,
  adjustment_value REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Estimate Runs
CREATE TABLE IF NOT EXISTS estimate_runs (
  id TEXT PRIMARY KEY,
  category_id INTEGER NOT NULL,
  area_id INTEGER NOT NULL,
  pricing_version_id INTEGER NOT NULL,
  user_answers TEXT NOT NULL,
  photo_keys TEXT,
  estimate_low REAL NOT NULL,
  estimate_typical REAL NOT NULL,
  estimate_high REAL NOT NULL,
  confidence_level TEXT NOT NULL,
  confidence_score REAL,
  assumptions TEXT,
  exclusions TEXT,
  reason_breakdown TEXT,
  disclaimers TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (area_id) REFERENCES area_profiles(id),
  FOREIGN KEY (pricing_version_id) REFERENCES pricing_versions(id)
);

-- Uploaded Photos
CREATE TABLE IF NOT EXISTS uploaded_photos (
  id TEXT PRIMARY KEY,
  estimate_id TEXT,
  r2_key TEXT NOT NULL UNIQUE,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  photo_signal TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimate_runs(id)
);

-- Admin Audit Log
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  changes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_estimates_created ON estimate_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_area ON estimate_runs(area_id);
CREATE INDEX IF NOT EXISTS idx_estimates_category ON estimate_runs(category_id);
CREATE INDEX IF NOT EXISTS idx_pricing_active ON pricing_tables(pricing_version_id, category_id, area_id);
CREATE INDEX IF NOT EXISTS idx_photos_estimate ON uploaded_photos(estimate_id);
CREATE INDEX IF NOT EXISTS idx_area_code ON area_profiles(area_code);
