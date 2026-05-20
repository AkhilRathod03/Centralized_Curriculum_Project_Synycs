from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Sum, Q
from django.utils import timezone
from django.http import FileResponse
from users.models import User, Institution
from curriculum.models import Program, Course, Topic, Assignment, Attendance, Submission
from datetime import timedelta
import io
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from ai_engine.services import GeminiService

class AdminReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized"}, status=403)
        
        institution = request.user.institution
        
        # Institution KPI analytics
        total_students = User.objects.filter(institution=institution, role='student').count()
        total_teachers = User.objects.filter(institution=institution, role='teacher').count()
        total_courses = Course.objects.filter(program__institution=institution).count()
        
        # Attendance %
        attendance_stats = Attendance.objects.filter(course__program__institution=institution)
        total_attendance = attendance_stats.count()
        present_count = attendance_stats.filter(status='present').count()
        attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
        
        # Curriculum Completion %
        total_topics = Topic.objects.filter(module__course__program__institution=institution).count()
        completed_topics = Topic.objects.filter(module__course__program__institution=institution, is_completed=True).count()
        curriculum_completion = (completed_topics / total_topics * 100) if total_topics > 0 else 0
        
        # Assignment Completion %
        total_assignments = Assignment.objects.filter(topic__module__course__program__institution=institution).count()
        total_submissions = Submission.objects.filter(assignment__topic__module__course__program__institution=institution).count()
        # Mocking expected submissions (total_students * total_assignments)
        expected_submissions = total_students * total_assignments
        assignment_completion = (total_submissions / expected_submissions * 100) if expected_submissions > 0 else 0

        # AI Risk Alerts (Mock logic for now)
        ai_risk_alerts = 5 # In production, this would come from an AI analysis service
        
        # Performance Score (Avg marks obtained)
        avg_score = Submission.objects.filter(assignment__topic__module__course__program__institution=institution).aggregate(Avg('marks_obtained'))['marks_obtained__avg'] or 0

        return Response({
            "kpi": [
                {"title": "Total Students", "value": f"{total_students:,}", "trend": "+2%", "color": "primary"},
                {"title": "Total Teachers", "value": f"{total_teachers}", "trend": "Stable", "color": "info"},
                {"title": "Active Courses", "value": f"{total_courses}", "trend": "+5%", "color": "success"},
                {"title": "Institution Attendance %", "value": f"{attendance_rate:.1f}%", "trend": "+1.2%", "color": "warning"},
                {"title": "Curriculum Completion %", "value": f"{curriculum_completion:.1f}%", "trend": "+8%", "color": "primary"},
                {"title": "Assignment Completion %", "value": f"{assignment_completion:.1f}%", "trend": "-2%", "color": "danger"},
                {"title": "AI Risk Alerts", "value": str(ai_risk_alerts), "trend": "Critical", "color": "danger"},
                {"title": "Academic Performance Score", "value": f"{avg_score:.1f}", "trend": "+3.4", "color": "success"},
            ],
            "department_comparison": [
                {"name": "Computer Science", "attendance": 92, "performance": 88, "risk": "Low"},
                {"name": "Mechanical", "attendance": 85, "performance": 76, "risk": "Medium"},
                {"name": "Civil", "attendance": 78, "performance": 72, "risk": "High"},
                {"name": "AI & ML", "attendance": 95, "performance": 91, "risk": "Low"},
            ],
            "academic_trends": [
                {"month": "Jan", "attendance": 94, "performance": 82},
                {"month": "Feb", "attendance": 92, "performance": 84},
                {"month": "Mar", "attendance": 88, "performance": 81},
                {"month": "Apr", "attendance": 85, "performance": 85},
                {"month": "May", "attendance": 89, "performance": 88},
            ],
            "ai_insights": [
                "AI detected low curriculum completion in AI department (Semester 4).",
                "Attendance trends dropping before mid-semester exams in Civil department.",
                "Students struggling in advanced mathematics topics across all engineering programs.",
            ]
        })

class TeacherReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({"error": "Unauthorized"}, status=403)
        
        courses = request.user.teaching_courses.all()
        
        total_classes = 42 # Mocking for now, could link to a ClassSession model
        avg_score = Submission.objects.filter(assignment__topic__module__course__in=courses).aggregate(Avg('marks_obtained'))['marks_obtained__avg'] or 0
        
        # Submission rate for their courses
        total_assignments = Assignment.objects.filter(topic__module__course__in=courses).count()
        total_students = User.objects.filter(enrolled_courses__in=courses).distinct().count()
        total_submissions = Submission.objects.filter(assignment__topic__module__course__in=courses).count()
        expected = total_students * total_assignments
        submission_rate = (total_submissions / expected * 100) if expected > 0 else 0
        
        # Attendance % for their courses
        attendance_stats = Attendance.objects.filter(course__in=courses)
        total_att = attendance_stats.count()
        present = attendance_stats.filter(status='present').count()
        attendance_rate = (present / total_att * 100) if total_att > 0 else 0
        
        weak_students = 8 # Mock logic

        return Response({
            "kpi": [
                {"title": "Classes Conducted", "value": str(total_classes), "icon": "calendar", "color": "primary"},
                {"title": "Average Student Score", "value": f"{avg_score:.1f}", "icon": "star", "color": "success"},
                {"title": "Assignment Completion", "value": f"{submission_rate:.1f}%", "icon": "file", "color": "info"},
                {"title": "Attendance %", "value": f"{attendance_rate:.1f}%", "icon": "users", "color": "warning"},
                {"title": "Weak Students", "value": str(weak_students), "icon": "alert", "color": "danger"},
            ],
            "course_analytics": [
                {"course": c.code, "avg_marks": 75, "attendance": 88} for c in courses
            ],
            "ai_insights": [
                "Students struggle with recursion concepts in Module 2.",
                "Lab sessions improve performance by 15% vs theory classes.",
                "Assignment completion dropping for late-night submissions.",
            ]
        })

class StudentReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({"error": "Unauthorized"}, status=403)
        
        # Performance
        avg_score = Submission.objects.filter(student=request.user).aggregate(Avg('marks_obtained'))['marks_obtained__avg'] or 0
        gpa = (avg_score / 25) # Mock conversion
        
        # Attendance
        attendance_stats = Attendance.objects.filter(student=request.user)
        total = attendance_stats.count()
        present = attendance_stats.filter(status='present').count()
        attendance_rate = (present / total * 100) if total > 0 else 0
        
        # Assignments
        total_assigned = Assignment.objects.filter(topic__module__course__students=request.user).count()
        completed = Submission.objects.filter(student=request.user).count()
        
        return Response({
            "kpi": [
                {"title": "Overall GPA", "value": f"{gpa:.2f}", "color": "primary"},
                {"title": "Attendance %", "value": f"{attendance_rate:.1f}%", "color": "success"},
                {"title": "Assignments Completed", "value": f"{completed}/{total_assigned}", "color": "info"},
                {"title": "Subjects At Risk", "value": "1", "color": "danger"},
                {"title": "AI Readiness Score", "value": "82%", "color": "warning"},
            ],
            "subject_performance": [
                {"subject": "DBMS", "score": 85, "attendance": 90},
                {"subject": "OS", "score": 72, "attendance": 85},
                {"subject": "Networks", "score": 88, "attendance": 92},
            ],
            "ai_insights": [
                "Focus more on DBMS practicals to improve marks.",
                "You need 8 more classes for safe attendance in OS.",
                "Operating Systems performance declining since last month.",
            ]
        })

class StudentResumeReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({"error": "Unauthorized"}, status=403)

        # 1. Gather Data
        avg_score = Submission.objects.filter(student=request.user).aggregate(Avg('marks_obtained'))['marks_obtained__avg'] or 0
        gpa = (avg_score / 25)
        
        attendance_stats = Attendance.objects.filter(student=request.user)
        total_att = attendance_stats.count()
        present = attendance_stats.filter(status='present').count()
        attendance_rate = (present / total_att * 100) if total_att > 0 else 0
        
        completed_assignments = Submission.objects.filter(student=request.user).count()
        
        courses = Course.objects.filter(students=request.user)
        perf_data = []
        for c in courses:
            score = Submission.objects.filter(student=request.user, assignment__topic__module__course=c).aggregate(Avg('marks_obtained'))['marks_obtained__avg'] or 0
            perf_data.append([c.name, f"{score:.1f}%"])

        # 2. Get AI Insights
        gemini = GeminiService()
        stats_text = f"GPA: {gpa:.2f}, Attendance: {attendance_rate:.1f}%, Completed: {completed_assignments}, Subjects: {', '.join([f'{d[0]}: {d[1]}' for d in perf_data])}"
        
        prompt = f"Generate a 3-sentence professional career summary and 3 career recommendations for a student with these stats. Format as JSON with keys 'summary' and 'recommendations'."
        ai_resp = gemini.chat(prompt, context=stats_text)
        
        try:
            if "```json" in ai_resp: ai_resp = ai_resp.split("```json")[1].split("```")[0].strip()
            elif "```" in ai_resp: ai_resp = ai_resp.split("```")[1].split("```")[0].strip()
            ai_data = json.loads(ai_resp)
        except:
            ai_data = {
                "summary": f"{request.user.first_name} is a dedicated student with a strong GPA of {gpa:.2f} and consistent attendance of {attendance_rate:.1f}%.",
                "recommendations": ["Software Engineering", "Data Analytics", "IT Consultancy"]
            }

        # 3. Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Custom Styles
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, spaceAfter=20, textColor=colors.HexColor('#007bff'))
        header_style = ParagraphStyle('HeaderStyle', parent=styles['Heading2'], spaceBefore=15, spaceAfter=10, textColor=colors.HexColor('#333333'))
        
        # Title
        elements.append(Paragraph("SYNYCS AI - CAREER READINESS PROFILE", title_style))
        
        # Student Info
        elements.append(Paragraph(f"<b>Name:</b> {request.user.first_name} {request.user.last_name}", styles['Normal']))
        elements.append(Paragraph(f"<b>Email:</b> {request.user.email}", styles['Normal']))
        elements.append(Paragraph(f"<b>Institution:</b> {request.user.institution.name if request.user.institution else 'SYNYCS PRO CCMS'}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # AI Summary Section
        elements.append(Paragraph("<b>AI PROFESSIONAL SUMMARY</b>", header_style))
        elements.append(Paragraph(ai_data.get('summary', ''), styles['Normal']))
        elements.append(Spacer(1, 12))

        # Academic Stats Table
        elements.append(Paragraph("<b>ACADEMIC PERFORMANCE BREAKDOWN</b>", header_style))
        if not perf_data:
            perf_data = [["No courses enrolled", "0%"]]
        data = [["Subject", "Score"]] + perf_data
        t = Table(data, colWidths=[350, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#007bff')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 12))

        # Recommendations
        elements.append(Paragraph("<b>AI CAREER RECOMMENDATIONS</b>", header_style))
        for rec in ai_data.get('recommendations', []):
            elements.append(Paragraph(f"• {rec}", styles['Normal']))

        # Footer
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("<font size=8 color='grey'>Generated by SYNYCS AI Engine on " + timezone.now().strftime("%Y-%m-%d %H:%M") + "</font>", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"Career_Profile_{request.user.last_name}.pdf")
