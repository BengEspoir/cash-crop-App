const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseAnon = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const createUserScopedClient = (accessToken) => createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

const createAnonAuthClient = () => createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

module.exports = { supabaseAnon, supabaseAdmin, createUserScopedClient, createAnonAuthClient };
