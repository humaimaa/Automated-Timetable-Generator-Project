from rest_framework import serializers
from .models import Batch, Section, Subject, Teacher, Classroom, TimetableEntry

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    batch = BatchSerializer(read_only=True)
    batch_id = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), source='batch', write_only=True)
    class Meta:
        model = Section
        fields = ['id', 'name', 'batch', 'batch_id']

class SubjectSerializer(serializers.ModelSerializer):
    batches = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), many=True)
    class Meta:
        model = Subject
        fields = ['id', 'code', 'name', 'periods_per_week', 'batches']

class TeacherSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)
    subject_ids = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), many=True, source='subjects', write_only=True)
    batches = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), many=True)
    class Meta:
        model = Teacher
        fields = ['id', 'name', 'max_periods_per_week', 'subjects', 'subject_ids', 'daily_unavailable', 'batches']

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'

class TimetableEntrySerializer(serializers.ModelSerializer):
    section = serializers.CharField(source='section.name', read_only=True)
    subject = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher = serializers.CharField(source='teacher.name', read_only=True)
    classroom = serializers.CharField(source='classroom.name', read_only=True, allow_null=True)
    batch = serializers.CharField(source='section.batch.name', read_only=True)
    batch_id = serializers.IntegerField(source='section.batch.id', read_only=True)
    class Meta:
        model = TimetableEntry
        fields = ['id', 'section', 'subject', 'subject_code', 'teacher', 'classroom', 'batch', 'batch_id', 'day', 'period']
