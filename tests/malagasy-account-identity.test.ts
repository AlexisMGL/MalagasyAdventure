import { describe, expect, it } from 'vitest';
import { accountIdentifier, loginEmail, normalizeUsername, usernameEmail, USERNAME_DOMAIN } from '../src/malagasy/account-identity';

describe('username Auth identities', () => {
  it('normalizes case and spaces without merging different usernames', () => {
    expect(normalizeUsername('  Mia_42  ')).toBe('mia_42');
    expect(usernameEmail('Mia_42')).toBe(usernameEmail('mia_42'));
    expect(usernameEmail('mia.42')).not.toBe(usernameEmail('mia_42'));
    expect(usernameEmail('mia-42')).not.toBe(usernameEmail('mia_42'));
  });

  it('round-trips every supported username shape without exposing its internal address', () => {
    for (const username of ['mia', 'a'.repeat(24), '.._', '.mi-a_', '123', 'a..b']) {
      const email = usernameEmail(username);
      expect(email).toMatch(/^u-[a-f0-9]+@users\.malagasyadventure\.invalid$/);
      expect(accountIdentifier(email)).toBe(username);
      expect(loginEmail(username)).toBe(email);
    }
  });

  it.each(['ab', 'a'.repeat(25), 'Jean Émile', 'éloïse', 'user@example.test', 'mia/user', '😀'])('rejects invalid new identifier %s', value => {
    expect(() => normalizeUsername(value)).toThrow();
  });

  it('keeps existing email accounts on their same Auth identity', () => {
    expect(loginEmail(' Voyageur@Example.test ')).toBe('voyageur@example.test');
    expect(accountIdentifier('Voyageur@Example.test')).toBe('Voyageur@Example.test');
    expect(() => loginEmail('voyageur@')).toThrow();
  });

  it('never exposes malformed aliases or reads mutable metadata as an identity', () => {
    expect(accountIdentifier(`mia@${USERNAME_DOMAIN}`)).toBe('Voyageur');
    expect(accountIdentifier(`u-404040@${USERNAME_DOMAIN}`)).toBe('Voyageur');
    expect(accountIdentifier(undefined)).toBe('Voyageur');
  });
});
