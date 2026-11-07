import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('provenance', '0029_alter_artwork_medium_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuctionInstitution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('buyer', 'Buyer'), ('seller', 'Seller'), ('expert', 'Expert'), ('auctioneer', 'Auctioneer')], max_length=20)),
                ('auction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auction_institutions', to='provenance.auction')),
                ('institution', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='institution_auctions', to='provenance.institution')),
            ],
        ),
    ]

