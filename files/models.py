from django.db import models
from users.models import Institution, User
from curriculum.models import Course, Program

class FileResource(models.Model):
    RESOURCE_TYPES = [
        ('syllabus', 'Syllabus'),
        ('handout', 'Handout'),
        ('reference', 'Reference Book'),
        ('assignment_template', 'Assignment Template'),
        ('other', 'Other'),
    ]
    
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='file_resources')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='file_resources')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True, related_name='file_resources')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='resources/')
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES, default='other')
    
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_resources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
