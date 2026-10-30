#!/usr/bin/env python3
"""Offline authoring: two consistent synthetic character voices, no human voice cloning.

Run prepare-malagasy-neural.mjs first. --pilot writes only private auditions.
The static application never loads Python, model weights or a provider account.
"""
from __future__ import annotations

import argparse
from dataclasses import replace
from functools import wraps
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

ROOT = Path(__file__).resolve().parent.parent


def replace_checkpoint(temporary: Path, destination: Path) -> None:
    """Retry transient Windows read locks while retaining the complete checkpoint."""
    for attempt in range(40):
        try:
            temporary.replace(destination)
            return
        except PermissionError:
            if attempt == 39:
                raise
            time.sleep(.1)


MODEL_REVISION = 'c5fdb5ccb189668d56333f77ba2629f4cd7535f4'
MODEL_HASHES = {
    'model.safetensors': '730839316de585f4c8298ec0e1712efc10fb19c6fa4e36eb741cb8d51ebcf6aa',
    'audio_tokenizer/model.safetensors': 'fe7c5e8785e0a05833e1bfc3e002ec7f55af21e306b2e7154a448c1f54ccfb0d',
    'config.json': '5e359117e13b420c5e0c925d4aba650d624767131f1d1746928f8b850d5dc372',
    'tokenizer.json': '408f669b7e2b045fdf54201d815bd364e6667dbd845115da81239c40bc6dcfd1',
    'tokenizer_config.json': '49f78845596a82bf15c83673794bdf9f76f812b11f60ab6a2239d9be65b00676',
    'audio_tokenizer/config.json': 'eefb20806f7104e77c9a5277c9df0f9bb8826b08eb1d4e8ab2b9829b6ef9fac1',
    'audio_tokenizer/preprocessor_config.json': 'ae61eea88558608ee2fa86d2aec9fce8d99a5ff75d09cb7651ccce21ae1d9084',
}
CHARACTERS = {
    'mia': {
        'seed': 202610271,
        'instruction': 'female, young adult, high pitch',
        'text': 'Salama! Mia no anarako. Avy any Frantsa aho. Salama aho. Misaotra, tompoko.',
    },
    'lova': {
        'seed': 202610272,
        'instruction': 'male, young adult, moderate pitch',
        'text': 'Salama! Lova no anarako. Tonga soa! Salama aho. Misaotra, tompoko. Veloma, tompoko.',
    },
}


def digest(path: Path) -> str:
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def cache_decision(cached, recipe_hash, current_hash, approved_hashes, force=False, replace_approved=False, missing_only=False):
    """A review approves exact bytes. A force rebuild alone never overrides it."""
    if missing_only and not cached and current_hash is not None:
        raise ValueError('Unmanifested audio already exists; refusing to overwrite it in missing-only mode.')
    if missing_only and cached:
        if current_hash != cached['sha256']:
            raise ValueError('Existing audio differs from its manifest; refusing to replace it in missing-only mode.')
        return 'retained'
    if current_hash in approved_hashes and not replace_approved:
        return 'protected'
    if cached and not force and current_hash == cached['sha256'] and cached.get('recipeSha256') == recipe_hash:
        return 'cached'
    return 'generate'


def generation_batches(jobs, batch_size):
    """Keep the single-item order; batch only items sharing post-processing policy."""
    if batch_size < 1:
        raise ValueError('Batch size must be at least one.')
    groups = [jobs] if batch_size == 1 else [
        [job for job in jobs if job['requested_duration'] is None],
        [job for job in jobs if job['requested_duration'] is not None],
    ]
    for group in groups:
        if batch_size > 1:
            # Similar text lengths reduce padded attention work in the batch.
            # This ordering is recorded in each batch's provenance and RNG seed.
            group = sorted(group, key=lambda job: len(job.get('item', {}).get('spokenText', '')))
        for start in range(0, len(group), batch_size):
            yield group[start:start + batch_size]


