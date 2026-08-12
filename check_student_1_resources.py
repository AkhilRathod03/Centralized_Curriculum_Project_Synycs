import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from curriculum.models import StudyMaterial, CourseEnrollment, Topic

def check_student_materials(username):
    try:
        student = User.objects.get(username=username)
        print(f"Student: {student.username} (Role: {student.role})")
        
        enrollments = CourseEnrollment.objects.filter(student=student)
        print(f"Enrolled in {enrollments.count()} courses.")
        
        for enrollment in enrollments:
            course = enrollment.course
            print(f"\nCourse: {course.name} ({course.code})")
            
            topics = Topic.objects.filter(module__course=course)
            materials = StudyMaterial.objects.filter(topic__in=topics)
            
            print(f"  Related Resources: {materials.count()}")
            for mat in materials:
                print(f"    - [{mat.material_type.upper()}] {mat.title} (Topic: {mat.topic.name})")
                
    except User.DoesNotExist:
        print(f"User {username} not found.")

if __name__ == "__main__":
    check_student_materials("student_1")
