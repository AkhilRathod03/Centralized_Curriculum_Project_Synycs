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

    def __str__(self):
        return f"{self.username} ({self.role}) - {self.institution}"