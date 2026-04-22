CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'inactive', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'winning_status') THEN
    CREATE TYPE winning_status AS ENUM ('pending_proof', 'approved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status') THEN
    CREATE TYPE payout_status AS ENUM ('pending', 'paid');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  contribution_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00 CHECK (contribution_percent >= 10 AND contribution_percent <= 100),
  subscription_status subscription_status NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status subscription_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(12) NOT NULL DEFAULT 'usd',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, played_at)
);

CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month VARCHAR(7) NOT NULL UNIQUE,
  draw_numbers INT[] NOT NULL,
  prize_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  rollover_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  five_match_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  four_match_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  three_match_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  unclaimed_jackpot NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS winnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_count INT NOT NULL CHECK (match_count BETWEEN 3 AND 5),
  matched_numbers INT[] NOT NULL,
  prize_tier VARCHAR(20) NOT NULL CHECK (prize_tier IN ('jackpot', 'tier_2', 'tier_3')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status winning_status NOT NULL DEFAULT 'pending_proof',
  payout_status payout_status NOT NULL DEFAULT 'pending',
  proof_url TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(12) NOT NULL DEFAULT 'usd',
  provider VARCHAR(50) NOT NULL,
  provider_reference TEXT,
  status VARCHAR(20) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_scores_user_played_at ON scores(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_draws_month ON draws(draw_month DESC);
CREATE INDEX IF NOT EXISTS idx_winnings_user ON winnings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

INSERT INTO charities (name, description, website_url, logo_url)
VALUES
  ('First Tee', 'Youth development through golf.', 'https://firsttee.org', NULL),
  ('Make-A-Wish', 'Creating life-changing wishes for children.', 'https://wish.org', NULL),
  ('Macmillan Cancer Support', 'Support for people living with cancer.', 'https://www.macmillan.org.uk', NULL)
ON CONFLICT (name) DO NOTHING;
