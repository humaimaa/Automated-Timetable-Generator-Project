from django.core.management.base import BaseCommand
from ttgen.models import Teacher, Batch

class Command(BaseCommand):
    help = 'Assigns a batch to all Teachers with null batch (uses first available batch)'

    def handle(self, *args, **options):
        batch = Batch.objects.first()
        if not batch:
            self.stdout.write(self.style.ERROR('No Batch found. Please create a Batch first.'))
            return
        updated = 0
        for teacher in Teacher.objects.filter(batch__isnull=True):
            teacher.batch = batch
            teacher.save()
            updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} teachers with batch {batch.name}'))
