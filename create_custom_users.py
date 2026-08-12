import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import Institution, User

def create_users():
    print("Updating institution to Synycs University...")

    # Ensure Synycs University exists
    inst, _ = Institution.objects.get_or_create(
        code="SYNYCS-U",
        defaults={'name': 'Synycs University'}
    )

    users_to_update = [
        {
            "username": "admin_main",
            "email": "admin_main@synycs.edu",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True
        },
        {
            "username": "teacher_1",
            "email": "teacher_1@synycs.edu",
            "role": "teacher",
            "is_staff": False,
            "is_superuser": False
        },
        {
            "username": "student_1",
            "email": "student_1@synycs.edu",
            "role": "student",
            "is_staff": False,
            "is_superuser": False
        }
    ]

    password = "password123"

    for u_data in users_to_update:
        user, created = User.objects.get_or_create(username=u_data['username'])
        
        # Explicitly update all fields
        user.email = u_data['email']
        user.role = u_data['role']
        user.institution = inst
        user.is_staff = u_data['is_staff']
        user.is_superuser = u_data['is_superuser']
        user.is_approved = True
        user.is_active = True
        
        user.set_password(password)
        user.save()
        
        status = "created" if created else "updated"
        print(f"User '{u_data['username']}' {status} and assigned to '{inst.name}'.")

    print("\nAll custom users are now under Synycs University!")

if __name__ == "__main__":
    create_users()
