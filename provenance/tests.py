from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Source, Artwork, ProvenanceEvent, Institution, Auction, Exhibition, EventType, ArtType, Medium

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

class ProvenanceEventExclusivityTest(TestCase):
    def setUp(self):
        self.art_type = ArtType.objects.create(name="Painting")
        self.medium = Medium.objects.create(name="Oil on Canvas", type=self.art_type)
        self.artwork = Artwork.objects.create(name="Test Artwork", medium=self.medium)
        self.event_type = EventType.objects.create(name="Sale")
        self.institution = Institution.objects.create(name="Test Museum")
        self.auction = Auction.objects.create(name="Test Auction", date="2023-01-01")
        self.exhibition = Exhibition.objects.create(name="Test Exhibition", date_start="2023-01-01")

    def test_single_actor_institution_success(self):
        event = ProvenanceEvent(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            institution=self.institution
        )
        # Should not raise
        event.full_clean()
        event.save()

    def test_single_actor_auction_success(self):
        event = ProvenanceEvent(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            auction=self.auction
        )
        # Should not raise
        event.full_clean()
        event.save()

    def test_single_actor_exhibition_success(self):
        event = ProvenanceEvent(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            exhibition=self.exhibition
        )
        # Should not raise
        event.full_clean()
        event.save()

    def test_multiple_actors_fails(self):
        event = ProvenanceEvent(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            institution=self.institution,
            auction=self.auction
        )
        with self.assertRaises(ValidationError) as cm:
            event.full_clean()
        
        self.assertIn("Only one of Institution, Auction, or Exhibition can be set.", str(cm.exception))

    def test_all_actors_fails(self):
        event = ProvenanceEvent(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            institution=self.institution,
            auction=self.auction,
            exhibition=self.exhibition
        )
        with self.assertRaises(ValidationError) as cm:
            event.full_clean()
        
        self.assertIn("Only one of Institution, Auction, or Exhibition can be set.", str(cm.exception))
