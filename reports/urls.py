from django.urls import path
from .views import AdminReportView, TeacherReportView, StudentReportView, StudentResumeReportView

urlpatterns = [
    path('admin/', AdminReportView.as_view(), name='admin-report'),
    path('teacher/', TeacherReportView.as_view(), name='teacher-report'),
    path('student/', StudentReportView.as_view(), name='student-report'),
    path('student/resume/', StudentResumeReportView.as_view(), name='student-resume-report'),
]
