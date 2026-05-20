from django.contrib import admin
from .models import (
    Program, Course, Module, Topic, LearningObjective,
    StudyMaterial, Assignment, AcademicSchedule
)

admin.site.register(Program)
admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Topic)
admin.site.register(LearningObjective)
admin.site.register(StudyMaterial)
admin.site.register(Assignment)
admin.site.register(AcademicSchedule)