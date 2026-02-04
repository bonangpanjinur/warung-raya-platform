-- SQL script to completely reset the Supabase database schema

-- IMPORTANT: This script will permanently delete all data and schema objects
-- in the public schema. Use with extreme caution, especially in production environments.

-- Disable RLS temporarily to allow dropping tables with RLS enabled
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kas_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifikator_withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifikator_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_earnings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_fund DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

-- Drop views
DROP VIEW IF EXISTS public.public_merchants CASCADE;
DROP VIEW IF EXISTS public.public_couriers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_verifikator() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_order_merchant(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_order_merchant(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_courier_owner(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_order_courier(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_quota_cost(integer) CASCADE;
DROP FUNCTION IF EXISTS public.use_merchant_quota(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop tables
DROP TABLE IF EXISTS public.rate_limits CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.backup_schedules CASCADE;
DROP TABLE IF EXISTS public.backup_logs CASCADE;
DROP TABLE IF EXISTS public.admin_audit_logs CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.saved_addresses CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.broadcast_notifications CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;
DROP TABLE IF EXISTS public.insurance_fund CASCADE;
DROP TABLE IF EXISTS public.platform_fees CASCADE;
DROP TABLE IF EXISTS public.courier_earnings CASCADE;
DROP TABLE IF EXISTS public.verifikator_codes CASCADE;
DROP TABLE IF EXISTS public.verifikator_withdrawals CASCADE;
DROP TABLE IF EXISTS public.withdrawal_requests CASCADE;
DROP TABLE IF EXISTS public.refund_requests CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.flash_sales CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.couriers CASCADE;
DROP TABLE IF EXISTS public.tourism CASCADE;
DROP TABLE IF EXISTS public.quota_tiers CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.kas_payments CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.merchant_subscriptions CASCADE;
DROP TABLE IF EXISTS public.merchants CASCADE;
DROP TABLE IF EXISTS public.transaction_packages CASCADE;
DROP TABLE IF EXISTS public.trade_groups CASCADE;
DROP TABLE IF EXISTS public.villages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop extensions (optional, but good for a complete reset)
DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Re-enable RLS on all tables (if needed after re-creating schema)
-- This part should be handled by your new complete_database.sql script
