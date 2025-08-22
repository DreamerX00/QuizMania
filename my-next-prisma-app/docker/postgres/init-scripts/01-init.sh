#!/bin/bash
set -e

# Create additional databases if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    -- Create additional schemas if needed
    CREATE SCHEMA IF NOT EXISTS analytics;
    CREATE SCHEMA IF NOT EXISTS monitoring;
    
    -- Create indexes for performance
    -- These will be created by Prisma migrations, but kept here as reference
    
    -- Grant necessary permissions
    GRANT ALL PRIVILEGES ON DATABASE quizmania TO quizmania;
    GRANT ALL PRIVILEGES ON SCHEMA public TO quizmania;
    GRANT ALL PRIVILEGES ON SCHEMA analytics TO quizmania;
    GRANT ALL PRIVILEGES ON SCHEMA monitoring TO quizmania;
    
    -- Performance tuning settings
    ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
    ALTER SYSTEM SET max_connections = 200;
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET maintenance_work_mem = '64MB';
    ALTER SYSTEM SET checkpoint_completion_target = 0.9;
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = 100;
    ALTER SYSTEM SET random_page_cost = 1.1;
    ALTER SYSTEM SET effective_io_concurrency = 200;
    
    -- Logging settings
    ALTER SYSTEM SET log_destination = 'stderr';
    ALTER SYSTEM SET logging_collector = on;
    ALTER SYSTEM SET log_directory = 'pg_log';
    ALTER SYSTEM SET log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log';
    ALTER SYSTEM SET log_statement = 'mod';
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    
    SELECT pg_reload_conf();
EOSQL

echo "PostgreSQL initialization completed successfully!"
