import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { deleteAccountHandler } from './handler.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, options);
const publicKey = 'sb_publishable_yBquUz0kRTwAmRLngLX1xg_z93okb1v';

Deno.serve(deleteAccountHandler({
  async session(token) {
    const { data, error } = await admin.auth.getUser(token);
    return !error && data.user?.email ? { id: data.user.id, email: data.user.email } : null;
  },
  async password(email, password, id) {
    const client = createClient(url, publicKey, options);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || data.user?.id !== id) return false;
    // The short-lived reauthentication session is discarded; deletion revokes every session.
    return true;
  },
  async remove(id, token) {
    const { error: revokeError } = await admin.auth.admin.signOut(token, 'global');
    if (revokeError) throw new Error('Session revocation failed');
    // learning_progress.user_id references auth.users ON DELETE CASCADE.
    const { error } = await admin.auth.admin.deleteUser(id, false);
    if (error) throw new Error('Account deletion failed');
  },
}));
