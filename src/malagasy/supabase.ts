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
    invalid_credentials: 'Adresse mail ou mot de passe incorrect.',
    email_not_confirmed: 'Confirmez votre adresse mail avant de vous connecter.',
    email_address_not_authorized: 'L’envoi des mails publics n’est pas encore configuré. Réessayez après l’activation du service mail.',
    over_email_send_rate_limit: 'La limite d’envoi de mails est atteinte. Réessayez plus tard.',
    over_request_rate_limit: 'Trop de tentatives. Patientez avant de réessayer.',
    weak_password: 'Choisissez un mot de passe plus robuste, avec au moins 8 caractères.',
    same_password: 'Choisissez un mot de passe différent du précédent.',
    otp_expired: 'Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien.',
    user_already_exists: 'Un compte existe déjà avec cette adresse. Essayez de vous connecter.',
  };
  return (code && messages[code]) || 'La connexion au service a échoué. Vérifiez votre réseau et réessayez. Votre carnet local est conservé.';
}
