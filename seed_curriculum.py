import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from curriculum.models import Curriculum, Program, Course
from users.models import Institution, User

def seed_data():
    try:
        # 1. Get Synycs University
        inst = Institution.objects.get(id=2)
        print(f"Seeding data for: {inst.name}")

        # 2. Create Degrees (Curriculum)
        btech, _ = Curriculum.objects.get_or_create(
            institution=inst,
            short_name="B.Tech",
            defaults={"name": "Bachelor of Technology", "description": "Undergraduate engineering degree."}
        )
        print("Created Degree: B.Tech")

        mtech, _ = Curriculum.objects.get_or_create(
            institution=inst,
            short_name="M.Tech",
            defaults={"name": "Master of Technology", "description": "Postgraduate engineering degree."}
        )
        print("Created Degree: M.Tech")

        # 3. Create Branches (Programs)
        branches = [
            ("CSE", "Computer Science & Engineering"),
            ("ECE", "Electronics & Communication Engineering"),
            ("IT", "Information Technology"),
            ("AIML", "Artificial Intelligence & Machine Learning")
        ]

        branch_objects = {}
        for code, name in branches:
            branch, _ = Program.objects.get_or_create(
                institution=inst,
                curriculum=btech,
                code=code,
                defaults={"name": name, "duration_years": 4}
            )
            branch_objects[code] = branch
            print(f"Created Branch: {name} ({code})")

        # 4. Create Courses for CSE
        cse = branch_objects["CSE"]
        
        # Semester 1
        sem1_courses = [
            ("CS101", "C Programming", 4),
            ("MA101", "Mathematics-I", 4),
            ("EE101", "Basic Electrical Engineering (BEE)", 3),
            ("EN101", "English for Communication", 2),
            ("CS101L", "C Programming Lab", 1),
            ("EE101L", "BEE Lab", 1),
        ]

        for code, name, credits in sem1_courses:
            Course.objects.get_or_create(
                program=cse,
                code=code,
                semester=1,
                defaults={"name": name, "credits": credits}
            )
        print("Added Semester 1 courses for CSE")

        # Semester 2
        sem2_courses = [
            ("MA102", "Mathematics-II", 4),
            ("PH101", "Engineering Physics", 4),
            ("CS102", "Python Programming", 3),
            ("CS103", "Data Structures", 4),
            ("PH101L", "Physics Lab", 1),
            ("CS102L", "Python Lab", 1),
        ]

        for code, name, credits in sem2_courses:
            Course.objects.get_or_create(
                program=cse,
                code=code,
                semester=2,
                defaults={"name": name, "credits": credits}
            )
        print("Added Semester 2 courses for CSE")

        print("Data seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding data: {e}")

if __name__ == "__main__":
    seed_data()
