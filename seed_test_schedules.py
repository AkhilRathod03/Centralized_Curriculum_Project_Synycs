import os
import django
import sys
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from curriculum.models import Course, Topic, AcademicSchedule, CourseEnrollment
from users.models import User

def seed_schedules():
    student = User.objects.filter(role='student').first()
    if not student:
        print("No student found.")
        return

    print(f"Seeding for student: {student.username}")
    
    # Get a course
    course = Course.objects.first()
    if not course:
        print("No course found.")
        return
        
    # Enroll student
    CourseEnrollment.objects.get_or_create(student=student, course=course)
    print(f"Enrolled in {course.name}")
    
    # Get a topic
    topic = Topic.objects.filter(module__course=course).first()
    if not topic:
        # Create a topic if none exists
        from curriculum.models import Module
        module, _ = Module.objects.get_or_create(course=course, name="Initial Module")
        topic, _ = Topic.objects.get_or_create(module=module, name="Introduction")
        
    # Create some schedules
    base_time = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    for i in range(3):
        start = base_time + timedelta(days=i)
        end = start + timedelta(hours=1, minutes=30)
        
        AcademicSchedule.objects.create(
            course=course,
            topic=topic,
            start_datetime=start,
            end_datetime=end,
            room=f"Hall {101+i}",
            notes="Regular class session"
        )
        print(f"Created schedule for {start}")

if __name__ == "__main__":
    seed_schedules()
