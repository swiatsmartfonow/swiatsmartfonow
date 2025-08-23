CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  author TEXT,
  urls JSONB,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);