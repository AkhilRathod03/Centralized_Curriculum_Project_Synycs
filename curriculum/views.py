from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import HttpResponse, FileResponse
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from .models import (
    Curriculum, Program, Course, Module, Topic, LearningObjective,
    StudyMaterial, Assignment, AcademicSchedule,
    CourseAssignment, CourseEnrollment, Attendance
)
from .serializers import (
    CurriculumSerializer, ProgramSerializer, CourseSerializer, CourseListSerializer,
    ModuleSerializer, TopicSerializer, TopicListSerializer,
    LearningObjectiveSerializer, StudyMaterialSerializer,
    AssignmentSerializer, AcademicScheduleSerializer, AttendanceSerializer
)
from users.serializers import UserSerializer
from .permissions import IsAdminUser, IsAdminOrTeacher, IsSameInstitution
from audit.utils import log_action
from django.db.models import Count

# ── Mixin: automatically filter by user's institution ──────────────
class InstitutionMixin:
    """
    Every view that uses this will ONLY see data
    from the logged-in user's institution.
    This is the core of multi-tenancy!
    """
    def get_institution(self):
        return self.request.user.institution

# ── Curriculum Views ────────────────────────────────────────────────

class CurriculumListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = CurriculumSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_name']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        return Curriculum.objects.filter(
            institution=self.get_institution()
        ).annotate(program_count_annotated=Count('programs', distinct=True))

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        curriculum = serializer.save(institution=self.get_institution())
        log_action(self.request.user, 'CREATE', 'Curriculum', curriculum.id,
                   {'name': curriculum.name}, self.request)


class CurriculumDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CurriculumSerializer

    def get_queryset(self):
        return Curriculum.objects.filter(institution=self.get_institution())

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


# ── Program Views ───────────────────────────────────────────────────

class ProgramListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = ProgramSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['order', 'name', 'created_at']

    def get_queryset(self):
        qs = Program.objects.filter(
            institution=self.get_institution()
        ).annotate(course_count_annotated=Count('courses', distinct=True))
        
        curriculum_id = self.request.query_params.get('curriculum')
        if curriculum_id:
            qs = qs.filter(curriculum_id=curriculum_id)
            
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        program = serializer.save(
            institution=self.get_institution(),
            created_by=self.request.user
        )
        log_action(self.request.user, 'CREATE', 'Program', program.id,
                   {'name': program.name}, self.request)


class ProgramDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProgramSerializer

    def get_queryset(self):
        return Program.objects.filter(institution=self.get_institution())

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def perform_update(self, serializer):
        program = serializer.save()
        log_action(self.request.user, 'UPDATE', 'Program', program.id,
                   {'name': program.name}, self.request)

    def perform_destroy(self, instance):
        log_action(self.request.user, 'DELETE', 'Program', instance.id,
                   {'name': instance.name}, self.request)
        instance.delete()


# ── Course Views ────────────────────────────────────────────────────

class CourseListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['order', 'semester', 'name']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CourseListSerializer
        return CourseSerializer

    def get_queryset(self):
        qs = Course.objects.filter(
            program__institution=self.get_institution()
        ).annotate(
            module_count_annotated=Count('modules', distinct=True),
            teacher_count_annotated=Count('teachers', distinct=True),
            student_count_annotated=Count('students', distinct=True)
        )
        program_id = self.request.query_params.get('program')
        semester = self.request.query_params.get('semester')
        role = self.request.user.role

        if program_id:
            qs = qs.filter(program_id=program_id)
        if semester:
            qs = qs.filter(semester=semester)
        # Teachers only see their assigned courses
        if role == 'teacher':
            qs = qs.filter(teachers=self.request.user)
        # Students see exactly what is in their Program and Semester
        elif role == 'student':
            if self.request.user.program:
                qs = qs.filter(
                    program=self.request.user.program, 
                    semester=self.request.user.current_semester
                )
            else:
                qs = qs.none()

        return qs.prefetch_related('modules')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.save()
        log_action(self.request.user, 'CREATE', 'Course', course.id,
                   {'name': course.name}, self.request)


class CourseDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(program__institution=self.get_institution())

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]


# ── Module Views ────────────────────────────────────────────────────

class ModuleListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Module.objects.filter(
            course_id=course_id,
            course__program__institution=self.get_institution()
        ).prefetch_related('topics')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        module = serializer.save(course=course)
        log_action(self.request.user, 'CREATE', 'Module', module.id,
                   {'name': module.name}, self.request)


class ModuleDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        return Module.objects.filter(
            course__program__institution=self.get_institution()
        )

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminOrTeacher()]


# ── Topic Views ─────────────────────────────────────────────────────

class TopicListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = TopicSerializer

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        return Topic.objects.filter(
            module_id=module_id,
            module__course__program__institution=self.get_institution()
        ).prefetch_related('objectives', 'materials', 'assignments', 'prerequisites')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        module = get_object_or_404(Module, id=self.kwargs['module_id'])
        topic = serializer.save(module=module)
        log_action(self.request.user, 'CREATE', 'Topic', topic.id,
                   {'name': topic.name}, self.request)


class TopicDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TopicSerializer

    def get_queryset(self):
        return Topic.objects.filter(
            module__course__program__institution=self.get_institution()
        )

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminOrTeacher()]


# ── Reorder View (for drag and drop) ───────────────────────────────

class ReorderView(APIView):
    """
    When user drags topic/module to new position,
    this saves the new order.
    Like rearranging books on a shelf.
    """
    permission_classes = [IsAdminOrTeacher]

    MODEL_MAP = {
        'program': Program,
        'course': Course,
        'module': Module,
        'topic': Topic,
    }

    def post(self, request, model_type):
        Model = self.MODEL_MAP.get(model_type)
        if not Model:
            return Response({'error': 'Invalid model type'}, status=400)

        # ordered_ids = [3, 1, 4, 2] means item 3 is first, item 1 is second...
        ordered_ids = request.data.get('ordered_ids', [])
        for index, item_id in enumerate(ordered_ids):
            Model.objects.filter(id=item_id).update(order=index)

        return Response({'message': f'{model_type} reordered successfully'})


# ── Learning Objective Views ────────────────────────────────────────

class ObjectiveListCreateView(generics.ListCreateAPIView):
    serializer_class = LearningObjectiveSerializer
    permission_classes = [IsAdminOrTeacher]

    def get_queryset(self):
        return LearningObjective.objects.filter(topic_id=self.kwargs['topic_id'])

    def perform_create(self, serializer):
        topic = get_object_or_404(Topic, id=self.kwargs['topic_id'])
        serializer.save(topic=topic)


class ObjectiveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LearningObjectiveSerializer
    permission_classes = [IsAdminOrTeacher]
    queryset = LearningObjective.objects.all()


# ── Study Material Views ────────────────────────────────────────────

class StudyMaterialListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = StudyMaterialSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        # View: Anyone in institution
        # Create: Admin or Teacher
        if self.request.method == 'POST':
            return [IsAdminOrTeacher(), IsSameInstitution()]
        return [permissions.IsAuthenticated(), IsSameInstitution()]

    def get_queryset(self):
        # Security: Only materials for this topic if topic belongs to user's institution
        return StudyMaterial.objects.filter(
            topic_id=self.kwargs['topic_id'],
            topic__module__course__program__institution=self.get_institution()
        )

    def perform_create(self, serializer):
        topic = get_object_or_404(
            Topic, 
            id=self.kwargs['topic_id'],
            module__course__program__institution=self.get_institution()
        )
        serializer.save(topic=topic, uploaded_by=self.request.user)


class StudyMaterialDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyMaterialSerializer
    
    def get_queryset(self):
        return StudyMaterial.objects.filter(
            topic__module__course__program__institution=self.get_institution()
        )

    def get_permissions(self):
        # Update/Delete: Admin or Assigned Teacher
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            from .permissions import IsAdminOrCourseTeacher
            return [IsAdminOrCourseTeacher(), IsSameInstitution()]
        return [permissions.IsAuthenticated(), IsSameInstitution()]


# ── Assignment Views ────────────────────────────────────────────────

class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Assignment.objects.filter(topic_id=self.kwargs['topic_id'])

    def perform_create(self, serializer):
        topic = get_object_or_404(Topic, id=self.kwargs['topic_id'])
        serializer.save(topic=topic, created_by=self.request.user)


# ── Academic Schedule Views ─────────────────────────────────────────

class ScheduleListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = AcademicScheduleSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = AcademicSchedule.objects.filter(
            course__program__institution=self.get_institution()
        )
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AcademicScheduleSerializer
    permission_classes = [IsAdminOrTeacher]

    def get_queryset(self):
        return AcademicSchedule.objects.filter(
            course__program__institution=self.request.user.institution
        )

class StudentScheduleExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({"error": "Only students can export their personal schedule."}, status=403)
        
        # 1. Fetch Schedule Data
        schedules = AcademicSchedule.objects.filter(
            course__students=request.user
        ).select_related('course', 'topic').order_by('start_datetime')

        if not schedules.exists():
            return Response({"error": "No schedule found for your enrolled courses."}, status=404)

        # 2. Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Custom Styles
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, spaceAfter=20, textColor=colors.HexColor('#2563eb'))
        header_style = ParagraphStyle('HeaderStyle', parent=styles['Heading2'], spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#333333'))
        
        # Title
        elements.append(Paragraph("SYNYCS PRO - ACADEMIC TIMETABLE", title_style))
        
        # Student Info
        elements.append(Paragraph(f"<b>Student:</b> {request.user.first_name} {request.user.last_name} ({request.user.username})", styles['Normal']))
        elements.append(Paragraph(f"<b>Institution:</b> {request.user.institution.name if request.user.institution else 'SYNYCS PRO CCMS'}", styles['Normal']))
        elements.append(Paragraph(f"<b>Generated On:</b> {timezone.now().strftime('%d %b %Y, %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))

        # Schedule Table
        data = [["Date", "Time", "Course", "Topic", "Room"]]
        for s in schedules:
            date_str = s.start_datetime.strftime("%d %b (%a)")
            time_str = f"{s.start_datetime.strftime('%H:%M')} - {s.end_datetime.strftime('%H:%M')}"
            data.append([
                date_str,
                time_str,
                s.course.name,
                s.topic.name,
                s.room if s.room else "TBA"
            ])

        t = Table(data, colWidths=[80, 100, 140, 140, 60])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        elements.append(t)
        
        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("<font size=8 color='grey'>This is an AI-generated academic schedule. Subject to change by institution administration.</font>", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        
        return FileResponse(buffer, as_attachment=True, filename=f"Timetable_{request.user.last_name}.pdf")


# ── Attendance Views ──────────────────────────────────────────────

class AttendanceListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        qs = Attendance.objects.filter(
            course__program__institution=self.get_institution()
        )
        course_id = self.request.query_params.get('course')
        date = self.request.query_params.get('date')
        if course_id:
            qs = qs.filter(course_id=course_id)
        if date:
            qs = qs.filter(date=date)
        
        # Students only see their own attendance
        if self.request.user.role == 'student':
            qs = qs.filter(student=self.request.user)
            
        return qs

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)


class BulkAttendanceView(APIView):
    """Allows marking attendance for a whole class in one go"""
    permission_classes = [IsAdminOrTeacher]

    def post(self, request):
        records = request.data.get('records', [])
        course_id = request.data.get('course_id')
        date = request.data.get('date')

        if not course_id or not date:
            return Response({'error': 'course_id and date are required'}, status=400)

        course = get_object_or_404(Course, id=course_id)
        
        created_count = 0
        for r in records:
            student_id = r.get('student_id')
            status = r.get('status', 'present')
            remarks = r.get('remarks', '')
            
            Attendance.objects.update_or_create(
                course=course,
                student_id=student_id,
                date=date,
                defaults={
                    'status': status,
                    'remarks': remarks,
                    'marked_by': request.user
                }
            )
            created_count += 1

        return Response({'message': f'Attendance for {created_count} students processed.'})


class CourseStudentsView(InstitutionMixin, generics.ListAPIView):
    serializer_class = UserSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        course = get_object_or_404(
            Course, id=course_id, 
            program__institution=self.get_institution()
        )
        return course.students.all()

class CourseTopicsView(InstitutionMixin, generics.ListAPIView):
    """Returns all topics for a given course across all modules"""
    serializer_class = TopicListSerializer

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Topic.objects.filter(
            module__course_id=course_id,
            module__course__program__institution=self.get_institution()
        ).order_by('module__order', 'order')


class TeacherAssignmentsView(InstitutionMixin, generics.ListAPIView):
    """Returns all assignments for courses taught by this teacher"""
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def get_queryset(self):
        # Find courses assigned to this teacher
        assigned_course_ids = CourseAssignment.objects.filter(
            teacher=self.request.user
        ).values_list('course_id', flat=True)
        
        return Assignment.objects.filter(
            topic__module__course_id__in=assigned_course_ids
        ).order_by('-created_at')


# ── Enrollment & Assignment Views ───────────────────────────────────

class EnrollStudentView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        student_id = request.data.get('student_id')
        student = get_object_or_404(
            User,
            id=student_id, role='student'
        )
        enrollment, created = CourseEnrollment.objects.get_or_create(
            course=course, student=student
        )
        if not created:
            return Response({'message': 'Already enrolled'}, status=400)
        return Response({'message': f'{student.username} enrolled in {course.name}'})


class AssignTeacherView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        teacher_id = request.data.get('teacher_id')
        teacher = get_object_or_404(
            User,
            id=teacher_id, role='teacher'
        )
        assignment, created = CourseAssignment.objects.get_or_create(
            course=course, teacher=teacher
        )
        if not created:
            return Response({'message': 'Already assigned'}, status=400)
        return Response({'message': f'{teacher.username} assigned to {course.name}'})
