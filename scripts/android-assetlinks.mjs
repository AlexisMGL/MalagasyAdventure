import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export const ANDROID_PACKAGE = 'app.netlify.malagasyadventure';
export function androidAssetLinks(fingerprints) {
  if (!fingerprints.length) throw Error('Fournir au moins une empreinte SHA-256 réelle du certificat de signature Google Play.');
  const values = [...new Set(fingerprints.map(value => {
    const fingerprint = value.trim().toUpperCase();
    if (!/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fingerprint) || /^00(?::00){31}$/.test(fingerprint)) throw Error('Empreinte SHA-256 invalide : 32 octets hexadécimaux séparés par des deux-points sont requis.');
    return fingerprint;
  }))];
  return [{ relation: ['delegate_permission/common.handle_all_urls'], target: {
    namespace: 'android_app', package_name: ANDROID_PACKAGE, sha256_cert_fingerprints: values,
  } }];
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (!args.length || args.length % 2 || args.some((arg, index) => index % 2 === 0 && arg !== '--sha256')) {
    throw Error('Usage : npm run android:link -- --sha256 "EMPREINTE_SHA256_GOOGLE_PLAY" [--sha256 "AUTRE_EMPREINTE"]');
  }
  const file = new URL('../public/.well-known/assetlinks.json', import.meta.url);
  const current = JSON.parse(readFileSync(file, 'utf8'));
  const previous = current.filter(item => item.target?.package_name === ANDROID_PACKAGE).flatMap(item => item.target.sha256_cert_fingerprints ?? []);
  const links = androidAssetLinks([...previous, ...args.filter((_, index) => index % 2 === 1)]);
  writeFileSync(file, JSON.stringify(links, null, 2) + '\n');
  console.log('Lien Android préparé. Publier ce fichier sur Netlify puis vérifier Digital Asset Links avant la sortie Google Play.');
}
