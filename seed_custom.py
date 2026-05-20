import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User
from curriculum.models import Curriculum, Program, Course, Module, Topic, CourseAssignment

def seed_custom():
    print("Initializing Custom Minimal Seed with Curriculum...")

    # 1. Create Institution
    inst, _ = Institution.objects.get_or_create(
        code="SYNYCS-PRO",
        defaults={'name': 'Synycs Academy of Technology'}
    )

    # Helper to create user
    def create_user(username, email, role, is_admin=False):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': role,
                'institution': inst,
                'is_approved': True,
                'is_staff': is_admin,
                'is_superuser': is_admin
            }
        )
        user.set_password('password123')
        user.is_approved = True
        user.save()
        return user

    # 2. Create Users
    admin_user = create_user("admin_main", "admin@synycs.edu", "admin", is_admin=True)
    
    teachers = []
    for i in range(1, 5):
        teachers.append(create_user(f"teacher_{i}", f"teacher{i}@synycs.edu", "teacher"))
    
    teacher_1 = teachers[0] # The one the user is logging in as

    # 3. Create B.Tech Curriculum
    btech, _ = Curriculum.objects.get_or_create(
        institution=inst,
        short_name="B.Tech",
        defaults={'name': 'Bachelor of Technology'}
    )

    # 4. Create Program (CSE)
    cse_program, _ = Program.objects.get_or_create(
        institution=inst,
        curriculum=btech,
        code="CSE",
        defaults={
            'name': 'Computer Science & Engineering',
            'duration_years': 4,
            'created_by': admin_user
        }
    )

    # 5. Create Students (Enrolled in CSE)
    students = []
    for i in range(1, 4):
        student = create_user(f"student_{i}", f"student{i}@synycs.edu", "student")
        student.program = cse_program
        student.current_semester = 1
        student.save()
        students.append(student)

    # 5. Create 4 Courses (one for each semester 1-4)
    courses_data = [
        {
            "name": "Introduction to Programming",
            "code": "CS101",
            "semester": 1,
            "modules": [
                {"name": "Unit 1: Syntax & Logic", "topics": ["Variables", "Loops", "Conditions"]},
                {"name": "Unit 2: Functions", "topics": ["Parameters", "Return Values"]}
            ]
        },
        {
            "name": "Data Structures",
            "code": "CS201",
            "semester": 2,
            "modules": [
                {"name": "Unit 1: Linear Structures", "topics": ["Arrays", "Linked Lists", "Stacks"]},
                {"name": "Unit 2: Trees", "topics": ["Binary Trees", "BST"]}
            ]
        },
        {
            "name": "Database Management",
            "code": "CS301",
            "semester": 3,
            "modules": [
                {"name": "Unit 1: SQL Basics", "topics": ["SELECT", "FROM", "WHERE"]},
                {"name": "Unit 2: Normalization", "topics": ["1NF", "2NF", "3NF"]}
            ]
        },
        {
            "name": "Operating Systems",
            "code": "CS401",
            "semester": 4,
            "modules": [
                {"name": "Unit 1: Process Management", "topics": ["Scheduling", "Threads"]},
                {"name": "Unit 2: Memory", "topics": ["Paging", "Segmentation"]}
            ]
        }
    ]

    for c_idx, c_info in enumerate(courses_data):
        course, _ = Course.objects.get_or_create(
            program=cse_program,
            code=c_info['code'],
            defaults={
                'name': c_info['name'],
                'semester': c_info['semester'],
                'credits': 4
            }
        )

        # Assign course to teacher_1
        CourseAssignment.objects.get_or_create(course=course, teacher=teacher_1)

        for m_idx, m_info in enumerate(c_info['modules']):
            module, _ = Module.objects.get_or_create(
                course=course,
                name=m_info['name'],
                defaults={'order': m_idx}
            )

            for t_idx, t_name in enumerate(m_info['topics']):
                Topic.objects.get_or_create(
                    module=module,
                    name=t_name,
                    defaults={'order': t_idx}
                )

    print("\nSuccess! Custom data set with B.Tech Curriculum created.")
    print("-" * 40)
    print("CURRICULUM ADDED & ASSIGNED:")
    print(f"  - Degree: B.Tech")
    print(f"  - Program: CSE")
    print(f"  - Courses: 4 (All assigned to teacher_1)")
    print("-" * 40)
    print("LOGIN CREDENTIALS (All passwords: password123)")
    print("-" * 40)
    print(f"ADMIN (1): admin_main")
    print(f"TEACHERS (4): teacher_1 to teacher_4")
    print(f"STUDENTS (3): student_1 to student_3")
    print("-" * 40)

if __name__ == "__main__":
    seed_custom()
