-- Phase 2: Leads & Email Capture
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  estimate_id TEXT UNIQUE,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  job_category_id INTEGER,
  job_description TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
  contacted_at TIMESTAMP,
  quoted_at TIMESTAMP,
  converted_at TIMESTAMP,
  conversion_value REAL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimate_runs(id),
  FOREIGN KEY (job_category_id) REFERENCES categories(id)
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_category ON leads(job_category_id);

-- Email settings for lead notifications
CREATE TABLE email_settings (
  id TEXT PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('sendgrid', 'mailgun', 'aws_ses', 'resend')),
  api_key TEXT NOT NULL,
  from_email TEXT NOT NULL,
  notification_email TEXT NOT NULL,
  daily_digest BOOLEAN DEFAULT TRUE,
  digest_time TEXT DEFAULT '09:00',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Lead source tracking for analytics
CREATE TABLE lead_sources (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('organic', 'paid_search', 'referral', 'direct')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX idx_lead_sources_source ON lead_sources(source);
