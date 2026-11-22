from rest_framework import routers
from .views import (
    BatchViewSet, SectionViewSet, SubjectViewSet, TeacherViewSet,
    ClassroomViewSet, TimetableEntryViewSet
)
from . import views
from django.urls import path

router = routers.DefaultRouter()
router.register(r'batches', BatchViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'classrooms', ClassroomViewSet)
router.register(r'timetable', TimetableEntryViewSet)

urlpatterns = router.urls

urlpatterns += [
    # Timetable export endpoints
    path("timetable/<int:section_id>/excel/", views.download_excel),
    path("timetable/<int:section_id>/pdf/", views.download_pdf),
]
