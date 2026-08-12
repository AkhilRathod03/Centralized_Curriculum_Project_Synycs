import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from curriculum.models import Course, CourseEnrollment, Program

def add_students():
    teacher = User.objects.get(username='teacher_1')
    inst = teacher.institution
    cse = Program.objects.get(code='CSE', institution=inst)
    courses = Course.objects.filter(program=cse)
    
    students_data = [
        ('student_alice', 'alice@synycs.edu'),
        ('student_bob', 'bob@synycs.edu'),
        ('student_charlie', 'charlie@synycs.edu')
    ]
    
    for username, email in students_data:
        u, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': 'student',
                'institution': inst,
                'program': cse,
                'current_semester': 1,
                'is_approved': True
            }
        )
        u.set_password('password123')
        u.save()
        
        for c in courses:
            CourseEnrollment.objects.get_or_create(course=c, student=u)
            
        print(f"{'Created' if created else 'Updated'} and Enrolled: {username}")

if __name__ == "__main__":
    add_students()
