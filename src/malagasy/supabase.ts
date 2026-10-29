import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CloudTransport } from './cloud-sync';

// Public client configuration only. Ownership is enforced by Postgres RLS.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://unpvrisziuttjmzhwyid.supabase.co';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_yBquUz0kRTwAmRLngLX1xg_z93okb1v';
export const supabase: SupabaseClient | null = SUPABASE_URL && publishableKey
  ? createClient(SUPABASE_URL, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
  }) : null;

/** Bind every query to the user that opened this synchronizer. RLS is the authority. */
export function cloudTransport(client: SupabaseClient, userId: string): CloudTransport {
  return {
    async get() {
      const { data, error } = await client.from('learning_progress')
        .select('progress, revision').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data;
    },
    async put(progress, expectedRevision) {
      // An old in-flight callback must never write a prior user's snapshot into a new account.
      const { data: { session } } = await client.auth.getSession();
      if (session?.user.id !== userId) throw new Error('La session a changé. Reconnectez-vous.');
      const { data, error } = await client.rpc('save_learning_progress', {
        p_progress: progress, p_expected_revision: expectedRevision, p_user_id: userId,
      });
      if (error) throw error;
      return data === null ? null : { revision: Number(data) };
    },
  };
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    invalid_credentials: 'Identifiant ou mot de passe incorrect.',
    email_not_confirmed: 'Ce compte n’est pas encore accessible. Réessayez plus tard.',
    email_address_not_authorized: 'La création du compte est indisponible pour le moment. Votre carnet local est conservé.',
    over_email_send_rate_limit: 'La création du compte est indisponible pour le moment. Réessayez plus tard.',
    over_request_rate_limit: 'Trop de tentatives. Patientez avant de réessayer.',
    weak_password: 'Choisissez un mot de passe plus robuste, de 8 à 128 caractères.',
    same_password: 'Choisissez un mot de passe différent du précédent.',
    otp_expired: 'Ce lien a expiré ou a déjà été utilisé. Connectez-vous avec votre identifiant et votre mot de passe.',
    user_already_exists: 'Cet identifiant est déjà utilisé. Connectez-vous ou choisissez-en un autre.',
    email_exists: 'Cet identifiant est déjà utilisé. Connectez-vous ou choisissez-en un autre.',
    username_taken: 'Cet identifiant est déjà utilisé. Connectez-vous ou choisissez-en un autre.',
    invalid_username: 'Choisissez un identifiant de 3 à 24 caractères : lettres sans accent, chiffres, point, tiret ou _ .',
    rate_limited: 'Trop de tentatives. Patientez avant de réessayer.',
    signup_unavailable: 'La création du compte est indisponible pour le moment. Votre carnet local est conservé.',
  };
  return (code && messages[code]) || 'La connexion au service a échoué. Vérifiez votre réseau et réessayez. Votre carnet local est conservé.';
}
