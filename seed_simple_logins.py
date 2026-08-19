"""Seeds the three simple demo logins: admin/admin, teacher/teacher, student/student.

They mirror the existing `admin_main`, `teacher_1` and `student_1` accounts so the
portals show populated data: same institution, same program, and the teacher/student
get the same course assignments and enrollments.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from curriculum.models import CourseAssignment, CourseEnrollment, Program
from users.models import Institution, User

ACCOUNTS = [
    {
        'username': 'admin',
        'password': 'admin',
        'email': 'admin@synycs.edu',
        'role': 'admin',
        'template': 'admin_main',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'username': 'teacher',
        'password': 'teacher',
        'email': 'teacher@synycs.edu',
        'role': 'teacher',
        'template': 'teacher_1',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'student',
        'password': 'student',
        'email': 'student@synycs.edu',
        'role': 'student',
        'template': 'student_1',
        'is_staff': False,
        'is_superuser': False,
    },
]


def mirror_course_links(user, template):
    """Copies the template account's course assignments/enrollments onto user."""
    if user.role == 'teacher':
        for assignment in CourseAssignment.objects.filter(teacher=template):
            CourseAssignment.objects.get_or_create(
                course=assignment.course, teacher=user
            )
    elif user.role == 'student':
        for enrollment in CourseEnrollment.objects.filter(student=template):
            CourseEnrollment.objects.get_or_create(
                course=enrollment.course, student=user
            )


def seed():
    institution = Institution.objects.filter(code='SYNYCS-PRO').first()
    if institution is None:
        institution = Institution.objects.order_by('id').first()

    for data in ACCOUNTS:
        template = User.objects.filter(username=data['template']).first()

        user, created = User.objects.get_or_create(username=data['username'])
        user.email = data['email']
        user.role = data['role']
        user.is_staff = data['is_staff']
        user.is_superuser = data['is_superuser']
        user.is_approved = True
        user.is_active = True
        user.institution = template.institution if template else institution

        if template is not None:
            user.program = template.program
            user.year_of_study = template.year_of_study
            user.current_semester = template.current_semester
        elif data['role'] == 'student':
            user.program = Program.objects.order_by('id').first()

        user.set_password(data['password'])
        user.save()

        if template is not None:
            mirror_course_links(user, template)

        print(
            f"{'Created' if created else 'Updated'} {user.username} "
            f"({user.role}) at {user.institution}"
        )


if __name__ == '__main__':
    seed()
