require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, phone, role, status, phone_verified, email_verified')
    .eq('email', 'mbengespoir@gmail.com')
    .single();

  if (error) {
    console.error('Error fetching admin:', error.message);
    return;
  }

  console.log('Admin user record:', JSON.stringify(user, null, 2));
}

checkAdmin();
