from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Batch, Section, Subject, Teacher, Classroom, TimetableEntry
from .serializers import (
    BatchSerializer, SectionSerializer, SubjectSerializer, TeacherSerializer,
    ClassroomSerializer, TimetableEntrySerializer
)
from .ga_scheduler import generate_timetable, generate_timetable_for_all
from rest_framework.decorators import api_view
from .utils.export_utils import export_timetable_to_excel, export_timetable_to_pdf
import logging

logger = logging.getLogger(__name__)

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all()
    serializer_class = BatchSerializer

class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_queryset(self):
        queryset = Subject.objects.all()
        batch_id = self.request.query_params.get('batch_id')
        if batch_id:
            queryset = queryset.filter(batches__id=batch_id)
        return queryset

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

    def get_queryset(self):
        queryset = Teacher.objects.all()
        batch_id = self.request.query_params.get('batch_id')
        if batch_id:
            queryset = queryset.filter(batches__id=batch_id)
        return queryset

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.all()
    serializer_class = TimetableEntrySerializer

    def get_queryset(self):
        queryset = TimetableEntry.objects.all()
        section_id = self.request.query_params.get('section_id')
        teacher_id = self.request.query_params.get('teacher_id')
        if section_id:
            queryset = queryset.filter(section_id=section_id)
        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        return queryset

    @action(detail=False, methods=['post'])
    def generate(self, request):
        logger.info('Timetable generation requested')
        try:
            batch_id = request.data.get('batch_id')
            if not batch_id:
                return Response({'error': 'batch_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            result = generate_timetable(batch_id)
            logger.info(f'Generation result: {result}')
            if result['success']:
                return Response({'status': 'generated'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': result.get('error', 'Unknown error')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception('Error during timetable generation')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def generate_all(self, request):
        try:
            result = generate_timetable_for_all()
            # result should be a list of dicts: [{batch_name, section_name, entries: [...]}, ...]
            return Response({'timetables': result}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception('Error during timetable generation for all')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def export_html(self, request):
        section_id = request.query_params.get('section_id')
        teacher_id = request.query_params.get('teacher_id')
        queryset = self.get_queryset()
        # Simple HTML export
        html = '<html><head><title>Timetable Export</title></head><body>'
        html += '<h2>Timetable</h2><table border="1"><tr><th>Day</th><th>Period</th><th>Section</th><th>Subject</th><th>Teacher</th><th>Classroom</th></tr>'
        for entry in queryset:
            html += f'<tr><td>{entry.day}</td><td>{entry.period}</td><td>{entry.section.name}</td><td>{entry.subject.name}</td><td>{entry.teacher.name}</td><td>{entry.classroom.name}</td></tr>'
        html += '</table></body></html>'
        return Response(html, content_type='text/html')

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        import csv
        from io import StringIO
        section_id = request.query_params.get('section_id')
        teacher_id = request.query_params.get('teacher_id')
        queryset = self.get_queryset()
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Day', 'Period', 'Section', 'Subject', 'Teacher', 'Classroom'])
        for entry in queryset:
            writer.writerow([entry.day, entry.period, entry.section.name, entry.subject.name, entry.teacher.name, entry.classroom.name])
        return Response(output.getvalue(), content_type='text/csv')

    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        from io import BytesIO
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        section_id = request.query_params.get('section_id')
        teacher_id = request.query_params.get('teacher_id')
        queryset = self.get_queryset()
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont('Helvetica', 12)
        y = 750
        p.drawString(30, y, 'Day')
        p.drawString(80, y, 'Period')
        p.drawString(140, y, 'Section')
        p.drawString(220, y, 'Subject')
        p.drawString(320, y, 'Teacher')
        p.drawString(420, y, 'Classroom')
        y -= 20
        for entry in queryset:
            p.drawString(30, y, str(entry.day))
            p.drawString(80, y, str(entry.period))
            p.drawString(140, y, entry.section.name)
            p.drawString(220, y, entry.subject.name)
            p.drawString(320, y, entry.teacher.name)
            p.drawString(420, y, entry.classroom.name)
            y -= 20
            if y < 50:
                p.showPage()
                y = 750
        p.save()
        pdf = buffer.getvalue()
        buffer.close()
        return Response(pdf, content_type='application/pdf')

@api_view(['GET'])
def download_excel(request, section_id):
    return export_timetable_to_excel(section_id)

@api_view(['GET'])
def download_pdf(request, section_id):
    return export_timetable_to_pdf(section_id)
