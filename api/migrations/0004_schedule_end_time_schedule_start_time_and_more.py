# Generated by Django 4.2.11 on 2024-04-10 08:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_service_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='schedule',
            name='end_time',
            field=models.TimeField(default='00:00:00'),
        ),
        migrations.AddField(
            model_name='schedule',
            name='start_time',
            field=models.TimeField(default='00:00:00'),
        ),
        migrations.AlterField(
            model_name='service',
            name='description',
            field=models.TextField(null=True),
        ),
    ]