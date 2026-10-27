#!/usr/bin/env node
/** Local authoring workbench. No frontend route, provider call or production dependency. */
import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, writeFile, mkdir, realpath, stat, rename } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pipeline } from 'node:stream/promises';

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BODY = 16 * 1024, MAX_NOTES = 4000, MAX_ASSET = 32 * 1024 * 1024;
const MIME = { '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.flac': 'audio/flac' };
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const normalise = text => text.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/gu, "'").trim().replace(/\s+/gu, ' ').replace(/[.!?…]+$/u, '').trim();
const within = (root, file) => { const path = relative(root, file); return path === '' || !path.startsWith('..' + sep) && path !== '..' && !isAbsolute(path); };

export const MANIFESTS = [
  { variant: 'omnivoice', label: 'OmniVoice', file: 'audio-workbench/generated/omnivoice/manifest.json', legacy: false },
];

async function jsonFile(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}

/** Files are only eligible through one of the known manifests, never through a URL path. */
export async function loadAudioCatalog(root = DEFAULT_ROOT) {
  root = resolve(root);
  const assets = [], warnings = [];
  const allowed = [resolve(root, 'public/malagasy/voices'), resolve(root, 'audio-workbench')];
  for (const spec of MANIFESTS) {
    const manifestFile = resolve(root, spec.file);
    let manifest;
    try { manifest = await jsonFile(manifestFile, null); }
    catch { warnings.push(`${spec.label} : manifeste illisible.`); continue; }
    if (!manifest) { if (!spec.legacy) warnings.push('Le nouveau lot audio n’est pas encore disponible.'); continue; }
    const entries = Array.isArray(manifest) ? manifest : manifest.recordings;
    if (!Array.isArray(entries) || entries.length > 10000) { warnings.push(`${spec.label} : inventaire invalide.`); continue; }
    for (const entry of entries) {
      const transcript = entry?.transcript ?? entry?.word;
      if (typeof entry?.id !== 'string' || typeof transcript !== 'string' || !transcript.trim()) continue;
      const provided = entry.file ?? entry.url;
      if (typeof provided !== 'string' || /^(?:[a-z]+:|\\\\)/iu.test(provided)) continue;
      let file;
      if (spec.legacy) {
        if (!provided.startsWith('/malagasy/voices/')) continue;
        file = resolve(root, 'public', provided.slice(1));
      } else {
        if (provided.startsWith('audio-workbench/')) file = resolve(root, provided);
        else if (!isAbsolute(provided) && !provided.startsWith('/')) file = resolve(dirname(manifestFile), provided);
        else continue;
      }
      if (!MIME[extname(file).toLowerCase()] || !allowed.some(directory => within(directory, file))) continue;
      try {
        const actual = await realpath(file);
        const allowedReal = await Promise.all(allowed.map(directory => realpath(directory).catch(() => directory)));
        if (!allowedReal.some(directory => within(directory, actual))) continue;
        const info = await stat(actual);
        if (!info.isFile() || info.size < 4 || info.size > MAX_ASSET) continue;
        const sha256 = digest(await readFile(actual));
        let playback = { playbackFile: actual, playbackSha256: sha256, playbackBytes: info.size, playbackManifestHashMatches: true,
          playbackContentType: MIME[extname(actual).toLowerCase()], playbackFormat: extname(actual).slice(1).toUpperCase() };
        // Review the lossless PCM master locally. Some browsers cannot decode Opus,
        // even though the compressed candidate is valid and works in Chromium.
        if (!spec.legacy && typeof entry.masterFile === 'string') {
          try {
            if (isAbsolute(entry.masterFile) || /^(?:[a-z]+:|\\\\)/iu.test(entry.masterFile)) throw new Error('Invalid master path');
            const master = resolve(dirname(manifestFile), entry.masterFile);
            if (extname(master).toLowerCase() !== '.wav' || !within(dirname(manifestFile), master)) throw new Error('Invalid master path');
            const masterReal = await realpath(master);
            if (!allowedReal.some(directory => within(directory, masterReal))) throw new Error('Invalid master path');
            const masterInfo = await stat(masterReal);
            if (!masterInfo.isFile() || masterInfo.size < 44 || masterInfo.size > MAX_ASSET) throw new Error('Invalid master size');
            const masterData = await readFile(masterReal);
            if (masterData.toString('ascii', 0, 4) !== 'RIFF' || masterData.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Invalid master format');
            const masterHash = digest(masterData);
            playback = { playbackFile: masterReal, playbackSha256: masterHash, playbackBytes: masterInfo.size,
              playbackManifestHashMatches: !entry.masterSha256 || entry.masterSha256 === masterHash,
              playbackContentType: 'audio/wav', playbackFormat: 'WAV PCM' };
          } catch { warnings.push(`${spec.label} : maître WAV absent ou invalide pour « ${transcript} » ; version compressée conservée.`); }
        }
        assets.push({ key: digest(`${spec.variant}\0${entry.id}`).slice(0, 24), id: entry.id,
          variant: spec.variant, label: spec.label, transcript, group: normalise(transcript),
          character: ['mia', 'lova'].includes(entry.character) ? entry.character : 'any',
          model: entry.model ?? manifest.model ?? entry.performer ?? '', duration: entry.duration ?? null,
          sha256, bytes: info.size, manifestHashMatches: (!(entry.sha256 ?? entry.hash) || (entry.sha256 ?? entry.hash) === sha256) && playback.playbackManifestHashMatches,
          file: actual, contentType: MIME[extname(actual).toLowerCase()], ...playback });
      } catch { warnings.push(`${spec.label} : fichier absent ou illisible pour « ${transcript} ».`); }
    }
  }
  return { assets, warnings };
}

const emptyReviews = () => ({ schemaVersion: 1, entries: {}, history: [] });
async function readReviews(root) {
  const value = await jsonFile(resolve(root, 'audio-workbench/reviews.json'), emptyReviews());
  if (value?.schemaVersion !== 1 || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) throw new Error('Le fichier de revue existant est invalide ; il a été conservé.');
  return { ...value, history: Array.isArray(value.history) ? value.history : [] };
}

function publicCatalog(catalog, reviews) {
  return { schemaVersion: 1, warnings: catalog.warnings,
    assets: catalog.assets.map(({ file: _privateFile, playbackFile: _privateMaster, contentType: _mime, playbackContentType: _playbackMime, ...asset }) => ({ ...asset,
      // A regenerated file must not reuse an older decoded browser media resource.
      audioUrl: `/audio/${asset.key}?sha256=${asset.playbackSha256}`, review: reviews.entries[asset.key] ?? null,
      reviewIsCurrent: reviews.entries[asset.key]?.sha256 === asset.sha256
        && (!reviews.entries[asset.key]?.playbackSha256 || reviews.entries[asset.key].playbackSha256 === asset.playbackSha256) })) };
}

function reviewClient() {
  const $ = selector => document.querySelector(selector);
  let catalog = { assets: [], warnings: [] }, current = null, epoch = 0;
  const text = (tag, value, className) => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };
  const button = (label, action) => { const node = text('button', label); node.type = 'button'; node.addEventListener('click', action); return node; };
  const status = value => { $('#status').textContent = value; };
  function stop() { epoch++; if (current) { current.pause(); current.removeAttribute('src'); current.load(); current = null; } }
  async function play(asset, rate) {
    stop(); const ticket = epoch;
    const audio = new Audio(asset.audioUrl); current = audio;
    audio.playbackRate = rate; audio.preservesPitch = true;
    audio.addEventListener('ended', () => { if (ticket === epoch) { status('Lecture terminée.'); stop(); } });
    audio.addEventListener('error', () => { if (ticket === epoch) status('Ce fichier ne peut pas être lu. Rechargez l’inventaire ou vérifiez sa génération.'); });
    try { await audio.play(); if (ticket !== epoch) { audio.pause(); return; } status(`${asset.character === 'any' ? 'Référence' : asset.character} · ${asset.transcript} · ${rate}×`); }
    catch { if (ticket === epoch) status('Lecture impossible. Cliquez à nouveau sur Écouter pour réessayer.'); }
  }
  async function load(message) {
    const response = await fetch('/api/catalog'); const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? 'Inventaire indisponible.');
    catalog = payload; $('#warnings').textContent = payload.warnings.join(' ');
    $('#count').textContent = `${payload.assets.length} fichiers OmniVoice · Mia et Lova`;
    render(); if (message) status(message);
  }
  function render() {
    const query = $('#search').value.toLocaleLowerCase('fr').trim(), character = $('#character').value, rating = $('#rating-filter').value;
    const groups = new Map();
    for (const asset of catalog.assets) {
      if (query && !asset.transcript.toLocaleLowerCase('fr').includes(query)) continue;
      if (character !== 'all' && asset.character !== character && asset.character !== 'any') continue;
      const value = asset.reviewIsCurrent ? asset.review?.rating : 'unreviewed';
      if (rating !== 'all' && value !== rating) continue;
      if (!groups.has(asset.group)) groups.set(asset.group, []);
      groups.get(asset.group).push(asset);
    }
    const holder = $('#list'); holder.replaceChildren();
    for (const assets of groups.values()) {
      const card = text('article', '', 'card'); card.append(text('h2', assets[0].transcript));
      for (const asset of assets) {
        const row = text('section', '', 'variant');
        row.append(text('h3', `${asset.label}${asset.character === 'any' ? '' : ` · ${asset.character}`}`));
        row.append(text('p', `${asset.model || 'Enregistrement publié'} · ${(asset.bytes / 1024).toFixed(1)} Ko${asset.duration ? ` · ${asset.duration.toFixed(2)} s` : ''}`, 'meta'));
        if (asset.playbackFormat === 'WAV PCM') row.append(text('p', 'Écoute : maître WAV PCM · version compressée conservée.', 'meta'));
        if (!asset.manifestHashMatches) row.append(text('p', 'Le fichier diffère de son manifeste de génération.', 'warning'));
        if (asset.review && !asset.reviewIsCurrent) row.append(text('p', `Ancienne revue « ${asset.review.rating} » : les octets ont changé. Cette nouvelle version reste à relire.`, 'warning'));
        const actions = text('div', '', 'controls');
        actions.append(button('Écouter · 1×', () => play(asset, 1)), button('Lent · 0,8×', () => play(asset, .8)), button('Répéter', () => play(asset, 1)), button('Arrêter', () => { stop(); status('Lecture arrêtée.'); })); row.append(actions);
        const select = document.createElement('select'); select.setAttribute('aria-label', `Évaluation de ${asset.transcript}, ${asset.label}, ${asset.character}`);
        for (const [value, label] of [['', 'À relire'], ['good', 'Good · Bon'], ['acceptable', 'Acceptable'], ['incorrect', 'Incorrect']]) { const option = text('option', label); option.value = value; select.append(option); }
        select.value = asset.reviewIsCurrent ? asset.review?.rating ?? '' : '';
        const notes = document.createElement('textarea'); notes.rows = 2; notes.maxLength = 4000; notes.placeholder = 'Erreurs entendues, accentuation, rythme, continuité du timbre…'; notes.setAttribute('aria-label', `Notes pour ${asset.transcript}, ${asset.label}`); notes.value = asset.reviewIsCurrent ? asset.review?.notes ?? '' : '';
        const save = button('Enregistrer la revue', async () => {
          if (!select.value) { status('Choisissez une évaluation avant d’enregistrer.'); return; }
          save.disabled = true;
          try {
            const response = await fetch('/api/review', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: asset.key, sha256: asset.sha256, playbackSha256: asset.playbackSha256, rating: select.value, notes: notes.value, reviewer: $('#reviewer').value }) });
            const payload = await response.json(); if (!response.ok) throw new Error(payload.error);
            status('Revue enregistrée pour cette version exacte du fichier.'); await load();
          } catch (error) { status(error.message ?? 'Enregistrement impossible.'); }
          finally { save.disabled = false; }
        });
        row.append(select, notes, save);
        const details = document.createElement('details'); details.append(text('summary', 'Identifiant et empreinte')); details.append(text('code', `${asset.id}\nSHA-256 ${asset.sha256}`)); row.append(details);
        if (asset.variant === 'omnivoice' && /^[a-z0-9_.-]+$/iu.test(asset.id)) {
          const regeneration = document.createElement('details');
          regeneration.append(text('summary', 'Commande locale pour régénérer cette réplique'));
          regeneration.append(text('code', `node scripts/malagasy-neural.mjs --id ${asset.id} --force`));
          regeneration.append(text('p', 'À lancer dans le terminal de préparation ; cette page n’exécute aucune génération. Un fichier approuvé reste protégé.'));
          row.append(regeneration);
        }
        card.append(row);
      }
      holder.append(card);
    }
    if (!groups.size) holder.append(text('p', 'Aucun fichier ne correspond aux filtres.'));
  }
  for (const id of ['search', 'character', 'rating-filter']) $(`#${id}`).addEventListener(id === 'search' ? 'input' : 'change', render);
  $('#reload').addEventListener('click', () => { stop(); load('Inventaire actualisé.').catch(error => status(error.message)); });
  $('#stop').addEventListener('click', () => { stop(); status('Lecture arrêtée.'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  load('Choisissez une version à écouter et à évaluer.').catch(error => status(error.message));
}

const clientScript = `(${reviewClient.toString()})();`;
const scriptHash = digest(clientScript);
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Revue audio malgache · atelier local</title><style>
:root{font:16px system-ui,sans-serif;color:#17372e;background:#f2f6f1}*{box-sizing:border-box}body{max-width:1180px;margin:auto;padding:24px}header{margin-bottom:22px}h1{font-size:1.9rem;margin:0 0 8px}h2{margin:0 0 16px}h3{font-size:1rem;margin:0 0 6px}p{line-height:1.5}.meta,small{color:#51695f;font-size:.85rem}.toolbar{display:flex;gap:12px;flex-wrap:wrap;background:#fff;padding:16px;border-radius:14px}.toolbar label{display:grid;gap:5px}.toolbar input{min-width:220px}input,select,textarea,button,.export{font:inherit;border:1px solid #a9beb2;border-radius:8px;padding:9px;background:#fff;color:inherit}button,.export{cursor:pointer;font-weight:650;text-decoration:none}button:hover,.export:hover{background:#e7f2e7}button:disabled{opacity:.55;cursor:wait}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid #218663;outline-offset:2px}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.variant{border-top:1px solid #dce5dd;padding:18px 0}.variant:last-child{padding-bottom:0}.variant textarea{display:block;width:100%;resize:vertical;margin:10px 0}.card{background:#fff;margin:20px 0;padding:22px;border-radius:16px;box-shadow:0 3px 15px #153c2610}.warning,#warnings{color:#865a13}#warnings:empty{display:none}#status{position:sticky;top:0;background:#183f32;color:#fff;border-radius:10px;padding:12px;z-index:2;min-height:46px}details{margin-top:12px;font-size:.8rem}code{display:block;white-space:pre-wrap;overflow-wrap:anywhere;margin-top:8px}.commands{background:#e4ede4;padding:15px;border-radius:10px}.commands code{font-size:.85rem}@media(max-width:500px){body{padding:14px}.card{padding:16px}.toolbar>*{width:100%}.controls button{flex:1 1 40%}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}</style></head><body>
<header><h1>Revue audio malgache</h1><p>Atelier de développement local. Écoutez les voix OmniVoice de Mia et Lova et notez leur prononciation. Les revues sont conservées pour les corrections futures ; leur enregistrement ne modifie pas les voix du site.</p><p id="count" class="meta"></p></header>
<div class="toolbar"><label>Rechercher<input id="search" type="search" placeholder="Eny, Azafady…"></label><label>Personnage<select id="character"><option value="all">Tous</option><option value="mia">Mia</option><option value="lova">Lova</option></select></label><label>État de revue<select id="rating-filter"><option value="all">Tous</option><option value="unreviewed">À relire</option><option value="good">Good · Bon</option><option value="acceptable">Acceptable</option><option value="incorrect">Incorrect</option></select></label><label>Relecteur facultatif<input id="reviewer" maxlength="120" autocomplete="off" placeholder="Nom ou initiales"></label><button id="reload" type="button">Actualiser les fichiers</button><button id="stop" type="button">Arrêter le son</button><a class="export" href="/api/export" download="malagasy-audio-reviews.json">Exporter les revues</a></div>
<p id="status" role="status" aria-live="polite">Chargement de l’inventaire…</p><p id="warnings"></p>
<details class="commands"><summary>Préparer ou régénérer des fichiers</summary><p>La génération reste une commande locale, sans clé dans cette page et sans appel payant. Après génération, actualisez les fichiers. Les fichiers notés Good sont liés à leur empreinte SHA-256 et restent protégés par le générateur.</p><p>Sous Windows, l’atelier se lance depuis la racine du dépôt avec :</p><code>review-audio.cmd</code><p>Les options de préparation et de génération se consultent avec :</p><code>node scripts/malagasy-neural.mjs --help</code><p>Chaque nouveau candidat dispose ci-dessous de sa commande locale de régénération. Les sorties restent sous <code>audio-workbench/generated/omnivoice/</code>, avec leur manifeste. Aucun bouton de cette page ne lance une génération ou un déploiement.</p></details>
<main id="list"></main><script>${clientScript}</script></body></html>`;

function sendJson(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function requestBody(request) {
  if (request.headers['content-type']?.split(';')[0] !== 'application/json') throw Object.assign(new Error('JSON requis.'), { status: 415 });
  if (Number(request.headers['content-length']) > MAX_BODY) throw Object.assign(new Error('Requête trop volumineuse.'), { status: 413 });
  let size = 0; const chunks = [];
  for await (const part of request) { size += part.length; if (size > MAX_BODY) throw Object.assign(new Error('Requête trop volumineuse.'), { status: 413 }); chunks.push(part); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('JSON invalide.'), { status: 400 }); }
}

/** Exported for isolated Node tests; never binds a public network address. */
export function createReviewServer({ root = DEFAULT_ROOT } = {}) {
  root = resolve(root);
  let writeQueue = Promise.resolve();
  return createServer(async (request, response) => {
    response.setHeader('cache-control', 'no-store');
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('referrer-policy', 'no-referrer');
    response.setHeader('content-security-policy', `default-src 'none'; script-src 'sha256-${Buffer.from(scriptHash, 'hex').toString('base64')}'; style-src 'unsafe-inline'; connect-src 'self'; media-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`);
    const port = request.socket.localPort;
    const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!hosts.includes(request.headers.host) || request.headers.origin && !hosts.some(host => request.headers.origin === `http://${host}`)) { sendJson(response, 403, { error: 'Accès local uniquement.' }); return; }
    try {
      const path = new URL(request.url, `http://127.0.0.1:${port}`).pathname;
      if (request.method === 'GET' && path === '/') { response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); response.end(html); return; }
      if (request.method === 'GET' && ['/api/catalog', '/api/reviews', '/api/export'].includes(path)) {
        const reviews = await readReviews(root);
        if (path === '/api/catalog') sendJson(response, 200, publicCatalog(await loadAudioCatalog(root), reviews));
        else { if (path === '/api/export') response.setHeader('content-disposition', 'attachment; filename="malagasy-audio-reviews.json"'); sendJson(response, 200, reviews); }
        return;
      }
      if (request.method === 'POST' && path === '/api/review') {
        const value = await requestBody(request);
        if (typeof value?.key !== 'string' || !/^[a-f0-9]{24}$/u.test(value.key) || typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(value.sha256)
          || !['good', 'acceptable', 'incorrect'].includes(value.rating) || typeof value.notes !== 'string' || value.notes.length > MAX_NOTES
          || value.playbackSha256 !== undefined && (typeof value.playbackSha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(value.playbackSha256))
          || value.reviewer !== undefined && (typeof value.reviewer !== 'string' || value.reviewer.length > 120)) { sendJson(response, 400, { error: 'Évaluation invalide.' }); return; }
        const operation = async () => {
          const catalog = await loadAudioCatalog(root), asset = catalog.assets.find(entry => entry.key === value.key);
          if (!asset) { sendJson(response, 404, { error: 'Fichier inconnu.' }); return; }
          if (asset.sha256 !== value.sha256) { sendJson(response, 409, { error: 'Le fichier a changé depuis son écoute. Actualisez et relisez cette version.' }); return; }
          if ((asset.playbackSha256 !== asset.sha256 || value.playbackSha256 !== undefined) && value.playbackSha256 !== asset.playbackSha256) {
            sendJson(response, 409, { error: 'La version d’écoute a changé. Actualisez les fichiers et réécoutez avant d’enregistrer.' }); return;
          }
          const reviews = await readReviews(root), previous = reviews.entries[asset.key];
          if (previous) reviews.history.push(previous);
          reviews.entries[asset.key] = { assetId: asset.id, variant: asset.variant, transcript: asset.transcript,
            character: asset.character, sha256: asset.sha256, rating: value.rating, notes: value.notes,
            playbackSha256: asset.playbackSha256, playbackFormat: asset.playbackFormat,
            reviewer: value.reviewer ?? '', reviewedAt: new Date().toISOString() };
          const file = resolve(root, 'audio-workbench/reviews.json');
          await mkdir(dirname(file), { recursive: true });
          const temporary = file + '.' + randomUUID() + '.tmp';
          await writeFile(temporary, JSON.stringify(reviews, null, 2) + '\n', { flag: 'wx' });
          await rename(temporary, file);
          sendJson(response, 200, { saved: reviews.entries[asset.key] });
        };
        const pending = writeQueue.then(operation);
        writeQueue = pending.catch(() => {}); await pending; return;
      }
      if (request.method === 'GET' && /^\/audio\/[a-f0-9]{24}$/u.test(path)) {
        const catalog = await loadAudioCatalog(root), asset = catalog.assets.find(entry => path === `/audio/${entry.key}`);
        if (!asset) { sendJson(response, 404, { error: 'Fichier audio inconnu.' }); return; }
        const range = request.headers.range;
        let start = 0, end = asset.playbackBytes - 1;
        if (range) {
          const match = /^bytes=(\d+)-(\d*)$/u.exec(range);
          if (!match) { response.writeHead(416, { 'content-range': `bytes */${asset.playbackBytes}` }); response.end(); return; }
          start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= asset.playbackBytes) { response.writeHead(416, { 'content-range': `bytes */${asset.playbackBytes}` }); response.end(); return; }
        }
        response.writeHead(range ? 206 : 200, { 'content-type': asset.playbackContentType, 'content-length': end - start + 1,
          'accept-ranges': 'bytes', ...(range ? { 'content-range': `bytes ${start}-${end}/${asset.playbackBytes}` } : {}) });
        await pipeline(createReadStream(asset.playbackFile, { start, end }), response); return;
      }
      sendJson(response, 404, { error: 'Route inconnue.' });
    } catch (error) {
      if (!response.headersSent) sendJson(response, error.status ?? 500, { error: error.status ? error.message : 'Impossible de lire ou enregistrer l’atelier. Les fichiers existants ont été conservés.' });
      else response.destroy();
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const portIndex = process.argv.indexOf('--port');
  const port = portIndex < 0 ? 5191 : Number(process.argv[portIndex + 1]);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port invalide.');
  const server = createReviewServer();
  server.on('error', error => { console.error(`Atelier non démarré : ${error.code === 'EADDRINUSE' ? 'port occupé ; choisir --port 5191.' : error.message}`); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Revue audio locale : http://127.0.0.1:${port}\nAucune modification du site ; aucune API payante.`));
}
