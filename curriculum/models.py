from django.db import models
from users.models import Institution, User

class Curriculum(models.Model):
    """Academic Degree/Curriculum level (e.g. B.Tech, M.Tech, MBA)"""
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='curriculums')
    name = models.CharField(max_length=100)           # e.g. "Bachelor of Technology"
    short_name = models.CharField(max_length=20)      # e.g. "B.Tech"
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.short_name} ({self.institution.code})"


class Program(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='programs')
    curriculum = models.ForeignKey(Curriculum, on_delete=models.SET_NULL, null=True, related_name='programs')
    name = models.CharField(max_length=255)           # e.g. "Computer Science & Engineering"
    code = models.CharField(max_length=50)            # e.g. "CSE"
    description = models.TextField(blank=True)
    duration_years = models.PositiveIntegerField(default=4)
    order = models.PositiveIntegerField(default=0)    # for drag-and-drop ordering
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='%(class)s_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        unique_together = ['institution', 'code']

    def __str__(self):
        return f"{self.institution.code} | {self.name}"


class Course(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField(default=3)
    semester = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    teachers = models.ManyToManyField(User, through='CourseAssignment', related_name='teaching_courses')
    students = models.ManyToManyField(User, through='CourseEnrollment', related_name='enrolled_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['semester', 'order', 'name']

    def __str__(self):
        return f"{self.program.code} | {self.name}"


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.code} | {self.name}"


class Topic(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=1, default=1.0)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='unlocks')
    ai_suggested_order = models.PositiveIntegerField(null=True, blank=True)  # AI sets this
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_topics')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class LearningObjective(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='objectives')
    description = models.TextField()   # e.g. "Student can write a for loop"
    bloom_level = models.CharField(max_length=50, blank=True)  # Remember/Understand/Apply/Analyze/Evaluate/Create
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']


class StudyMaterial(models.Model):
    MATERIAL_TYPES = [
        ('pdf', 'PDF'),
        ('video', 'Video URL'),
        ('link', 'External Link'),
        ('image', 'Image'),
        ('doc', 'Document'),
    ]
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=255)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPES)
    file = models.FileField(upload_to='materials/', null=True, blank=True)
    url = models.URLField(blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Assignment(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField(null=True, blank=True)
    max_marks = models.PositiveIntegerField(default=100)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='%(class)s_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    file = models.FileField(upload_to='submissions/', null=True, blank=True)
    content = models.TextField(blank=True)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_graded = models.BooleanField(default=False)

    class Meta:
        unique_together = ['assignment', 'student']

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendance')
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['course', 'student', 'date']

    def __str__(self):
        return f"{self.student.username} - {self.course.code} - {self.date}"


class AcademicSchedule(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='schedules')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules')
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    room = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_datetime']


class CourseAssignment(models.Model):
    """Which Teacher teaches which Course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['course', 'teacher']


class CourseEnrollment(models.Model):
    """Which Student is enrolled in which Course"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['course', 'student']