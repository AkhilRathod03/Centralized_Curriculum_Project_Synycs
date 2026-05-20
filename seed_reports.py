import os
import django
import random
from datetime import datetime, date, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Institution
from curriculum.models import Program, Course, Module, Topic, Assignment, Attendance, Submission

def seed_reports():
    print("Seeding Reports Data...")
    
    # Get an institution and some students/teachers
    institution = Institution.objects.first()
    if not institution:
        print("No institution found. Please run seed_ccms.py first.")
        return

    students = User.objects.filter(institution=institution, role='student')
    teachers = User.objects.filter(institution=institution, role='teacher')
    
    if not students.exists() or not teachers.exists():
        print("Need students and teachers to seed reports.")
        return

    # Get some courses
    courses = Course.objects.filter(program__institution=institution)
    if not courses.exists():
        print("No courses found.")
        return

    # 1. Seed Attendance
    print("Seeding Attendance...")
    today = date.today()
    for course in courses:
        course_students = students[:10] # Seed for first 10 students
        for day_offset in range(30): # Last 30 days
            d = today - timedelta(days=day_offset)
            for student in course_students:
                # 85% attendance rate
                status = 'present' if random.random() < 0.85 else 'absent'
                Attendance.objects.get_or_create(
                    course=course,
                    student=student,
                    date=d,
                    defaults={'status': status, 'marked_by': teachers.first()}
                )

    # 2. Seed Assignments & Submissions
    print("Seeding Submissions...")
    for course in courses:
        modules = course.modules.all()
        for module in modules:
            topics = module.topics.all()
            for topic in topics:
                # Create an assignment for each topic
                assignment, created = Assignment.objects.get_or_create(
                    topic=topic,
                    defaults={
                        'title': f"Assignment: {topic.name}",
                        'description': f"Complete the tasks for {topic.name}",
                        'due_date': timezone.now() + timedelta(days=7),
                        'max_marks': 100,
                        'created_by': teachers.first()
                    }
                )
                
                # Seed submissions for some students
                for student in students[:5]:
                    if random.random() < 0.7: # 70% submission rate
                        Submission.objects.get_or_create(
                            assignment=assignment,
                            student=student,
                            defaults={
                                'content': "This is a sample submission content.",
                                'marks_obtained': random.randint(60, 100),
                                'is_graded': True,
                                'submitted_at': timezone.now() - timedelta(days=random.randint(1, 5))
                            }
                        )

    print("Seeding Complete!")

if __name__ == "__main__":
    from django.utils import timezone
    seed_reports()
