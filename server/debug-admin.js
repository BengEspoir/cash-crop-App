require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  const identifier = process.argv[2] || process.env.ADMIN_DIAGNOSTIC_EMAIL;
  if (!identifier) {
    throw new Error('Usage: node debug-admin.js <admin-email>');
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, auth_user_id, email, role, status, email_verified')
    .eq('email', identifier.trim().toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching admin:', error.message);
    return;
  }

  if (!user.auth_user_id) {
    throw new Error('The public administrator is not linked to Supabase Auth.');
  }

  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(user.auth_user_id);
  if (authError) throw authError;

  console.log('Admin auth audit:', JSON.stringify({
    publicUserId: user.id,
    authUserId: user.auth_user_id,
    role: user.role,
    status: user.status,
    publicEmailVerified: user.email_verified,
    authEmailConfirmed: Boolean(authData.user.email_confirmed_at),
    jwtRole: authData.user.app_metadata?.user_role,
    jwtAccountStatus: authData.user.app_metadata?.account_status,
    jwtPublicUserId: authData.user.app_metadata?.public_user_id
  }, null, 2));
}

checkAdmin().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
