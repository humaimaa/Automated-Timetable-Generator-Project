from django.db import models

# Create your models here.

class Batch(models.Model):
    name = models.CharField(max_length=10, unique=True)
    def __str__(self):
        return self.name

class Section(models.Model):
    name = models.CharField(max_length=10)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='sections')
    def __str__(self):
        return f"{self.batch.name}-{self.name}"

class Subject(models.Model):
    code = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=50)
    periods_per_week = models.PositiveIntegerField()
    batches = models.ManyToManyField(Batch, related_name='subjects')  # ManyToMany for multi-batch support
    def __str__(self):
        return self.name

class Teacher(models.Model):
    name = models.CharField(max_length=50)
    max_periods_per_week = models.PositiveIntegerField()
    subjects = models.ManyToManyField(Subject, related_name='teachers')
    daily_unavailable = models.JSONField(default=dict, blank=True)
    batches = models.ManyToManyField(Batch, related_name='teachers')  # ManyToMany for multi-batch support
    def __str__(self):
        return self.name

class Classroom(models.Model):
    LAB = 'lab'
    REGULAR = 'regular'
    TYPE_CHOICES = [
        (LAB, 'Lab'),
        (REGULAR, 'Regular'),
    ]
    name = models.CharField(max_length=20)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=REGULAR)
    def __str__(self):
        return f"{self.name} ({self.type})"

class TimetableEntry(models.Model):
    DAYS = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
    ]
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='timetable_entries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.SET_NULL, null=True, blank=True)
    day = models.IntegerField(choices=DAYS)
    period = models.PositiveIntegerField()  # 1 to 6
    class Meta:
        unique_together = ('section', 'day', 'period')
    def __str__(self):
        return f"{self.section} {self.get_day_display()} P{self.period}: {self.subject} ({self.teacher})"
