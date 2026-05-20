import os
import django
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User
from curriculum.models import Program, Course, Module, Topic, CourseAssignment, CourseEnrollment

def seed_data():
    print("Seeding CCMS Pro with dummy data...")

    # 1. Create Institution
    inst, _ = Institution.objects.get_or_create(
        code="SCET",
        defaults={'name': 'Siddharth College of Engineering & Technology'}
    )

    # 2. Create Users (Roles)
    # Admin
    admin_user, _ = User.objects.get_or_create(
        username="admin_akhil",
        defaults={
            'email': 'admin@scet.edu',
            'role': 'admin',
            'institution': inst,
            'is_staff': True,
            'is_superuser': True,
            'is_approved': True
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()

    # Teacher
    teacher_user, _ = User.objects.get_or_create(
        username="teacher_kumar",
        defaults={
            'email': 'teacher@scet.edu',
            'role': 'teacher',
            'institution': inst,
            'is_approved': True
        }
    )
    teacher_user.set_password('teacher123')
    teacher_user.save()

    # Student
    student_user, _ = User.objects.get_or_create(
        username="student_rao",
        defaults={
            'email': 'student@scet.edu',
            'role': 'student',
            'institution': inst,
            'is_approved': True
        }
    )
    student_user.set_password('student123')
    student_user.save()

    # 3. Create Program
    program, _ = Program.objects.get_or_create(
        code="BTECH-CSE",
        institution=inst,
        defaults={
            'name': 'B.Tech Computer Science & Engineering',
            'description': '4-Year Undergraduate Program in CSE',
            'created_by': admin_user
        }
    )

    # 4. Create Course
    course, _ = Course.objects.get_or_create(
        code="CS301",
        program=program,
        defaults={
            'name': 'Data Structures & Algorithms',
            'description': 'Core computer science course focusing on efficient data handling.',
            'semester': 3,
            'credits': 4
        }
    )

    # Assign teacher & student to course
    CourseAssignment.objects.get_or_create(course=course, teacher=teacher_user)
    CourseEnrollment.objects.get_or_create(course=course, student=student_user)

    # 5. Create Modules & Topics
    # ... rest of the logic ...
    modules_data = [
        {
            "name": "Module 1: Introduction to Data Structures",
            "topics": ["Basics of Arrays", "Stack & Queue Implementation", "Linked Lists"]
        },
        {
            "name": "Module 2: Sorting and Searching",
            "topics": ["Bubble & Merge Sort", "Quick Sort", "Binary Search Trees"]
        },
        {
            "name": "Module 3: Graph Theory",
            "topics": ["BFS & DFS", "Shortest Path Algorithms", "Minimum Spanning Tree"]
        }
    ]

    for i, m_info in enumerate(modules_data):
        module, _ = Module.objects.get_or_create(
            course=course,
            name=m_info['name'],
            defaults={'order': i}
        )
        
        for j, t_name in enumerate(m_info['topics']):
            # Randomly mark some as completed for demo
            is_done = random.choice([True, False])
            Topic.objects.get_or_create(
                module=module,
                name=t_name,
                defaults={
                    'order': j,
                    'is_completed': is_done,
                    'completed_at': datetime.now() if is_done else None,
                    'completed_by': teacher_user if is_done else None
                }
            )

    print("Success! Dummy data created.")
    print(f"Login as Student: student_rao / student123")
    print(f"Login as Teacher: teacher_kumar / teacher123")
    print(f"Login as Admin: admin_akhil / admin123")

if __name__ == "__main__":
    seed_data()
