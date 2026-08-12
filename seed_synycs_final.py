import os
import django
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User
from curriculum.models import Curriculum, Program, Course, Module, Topic, StudyMaterial, CourseAssignment, CourseEnrollment
from files.models import FileResource

def seed_synycs_data():
    print("🚀 Seeding final Synycs University data structure...")

    # 1. Get Institution
    inst = Institution.objects.get(code="SYNYCS-U")
    
    # 2. Get Users
    admin_user = User.objects.get(username="admin_main")
    teacher_user = User.objects.get(username="teacher_1")
    student_user = User.objects.get(username="student_1")

    # 3. Create Curriculum
    curr, _ = Curriculum.objects.get_or_create(
        institution=inst,
        short_name="B.Tech",
        defaults={'name': 'Bachelor of Technology', 'description': '4-Year Engineering Program'}
    )

    # 4. Create Program
    program, _ = Program.objects.get_or_create(
        institution=inst,
        code="BTECH-CSE",
        defaults={
            'name': 'B.Tech Computer Science & Engineering',
            'curriculum': curr,
            'description': 'Advanced study in Computer Science and Engineering principles.',
            'created_by': admin_user
        }
    )

    # 5. Create Courses
    courses_data = [
        {
            "code": "CS101",
            "name": "Data Structures & Algorithms",
            "desc": "Foundational course on organizing and processing data efficiently.",
            "lessons": ["Introduction to Arrays", "Linked Lists Mastery", "Stack & Queue Logic", "Sorting Algorithms", "Binary Tree structures"]
        },
        {
            "code": "CS102",
            "name": "Full Stack Web Development",
            "desc": "End-to-end development using modern frameworks.",
            "lessons": ["HTML & CSS Fundamentals", "JavaScript Deep Dive", "React Framework Basics", "Node.js & Express APIs", "Database Integration (SQL/NoSQL)"]
        },
        {
            "code": "CS103",
            "name": "Operating Systems",
            "desc": "Core concepts of OS, process management, and memory.",
            "lessons": ["OS Architecture Overview", "Process Synchronization", "Memory Management Units", "File System Internals", "Deadlock Prevention"]
        }
    ]

    for c_info in courses_data:
        course, created = Course.objects.get_or_create(
            program=program,
            code=c_info['code'],
            defaults={
                'name': c_info['name'],
                'description': c_info['desc'],
                'semester': 1,
                'credits': 4
            }
        )

        # Assign Teacher & Student
        CourseAssignment.objects.get_or_create(course=course, teacher=teacher_user)
        CourseEnrollment.objects.get_or_create(course=course, student=student_user)

        # Create Lessons (Modules + Topics)
        for i, lesson_name in enumerate(c_info['lessons']):
            module, _ = Module.objects.get_or_create(
                course=course,
                name=f"Unit {i+1}: {lesson_name}",
                defaults={'order': i}
            )
            
            topic, _ = Topic.objects.get_or_create(
                module=module,
                name=lesson_name,
                defaults={'order': 0, 'description': f'Detailed study of {lesson_name}'}
            )

            # Add Study Material (Link)
            StudyMaterial.objects.get_or_create(
                topic=topic,
                title=f"Reference for {lesson_name}",
                material_type='link',
                defaults={'url': 'https://synycs.edu/library', 'uploaded_by': teacher_user}
            )

        # Add Course Resource (FileResource)
        FileResource.objects.get_or_create(
            institution=inst,
            course=course,
            title=f"{c_info['name']} Syllabus",
            defaults={
                'description': f'Official syllabus for {c_info['name']}',
                'resource_type': 'syllabus',
                'uploaded_by': admin_user
            }
        )

    print("✅ Success! Synycs University is fully populated.")
    print(f"Program: {program.name}")
    print(f"Total Courses: {len(courses_data)}")
    print(f"Lessons per Course: 5")
    print(f"Users Enrolled: student_1, teacher_1, admin_main")

if __name__ == "__main__":
    seed_synycs_data()
