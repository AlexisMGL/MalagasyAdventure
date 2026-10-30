"""No model or audio provider is loaded by these authoring safeguards."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('malagasy_neural', Path(__file__).with_name('generate-malagasy-neural.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AudioCacheTests(unittest.TestCase):
    def test_checkpoint_retries_a_temporary_windows_read_lock(self):
        temporary = Mock()
        temporary.replace.side_effect = [PermissionError('reader'), PermissionError('reader'), None]
        with patch.object(module.time, 'sleep'):
            module.replace_checkpoint(temporary, Path('manifest.json'))
        self.assertEqual(temporary.replace.call_count, 3)

    def test_checkpoint_preserves_failure_on_a_persistent_lock(self):
        temporary = Mock()
        temporary.replace.side_effect = PermissionError('persistent lock')
        with patch.object(module.time, 'sleep'), self.assertRaises(PermissionError):
            module.replace_checkpoint(temporary, Path('manifest.json'))
        self.assertEqual(temporary.replace.call_count, 40)

    def test_missing_only_preserves_every_existing_file_even_without_a_review(self):
        cached = {'sha256': 'current', 'recipeSha256': 'old'}
        self.assertEqual(module.cache_decision(cached, 'new', 'current', set(), missing_only=True), 'retained')
        self.assertEqual(module.cache_decision(None, 'new', None, set(), missing_only=True), 'generate')
        with self.assertRaises(ValueError):
            module.cache_decision(cached, 'new', 'modified', set(), missing_only=True)
        with self.assertRaises(ValueError):
            module.cache_decision(None, 'new', 'unmanifested-existing-audio', set(), missing_only=True)

    def test_good_audio_survives_force_and_changed_generation_settings(self):
        self.assertEqual(module.cache_decision({'sha256': 'approved', 'recipeSha256': 'old'},
            'new', 'approved', {'approved'}, force=True), 'protected')

    def test_only_explicit_override_allows_replacing_approved_bytes(self):
        self.assertEqual(module.cache_decision({'sha256': 'approved', 'recipeSha256': 'old'},
            'new', 'approved', {'approved'}, force=True, replace_approved=True), 'generate')

    def test_old_review_does_not_approve_changed_bytes(self):
        self.assertEqual(module.cache_decision({'sha256': 'approved', 'recipeSha256': 'recipe'},
            'recipe', 'modified', {'approved'}), 'generate')

    def test_incremental_cache_requires_exact_audio_and_generation_recipe(self):
        cached = {'sha256': 'current', 'recipeSha256': 'recipe'}
        self.assertEqual(module.cache_decision(cached, 'recipe', 'current', set()), 'cached')
        self.assertEqual(module.cache_decision(cached, 'new-voice', 'current', set()), 'generate')
        self.assertEqual(module.cache_decision(cached, 'recipe', None, set()), 'generate')

    def test_unapproved_forced_regeneration_is_possible(self):
        cached = {'sha256': 'current', 'recipeSha256': 'recipe'}
        self.assertEqual(module.cache_decision(cached, 'recipe', 'current', set(), force=True), 'generate')


class AudioBatchTests(unittest.TestCase):
    def job(self, identifier, duration=None):
        return {'asset_id': identifier, 'seed': len(identifier), 'requested_duration': duration}

    def test_single_item_mode_preserves_order_and_one_item_calls(self):
        jobs = [self.job('a'), self.job('word', 1.2), self.job('c')]
        self.assertEqual(list(module.generation_batches(jobs, 1)), [[job] for job in jobs])

    def test_short_words_never_share_phrase_postprocessing(self):
        jobs = [self.job('a'), self.job('word', 1.2), self.job('c'), self.job('tiny', 1.2), self.job('e')]
        batches = list(module.generation_batches(jobs, 2))
        self.assertEqual([[job['asset_id'] for job in batch] for batch in batches], [['a', 'c'], ['e'], ['word', 'tiny']])
        self.assertEqual(sum(len(batch) for batch in batches), len(jobs))

    def test_batch_seed_is_stable_and_bound_to_members_and_order(self):
        jobs = [self.job('a'), self.job('b')]
        first = module.batch_provenance(jobs)
        self.assertEqual(first, module.batch_provenance(jobs))
        self.assertNotEqual(first['seed'], module.batch_provenance(list(reversed(jobs)))['seed'])
        self.assertEqual(first['recordingIds'], ['a', 'b'])
        self.assertEqual(first['size'], 2)
        self.assertIn('not independent', first['seedPolicy'])

    def test_batch_size_zero_is_refused(self):
        with self.assertRaises(ValueError):
            list(module.generation_batches([], 0))

    def test_similar_text_lengths_share_batches_without_reordering_single_item_mode(self):
        jobs = [dict(self.job('long'), item={'spokenText': 'a much longer phrase'}),
            dict(self.job('short'), item={'spokenText': 'word'}),
            dict(self.job('medium'), item={'spokenText': 'two words'})]
        self.assertEqual([[job['asset_id'] for job in batch] for batch in module.generation_batches(jobs, 2)],
            [['short', 'medium'], ['long']])
        self.assertEqual([batch[0]['asset_id'] for batch in module.generation_batches(jobs, 1)],
            ['long', 'short', 'medium'])


if __name__ == '__main__':
    unittest.main()
