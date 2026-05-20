from django.contrib.auth.models import AbstractUser
from django.db import models

class Institution(models.Model):
    """Each college/school is one Institution — fully isolated"""
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)  # e.g. "MIT", "IIT-HYD"
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='users'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False, help_text="Admin must approve before login")

    # Portfolio/Profile Fields
    unique_id = models.CharField(max_length=50, blank=True, null=True) # e.g. STU1001, TEA2001
    bio = models.TextField(blank=True, help_text="Short bio or portfolio description")
    experience = models.TextField(blank=True, help_text="Work experience for teachers")
    year_of_study = models.PositiveIntegerField(null=True, blank=True) # 1, 2, 3, 4
    current_semester = models.PositiveIntegerField(null=True, blank=True, default=1) # 1-8
    program = models.ForeignKey(
        'curriculum.Program', 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='program_users'
    )

    def save(self, *args, **kwargs):
        if not self.unique_id:
            prefix = self.role[:3].upper() # ADM, TEA, STU
            # Very simple ID generation for now
            count = User.objects.count() + 1
            self.unique_id = f"{prefix}{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.unique_id}) - {self.role}"