from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Only admins can do this"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrTeacher(BasePermission):
    """Admins and teachers can do this"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'teacher']


class IsSameInstitution(BasePermission):
    """
    Users can only access data from their own institution.
    This is what makes multi-tenancy work!
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        user_inst = request.user.institution_id
        if not user_inst:
            return False

        # Handle different model structures
        if hasattr(obj, 'institution_id'):
            return obj.institution_id == user_inst

        # Walk up the hierarchy
        target_obj = obj
        if hasattr(target_obj, 'topic'):
            target_obj = target_obj.topic
        if hasattr(target_obj, 'module'):
            target_obj = target_obj.module
        if hasattr(target_obj, 'course'):
            target_obj = target_obj.course
        if hasattr(target_obj, 'program'):
            target_obj = target_obj.program

        if hasattr(target_obj, 'institution_id'):
            return target_obj.institution_id == user_inst

        return False


class IsAdminOrCourseTeacher(BasePermission):
    """
    Admins can manage anything in their institution.
    Teachers can manage only if they are assigned to the course.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False

        if request.user.role == 'admin':
            return True

        if request.user.role == 'teacher':
            # Find the course linked to the object
            course = None
            if hasattr(obj, 'course'):
                course = obj.course
            elif hasattr(obj, 'topic'):
                course = obj.topic.module.course
            elif hasattr(obj, 'module'):
                course = obj.module.course
            elif isinstance(obj, __import__('curriculum.models', fromlist=['Course']).Course):
                course = obj

            if course:
                return course.teachers.filter(id=request.user.id).exists()

            # If no course is linked (e.g. general program/inst resource), 
            # allow if they are the uploader
            if hasattr(obj, 'uploaded_by'):
                return obj.uploaded_by == request.user

        return False