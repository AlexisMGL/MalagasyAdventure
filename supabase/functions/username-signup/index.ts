import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { signupHandler } from './handler.ts';
import { usernameEmail } from '../_shared/username.ts';

const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

Deno.serve(signupHandler({
  // Public application identifier. It grants no access to private tables.
  publishableKey: 'sb_publishable_yBquUz0kRTwAmRLngLX1xg_z93okb1v',
  async fingerprint(request) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(serviceKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  },
  async consumeLimit(fingerprint) {
    const { data, error } = await admin.rpc('consume_username_signup_limit', { p_fingerprint: fingerprint });
    if (error) throw new Error('Signup limiter unavailable');
    return data === true;
  },
  async createUser(username, password) {
    const { error } = await admin.auth.admin.createUser({
      email: usernameEmail(username), password,
      // This reserved .invalid address is an internal username alias, never a claimed mailbox.
      email_confirm: true, user_metadata: { username },
    });
    if (!error) return 'ok';
    if (error.code === 'email_exists' || error.code === 'user_already_exists') return 'username_taken';
    if (error.code === 'weak_password') return 'weak_password';
    return 'signup_unavailable';
  },
}));
