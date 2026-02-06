-- ROADMAP PHASE 4: MONITORING & PREVENTION (LONG-TERM)
-- This script sets up low quota alerts and an auto-reconciliation job.

-- 1. Low Quota Alert System
-- This trigger automatically sends a notification when quota falls below a threshold.
CREATE OR REPLACE FUNCTION public.check_low_quota_alert()
RETURNS TRIGGER AS $$
DECLARE
    v_remaining INTEGER;
    v_merchant_name TEXT;
    v_user_id UUID;
BEGIN
    v_remaining := NEW.transaction_quota - NEW.used_quota;
    
    -- Only alert if quota just crossed the threshold (e.g., 5)
    -- and it's a reduction in quota (used_quota increased)
    IF v_remaining <= 5 AND NEW.used_quota > OLD.used_quota AND (OLD.transaction_quota - OLD.used_quota) > 5 THEN
        -- Get merchant info
        SELECT name, user_id INTO v_merchant_name, v_user_id
        FROM public.merchants
        WHERE id = NEW.merchant_id;

        -- Send notification (using existing send_notification RPC)
        PERFORM public.send_notification(
            v_user_id,
            'Kuota Transaksi Hampir Habis',
            'Sisa kuota transaksi Anda tinggal ' || v_remaining || '. Segera isi ulang agar toko tetap aktif.',
            'warning',
            '/merchant/subscription'
        );
    END IF;

    -- Alert if quota is completely empty
    IF v_remaining = 0 AND NEW.used_quota > OLD.used_quota AND (OLD.transaction_quota - OLD.used_quota) > 0 THEN
        SELECT name, user_id INTO v_merchant_name, v_user_id
        FROM public.merchants
        WHERE id = NEW.merchant_id;

        PERFORM public.send_notification(
            v_user_id,
            'Kuota Transaksi Habis!',
            'Kuota transaksi Anda telah habis. Toko Anda sementara tidak dapat menerima pesanan baru.',
            'error',
            '/merchant/subscription'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_quota_usage_alert ON public.merchant_subscriptions;
CREATE TRIGGER on_quota_usage_alert
    AFTER UPDATE OF used_quota ON public.merchant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.check_low_quota_alert();

-- 2. Auto-reconciliation Job (Conceptual for Edge Function)
-- This query can be run by a cron job to detect anomalies.
CREATE OR REPLACE VIEW public.quota_anomalies AS
WITH purchase_summary AS (
    SELECT merchant_id, SUM(transaction_quota) as total_granted
    FROM public.merchant_subscriptions
    WHERE payment_status = 'PAID'
    GROUP BY merchant_id
),
usage_summary AS (
    SELECT merchant_id, COUNT(*) as total_used
    FROM public.orders
    WHERE status NOT IN ('CANCELLED', 'REFUNDED')
    GROUP BY merchant_id
),
current_status AS (
    SELECT merchant_id, SUM(transaction_quota - used_quota) as current_remaining
    FROM public.merchant_subscriptions
    WHERE status = 'ACTIVE' AND expired_at > now()
    GROUP BY merchant_id
)
SELECT 
    m.id as merchant_id,
    m.name as merchant_name,
    COALESCE(ps.total_granted, 0) as purchased,
    COALESCE(us.total_used, 0) as used,
    COALESCE(cs.current_remaining, 0) as actual,
    (COALESCE(ps.total_granted, 0) - COALESCE(us.total_used, 0)) as expected,
    ((COALESCE(ps.total_granted, 0) - COALESCE(us.total_used, 0)) - COALESCE(cs.current_remaining, 0)) as discrepancy
FROM public.merchants m
LEFT JOIN purchase_summary ps ON m.id = ps.merchant_id
LEFT JOIN usage_summary us ON m.id = us.merchant_id
LEFT JOIN current_status cs ON m.id = cs.merchant_id
WHERE ABS((COALESCE(ps.total_granted, 0) - COALESCE(us.total_used, 0)) - COALESCE(cs.current_remaining, 0)) > 0;

-- 3. Admin Dashboard Helper
-- Summary of quota circulation for admin monitoring.
CREATE OR REPLACE VIEW public.quota_circulation_summary AS
SELECT 
    COUNT(DISTINCT merchant_id) as active_merchants,
    SUM(transaction_quota) as total_quota_issued,
    SUM(used_quota) as total_quota_used,
    SUM(transaction_quota - used_quota) as total_quota_remaining,
    ROUND(AVG((used_quota::numeric / NULLIF(transaction_quota, 0)) * 100), 2) as avg_usage_percentage
FROM public.merchant_subscriptions
WHERE status = 'ACTIVE' AND expired_at > now();
