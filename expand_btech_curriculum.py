import os
import django
from datetime import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Institution
from curriculum.models import Program, Course, Module, Topic, CourseAssignment, CourseEnrollment

def expand_curriculum():
    print("📚 Expanding BTECH CSE Curriculum (Semesters 1, 2, 3)...")

    # 1. Get Core Data
    inst = Institution.objects.get(code="SYNYCS-U")
    program = Program.objects.get(code="BTECH-CSE", institution=inst)
    teacher = User.objects.get(username="teacher_1")
    student = User.objects.get(username="student_1")

    # 2. Define Multi-Semester Curriculum
    semesters_data = {
        1: [
            {
                "code": "CS101-C",
                "name": "Programming in C",
                "lessons": ["C Fundamentals", "Control Structures", "Functions & Recursion", "Arrays & Pointers", "File Handling"]
            },
            {
                "code": "MA101",
                "name": "Engineering Mathematics-I",
                "lessons": ["Matrices & Determinants", "Calculus Basics", "Differential Equations", "Vector Algebra", "Complex Numbers"]
            }
        ],
        2: [
            {
                "code": "CS201",
                "name": "Data Structures & Algorithms",
                "lessons": ["Linear Data Structures", "Trees & Binary Search", "Heaps & Hashing", "Graph Algorithms", "Complexity Analysis"]
            },
            {
                "code": "CS202",
                "name": "Digital Logic Design",
                "lessons": ["Number Systems", "Boolean Algebra", "Combinational Circuits", "Sequential Circuits", "Memory Devices"]
            }
        ],
        3: [
            {
                "code": "CS301",
                "name": "Database Management Systems",
                "lessons": ["ER Modeling", "Relational Algebra", "SQL Mastery", "Normalization", "Transaction Control"]
            },
            {
                "code": "CS302",
                "name": "Computer Networks",
                "lessons": ["OSI & TCP/IP Layers", "Physical Layer Protocols", "Data Link Control", "Network Routing", "Transport Layer Security"]
            }
        ]
    }

    for sem, courses in semesters_data.items():
        print(f"--- Processing Semester {sem} ---")
        for c_info in courses:
            course, created = Course.objects.get_or_create(
                program=program,
                code=c_info['code'],
                defaults={
                    'name': c_info['name'],
                    'semester': sem,
                    'credits': 4,
                    'description': f'Core curriculum course for BTECH CSE Semester {sem}.'
                }
            )

            # Ensure student and teacher are linked
            CourseAssignment.objects.get_or_create(course=course, teacher=teacher)
            CourseEnrollment.objects.get_or_create(course=course, student=student)

            # Create Lessons (Units)
            for i, lesson_name in enumerate(c_info['lessons']):
                module, _ = Module.objects.get_or_create(
                    course=course,
                    name=f"Unit {i+1}: {lesson_name}",
                    defaults={'order': i}
                )
                
                Topic.objects.get_or_create(
                    module=module,
                    name=lesson_name,
                    defaults={'order': 0, 'description': f'Detailed coverage of {lesson_name}'}
                )
            
            status = "Created" if created else "Updated"
            print(f"[{status}] {c_info['code']}: {c_info['name']}")

    print("\n✅ Success! BTECH CSE now has a full 3-semester roadmap.")
    print("Student student_1 can now see their past, present, and future courses.")

if __name__ == "__main__":
    expand_curriculum()
