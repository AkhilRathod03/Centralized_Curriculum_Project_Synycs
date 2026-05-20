import os
import django
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User

def seed_complete_data():
    print("Seeding 30 Institutions with Admins, Teachers, and Students...")
    
    colleges = [
        ("IITB", "Indian Institute of Technology, Bombay"),
        ("IITD", "Indian Institute of Technology, Delhi"),
        ("IITM", "Indian Institute of Technology, Madras"),
        ("BITS", "Birla Institute of Technology and Science, Pilani"),
        ("NITW", "National Institute of Technology, Warangal"),
        ("NITK", "National Institute of Technology, Surathkal"),
        ("IIITH", "International Institute of Information Technology, Hyderabad"),
        ("SRM", "SRM Institute of Science and Technology"),
        ("VIT", "Vellore Institute of Technology"),
        ("COEP", "College of Engineering, Pune"),
        ("JNTU", "Jawaharlal Nehru Technological University"),
        ("OU", "Osmania University"),
        ("AU", "Andhra University"),
        ("MIT", "Manipal Institute of Technology"),
        ("RVCE", "RV College of Engineering"),
        ("BMS", "BMS College of Engineering"),
        ("PSG", "PSG College of Technology"),
        ("SSN", "SSN College of Engineering"),
        ("VJTI", "Veermata Jijabai Technological Institute"),
        ("DTU", "Delhi Technological University"),
        ("NSUT", "Netaji Subhas University of Technology"),
        ("PEC", "Punjab Engineering College"),
        ("TIET", "Thapar Institute of Engineering and Technology"),
        ("AMITY", "Amity University"),
        ("LPU", "Lovely Professional University"),
        ("CU", "Chandigarh University"),
        ("SASTRA", "SASTRA Deemed University"),
        ("KLE", "KLE Technological University"),
        ("PES", "PES University"),
        ("MSRIT", "Ramaiah Institute of Technology")
    ]

    first_names = ["Arjun", "Aditi", "Rohan", "Sanya", "Vikram", "Neha", "Rahul", "Priya", "Amit", "Anjali", "Karan", "Ishita"]
    last_names = ["Sharma", "Verma", "Gupta", "Malhotra", "Reddy", "Iyer", "Nair", "Patel", "Singh", "Yadav"]

    for code, name in colleges:
        inst, _ = Institution.objects.get_or_create(
            code=code,
            defaults={'name': name}
        )
        print(f"Processing: {name}")

        # 1. Ensure Admin exists
        admin_user, _ = User.objects.get_or_create(
            username=f"admin_{code.lower()}",
            defaults={
                'email': f"admin@{code.lower()}.edu",
                'role': 'admin',
                'institution': inst,
                'is_staff': True,
                'is_approved': True
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        # 2. Create 3-5 Teachers for each college
        for i in range(random.randint(3, 5)):
            f_name = random.choice(first_names)
            l_name = random.choice(last_names)
            username = f"teacher_{code.lower()}_{i+1}"
            teacher, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': f_name,
                    'last_name': l_name,
                    'email': f"{username}@{code.lower()}.edu",
                    'role': 'teacher',
                    'institution': inst,
                    'is_approved': True
                }
            )
            if created:
                teacher.set_password('teacher123')
                # Set random last login within last 7 days
                teacher.last_login = datetime.now() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
                teacher.save()

        # 3. Create 10-15 Students for each college
        for i in range(random.randint(10, 15)):
            f_name = random.choice(first_names)
            l_name = random.choice(last_names)
            username = f"student_{code.lower()}_{i+1}"
            student, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': f_name,
                    'last_name': l_name,
                    'email': f"{username}@{code.lower()}.edu",
                    'role': 'student',
                    'institution': inst,
                    'is_approved': True
                }
            )
            if created:
                student.set_password('student123')
                # Set random last login within last 15 days
                student.last_login = datetime.now() - timedelta(days=random.randint(0, 15), hours=random.randint(0, 23))
                student.save()

    print("\nSuccess! Seeded 30 colleges with full user sets.")

if __name__ == "__main__":
    seed_complete_data()
