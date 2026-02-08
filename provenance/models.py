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

class Person(models.Model):
    name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    death_date = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    biography = models.TextField(blank=True)
    
    images = GenericRelation(Image)

    def __str__(self):
        return self.name

class Organization(models.Model):
    ORG_TYPES = [
        ('auction_house', 'Auction House'),
        ('dealership', 'Dealership'),
        ('museum', 'Museum'),
        ('gallery', 'Gallery'),
        ('other', 'Other'),
    ]
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=ORG_TYPES)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class ArtworkGroup(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Medium(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Artwork(models.Model):
    title = models.CharField(max_length=255)
    medium = models.ForeignKey(Medium, on_delete=models.SET_NULL, null=True, blank=True, related_name='artworks')
    dimensions = models.CharField(max_length=100, blank=True)
    creation_date_text = models.CharField(max_length=100, blank=True, help_text="e.g. 'c. 1750'")
    year_start = models.IntegerField(null=True, blank=True)
    year_end = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="General notes or content remarks.")
    
    groups = models.ManyToManyField(ArtworkGroup, blank=True, related_name='artworks')
    images = GenericRelation(Image)

    def __str__(self):
        return self.title

class Source(models.Model):
    SOURCE_TYPES = [
        ('archive', 'Archive Document (Archivalie)'),
        ('literature', 'Literature (Literatur)'),
        ('other', 'Other'),
    ]
    citation = models.CharField(max_length=500, help_text="e.g. 'Sotheby's Catalog, 1923'")
    type = models.CharField(max_length=50, choices=SOURCE_TYPES, default='other')
    details = models.TextField(blank=True, help_text="Specific pages, digital locations, etc.")
    notes = models.TextField(blank=True, help_text="Remarks about the archival document.")
    images = GenericRelation(Image)

    def __str__(self):
        return self.citation[:50]

class Auction(models.Model):
    name = models.CharField(max_length=255)
    auction_house = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='auctions')
    date = models.DateField(null=True, blank=True)
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, null=True, blank=True, help_text="Link to the auction catalog.")

    def __str__(self):
        return f"{self.name} ({self.date})"

class Exhibition(models.Model):
    title = models.CharField(max_length=255)
    location = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='exhibitions')
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, null=True, blank=True, help_text="Link to the exhibition catalog.")

    def __str__(self):
        return f"{self.title} ({self.date_start})"

class ProvenanceEvent(models.Model):
    EVENT_TYPES = [
        ('creation', 'Creation'),
        ('acquisition', 'Acquisition'),
        ('sale', 'Sale'),
        ('transfer', 'Transfer'),
        ('mentioned', 'Mentioned'),
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('loan', 'Loan'),
        ('exhibition', 'Exhibited'),
    ]
    CERTAINTY_CHOICES = [
        ('proven', 'Proven'),
        ('likely', 'Likely'),
        ('possible', 'Possible'),
        ('unproven', 'Unproven'),
        ('false', 'False / Disproven'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='provenance')
    sequence_number = models.IntegerField(help_text="Order of events. Higher number = later.")
    
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, default='acquisition')
    
    # Actor (Person or Organization)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    actor = GenericForeignKey('content_type', 'object_id')
    
    role = models.CharField(max_length=100, blank=True, help_text="e.g. Owner, Seller, Agent")
    
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    display_date = models.CharField(max_length=100, blank=True, help_text="e.g. 'Early 20th Century'")
    
    certainty = models.CharField(max_length=20, choices=CERTAINTY_CHOICES, default='proven')
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Context
    auction = models.ForeignKey(Auction, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    exhibition = models.ForeignKey(Exhibition, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')

    price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['sequence_number']

    def __str__(self):
        return f"{self.sequence_number}. {self.get_event_type_display()} - {self.artwork}"

class ArtworkRelationship(models.Model):
    RELATION_TYPES = [
        ('possible_match', 'Possible Match (Is this the same?)'),
        ('copy_of', 'Copy Of'),
        ('pendant_to', 'Pendant To'),
        ('study_for', 'Study For'),
    ]
    CERTAINTY_CHOICES = [
        ('possible', 'Possible'),
        ('probable', 'Probable'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]

    source_artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='relationships_from')
    target_artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='relationships_to')
    
    type = models.CharField(max_length=50, choices=RELATION_TYPES, default='possible_match')
    certainty = models.CharField(max_length=20, choices=CERTAINTY_CHOICES, default='possible')
    reasoning = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source_artwork} -> {self.get_type_display()} -> {self.target_artwork}"
