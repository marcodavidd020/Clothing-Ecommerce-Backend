 -- ==========================================
-- 🗄️  Database Initialization Script
-- ==========================================

-- Create database if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecommerce_db') THEN
      PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE ecommerce_db');
   END IF;
END
$do$;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM (
            'PENDING_PAYMENT',
            'PROCESSING', 
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'FAILED',
            'COMPLETED',
            'REFUNDED'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM (
            'PENDING',
            'PROCESSING',
            'PAID',
            'FAILED',
            'CANCELLED',
            'REFUNDED'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM (
            'CARD',
            'PAYPAL',
            'BANK_TRANSFER',
            'CASH_ON_DELIVERY'
        );
    END IF;
END $$;

-- Set timezone
SET timezone TO 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE '✅ Database initialized successfully at %', NOW();
END $$;