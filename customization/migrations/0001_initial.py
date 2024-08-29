# Generated by Django 5.1 on 2024-08-26 13:58

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserCustom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score_win', models.IntegerField(default=1)),
                ('color_1', models.IntegerField(default=3)),
                ('color_2', models.IntegerField(default=2)),
                ('color_filet', models.IntegerField(default=4)),
                ('size_raquette', models.CharField(default='regular')),
                ('nb_balls', models.IntegerField(default=1)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]