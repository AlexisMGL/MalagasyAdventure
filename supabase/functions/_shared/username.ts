/** Non-deliverable aliases adapt usernames to Auth. They never represent a mailbox. */
export const USERNAME_DOMAIN = 'users.malagasyadventure.invalid';
export const USERNAME_PATTERN = /^[a-z0-9._-]{3,24}$/;

export function normalizeUsername(value: string): string {
  const username = value.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(username)) throw new Error('Choisissez un identifiant de 3 à 24 caractères : lettres sans accent, chiffres, point, tiret ou _ .');
  return username;
}

/** Hex is injective and permits usernames with dots at either end or repeated dots. */
export function usernameEmail(username: string): string {
  const normalized = normalizeUsername(username);
  const hex = [...normalized].map(character => character.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  return `u-${hex}@${USERNAME_DOMAIN}`;
}
