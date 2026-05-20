import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from curriculum.models import Curriculum, Program, Course, Module, Topic, CourseAssignment, CourseEnrollment
from users.models import Institution, User
from django.contrib.auth.hashers import make_password

def clear_data():
    print("--- PURGING ALL SYSTEM DATA ---")
    # Delete in order of dependency
    CourseEnrollment.objects.all().delete()
    CourseAssignment.objects.all().delete()
    Topic.objects.all().delete()
    Module.objects.all().delete()
    Course.objects.all().delete()
    Program.objects.all().delete()
    Curriculum.objects.all().delete()
    User.objects.all().delete()
    Institution.objects.all().delete()
    print("Database cleared successfully.\n")

def seed_college(name, code, admin_prefix):
    # 1. Create Institution
    inst = Institution.objects.create(
        name=name,
        code=code,
        address=f"{name} Campus, Knowledge City"
    )
    print(f"College Created: {name}")

    # 2. Create Admin (Admin/Dean/HOD role)
    admin = User.objects.create(
        username=f"{admin_prefix}_admin",
        password=make_password('admin123'),
        email=f"admin@{code.lower()}.com",
        role='admin',
        institution=inst,
        is_approved=True,
        is_verified=True,
        first_name=f"{name} Admin",
        last_name="Superuser"
    )
    print(f"  Admin Created: {admin.username}")

    # 3. Create Curriculum (Degree)
    btech = Curriculum.objects.create(
        institution=inst,
        name="Bachelor of Technology",
        short_name="B.Tech",
        description="A 4-year undergraduate engineering degree program."
    )
    print(f"  Degree Created: B.Tech")

    # 4. Create Branches (Programs)
    branches = [
        ("CSE", "Computer Science & Engineering"),
        ("ECE", "Electronics & Communication Engineering"),
        ("IT", "Information Technology"),
        ("AIML", "Artificial Intelligence & Machine Learning")
    ]

    branch_map = {}
    for b_code, b_name in branches:
        branch = Program.objects.create(
            institution=inst,
            curriculum=btech,
            name=b_name,
            code=b_code,
            duration_years=4
        )
        branch_map[b_code] = branch
        print(f"    Branch Created: {b_code}")

    # 5. Create Teachers
    teacher_cse = User.objects.create(
        username=f"{admin_prefix}_teacher_cse",
        password=make_password('teacher123'),
        role='teacher',
        institution=inst,
        is_approved=True,
        is_verified=True,
        first_name="Dr. Alan",
        last_name="Turing",
        experience="15 years in Systems & AI"
    )
    
    teacher_multi = User.objects.create(
        username=f"{admin_prefix}_teacher_multi",
        password=make_password('teacher123'),
        role='teacher',
        institution=inst,
        is_approved=True,
        is_verified=True,
        first_name="Prof. Sarah",
        last_name="Cross",
        experience="10 years in Signal Processing & Math"
    )
    print(f"    Teachers Created: {teacher_cse.username}, {teacher_multi.username}")

    # 6. Create Courses (Subjects) for CSE (Sem 1 & 2)
    # Sem 1 CSE
    subjects_sem1_cse = [
        ("CS101", "C Programming", 4),
        ("MA101", "Engineering Mathematics-I", 4),
        ("EE101", "Basic Electrical Engineering", 3),
        ("EN101", "English for Communication", 2),
        ("CS101L", "C Programming Lab", 1),
    ]

    for c_code, c_name, c_cred in subjects_sem1_cse:
        course = Course.objects.create(
            program=branch_map["CSE"],
            name=c_name,
            code=f"{code}-{c_code}",
            credits=c_cred,
            semester=1
        )
        # Assign teacher
        if "CS" in c_code:
            CourseAssignment.objects.create(course=course, teacher=teacher_cse)
        else:
            CourseAssignment.objects.create(course=course, teacher=teacher_multi)

    # 7. Create Subjects for ECE (Sem 1) - To show multi-domain teacher
    subjects_sem1_ece = [
        ("EC101", "Electronic Circuits", 4),
        ("MA101", "Engineering Mathematics-I", 4), # Same math subject
    ]
    for c_code, c_name, c_cred in subjects_sem1_ece:
        course = Course.objects.create(
            program=branch_map["ECE"],
            name=c_name,
            code=f"{code}-{c_code}",
            credits=c_cred,
            semester=1
        )
        # Prof Sarah teaches math in both CSE and ECE
        if "MA" in c_code:
            CourseAssignment.objects.create(course=course, teacher=teacher_multi)
            print(f"      Teacher Assigned: {teacher_multi.username} assigned to {c_name} in ECE")

    # 8. Create Students
    # Student 1: CSE Sem 1
    student1 = User.objects.create(
        username=f"{admin_prefix}_student_cse_sem1",
        password=make_password('student123'),
        role='student',
        institution=inst,
        is_approved=True,
        is_verified=True,
        program=branch_map["CSE"],
        current_semester=1,
        first_name="James",
        last_name="Smith"
    )
    
    # Auto-enroll student in their semester courses
    for course in Course.objects.filter(program=branch_map["CSE"], semester=1):
        CourseEnrollment.objects.create(course=course, student=student1)
    
    print(f"    Student Created & Enrolled: {student1.username} in CSE Sem 1")

def run_seeder():
    clear_data()
    
    colleges = [
        ("Synycs Institute of Technology", "SIT", "sit"),
        ("Global Academy of Engineering", "GAE", "gae"),
        ("Elite Science University", "ESU", "esu")
    ]
    
    for name, code, prefix in colleges:
        seed_college(name, code, prefix)
        print("-" * 30)

    print("\n[SUCCESS] Institutional logic refactor and data seeding complete!")

if __name__ == "__main__":
    run_seeder()
