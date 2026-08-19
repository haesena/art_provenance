from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Source, Artwork, ProvenanceEvent, Institution, Auction, Exhibition, EventType, ArtType, Medium, Person, Interaction, ArtworkRelationship

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


from django.urls import reverse

class PersonDetailAPITest(TestCase):
    def setUp(self):
        self.person = Person.objects.create(family_name="Gogh", first_name="Vincent")
        
        self.art_type = ArtType.objects.create(name="Painting")
        self.medium = Medium.objects.create(name="Oil on Canvas", type=self.art_type)
        
        # Create artworks with names that sort differently from creation order
        self.art_b = Artwork.objects.create(name="Bedroom in Arles", medium=self.medium)
        self.art_a = Artwork.objects.create(name="Almond Blossoms", medium=self.medium)
        
        self.event_type = EventType.objects.create(name="Acquisition")
        
        # Create events for Almond Blossoms
        # sequence 2
        ProvenanceEvent.objects.create(
            artwork=self.art_a,
            event_type=self.event_type,
            sequence_number=2,
            person=self.person,
            date="1890"
        )
        # sequence 1
        ProvenanceEvent.objects.create(
            artwork=self.art_a,
            event_type=self.event_type,
            sequence_number=1,
            person=self.person,
            date="1889"
        )
        
        # Create events for Bedroom in Arles
        ProvenanceEvent.objects.create(
            artwork=self.art_b,
            event_type=self.event_type,
            sequence_number=1,
            person=self.person,
            date="1888"
        )
        
    def test_events_sorted_by_artwork_and_sequence(self):
        url = reverse('person-detail', kwargs={'pk': self.person.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        events = data['events']
        self.assertEqual(len(events), 3)
        
        # Expected order:
        # 1. Almond Blossoms (sequence 1)
        # 2. Almond Blossoms (sequence 2)
        # 3. Bedroom in Arles (sequence 1)
        self.assertEqual(events[0]['artwork_name'], "Almond Blossoms")
        self.assertEqual(events[0]['sequence'], 1)
        
        self.assertEqual(events[1]['artwork_name'], "Almond Blossoms")
        self.assertEqual(events[1]['sequence'], 2)
        
        self.assertEqual(events[2]['artwork_name'], "Bedroom in Arles")
        self.assertEqual(events[2]['sequence'], 1)


class InstitutionListAPITest(TestCase):
    def setUp(self):
        self.inst = Institution.objects.create(name="Louvre Museum", place="Paris")
        self.person = Person.objects.create(family_name="Gogh", first_name="Vincent")
        
        # Create an interaction with the institution
        self.interaction = Interaction.objects.create(
            entity1_person=self.person,
            entity2_institution=self.inst,
            interaction_type="singular",
            date="1889",
            place="Paris"
        )
        
    def test_institution_list_includes_interactions(self):
        url = reverse('institution-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        results = data['results']
        self.assertEqual(len(results), 1)
        
        inst_data = results[0]
        self.assertEqual(inst_data['name'], "Louvre Museum")
        self.assertEqual(inst_data['interactions'][0]['entity2']['name'], "Louvre Museum")


class LookupAPITest(TestCase):
    def setUp(self):
        Person.objects.create(family_name="de Jong", first_name="Piet")
        Person.objects.create(family_name="Gogh", first_name="Vincent")
        Person.objects.create(family_name="Alberts", first_name="Albert")
        
        Institution.objects.create(name="metropolitan Museum")
        Institution.objects.create(name="Louvre Museum")
        Institution.objects.create(name="Alte Nationalgalerie")
        
    def test_lookups_are_case_insensitive_sorted(self):
        # Person lookup
        response = self.client.get('/api/persons/lookup/')
        self.assertEqual(response.status_code, 200)
        results = response.json()['results']
        names = [r['name'] for r in results]
        self.assertEqual(names, ["Alberts, Albert", "de Jong, Piet", "Gogh, Vincent"])
        
        # Institution lookup
        response = self.client.get('/api/institutions/lookup/')
        self.assertEqual(response.status_code, 200)
        results = response.json()['results']
        names = [r['name'] for r in results]
        self.assertEqual(names, ["Alte Nationalgalerie", "Louvre Museum", "metropolitan Museum"])


from django.db.models import ProtectedError

class PersonDeletionProtectionTest(TestCase):
    def setUp(self):
        self.person = Person.objects.create(family_name="Gogh", first_name="Vincent")
        
        self.art_type = ArtType.objects.create(name="Painting")
        self.medium = Medium.objects.create(name="Oil on Canvas", type=self.art_type)
        self.artwork = Artwork.objects.create(name="Almond Blossoms", medium=self.medium)
        
        self.event_type = EventType.objects.create(name="Acquisition")
        
    def test_delete_person_succeeds_when_not_referenced(self):
        person_to_delete = Person.objects.create(family_name="Unreferenced", first_name="Person")
        person_id = person_to_delete.id
        person_to_delete.delete()
        self.assertFalse(Person.objects.filter(id=person_id).exists())
        
    def test_delete_person_fails_when_referenced_in_provenance_event(self):
        # Create an event referencing the person
        ProvenanceEvent.objects.create(
            artwork=self.artwork,
            event_type=self.event_type,
            sequence_number=1,
            person=self.person,
            date="1889"
        )
        
        # Attempting to delete the person should raise ProtectedError
        with self.assertRaises(ProtectedError):
            self.person.delete()
            
        # Verify the person still exists
        self.assertTrue(Person.objects.filter(id=self.person.id).exists())


class GeneralDeletionProtectionTest(TestCase):
    def setUp(self):
        self.art_type = ArtType.objects.create(name="Painting")
        self.medium = Medium.objects.create(name="Oil on Canvas", type=self.art_type)
        self.artwork_1 = Artwork.objects.create(name="Artwork 1", medium=self.medium)
        self.artwork_2 = Artwork.objects.create(name="Artwork 2", medium=self.medium)
        self.institution = Institution.objects.create(name="Louvre Museum")
        
    def test_delete_medium_fails_when_referenced_by_artwork(self):
        with self.assertRaises(ProtectedError):
            self.medium.delete()
        self.assertTrue(Medium.objects.filter(id=self.medium.id).exists())

    def test_delete_artwork_fails_when_referenced_by_relationship(self):
        # Create a relationship between artwork 1 and artwork 2
        ArtworkRelationship.objects.create(
            source_artwork=self.artwork_1,
            target_artwork=self.artwork_2,
            type="study_for"
        )
        
        with self.assertRaises(ProtectedError):
            self.artwork_1.delete()
        self.assertTrue(Artwork.objects.filter(id=self.artwork_1.id).exists())

        with self.assertRaises(ProtectedError):
            self.artwork_2.delete()
        self.assertTrue(Artwork.objects.filter(id=self.artwork_2.id).exists())

    def test_delete_institution_fails_when_referenced_by_exhibition(self):
        Exhibition.objects.create(
            name="Great Exhibition",
            date_start="1851",
            institution=self.institution
        )
        with self.assertRaises(ProtectedError):
            self.institution.delete()
        self.assertTrue(Institution.objects.filter(id=self.institution.id).exists())







