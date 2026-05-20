from rest_framework import serializers
from .models import (
    Curriculum, Program, Course, Module, Topic, LearningObjective,
    StudyMaterial, Assignment, AcademicSchedule,
    CourseAssignment, CourseEnrollment, Attendance
)
from users.serializers import UserSerializer


class LearningObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningObjective
        fields = ['id', 'description', 'bloom_level', 'order']


class StudyMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = StudyMaterial
        fields = [
            'id', 'title', 'material_type', 'file',
            'url', 'uploaded_by', 'uploaded_by_detail', 'uploaded_at'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at']


class AssignmentSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'topic', 'topic_name', 'title', 'description', 'due_date', 'max_marks', 'created_at']
        read_only_fields = ['created_at']


class TopicSerializer(serializers.ModelSerializer):
    objectives = LearningObjectiveSerializer(many=True, read_only=True)
    materials = StudyMaterialSerializer(many=True, read_only=True)
    assignments = AssignmentSerializer(many=True, read_only=True)
    prerequisites_detail = serializers.SerializerMethodField()
    completed_by_detail = UserSerializer(source='completed_by', read_only=True)

    class Meta:
        model = Topic
        fields = [
            'id', 'name', 'description', 'order', 'duration_hours',
            'prerequisites', 'prerequisites_detail', 'ai_suggested_order',
            'is_completed', 'completed_at', 'completed_by', 'completed_by_detail',
            'objectives', 'materials', 'assignments', 'created_at'
        ]

    def get_prerequisites_detail(self, obj):
        return [{'id': t.id, 'name': t.name} for t in obj.prerequisites.all()]


class TopicListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lists (no nested data — faster)"""
    class Meta:
        model = Topic
        fields = ['id', 'name', 'order', 'duration_hours', 'ai_suggested_order', 'is_completed']


class ModuleSerializer(serializers.ModelSerializer):
    topics = TopicListSerializer(many=True, read_only=True)
    topic_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'name', 'description', 'order', 'topics', 'topic_count', 'created_at']

    def get_topic_count(self, obj):
        return obj.topics.count()


class ModuleListSerializer(serializers.ModelSerializer):
    topic_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'name', 'order', 'topic_count']

    def get_topic_count(self, obj):
        return obj.topics.count()


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleListSerializer(many=True, read_only=True)
    module_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'program', 'name', 'code', 'description', 'credits', 'semester',
            'order', 'is_active', 'modules', 'module_count',
            'teacher_count', 'student_count', 'created_at'
        ]

    def get_module_count(self, obj):
        return obj.modules.count()

    def get_teacher_count(self, obj):
        return obj.teachers.count()

    def get_student_count(self, obj):
        return obj.students.count()


class CourseListSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'credits', 'semester', 'order', 
            'is_active', 'module_count', 'teacher_count', 'student_count'
        ]

    def get_module_count(self, obj):
        return obj.modules.count()

    def get_teacher_count(self, obj):
        return obj.teachers.count()

    def get_student_count(self, obj):
        return obj.students.count()


class CurriculumSerializer(serializers.ModelSerializer):
    program_count = serializers.SerializerMethodField()

    class Meta:
        model = Curriculum
        fields = ['id', 'institution', 'name', 'short_name', 'description', 'program_count', 'created_at']

    def get_program_count(self, obj):
        return obj.programs.count()


class ProgramSerializer(serializers.ModelSerializer):
    courses = CourseListSerializer(many=True, read_only=True)
    course_count = serializers.SerializerMethodField()
    curriculum_detail = CurriculumSerializer(source='curriculum', read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'curriculum', 'curriculum_detail', 'name', 'code', 'description', 'duration_years',
            'order', 'is_active', 'courses', 'course_count', 'created_at'
        ]

    def get_course_count(self, obj):
        return obj.courses.count()


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'course', 'student', 'student_name', 
            'date', 'status', 'remarks', 'marked_by'
        ]
        read_only_fields = ['marked_by']


class AcademicScheduleSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = AcademicSchedule
        fields = [
            'id', 'topic', 'topic_name', 'course', 'course_name',
            'start_datetime', 'end_datetime', 'room', 'notes'
        ]

    def validate(self, attrs):
        # Conflict detection — no two sessions in same room at same time
        start = attrs.get('start_datetime')
        end = attrs.get('end_datetime')
        room = attrs.get('room')

        if start and end and start >= end:
            raise serializers.ValidationError("End time must be after start time.")

        if room:
            conflict = AcademicSchedule.objects.filter(
                room=room,
                start_datetime__lt=end,
                end_datetime__gt=start
            ).exclude(id=self.instance.id if self.instance else None)

            if conflict.exists():
                raise serializers.ValidationError(
                    f"Room '{room}' is already booked during this time."
                )
        return attrs