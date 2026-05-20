import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User
from curriculum.models import Curriculum, Program, Course, CourseEnrollment

def seed_test_students():
    print("Seeding 4 test students and enrolling them...")

    # 1. Get Institution
    inst = Institution.objects.get(code="SYNYCS-PRO")

    # 2. Get CSE Program
    cse_program = Program.objects.get(code="CSE", institution=inst)

    # 3. Get Semester 1 Course (Introduction to Programming)
    course = Course.objects.get(code="CS101", program=cse_program)

    # 4. Create 4 Students
    student_names = [
        ("alex_johnson", "alex@example.com", "Alex Johnson"),
        ("sarah_smith", "sarah@example.com", "Sarah Smith"),
        ("mike_ross", "mike@example.com", "Mike Ross"),
        ("rachel_zane", "rachel@example.com", "Rachel Zane"),
    ]

    for username, email, full_name in student_names:
        first_name, last_name = full_name.split(' ', 1)
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'student',
                'institution': inst,
                'is_approved': True,
                'program': cse_program,
                'current_semester': 1
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created student: {username}")
        else:
            print(f"Student {username} already exists")

        # Enroll in course
        enrollment, created = CourseEnrollment.objects.get_or_create(
            course=course,
            student=user
        )
        if created:
            print(f"Enrolled {username} in {course.name}")
        else:
            print(f"Student {username} already enrolled in {course.name}")

    print("\nSuccess! 4 students seeded and enrolled in CS101.")

if __name__ == "__main__":
    seed_test_students()
