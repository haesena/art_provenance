from django.test import TestCase
from .models import Source

class SourceModelTest(TestCase):
    def test_source_str_truncation(self):
        long_source_name = "A" * 250
        source = Source(source=long_source_name)
        self.assertEqual(len(str(source)), 200)
        self.assertTrue(str(source).startswith("A" * 200))

    def test_source_str_no_truncation_under_limit(self):
        short_source_name = "Short source name"
        source = Source(source=short_source_name)
        self.assertEqual(str(source), short_source_name)
