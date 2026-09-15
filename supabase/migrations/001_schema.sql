-- ============================================================
-- CallMind AI — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search on names

-- ============================================================
-- AGENCIES
-- ============================================================
CREATE TABLE IF NOT EXISTS agencies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agencies_created_at ON agencies(created_at DESC);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role         TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent','sales_manager','agency_admin')),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_agency    ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id           UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT,
  source              TEXT NOT NULL DEFAULT 'manual',
  intent              TEXT NOT NULL DEFAULT 'buy' CHECK (intent IN ('buy','rent','invest','sell')),
  status              TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','engaging','qualified','reviewing','human-required','converted')),
  contact_eligibility BOOLEAN NOT NULL DEFAULT TRUE,
  consent_status      TEXT NOT NULL DEFAULT 'opted_in',
  notes               TEXT,
  budget              TEXT,
  location            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookups for agency dashboard
CREATE INDEX IF NOT EXISTS idx_leads_agency         ON leads(agency_id);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON leads(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at     ON leads(agency_id, created_at DESC);
-- Full-text search on lead name
CREATE INDEX IF NOT EXISTS idx_leads_name_trgm      ON leads USING GIN (name gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- QUALIFICATION STRATEGIES
-- ============================================================
CREATE TABLE IF NOT EXISTS qualification_strategies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  objective   TEXT NOT NULL,
  questions   JSONB NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategies_agency    ON qualification_strategies(agency_id);
CREATE INDEX IF NOT EXISTS idx_strategies_lead      ON qualification_strategies(lead_id);
CREATE INDEX IF NOT EXISTS idx_strategies_status    ON qualification_strategies(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_strategies_created   ON qualification_strategies(agency_id, created_at DESC);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  channel     TEXT NOT NULL DEFAULT 'SMS' CHECK (channel IN ('SMS','Email','Voice','WhatsApp')),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','waiting','completed','human-required')),
  sentiment   TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  ai_handled  BOOLEAN NOT NULL DEFAULT TRUE,
  -- JSONB for messages: queryable, indexable, no extra table needed
  messages    JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_agency      ON conversations(agency_id);
CREATE INDEX IF NOT EXISTS idx_conv_lead        ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conv_status      ON conversations(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_conv_updated     ON conversations(agency_id, updated_at DESC);
-- Index for querying last message inside JSONB
CREATE INDEX IF NOT EXISTS idx_conv_messages    ON conversations USING GIN (messages);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  agency_id         UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  INTEGER NOT NULL DEFAULT 60,
  appointment_type  TEXT NOT NULL DEFAULT 'Property Viewing',
  property_address  TEXT,
  agent_id          UUID REFERENCES users(id),
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','completed','invited','cancelled')),
  notes             TEXT,
  confirmation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appt_agency      ON appointments(agency_id);
CREATE INDEX IF NOT EXISTS idx_appt_lead        ON appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appt_status      ON appointments(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_appt_scheduled   ON appointments(agency_id, scheduled_at DESC);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-transition lead to 'reviewing' when appointment booked
CREATE OR REPLACE FUNCTION on_appointment_created()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads SET status = 'reviewing', updated_at = NOW()
  WHERE id = NEW.lead_id AND status NOT IN ('qualified','converted');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appt_lead_status_transition
  AFTER INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION on_appointment_created();

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  actor_type   TEXT NOT NULL,
  actor_id     UUID NOT NULL,
  event_type   TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_agency     ON audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_logs(agency_id, created_at DESC);

-- ============================================================
-- ANALYTICS — Stored Procedures (optimized single-query)
-- ============================================================
CREATE OR REPLACE FUNCTION get_agency_funnel(p_agency_id UUID)
RETURNS TABLE(status TEXT, count BIGINT, pct NUMERIC) AS $$
  SELECT
    status,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) AS pct
  FROM leads
  WHERE agency_id = p_agency_id
  GROUP BY status
  ORDER BY CASE status
    WHEN 'new'            THEN 1
    WHEN 'engaging'       THEN 2
    WHEN 'qualified'      THEN 3
    WHEN 'reviewing'      THEN 4
    WHEN 'human-required' THEN 5
    WHEN 'converted'      THEN 6
    ELSE 7 END;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_agency_channel_breakdown(p_agency_id UUID)
RETURNS TABLE(source TEXT, count BIGINT, pct NUMERIC) AS $$
  SELECT
    COALESCE(source, 'Unknown') AS source,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) AS pct
  FROM leads
  WHERE agency_id = p_agency_id
  GROUP BY source
  ORDER BY count DESC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_weekly_activity(p_agency_id UUID)
RETURNS TABLE(day DATE, conversations BIGINT, qualified BIGINT, booked BIGINT) AS $$
  WITH days AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE AS day
  )
  SELECT
    d.day,
    COUNT(DISTINCT c.id) AS conversations,
    COUNT(DISTINCT l.id) FILTER (WHERE l.status IN ('qualified','converted')) AS qualified,
    COUNT(DISTINCT a.id) AS booked
  FROM days d
  LEFT JOIN conversations c ON c.agency_id = p_agency_id AND c.created_at::DATE = d.day
  LEFT JOIN leads l ON l.agency_id = p_agency_id AND l.updated_at::DATE = d.day
  LEFT JOIN appointments a ON a.agency_id = p_agency_id AND a.created_at::DATE = d.day
  GROUP BY d.day
  ORDER BY d.day;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE agencies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualification_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs              ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- REALTIME — Enable live updates for conversations + appointments
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
