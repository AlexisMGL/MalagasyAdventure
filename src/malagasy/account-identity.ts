/** A reserved, non-deliverable namespace adapts usernames to Supabase password Auth.
 * It is never shown or used for mail. Account ownership continues to use auth.uid(). */
import { normalizeUsername, usernameEmail, USERNAME_DOMAIN, USERNAME_PATTERN } from '../../supabase/functions/_shared/username';
export { normalizeUsername, usernameEmail, USERNAME_DOMAIN };

export function loginEmail(identifier: string): string {
  const value = identifier.trim();
  if (!value.includes('@')) return usernameEmail(value);
  // Accounts created before username login retain their original Auth identity and password.
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('Saisissez votre identifiant ou l’adresse mail de votre ancien compte.');
  return value.toLowerCase();
}

export function accountIdentifier(email: string | undefined): string {
  if (!email) return 'Voyageur';
  const [local, domain] = email.toLowerCase().split('@');
  if (domain !== USERNAME_DOMAIN) return email;
  if (!/^u-(?:[a-f0-9]{2}){3,24}$/.test(local)) return 'Voyageur';
  const decoded = local.slice(2).match(/../g)!.map(pair => String.fromCharCode(parseInt(pair, 16))).join('');
  return USERNAME_PATTERN.test(decoded) ? decoded : 'Voyageur';
}
