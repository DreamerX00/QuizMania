-- Development database initialization
-- This file is used in development environment

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create development schemas
CREATE SCHEMA IF NOT EXISTS dev_analytics;
CREATE SCHEMA IF NOT EXISTS dev_testing;

-- Create a test user for development
CREATE USER IF NOT EXISTS dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE quizmania_dev TO dev_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO dev_user;
