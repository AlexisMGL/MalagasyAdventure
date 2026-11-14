import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
// @ts-expect-error The small authoring script is plain ESM, without a runtime TS dependency.
import { androidAssetLinks } from '../scripts/android-assetlinks.mjs';
describe('Android origin verification', () => {
  it('matches the native package and deduplicates real SHA-256 certificate fingerprints', () => {
    const fingerprint = Array.from({ length: 32 }, (_, index) => index.toString(16).padStart(2, '0')).join(':');
    const native = JSON.parse(readFileSync('android/twa-manifest.json', 'utf8'));
    expect(androidAssetLinks([fingerprint, fingerprint.toUpperCase()])).toEqual([{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: native.packageId, sha256_cert_fingerprints: [fingerprint.toUpperCase()] } }]);
  });
  it('refuses missing, placeholder or malformed fingerprints instead of claiming a verified app', () => {
    for (const fingerprints of [[], ['TODO'], ['AB:CD'], [Array(32).fill('00').join(':')]]) expect(() => androidAssetLinks(fingerprints)).toThrow();
  });
});
