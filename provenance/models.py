from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType

class Image(models.Model):
    image = models.ImageField(upload_to='images/')
    caption = models.CharField(max_length=255, blank=True)
    
    # Polymorphic link to Person, Artwork, Source, etc.
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.caption or f"Image {self.id}"

class ArtType(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class EventType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class ArtworkGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Medium(models.Model):
    name = models.CharField(max_length=255, unique=True)
    type = models.ForeignKey(ArtType, on_delete=models.SET_NULL, null=True, blank=True, related_name='mediums')
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Person(models.Model):
    family_name = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255, blank=True)
    birth_date = models.CharField(max_length=100, blank=True, null=True) # Changed to CharField to handle Excel dates
    death_date = models.CharField(max_length=100, blank=True, null=True)
    biography = models.TextField(blank=True)
    
    images = GenericRelation(Image)

    def __str__(self):
        return f"{self.family_name}, {self.first_name}".strip(", ")

class InstitutionType(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Institution(models.Model):
    name = models.CharField(max_length=255, unique=True)
    type = models.ForeignKey(InstitutionType, on_delete=models.SET_NULL, null=True, blank=True, related_name='institutions')
    place = models.CharField(max_length=255, blank=True)
    start_date = models.CharField(max_length=100, blank=True, null=True)
    end_date = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Artwork(models.Model):
    name = models.CharField(max_length=255)
    dimension = models.CharField(max_length=255, blank=True)
    medium = models.ForeignKey(Medium, on_delete=models.SET_NULL, null=True, blank=True, related_name='artworks')
    notes = models.TextField(blank=True)
    
    groups = models.ManyToManyField(ArtworkGroup, blank=True, related_name='artworks')
    images = GenericRelation(Image)

    def __str__(self):
        return self.name

class Source(models.Model):
    source = models.CharField(max_length=500)
    type = models.CharField(max_length=255, blank=True)
    link = models.URLField(max_length=500, blank=True, null=True)
    images = GenericRelation(Image)

    def __str__(self):
        return self.source[:50]

class ProvenanceEvent(models.Model):
    CERTAINTY_CHOICES = [
        ('proven', 'Proven'),
        ('likely', 'Likely'),
        ('possible', 'Possible'),
        ('unproven', 'Unproven'),
        ('false', 'False / Disproven'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='provenance_events')
    event_type = models.ForeignKey(EventType, on_delete=models.SET_NULL, null=True, blank=True, related_name='provenance_events')
    sequence_number = models.IntegerField(help_text="Order of events.")
    date = models.CharField(max_length=100, blank=True, help_text="Date as input type text")
    
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, related_name='provenance_events')
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='provenance_events')
    
    certainty = models.CharField(max_length=20, choices=CERTAINTY_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True)
    
    sources = models.ManyToManyField(Source, blank=True, related_name='provenance_events')

    class Meta:
        ordering = ['sequence_number']

    def __str__(self):
        return f"{self.sequence_number}. {self.event_type} - {self.artwork}"

class ArtworkRelationship(models.Model):
    RELATION_TYPES = [
        ('possible_match', 'Possible Match'),
        ('copy_of', 'Copy Of'),
        ('pendant_to', 'Pendant To'),
        ('study_for', 'Study For'),
    ]

    source_artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='relationships_from')
    target_artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='relationships_to')
    
    type = models.CharField(max_length=50, choices=RELATION_TYPES, default='possible_match')
    reasoning = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source_artwork} -> {self.type} -> {self.target_artwork}"

class Auction(models.Model):
    name = models.CharField(max_length=255)
    date = models.CharField(max_length=100, blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='auctions')
    notes = models.TextField(blank=True)
    sources = models.ManyToManyField(Source, blank=True, related_name='auctions')
    images = GenericRelation(Image)

    def __str__(self):
        return self.name

class AuctionPerson(models.Model):
    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('expert', 'Expert'),
        ('auctioneer', 'Auctioneer'),
    ]
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='auction_persons')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='person_auctions')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.person} as {self.get_role_display()} in {self.auction}"

class Exhibition(models.Model):
    name = models.CharField(max_length=255)
    date_start = models.CharField(max_length=100, blank=True)
    date_end = models.CharField(max_length=100, blank=True, null=True)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name='exhibitions')
    notes = models.TextField(blank=True)
    sources = models.ManyToManyField(Source, blank=True, related_name='exhibitions')
    images = GenericRelation(Image)

    def __str__(self):
        return self.name
