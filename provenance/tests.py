from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Source, Artwork, ProvenanceEvent, Institution, Auction, Exhibition, EventType, ArtType, Medium, Person, Interaction

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
from .models import Source, Artwork, ProvenanceEvent, Institution, Auction, Exhibition, EventType, ArtType, Medium, ProvenanceEventSource

# ... (rest of imports)

class EventSourceNotesTest(TestCase):
    def setUp(self):
        self.art_type = ArtType.objects.create(name="Painting")
        self.medium = Medium.objects.create(name="Oil on Canvas", type=self.art_type)
        self.artwork = Artwork.objects.create(name="Test Artwork", medium=self.medium)
        self.event_type = EventType.objects.create(name="Sale")
        self.source1 = Source.objects.create(source="Source 1")
        self.source2 = Source.objects.create(source="Source 2")
        self.event = ProvenanceEvent.objects.create(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1
        )

    def test_multiple_source_notes_save_retrieval(self):
        notes1 = "First source notes."
        notes2 = "Second source notes."
        
        ProvenanceEventSource.objects.create(event=self.event, source=self.source1, notes=notes1)
        ProvenanceEventSource.objects.create(event=self.event, source=self.source2, notes=notes2)
        
        # Refresh and verify
        self.event.refresh_from_db()
        self.assertEqual(self.event.sources.count(), 2)
        
        pes1 = ProvenanceEventSource.objects.get(event=self.event, source=self.source1)
        self.assertEqual(pes1.notes, notes1)
        
        pes2 = ProvenanceEventSource.objects.get(event=self.event, source=self.source2)
        self.assertEqual(pes2.notes, notes2)


class InteractionExclusivityTest(TestCase):
    def setUp(self):
        self.person1 = Person.objects.create(family_name="Smith", first_name="John")
        self.person2 = Person.objects.create(family_name="Doe", first_name="Jane")
        self.institution1 = Institution.objects.create(name="Louvre Museum")
        self.institution2 = Institution.objects.create(name="Metropolitan Museum")

    def test_valid_person_to_person_success(self):
        interaction = Interaction(
            entity1_person=self.person1,
            entity2_person=self.person2,
            interaction_type="singular",
            date="1950",
            place="Paris"
        )
        interaction.full_clean()
        interaction.save()
        self.assertEqual(Interaction.objects.count(), 1)

    def test_valid_person_to_institution_success(self):
        interaction = Interaction(
            entity1_person=self.person1,
            entity2_institution=self.institution1,
            interaction_type="long term",
            date="1940-1945",
            place="London"
        )
        interaction.full_clean()
        interaction.save()
        self.assertEqual(Interaction.objects.count(), 1)

    def test_invalid_entity1_both_person_and_institution_fails(self):
        interaction = Interaction(
            entity1_person=self.person1,
            entity1_institution=self.institution1,
            entity2_person=self.person2,
            interaction_type="singular"
        )
        with self.assertRaises(ValidationError) as cm:
            interaction.full_clean()
        self.assertIn("Entity 1 must be either a Person or an Institution, not both or neither.", str(cm.exception))

    def test_invalid_entity1_neither_person_nor_institution_fails(self):
        interaction = Interaction(
            entity2_person=self.person2,
            interaction_type="singular"
        )
        with self.assertRaises(ValidationError) as cm:
            interaction.full_clean()
        self.assertIn("Entity 1 must be either a Person or an Institution, not both or neither.", str(cm.exception))

    def test_invalid_entity2_both_person_and_institution_fails(self):
        interaction = Interaction(
            entity1_person=self.person1,
            entity2_person=self.person2,
            entity2_institution=self.institution2,
            interaction_type="singular"
        )
        with self.assertRaises(ValidationError) as cm:
            interaction.full_clean()
        self.assertIn("Entity 2 must be either a Person or an Institution, not both or neither.", str(cm.exception))

    def test_invalid_entity2_neither_person_nor_institution_fails(self):
        interaction = Interaction(
            entity1_person=self.person1,
            interaction_type="singular"
        )
        with self.assertRaises(ValidationError) as cm:
            interaction.full_clean()
        self.assertIn("Entity 2 must be either a Person or an Institution, not both or neither.", str(cm.exception))

    def test_interaction_notes_and_sources_success(self):
        interaction = Interaction.objects.create(
            entity1_person=self.person1,
            entity2_institution=self.institution1,
            interaction_type="long term",
            notes="General notes about relationship"
        )
        source1 = Source.objects.create(source="Test Source A")
        source2 = Source.objects.create(source="Test Source B")
        
        from .models import InteractionSource
        InteractionSource.objects.create(interaction=interaction, source=source1, notes="Source A specific note")
        InteractionSource.objects.create(interaction=interaction, source=source2, notes="Source B specific note")
        
        interaction.refresh_from_db()
        self.assertEqual(interaction.notes, "General notes about relationship")
        self.assertEqual(interaction.sources.count(), 2)
        
        its1 = InteractionSource.objects.get(interaction=interaction, source=source1)
        self.assertEqual(its1.notes, "Source A specific note")


