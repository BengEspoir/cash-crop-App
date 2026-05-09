require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyHash() {
  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('email', 'mbengespoir@gmail.com')
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const pass1 = 'Admin@AgriculNet2025!';
  const pass2 = 'AgriculNet#2025!';
  
  const match1 = await bcrypt.compare(pass1, user.password_hash);
  const match2 = await bcrypt.compare(pass2, user.password_hash);

  console.log('Password hash in DB:', user.password_hash);
  console.log(`Match with "${pass1}":`, match1);
  console.log(`Match with "${pass2}":`, match2);
}

verifyHash();
