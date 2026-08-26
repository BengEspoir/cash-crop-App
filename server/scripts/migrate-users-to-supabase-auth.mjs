import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const execute = process.argv.includes('--execute');
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const normalize = (value) => String(value || '').trim().toLowerCase();
const normalizeRole = (value) => normalize(value).replace('-', '_');
const roleArgument = process.argv.find((argument) => argument.startsWith('--role='));
const requestedRole = roleArgument ? normalizeRole(roleArgument.split('=', 2)[1]) : null;

if (requestedRole && !['admin', 'super_admin'].includes(requestedRole)) {
  throw new Error('The --role filter only accepts admin or super_admin');
}

async function listAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

async function main() {
  let appUsersQuery = supabase
    .from('users')
    .select('id, auth_user_id, role, status, first_name, last_name, email, phone, password_hash, email_verified, phone_verified')
    .is('auth_user_id', null)
    .order('created_at', { ascending: true });

  if (requestedRole === 'admin') {
    appUsersQuery = appUsersQuery.in('role', ['admin', 'super_admin']);
  } else if (requestedRole) {
    appUsersQuery = appUsersQuery.eq('role', requestedRole);
  }

  const [{ data: appUsers, error: appError }, authUsers] = await Promise.all([
    appUsersQuery,
    listAuthUsers()
  ]);
  if (appError) throw appError;

  const byEmail = new Map(authUsers.filter((user) => user.email).map((user) => [normalize(user.email), user]));
  const byPhone = new Map(authUsers.filter((user) => user.phone).map((user) => [String(user.phone), user]));
  const report = {
    mode: execute ? 'execute' : 'dry-run',
    roleFilter: requestedRole,
    total: appUsers.length,
    linked: 0,
    created: 0,
    skipped: 0,
    failed: []
  };

  for (const appUser of appUsers) {
    try {
      let authUser = byEmail.get(normalize(appUser.email)) || byPhone.get(String(appUser.phone || ''));
      if (!authUser) {
        if (!appUser.email && !appUser.phone) {
          report.skipped += 1;
          report.failed.push({ userId: appUser.id, reason: 'missing_login_identifier' });
          continue;
        }
        if (!appUser.password_hash) {
          report.skipped += 1;
          report.failed.push({ userId: appUser.id, reason: 'identity_missing_and_no_password_hash' });
          continue;
        }

        if (!execute) {
          report.created += 1;
          continue;
        }

        const { data, error } = await supabase.auth.admin.createUser({
          email: appUser.email || undefined,
          phone: appUser.phone || undefined,
          password_hash: appUser.password_hash,
          email_confirm: Boolean(appUser.email_verified),
          phone_confirm: Boolean(appUser.phone_verified),
          user_metadata: {
            existing_public_user_id: appUser.id,
            first_name: appUser.first_name,
            last_name: appUser.last_name
          },
          app_metadata: {
            user_role: appUser.role,
            account_status: appUser.status,
            public_user_id: appUser.id
          }
        });
        if (error) throw error;
        authUser = data.user;
        report.created += 1;
      }

      if (execute) {
        const { error } = await supabase
          .from('users')
          .update({ auth_user_id: authUser.id })
          .eq('id', appUser.id)
          .is('auth_user_id', null);
        if (error) throw error;

        const { error: metadataError } = await supabase.auth.admin.updateUserById(authUser.id, {
          app_metadata: {
            ...(authUser.app_metadata || {}),
            user_role: appUser.role,
            account_status: appUser.status,
            public_user_id: appUser.id
          }
        });
        if (metadataError) throw metadataError;
      }
      report.linked += 1;
    } catch (error) {
      report.failed.push({ userId: appUser.id, reason: error.message });
    }
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.failed.length > 0) process.exitCode = 2;
}

await main();
