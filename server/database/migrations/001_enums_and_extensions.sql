-- AgriculNet — Enums and PostgreSQL Extensions
-- Run this first in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ── AUTH ENUMS ────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'farmer',
  'local_buyer',
  'international_buyer',
  'field_agent',
  'admin',
  'super_admin'
);

CREATE TYPE user_status AS ENUM (
  'pending_verification',
  'pending_review',
  'active',
  'suspended',
  'rejected',
  'deactivated'
);

CREATE TYPE buyer_type AS ENUM (
  'local',
  'international',
  'business_reseller'
);

CREATE TYPE otp_purpose AS ENUM (
  'phone_verification',
  'password_reset',
  'login_otp'
);

CREATE TYPE token_type AS ENUM (
  'email_verification',
  'password_reset',
  'refresh_token'
);

-- ── MARKETPLACE ENUMS ──────────────────────────────────────────
CREATE TYPE listing_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'sold_out',
  'archived',
  'rejected'
);

CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'confirmed',
  'inspection_in_progress',
  'verified',
  'processing',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
  'disputed'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'held_in_escrow',
  'released',
  'refunded',
  'failed'
);

CREATE TYPE payment_channel AS ENUM (
  'mtn_momo',
  'orange_money',
  'bank_transfer',
  'credit_card',
  'cash_on_delivery'
);

CREATE TYPE inspection_status AS ENUM (
  'pending',
  'scheduled',
  'in_progress',
  'passed',
  'failed',
  're_inspection_required'
);

CREATE TYPE dispute_status AS ENUM (
  'open',
  'under_review',
  'escalated',
  'resolved',
  'dismissed'
);

CREATE TYPE notification_type AS ENUM (
  'system',
  'order_update',
  'payment_received',
  'new_message',
  'listing_approved',
  'dispute_update'
);

CREATE TYPE doc_type AS ENUM (
  'export_license',
  'phytosanitary_cert',
  'certificate_of_origin',
  'packing_list',
  'invoice',
  'inspection_report'
);