def batch_provenance(jobs):
    """PyTorch owns one RNG per batch, not one independent stream per row."""
    members = [job['asset_id'] for job in jobs]
    value = 'omnivoice-batch-v1\0' + '\0'.join(f'{job["asset_id"]}:{job["seed"]}' for job in jobs)
    return {'size': len(jobs), 'seed': int(hashlib.sha256(value.encode('utf8')).hexdigest()[:8], 16),
        'recordingIds': members, 'seedPolicy': 'one PyTorch RNG seed for this ordered batch; not independent per-item seeds'}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pilot', action='store_true')
    parser.add_argument('--device', default='auto', choices=['auto', 'cpu', 'xpu', 'cuda'])
    parser.add_argument('--steps', type=int, default=32)
    parser.add_argument('--threads', type=int, default=4)
    parser.add_argument('--flush-denormal', action='store_true', help='Opt-in CPU flush-to-zero for subnormal values; recorded in the generation recipe.')
    parser.add_argument('--cpu-codec', action='store_true', help='Keep the audio codec on CPU in float32 when using an accelerator; recorded in the generation recipe.')
    parser.add_argument('--cpu-bf16', action='store_true', help='Opt-in CPU bfloat16 autocast for the language model; the audio codec and default recipe stay float32.')
    parser.add_argument('--batch-size', type=int, default=1, help='Optional batched inference, grouped by short-word processing policy; default preserves single-item inference.')
    parser.add_argument('--max-new-recordings', type=int, help='Stop scheduling new recordings after this many, for bounded benchmarks or incremental runs.')
    parser.add_argument('--character', choices=['mia', 'lova'])
    parser.add_argument('--id', help='Regenerate only this stable audio ID.')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--missing-only', action='store_true', help='Add new IDs only; preserve every existing recording regardless of recipe changes.')
    parser.add_argument('--replace-approved', action='store_true', help='Explicitly allow replacing reviewed good audio.')
    parser.add_argument('--download-model', action='store_true', help='Download the pinned free model locally; never calls a paid API.')
    parser.add_argument('--plan', action='store_true', help='Print selected stable IDs without loading a model.')
    args = parser.parse_args()
    if not 16 <= args.steps <= 64:
        raise ValueError('Use at least 16 generation steps.')
    if not 1 <= args.batch_size <= 32:
        raise ValueError('Batch size must be between 1 and 32.')
    if args.max_new_recordings is not None and args.max_new_recordings < 1:
        raise ValueError('Maximum new recordings must be at least one.')
    inventory = json.loads((ROOT / '.tools/neural-voice-authoring/inventory.json').read_text(encoding='utf8'))
    if args.pilot:
        wanted = {'salama', 'eny', 'azafady', 'tsia', 'misaotra', 'mia no anarako'}
        inventory['utterances'] = [item for item in inventory['utterances'] if item['key'] in wanted]
    selected = [(character, item, f'audio-neural-{character}-{item["id"]}')
        for character in CHARACTERS for item in inventory['utterances'] if not args.character or args.character == character]
    if args.id:
        selected = [entry for entry in selected if entry[2] == args.id]
        if not selected:
            raise ValueError('Unknown ID or conflicting character; inspect --plan before requesting regeneration.')
    if args.plan:
        print(json.dumps({'language': 'plt', 'files': len(selected), 'items': [
            {'id': identifier, 'character': character, 'text': item['spokenText']} for character, item, identifier in selected]}, ensure_ascii=False))
        return
    os.environ['HF_HUB_OFFLINE'] = '0' if args.download_model else '1'
    os.environ.setdefault('TOKENIZERS_PARALLELISM', 'false')
    os.environ['PATH'] = str(ROOT / '.tools/voice-processing/node_modules/ffmpeg-static') + os.pathsep + os.environ['PATH']
    import numpy as np
    import soundfile as sf
    import torch
    from omnivoice import OmniVoice, OmniVoiceGenerationConfig

    if args.device == 'auto':
        args.device = 'cuda' if torch.cuda.is_available() else 'xpu' if torch.xpu.is_available() else 'cpu'

    if args.cpu_bf16 and args.device != 'cpu':
        raise ValueError('--cpu-bf16 requires the CPU device.')
    torch.set_num_threads(args.threads)
    if args.flush_denormal and not torch.set_flush_denormal(True):
        raise ValueError('This CPU does not support flush-to-zero.')
    model_path = ROOT / '.tools/omnivoice-model'
    if args.download_model:
        from huggingface_hub import snapshot_download
        snapshot_download('k2-fsa/OmniVoice', revision=MODEL_REVISION, local_dir=str(model_path),
            allow_patterns=[*MODEL_HASHES, '*.json', 'audio_tokenizer/*.json', 'README.md', 'audio_tokenizer/LICENSE'])
    for filename, expected in MODEL_HASHES.items():
        if not (model_path / filename).exists():
            raise ValueError('Local model missing. Use --download-model once; the download is free and is not a hosted TTS call.')
        if digest(model_path / filename) != expected:
            raise ValueError(f'Unexpected model weights: {filename}')
    # Candidate audio stays outside public/ and src/: never activate a new voice by generating it.
    output = ROOT / 'audio-workbench/generated/omnivoice'
    output.mkdir(parents=True, exist_ok=True)
    reference_dir = output / 'references'
    reference_dir.mkdir(parents=True, exist_ok=True)
    (output / 'audio').mkdir(exist_ok=True)
    (output / 'masters').mkdir(exist_ok=True)
    reviews_file = ROOT / 'audio-workbench/reviews.json'
    reviews = json.loads(reviews_file.read_text(encoding='utf8')) if reviews_file.exists() else {'entries': {}}
    approved_hashes = {review['sha256'] for review in reviews.get('entries', {}).values() if review.get('rating') == 'good'}
    print(f'Loading pinned OmniVoice on {args.device}', flush=True)
    dtype = torch.float32 if args.device == 'cpu' else torch.float16
    # Load on CPU first: Arc integrated GPUs in torch 2.8 cannot report free
    # memory to Transformers' allocator warmup. Explicit transfer avoids that query.
    model = OmniVoice.from_pretrained(str(model_path), device_map='cpu', dtype=dtype, load_asr=False)
    if args.device != 'cpu':
        model.to(args.device)
    if args.cpu_codec:
        model.audio_tokenizer.to(device='cpu', dtype=torch.float32)
    if args.cpu_bf16:
        original_forward = model.llm.forward
        @wraps(original_forward)
        def bf16_forward(*forward_args, **forward_kwargs):
            # Only the transformer runs under autocast. Keep the audio codec in
            # float32 so its NumPy waveform output retains full signal precision.
            with torch.autocast(device_type='cpu', dtype=torch.bfloat16):
                return original_forward(*forward_args, **forward_kwargs)
        model.llm.forward = bf16_forward
    config = OmniVoiceGenerationConfig(num_step=args.steps, guidance_scale=2.0,
        denoise=True, preprocess_prompt=True, postprocess_output=True,
        fade_duration=.012, pad_duration=.08)

    def save_signal(path: Path, waveform) -> dict:
        waveform = np.asarray(waveform, dtype=np.float32).reshape(-1)
        duration = len(waveform) / model.sampling_rate
        if not np.isfinite(waveform).all() or not .2 < duration < 35:
            raise ValueError(f'Invalid waveform: {path.name}, duration={duration:.3f}s, finite={np.isfinite(waveform).all()}')
        peak = float(np.max(np.abs(waveform)))
        rms = float(np.sqrt(np.mean(waveform ** 2)))
        if peak < .01 or rms < .001:
            raise ValueError(f'Silent waveform: {path.name}')
        # Consistent speech level, not peak-only amplification that varies by word.
        gain = min(.11 / rms, .92 / peak, 4.0)
        sf.write(str(path), waveform * gain, model.sampling_rate, subtype='PCM_16')
        return {'bytes': path.stat().st_size, 'sha256': digest(path),
            'duration': len(waveform) / model.sampling_rate, 'sampleRate': model.sampling_rate,
            'peak': peak * gain, 'rms': rms * gain, 'appliedGain': gain}

    previous_path = output / 'manifest.json'
    previous = json.loads(previous_path.read_text(encoding='utf8')) if previous_path.exists() else {'recordings': []}
    recordings = {entry['id']: entry for entry in previous['recordings']}
    reference_records = previous.get('references', [])
    manifest = {'schemaVersion': 1, 'model': 'k2-fsa/OmniVoice', 'modelRevision': MODEL_REVISION,
        'modelHashes': MODEL_HASHES, 'license': 'CC-BY-NC (version not specified in model card)',
        'language': 'plt', 'library': f'omnivoice=={importlib.metadata.version("omnivoice")}',
        'nativeSpeakerReviewed': False, 'stage': 'unreviewed-candidates-outside-site',
        'references': reference_records, 'recordings': list(recordings.values())}

    def persist() -> None:
        manifest['recordings'] = list(recordings.values())
        manifest['references'] = reference_records
        temporary = output / 'manifest.tmp.json'
        temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        # Windows readers and antivirus may briefly hold a handle that denies
        # replacement. Keep the complete temporary checkpoint and retry without
        # rewriting or regenerating any audio.
        replace_checkpoint(temporary, previous_path)

    scheduled = 0
    for character, settings in CHARACTERS.items():
        if character not in {entry[0] for entry in selected}:
            continue
        reference = reference_dir / f'{character}.wav'
        if not reference.exists():
            torch.manual_seed(settings['seed'])
            started = time.monotonic()
            with torch.inference_mode():
                audio = model.generate(text=settings['text'], language='plt',
                    instruct=settings['instruction'], duration=8.0, generation_config=config)[0]
            save_signal(reference, audio)
            print(f'{character} synthetic reference: {time.monotonic() - started:.1f}s', flush=True)
        reference_hash = digest(reference)
        reference_info = sf.info(str(reference))
        prior_reference = next((entry for entry in reference_records if entry['character'] == character), None)
        if prior_reference and (prior_reference['sha256'] != reference_hash or prior_reference['text'] != settings['text']
                or prior_reference['instruction'] != settings['instruction'] or prior_reference['seed'] != settings['seed']):
            raise ValueError(f'Reference {character} differs from its recorded provenance; refusing to change this character silently.')
        if not prior_reference:
            reference_records.append({'character': character, 'text': settings['text'], 'file': f'references/{character}.wav',
            'instruction': settings['instruction'], 'seed': settings['seed'], 'sha256': reference_hash,
            'steps': args.steps, 'requestedDuration': 8.0, 'duration': reference_info.duration,
            'origin': 'model-generated fictional character; no human reference recording'})
        else:
            prior_reference['requestedDuration'] = 8.0
            prior_reference['duration'] = reference_info.duration
        # Reuse one fixed voice embedding, including for Eny and Azafady.
        voice = model.create_voice_clone_prompt(ref_audio=str(reference), ref_text=settings['text'], preprocess_prompt=True)
        utterances = inventory['utterances']
        jobs = []
        for item in utterances:
            identifier = item['id']
            asset_id = f'audio-neural-{character}-{identifier}'
            if args.id and args.id != asset_id:
                continue
            file = output / 'audio' / f'{asset_id}.ogg'
            master = output / 'masters' / f'{asset_id}.wav'
            seed = int(hashlib.sha256(f'{character}:{item["spokenText"]}'.encode()).hexdigest()[:8], 16)
            bare_word = item['spokenText'].strip().rstrip('.!?')
            requested_duration = 1.2 if len(bare_word.split()) == 1 and len(bare_word) <= 4 else None
            recipe = {'version': 1, 'spokenText': item['spokenText'], 'transcript': item['transcript'],
                'character': character, 'modelRevision': MODEL_REVISION, 'referenceSha256': digest(reference),
                'steps': args.steps, 'seed': seed, 'speed': .95, 'language': 'plt', 'cfg': 2.0,
                'fadeSeconds': .012, 'padSeconds': .08, 'format': 'opus-48k-vbr', 'targetRms': .11,
                'library': importlib.metadata.version('omnivoice'), 'torch': torch.__version__, 'dtype': str(dtype)}
            if args.device == 'cuda' and torch.version.hip:
                recipe['hip'] = torch.version.hip
            if args.cpu_codec:
                recipe['codecDevice'] = 'cpu'
                recipe['codecDtype'] = 'torch.float32'
            if args.flush_denormal:
                recipe['flushDenormal'] = True
            if args.cpu_bf16:
                recipe['autocastDtype'] = 'torch.bfloat16'
                recipe['autocastScope'] = 'language-model'
            if requested_duration is not None:
                recipe['duration'] = requested_duration
                recipe['postprocessOutput'] = False
            recipe_hash = hashlib.sha256(json.dumps(recipe, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
            cached = recordings.get(asset_id)
            current_hash = digest(file) if file.exists() else None
            if args.missing_only and not cached and master.exists():
                raise ValueError(f'Unmanifested master already exists: {asset_id}; refusing to replace it.')
            if args.missing_only and cached and (not master.exists() or digest(master) != cached.get('masterSha256')):
                raise ValueError(f'Existing master differs from its manifest: {asset_id}; refusing to replace it.')
            # A valid prior batch remains cached when its base content/settings match.
            # Its full recipe still records the original batch RNG and membership.
            cache_entry = {**cached, 'recipeSha256': cached.get('baseRecipeSha256', cached.get('recipeSha256'))} if cached else None
            decision = cache_decision(cache_entry, recipe_hash, current_hash, approved_hashes, args.force, args.replace_approved, args.missing_only)
            if decision == 'retained':
                cached['bindings'] = item.get('bindings', [])
                print(f'Retained unchanged audio: {asset_id}', flush=True)
                continue
            if decision == 'protected':
                if cached:
                    cached['bindings'] = item.get('bindings', [])
                print(f'Protected approved audio: {asset_id}', flush=True)
                continue
            if decision == 'cached':
                cached['bindings'] = item.get('bindings', [])
                print(f'Cached: {asset_id}', flush=True)
                continue
            if args.max_new_recordings is not None and scheduled >= args.max_new_recordings:
                continue
            jobs.append({'item': item, 'asset_id': asset_id, 'file': file, 'master': master, 'seed': seed,
                'requested_duration': requested_duration, 'recipe': recipe, 'recipe_hash': recipe_hash})
            scheduled += 1

        for batch in generation_batches(jobs, args.batch_size):
            started = time.monotonic()
            context = batch_provenance(batch) if len(batch) > 1 else None
            accelerator = getattr(torch, args.device, None) if args.device in {'xpu', 'cuda'} else None
            if accelerator:
                accelerator.synchronize()
                accelerator.reset_peak_memory_stats()
            torch.manual_seed(context['seed'] if context else batch[0]['seed'])
            short_words = batch[0]['requested_duration'] is not None
            batch_config = replace(config, postprocess_output=False) if short_words else config
            with torch.inference_mode():
                audios = model.generate(
                    text=[job['item']['spokenText'] for job in batch] if context else batch[0]['item']['spokenText'],
                    language='plt', voice_clone_prompt=[voice] * len(batch) if context else voice,
                    generation_config=batch_config,
                    duration=[job['requested_duration'] for job in batch] if context else batch[0]['requested_duration'], speed=.95)
            if accelerator:
                accelerator.synchronize()
            if len(audios) != len(batch):
                raise ValueError('Model returned a different number of waveforms than requested.')
            inference_seconds = time.monotonic() - started
            print(json.dumps({'batchInference': {'files': len(batch), 'seconds': round(inference_seconds, 3),
                'secondsPerFile': round(inference_seconds / len(batch), 3), 'steps': args.steps,
                'shortWords': short_words, 'peakAllocatedBytes': accelerator.max_memory_allocated() if accelerator else None,
                'recordingIds': [job['asset_id'] for job in batch]}}), flush=True)
            for position, (job, audio) in enumerate(zip(batch, audios)):
                item, asset_id, file, master, seed = (job[key] for key in ['item', 'asset_id', 'file', 'master', 'seed'])
                requested_duration = job['requested_duration']
                duration = requested_duration
                actual_seed = context['seed'] if context else seed
                recipe_hash = job['recipe_hash']
                extra_metadata = {}
                if context:
                    full_recipe = {**job['recipe'], 'batch': context, 'batchPosition': position}
                    recipe_hash = hashlib.sha256(json.dumps(full_recipe, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
                    extra_metadata = {'baseRecipeSha256': job['recipe_hash'], 'batch': {**context, 'position': position}}
                temporary_master = master.with_suffix('.tmp.wav')
                temporary_audio = file.with_suffix('.tmp.ogg')
                for attempt in range(2):
                    try:
                        signal = save_signal(temporary_master, audio)
                        break
                    except ValueError as error:
                        print(str(error), flush=True)
                        if attempt == 1:
                            raise
                        # Only retry the invalid row; never recalculate validated batch siblings.
                        actual_seed = seed + 1
                        duration = requested_duration * 1.25 if requested_duration else None
                        torch.manual_seed(actual_seed)
                        with torch.inference_mode():
                            audio = model.generate(text=item['spokenText'], language='plt', voice_clone_prompt=voice,
                                generation_config=batch_config, duration=duration, speed=.95)[0]
                        if context:
                            extra_metadata['batch']['retry'] = {'mode': 'single-item', 'seed': actual_seed}
                ffmpeg = ROOT / '.tools/voice-processing/node_modules/ffmpeg-static/ffmpeg.exe'
                executable = str(ffmpeg) if ffmpeg.exists() else shutil.which('ffmpeg')
                if not executable:
                    raise ValueError('Install the free offline encoder ffmpeg before generation.')
                subprocess.run([executable, '-v', 'error', '-y', '-i', str(temporary_master), '-c:a', 'libopus',
                    '-b:a', '48k', '-vbr', 'on', '-map_metadata', '-1', str(temporary_audio)], check=True)
                decoded = subprocess.run([executable, '-v', 'error', '-i', str(temporary_audio), '-f', 'f32le',
                    '-ar', '24000', '-ac', '1', 'pipe:1'], check=True, capture_output=True).stdout
                decoded_samples = np.frombuffer(decoded, dtype='<f4')
                decoded_peak = float(np.max(np.abs(decoded_samples)))
                decoded_rms = float(np.sqrt(np.mean(decoded_samples ** 2)))
                if not np.isfinite(decoded_samples).all() or decoded_peak > .995 or decoded_rms < .001 or abs(len(decoded_samples) / 24000 - signal['duration']) > .05:
                    raise ValueError(f'Encoded audio failed signal checks: {asset_id}')
                temporary_master.replace(master)
                temporary_audio.replace(file)
                recordings[asset_id] = {'id': asset_id, 'transcript': item['transcript'], 'spokenText': item['spokenText'],
                    'file': f'audio/{asset_id}.ogg', 'masterFile': f'masters/{asset_id}.wav', 'sourceId': 'omnivoice-malagasy',
                    'character': character, 'status': 'synthetic', 'verification': 'model-generated',
                    'model': 'k2-fsa/OmniVoice', 'language': 'plt', 'referenceSha256': digest(reference),
                    'steps': args.steps, 'seed': seed, 'speed': .95, 'torch': torch.__version__, 'device': args.device,
                    **({'hip': torch.version.hip} if args.device == 'cuda' and torch.version.hip else {}),
                    **({'codecDevice': 'cpu', 'codecDtype': 'torch.float32'} if args.cpu_codec else {}),
                    **({'flushDenormal': True} if args.flush_denormal else {}),
                    **({'autocastDtype': 'torch.bfloat16', 'autocastScope': 'language-model'} if args.cpu_bf16 else {}),
                    'requestedDuration': duration, 'actualSeed': actual_seed,
                    **signal, 'masterSha256': signal['sha256'], 'masterBytes': signal['bytes'],
                    'sha256': digest(file), 'bytes': file.stat().st_size, 'format': 'ogg-opus', 'sourceSampleRate': signal['sampleRate'],
                    'sampleRate': 48000, 'decodedPeak': decoded_peak, 'decodedRms': decoded_rms,
                    'recipeSha256': recipe_hash, **extra_metadata, 'bindings': item.get('bindings', [])}
                print(f'{character}: {item["transcript"]} ({signal["duration"]:.2f}s, inference batch {inference_seconds:.1f}s/{len(batch)} files)', flush=True)
                # Save each validated file, so an interrupted batch remains resumable.
                persist()
    persist()
    sources = [{'id': 'omnivoice-malagasy', 'title': 'Voix numériques malgaches : OmniVoice',
            'author': 'Han Zhu et collaborateurs — k2-fsa/OmniVoice ; personnages synthétiques Afterhours',
            'url': 'https://huggingface.co/k2-fsa/OmniVoice', 'category': 'audio', 'consulted': True,
            'supports': 'Synthèse en malgache du Plateau (plt), fichiers de phrases entières. Une référence générée et fixe pour chaque personnage conserve son timbre, y compris sur les mots courts. Aucun clonage d’une personne réelle. Sorties de modèle sans validation native phrase par phrase.',
            'license': 'Code Apache 2.0 ; modèle CC-BY-NC, version non précisée dans sa fiche. Restriction non commerciale conservée. https://huggingface.co/k2-fsa/OmniVoice#license'},
        {'id': 'higgs-audio-tokenizer', 'title': 'Codec Higgs Audio 2 inclus dans OmniVoice',
            'author': 'Boson AI USA, Inc. ; notices Meta Llama 3', 'category': 'audio', 'consulted': True,
            'url': f'https://huggingface.co/k2-fsa/OmniVoice/blob/{MODEL_REVISION}/audio_tokenizer/LICENSE',
            'supports': 'Codec de décodage des sons générés ; ne constitue pas un moteur linguistique malgache indépendant.',
            'license': 'Boson Higgs Audio 2 Community License et accords Llama 3, copies dans audio-workbench/licenses et notices dans audio-workbench/NOTICE.md.'},
        {'id': 'omnivoice-language-support', 'title': 'Langues et génération de clips courts OmniVoice',
            'author': 'k2-fsa / OmniVoice', 'category': 'audio', 'consulted': True,
            'url': 'https://github.com/k2-fsa/OmniVoice/blob/master/docs/languages.md',
            'supports': 'Malgache du Plateau plt explicitement listé. Les conseils du projet recommandent une référence vocale pour les clips courts.',
            'license': 'Documentation consultée ; code Apache 2.0, conditions des poids distinctes.'}]
    (output / 'sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    if args.id and args.id not in recordings:
        raise ValueError('Unknown ID; inspect the prepared inventory before requesting regeneration.')
    print(json.dumps({'files': len(recordings), 'pilot': args.pilot, 'output': str(output)}), flush=True)


if __name__ == '__main__':
    main()
