import os
import django
from datetime import datetime, timedelta
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from curriculum.models import Course, Topic, Assignment, Submission, Attendance

def seed_student_content():
    print("📈 Generating student engagement content for student_1...")

    # 1. Get Users
    student = User.objects.get(username="student_1")
    teacher = User.objects.get(username="teacher_1")
    
    # 2. Get Courses
    courses = Course.objects.filter(program__code="BTECH-CSE")

    for course in courses:
        print(f"Processing Course: {course.name}")
        
        # A. Add Attendance (Last 7 days)
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).date()
            status = random.choice(['present', 'present', 'present', 'late']) # Mostly present
            Attendance.objects.get_or_create(
                course=course,
                student=student,
                date=date,
                defaults={
                    'status': status,
                    'marked_by': teacher,
                    'remarks': 'Regular class attendance'
                }
            )

        # B. Add Assignments & Submissions
        topics = Topic.objects.filter(module__course=course)
        
        # Create an assignment for the first topic
        if topics.exists():
            first_topic = topics[0]
            assignment, _ = Assignment.objects.get_or_create(
                topic=first_topic,
                title=f"{course.code} - Major Assignment 1",
                defaults={
                    'description': f'Implementation of core concepts learned in {first_topic.name}.',
                    'due_date': datetime.now() + timedelta(days=5),
                    'max_marks': 100,
                    'created_by': teacher
                }
            )

            # Create a submission for the student
            Submission.objects.get_or_create(
                assignment=assignment,
                student=student,
                defaults={
                    'content': f'Attached is my submission for {assignment.title}. I have implemented the requirements as discussed in class.',
                    'is_graded': True,
                    'marks_obtained': random.randint(85, 98),
                    'feedback': 'Excellent work! Your logic is sound and code is well-structured.'
                }
            )

            # C. Mark first 2 topics as completed to show progress
            for i in range(min(2, topics.count())):
                t = topics[i]
                t.is_completed = True
                t.completed_at = datetime.now() - timedelta(days=2)
                t.completed_by = teacher
                t.save()

    print("\n✅ Success! student_1 now has attendance, assignments, and progress records.")
    print("Dashboard Analytics Updated: Progress, Attendance %, and Grades are now visible.")

if __name__ == "__main__":
    seed_student_content()
