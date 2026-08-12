import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User, Institution
from curriculum.models import Program, Course, CourseEnrollment, CourseAssignment

def fix_student_data():
    print("🛠️ Fixing Student/Course Data Synchronization...")
    
    try:
        # 1. Target Institution: Synycs University
        target_inst = Institution.objects.get(code="SYNYCS-U")
        
        # 2. Target Program: B.Tech Computer Science & Engineering
        # (Make sure we get the one in SYNYCS-U)
        target_program = Program.objects.filter(code="BTECH-CSE", institution=target_inst).first()
        
        if not target_program:
            print("❌ Target program BTECH-CSE not found in SYNYCS-U")
            return

        # 3. Fix student_1
        student = User.objects.get(username="student_1")
        student.institution = target_inst
        student.program = target_program
        student.current_semester = 1
        student.save()
        print(f"✅ student_1 synced to {target_inst.name} | {target_program.name}")

        # 4. Fix teacher_1
        teacher = User.objects.get(username="teacher_1")
        teacher.institution = target_inst
        teacher.save()
        print(f"✅ teacher_1 synced to {target_inst.name}")

        # 5. Move ALL courses student is enrolled in to the target program/institution
        enrolled_courses = Course.objects.filter(students=student)
        print(f"📦 Moving {enrolled_courses.count()} enrolled courses to {target_inst.code}...")
        
        for course in enrolled_courses:
            if course.program.institution != target_inst:
                print(f"  -> Relocating {course.code}: {course.name} from {course.program.institution.code} to {target_inst.code}")
                # We move the course to the target program to satisfy InstitutionMixin
                course.program = target_program
                course.save()
                
            # Ensure teacher is assigned to all these courses
            CourseAssignment.objects.get_or_create(course=course, teacher=teacher)

        print("\n🚀 Data Sync Complete! All courses are now in the same institution as the student.")

    except Exception as e:
        print(f"❌ Error during fix: {e}")

if __name__ == "__main__":
    fix_student_data()
