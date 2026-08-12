import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from curriculum.models import StudyMaterial, Course, Topic

def seed_resources():
    print("🚀 Seeding Related Resources for student_1's courses...")
    
    try:
        teacher = User.objects.get(username="teacher_1")
    except User.DoesNotExist:
        print("Teacher teacher_1 not found.")
        return

    # Define resource data for empty courses
    course_resources = {
        "CS101-C": [
            ("C Programming Guide PDF", "pdf", "https://example.com/c-guide.pdf"),
            ("Control Structures Video", "video", "https://www.youtube.com/watch?v=example1"),
            ("Functions & Recursion Tutorial", "link", "https://tutorial.com/functions")
        ],
        "MA101": [
            ("Matrices & Determinants Notes", "pdf", "https://example.com/math1.pdf"),
            ("Calculus Basics Video", "video", "https://www.youtube.com/watch?v=example2")
        ],
        "CS201": [
            ("Advanced Data Structures PDF", "pdf", "https://example.com/dsa-adv.pdf"),
            ("Graph Algorithms Masterclass", "video", "https://www.youtube.com/watch?v=example3"),
            ("Complexity Analysis Sheet", "link", "https://cheatsheet.com/complexity")
        ],
        "CS301": [
            ("SQL Mastery Handouts", "pdf", "https://example.com/sql-master.pdf"),
            ("Database Normalization Video", "video", "https://www.youtube.com/watch?v=example4"),
            ("ER Modeling Interactive Tool", "link", "https://draw.io/sql")
        ],
        "CS302": [
            ("OSI Model Explained PDF", "pdf", "https://example.com/osi.pdf"),
            ("TCP/IP Protocols Overview", "video", "https://www.youtube.com/watch?v=example5")
        ]
    }

    for code, resources in course_resources.items():
        try:
            # Get the student to find the specific course they are enrolled in
            student = User.objects.get(username="student_1")
            course = Course.objects.filter(code=code, students=student).first()
            
            if not course:
                print(f"  ⚠️ Course {code} not found for student_1. Skipping.")
                continue

            print(f"\nProcessing Course: {course.name} ({code})")
            
            # Get all topics for this course
            topics = Topic.objects.filter(module__course=course)
            if not topics.exists():
                print(f"  ⚠️ No topics found for {code}. Skipping.")
                continue
                
            # Distribute resources among topics
            for i, (title, r_type, url) in enumerate(resources):
                # Pick a topic (round-robin)
                topic = topics[i % topics.count()]
                
                mat, created = StudyMaterial.objects.get_or_create(
                    topic=topic,
                    title=title,
                    defaults={
                        'material_type': r_type,
                        'url': url,
                        'uploaded_by': teacher
                    }
                )
                
                status = "Created" if created else "Already Exists"
                print(f"  - [{status}] {title} -> Topic: {topic.name}")
                
        except Course.DoesNotExist:
            print(f"  ❌ Course {code} not found.")

    print("\n✅ Success! Related resources added for student_1.")

if __name__ == "__main__":
    seed_resources()
