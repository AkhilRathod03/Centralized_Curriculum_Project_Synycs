import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from curriculum.models import Course, Topic, Module, AcademicSchedule, CourseAssignment

def seed():
    teacher = User.objects.filter(role='teacher').first()
    if not teacher:
        print("No teacher found.")
        return

    print(f"Seeding schedules for teacher: {teacher.username}")
    
    # Get courses assigned to this teacher
    assignments = CourseAssignment.objects.filter(teacher=teacher)
    if not assignments.exists():
        print("Teacher has no courses assigned.")
        return
        
    for assignment in assignments:
        course = assignment.course
        print(f"Processing course: {course.name}")
        
        # Get or create a module and topic
        module, _ = Module.objects.get_or_create(course=course, name="Core Fundamentals")
        topic, _ = Topic.objects.get_or_create(module=module, name="Introduction to Course")
        
        # Create 3 schedules for this week
        base_time = timezone.now().replace(hour=9, minute=0, second=0, microsecond=0)
        for i in range(3):
            start = base_time + timedelta(days=i)
            end = start + timedelta(hours=1, minutes=30)
            
            AcademicSchedule.objects.get_or_create(
                course=course,
                topic=topic,
                start_datetime=start,
                end_datetime=end,
                defaults={
                    'room': f"Room {100 + i}",
                    'notes': "Seeded for testing export"
                }
            )
            print(f"  Created schedule for {start}")

    print("Success! Teacher schedules seeded.")

if __name__ == "__main__":
    seed()
