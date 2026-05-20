from django.urls import path
from . import views

urlpatterns = [
    # Curriculums (Degrees)
    path('curriculums/', views.CurriculumListCreateView.as_view()),
    path('curriculums/<int:pk>/', views.CurriculumDetailView.as_view()),

    # Programs (Branches)
    path('programs/', views.ProgramListCreateView.as_view()),
    path('programs/<int:pk>/', views.ProgramDetailView.as_view()),

    # Courses
    path('courses/', views.CourseListCreateView.as_view()),
    path('courses/<int:pk>/', views.CourseDetailView.as_view()),
    path('courses/<int:course_id>/enroll/', views.EnrollStudentView.as_view()),
    path('courses/<int:course_id>/assign-teacher/', views.AssignTeacherView.as_view()),
    path('courses/<int:course_id>/students/', views.CourseStudentsView.as_view()),

    # Modules (nested under course)
    path('courses/<int:course_id>/modules/', views.ModuleListCreateView.as_view()),
    path('modules/<int:pk>/', views.ModuleDetailView.as_view()),

    # Topics (nested under module)
    path('modules/<int:module_id>/topics/', views.TopicListCreateView.as_view()),
    path('topics/<int:pk>/', views.TopicDetailView.as_view()),

    # Learning Objectives
    path('topics/<int:topic_id>/objectives/', views.ObjectiveListCreateView.as_view()),
    path('objectives/<int:pk>/', views.ObjectiveDetailView.as_view()),

    # Study Materials
    path('topics/<int:topic_id>/materials/', views.StudyMaterialListCreateView.as_view()),
    path('materials/<int:pk>/', views.StudyMaterialDetailView.as_view()),

    # Assignments
    path('topics/<int:topic_id>/assignments/', views.AssignmentListCreateView.as_view()),

    # Schedules
    path('schedules/', views.ScheduleListCreateView.as_view()),
    path('schedules/export/', views.StudentScheduleExportView.as_view()),
    path('schedules/<int:pk>/', views.ScheduleDetailView.as_view()),

    # Reorder (drag and drop)
    path('reorder/<str:model_type>/', views.ReorderView.as_view()),

    # Attendance
    path('attendance/', views.AttendanceListCreateView.as_view()),
    path('attendance/bulk/', views.BulkAttendanceView.as_view()),

    # Teacher Specialized Views
    path('teacher/assignments/', views.TeacherAssignmentsView.as_view()),
    path('courses/<int:course_id>/topics/', views.CourseTopicsView.as_view()),
]