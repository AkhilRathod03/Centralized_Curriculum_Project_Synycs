from rest_framework import serializers
from .models import FileResource
from users.serializers import UserSerializer

class FileResourceSerializer(serializers.ModelSerializer):
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = FileResource
        fields = [
            'id', 'institution', 'course', 'course_name', 'program', 'program_name',
            'title', 'description', 'file', 'resource_type',
            'uploaded_by', 'uploaded_by_detail', 'created_at', 'updated_at'
        ]
        read_only_fields = ['institution', 'uploaded_by', 'created_at', 'updated_at']
