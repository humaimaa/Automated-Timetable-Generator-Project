from django.core.management.base import BaseCommand
from ttgen.models import Subject, Batch

class Command(BaseCommand):
    help = 'Assigns a batch to all Subjects with null batch (uses first available batch)'

    def handle(self, *args, **options):
        batch = Batch.objects.first()
        if not batch:
            self.stdout.write(self.style.ERROR('No Batch found. Please create a Batch first.'))
            return
        updated = 0
        for subject in Subject.objects.filter(batch__isnull=True):
            subject.batch = batch
            subject.save()
            updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} subjects with batch {batch.name}'))
