import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Institution
from curriculum.models import Program, Course, Module, Topic, CourseAssignment, CourseEnrollment, StudyMaterial

def sync_student_teacher_courses():
    print("🔄 Syncing student_1's courses with teacher_1 and adding Python...")
    
    try:
        inst = Institution.objects.get(code="SYNYCS-U")
        program = Program.objects.get(code="BTECH-CSE", institution=inst)
        teacher = User.objects.get(username="teacher_1")
        student = User.objects.get(username="student_1")
    except Exception as e:
        print(f"Error fetching base data: {e}")
        return

    # 1. Create Python Course if it doesn't exist
    python_course, created = Course.objects.get_or_create(
        program=program,
        code="CS104-PY",
        defaults={
            'name': 'Python Programming',
            'semester': 1,
            'credits': 4,
            'description': 'Comprehensive guide to Python Programming for CSE students.'
        }
    )
    if created:
        print(f"✅ Created new course: {python_course.name}")
    
    # 2. Sync all of teacher_1's courses to student_1
    t1_assignments = CourseAssignment.objects.filter(teacher=teacher)
    for ca in t1_assignments:
        course = ca.course
        _, enrolled = CourseEnrollment.objects.get_or_create(course=course, student=student)
        if enrolled:
            print(f"➕ Enrolled student_1 in teacher's course: {course.name} ({course.code})")

    # Also ensure student is in the new Python course
    CourseAssignment.objects.get_or_create(course=python_course, teacher=teacher)
    _, enrolled = CourseEnrollment.objects.get_or_create(course=python_course, student=student)
    if enrolled:
        print(f"➕ Enrolled student_1 in Python course.")

    # 3. Add modules/topics for Python if missing
    if not Module.objects.filter(course=python_course).exists():
        modules_data = [
            ("Basics & Syntax", ["Variables & Types", "Control Flow"]),
            ("Data Structures", ["Lists & Tuples", "Dictionaries & Sets"]),
            ("Functional Programming", ["Functions", "Modules & Packages"]),
            ("Object Oriented Python", ["Classes & Objects", "Inheritance"]),
        ]
        
        for i, (m_name, topics) in enumerate(modules_data):
            module = Module.objects.create(course=python_course, name=m_name, order=i)
            for j, t_name in enumerate(topics):
                Topic.objects.create(module=module, name=t_name, order=j)
        print("✅ Added Modules and Topics for Python Programming.")

    # 4. Add resources for Python Programming
    python_topics = Topic.objects.filter(module__course=python_course)
    resources = [
        ("Python for Beginners PDF", "pdf", "https://example.com/python-basics.pdf"),
        ("Advanced Python Patterns", "video", "https://youtube.com/python-adv"),
        ("Official Python Docs", "link", "https://docs.python.org/3/")
    ]
    
    for i, (title, r_type, url) in enumerate(resources):
        topic = python_topics[i % python_topics.count()]
        StudyMaterial.objects.get_or_create(
            topic=topic,
            title=title,
            defaults={
                'material_type': r_type,
                'url': url,
                'uploaded_by': teacher
            }
        )
    print("✅ Added Related Resources for Python Programming.")

    print("\n🚀 Final Sync Complete! student_1 now has all teacher subjects including Python.")

if __name__ == "__main__":
    sync_student_teacher_courses()
