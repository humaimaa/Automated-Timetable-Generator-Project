from django.core.management.base import BaseCommand
from ttgen.models import Batch, Section, Subject, Teacher, Classroom, TimetableEntry

class Command(BaseCommand):
    help = 'Deletes all data from ttgen app models (Batch, Section, Subject, Teacher, Classroom, TimetableEntry)'

    def handle(self, *args, **options):
        TimetableEntry.objects.all().delete()
        Teacher.objects.all().delete()
        Subject.objects.all().delete()
        Section.objects.all().delete()
        Classroom.objects.all().delete()
        Batch.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('All ttgen data cleared.'))
