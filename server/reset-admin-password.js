#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const [, , identifier, newPassword] = process.argv;
if (!identifier || !newPassword || newPassword.length < 8) {
  console.error('Usage: node reset-admin-password.js <admin-email-or-phone> <new-password>');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const column = identifier.includes('@') ? 'email' : 'phone';
  const value = column === 'email' ? identifier.toLowerCase() : identifier;
  const { data: appUser, error } = await supabase
    .from('users')
    .select('id, auth_user_id, role, status')
    .eq(column, value)
    .single();

  if (error || !appUser?.auth_user_id) {
    throw new Error('Linked Supabase Auth administrator was not found. Run migration 039 and the account import first.');
  }
  if (!['admin', 'super_admin'].includes(appUser.role)) {
    throw new Error('The linked domain account is not an administrator.');
  }

  const { error: passwordError } = await supabase.auth.admin.updateUserById(
    appUser.auth_user_id,
    { password: newPassword }
  );
  if (passwordError) throw passwordError;

  console.log('Supabase Auth password updated. Sign in at /auth/login.');
  if (appUser.status !== 'active') {
    console.log(`The domain account status is ${appUser.status}; activate it through an audited admin operation.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
