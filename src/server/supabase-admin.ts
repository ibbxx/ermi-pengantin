import 'server-only';

import { createClient } from '@supabase/supabase-js';

function required(name: string, fallbacks: string[] = []): string {
  for (const key of [name, ...fallbacks]) {
    const value = process.env[key];
    if (value) return value;
  }
  throw new Error(`Konfigurasi server ${name} belum tersedia.`);
}

export function createSupabaseAdmin() {
  return createClient(
    required('SUPABASE_URL', ['NEXT_PUBLIC_SUPABASE_URL']),
    required('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw new AdminAuthError();

  const supabase = createSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new AdminAuthError();

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!admin) throw new AdminAuthError();
  return { supabase, user, admin };
}

export class AdminAuthError extends Error {
  status = 403;
  constructor() {
    super('Akses admin ditolak.');
  }
}
