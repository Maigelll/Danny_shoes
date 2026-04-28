-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable Row Level Security globally (applied per table in Prisma migrations)
-- This script runs once on first DB initialization

-- Create read replica user (for analytics queries)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dannyshoes_readonly') THEN
    CREATE ROLE dannyshoes_readonly WITH LOGIN PASSWORD 'readonly_2024';
    GRANT CONNECT ON DATABASE dannyshoes_dev TO dannyshoes_readonly;
  END IF;
END
$$;
