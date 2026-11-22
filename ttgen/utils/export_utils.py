import openpyxl
from openpyxl.styles import Font
from django.http import HttpResponse
from django.template.loader import render_to_string
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from io import BytesIO

import io
from ..models import TimetableEntry, Section

# Define period timings
PERIOD_TIMINGS = {
    1: "08:00–09:30",
    2: "09:30–11:00",
    3: "11:00–12:30",
    4: "12:30–14:00",
    5: "14:00–15:30",
    6: "15:30–17:00",
}

def export_timetable_to_excel(section_id):
    section = Section.objects.get(id=section_id)
    entries = TimetableEntry.objects.filter(section=section).order_by('day', 'period')

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"{section.name} Timetable"

    ws.append(["Day", "Period", "Time", "Subject", "Teacher", "Classroom"])
    for cell in ws[1]:
        cell.font = Font(bold=True)

    for entry in entries:
        ws.append([
            entry.get_day_display(),
            entry.period,
            PERIOD_TIMINGS.get(entry.period, ""),
            entry.subject.name,
            entry.teacher.name,
            entry.classroom.name if entry.classroom else ""
        ])

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    filename = f"{section.name}_timetable.xlsx"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    wb.save(response)
    return response

def export_timetable_to_pdf(timetable_data):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)
    pdf.setTitle("Generated Timetable")
    pdf.setFont("Helvetica", 12)

    y = 800
    pdf.drawString(100, y, "Timetable Export")
    y -= 30

    for item in timetable_data:
        line = ", ".join([f"{key}: {value}" for key, value in item.items()])
        pdf.drawString(100, y, line)
        y -= 20
        if y < 50:
            pdf.showPage()
            y = 800

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')

