#!/usr/bin/env node
/**
 * Verify the auth-critical Supabase schema used by the local AgriculNet app.
 * This checks the real tables and columns referenced by the current auth code.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const REQUIRED_TABLES = [
  'users',
  'farmer_profiles',
  'buyer_profiles',
  'tokens',
  'otps',
  'audit_logs',
  'activity_events'
];

const REQUIRED_COLUMNS = [
  ['users', 'reviewed_at', '023_auto_approval_setup.sql'],
  ['users', 'banned_at', '024_enhanced_verification.sql'],
  ['users', 'ban_reason', '024_enhanced_verification.sql'],
  ['farmer_profiles', 'primary_crop', '022_profile_extensions.sql'],
  ['farmer_profiles', 'harvest_volume', '022_profile_extensions.sql'],
  ['farmer_profiles', 'export_ready', '022_profile_extensions.sql'],
  ['farmer_profiles', 'inspection_preference', '022_profile_extensions.sql'],
  ['farmer_profiles', 'payout_method', '022_profile_extensions.sql'],
  ['farmer_profiles', 'payout_account_name', '022_profile_extensions.sql'],
  ['farmer_profiles', 'payout_phone', '022_profile_extensions.sql'],
  ['farmer_profiles', 'notification_opt_in', '022_profile_extensions.sql'],
  ['farmer_profiles', 'id_front_url', '024_enhanced_verification.sql'],
  ['farmer_profiles', 'id_back_url', '024_enhanced_verification.sql'],
  ['farmer_profiles', 'selfie_url', '024_enhanced_verification.sql'],
  ['farmer_profiles', 'verification_submitted_at', '024_enhanced_verification.sql'],
  ['buyer_profiles', 'destination_market', '022_profile_extensions.sql']
];

const REQUIRED_ENUM_VALUES = [
  ['users', 'status', 'pending_identity_verification', '024_enhanced_verification.sql']
];

const REQUIRED_MIGRATIONS = [
  '001_enums_and_extensions.sql',
  '002_users_table.sql',
  '003_farmer_profiles.sql',
  '004_buyer_profiles.sql',
  '005_tokens_and_otps.sql',
  '021_audit_logs.sql',
  '022_profile_extensions.sql',
  '023_auto_approval_setup.sql',
  '024_enhanced_verification.sql',
  '025_activity_events.sql'
];

const OPTIONAL_SEEDS = [
  'server/database/seeds/001_seed_admin.sql',
  'server/database/seeds/002_seed_regions.sql',
  'server/database/seeds/003_seed_crops.sql'
];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY in server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const hasMissingTable = (error) => {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return (
    error?.code === 'PGRST205' ||
    message.includes('relation') ||
    message.includes('does not exist')
  );
};

const hasMissingColumn = (error) => {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  return (
    error?.code === '42703' ||
    error?.code === 'PGRST204' ||
    message.includes('column') ||
    message.includes('could not find')
  );
};

const checkTable = async (table) => {
  const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' });

  if (!error) {
    return { ok: true };
  }

  if (hasMissingTable(error)) {
    return { ok: false, reason: 'missing-table' };
  }

  return { ok: false, reason: error.message || 'unknown-error' };
};

const checkColumn = async (table, column) => {
  const { error } = await supabase.from(table).select(column).limit(1);

  if (!error) {
    return { ok: true };
  }

  if (hasMissingColumn(error)) {
    return { ok: false, reason: 'missing-column' };
  }

  if (hasMissingTable(error)) {
    return { ok: false, reason: 'missing-table' };
  }

  return { ok: false, reason: error.message || 'unknown-error' };
};

const checkEnumValue = async (table, column, value) => {
  const { error } = await supabase.from(table).select(column).eq(column, value).limit(1);

  if (!error) {
    return { ok: true };
  }

  if (hasMissingColumn(error) || hasMissingTable(error)) {
    return { ok: false, reason: error.message || 'missing schema' };
  }

  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  if (message.includes('invalid input value for enum')) {
    return { ok: false, reason: 'missing-enum-value' };
  }

  return { ok: false, reason: error.message || 'unknown-error' };
};

async function verify() {
  console.log('\nVerifying AgriculNet auth schema...\n');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log('\nRequired migrations for auth-backed local flows:');
  REQUIRED_MIGRATIONS.forEach((migration) => console.log(`  - ${migration}`));

  console.log('\nChecking required tables:\n');
  let hasFailures = false;

  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    if (result.ok) {
      console.log(`  OK   ${table}`);
      continue;
    }

    hasFailures = true;
    console.log(`  FAIL ${table} (${result.reason})`);
  }

  console.log('\nChecking required columns from later auth migrations:\n');
  for (const [table, column, migration] of REQUIRED_COLUMNS) {
    const result = await checkColumn(table, column);
    if (result.ok) {
      console.log(`  OK   ${table}.${column}`);
      continue;
    }

    hasFailures = true;
    console.log(`  FAIL ${table}.${column} (${migration}, ${result.reason})`);
  }

  console.log('\nChecking required enum values:\n');
  for (const [table, column, value, migration] of REQUIRED_ENUM_VALUES) {
    const result = await checkEnumValue(table, column, value);
    if (result.ok) {
      console.log(`  OK   ${table}.${column} includes ${value}`);
      continue;
    }

    hasFailures = true;
    console.log(`  FAIL ${table}.${column}=${value} (${migration}, ${result.reason})`);
  }

  console.log('\nOptional seeds:');
  OPTIONAL_SEEDS.forEach((seed) => console.log(`  - ${seed}`));
  console.log('    001_seed_admin.sql is needed for seeded admin login.');
  console.log('    002_seed_regions.sql and 003_seed_crops.sql are marketplace data seeds, not auth prerequisites.');

  if (hasFailures) {
    console.log('\nResult: auth schema is incomplete for the current local app.');
    console.log('Apply the missing migrations in Supabase SQL Editor, then re-run this script.\n');
    process.exit(1);
  }

  console.log('\nResult: auth schema is ready for local registration, verification, sign-in, and admin login.\n');
}

verify().catch((error) => {
  console.error('\nVerification failed:', error.message);
  process.exit(1);
});
