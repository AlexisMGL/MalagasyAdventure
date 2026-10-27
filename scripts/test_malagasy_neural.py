"""No model or audio provider is loaded by these authoring safeguards."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('malagasy_neural', Path(__file__).with_name('generate-malagasy-neural.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AudioCacheTests(unittest.TestCase):
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


if __name__ == '__main__':
    unittest.main()
