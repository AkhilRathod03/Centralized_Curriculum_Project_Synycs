from rest_framework import generics, permissions, filters
from rest_framework.parsers import MultiPartParser, FormParser
from .models import FileResource
from .serializers import FileResourceSerializer
from curriculum.permissions import IsAdminOrTeacher, IsSameInstitution
from audit.utils import log_action

class InstitutionMixin:
    def get_institution(self):
        return self.request.user.institution

class FileResourceListCreateView(InstitutionMixin, generics.ListCreateAPIView):
    serializer_class = FileResourceSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'resource_type']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        qs = FileResource.objects.filter(institution=self.get_institution())
        
        # Optional filters
        course_id = self.request.query_params.get('course')
        program_id = self.request.query_params.get('program')
        resource_type = self.request.query_params.get('resource_type')
        
        if course_id:
            qs = qs.filter(course_id=course_id)
        if program_id:
            qs = qs.filter(program_id=program_id)
        if resource_type:
            qs = qs.filter(resource_type=resource_type)
            
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        resource = serializer.save(
            institution=self.get_institution(),
            uploaded_by=self.request.user
        )
        log_action(self.request.user, 'UPLOAD', 'FileResource', resource.id,
                   {'title': resource.title}, self.request)

class FileResourceDetailView(InstitutionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FileResourceSerializer
    
    def get_queryset(self):
        return FileResource.objects.filter(institution=self.get_institution())

    def get_permissions(self):
        # Allow any Teacher/Admin in the same institution to manage resources
        # This matches the user request: "even the teacher has to get the access to delete or add or update"
        return [IsAdminOrTeacher(), IsSameInstitution()]

    def perform_update(self, serializer):
        resource = serializer.save()
        log_action(self.request.user, 'UPDATE', 'FileResource', resource.id,
                   {'title': resource.title}, self.request)

    def perform_destroy(self, instance):
        log_action(self.request.user, 'DELETE', 'FileResource', instance.id,
                   {'title': instance.title}, self.request)
        instance.delete()
