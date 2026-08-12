from PyPDF2 import PdfReader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .services import GeminiService, AIServiceError
from curriculum.models import Topic, Module, Course
from curriculum.permissions import IsAdminOrTeacher


def ai_error_response(error):
    """Maps an AIServiceError onto a non-2xx response the UI can act on."""
    code = status.HTTP_429_TOO_MANY_REQUESTS if error.quota_exceeded else status.HTTP_502_BAD_GATEWAY
    return Response({'error': str(error), 'quota_exceeded': error.quota_exceeded}, status=code)


class SuggestObjectivesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        topic_name = request.data.get('name')
        topic_description = request.data.get('description', '')

        if not topic_name:
            return Response({'error': 'Topic name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            objectives = GeminiService().generate_objectives(topic_name, topic_description)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'objectives': objectives})


class SuggestTopicOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, module_id):
        try:
            module = Module.objects.get(id=module_id)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)

        topics_data = [
            {'id': t.id, 'name': t.name, 'description': t.description}
            for t in module.topics.all()
        ]

        if not topics_data:
            return Response({'error': 'No topics found in this module'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            suggestions = GeminiService().suggest_topic_order(topics_data)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'suggestions': suggestions})


class GenerateQuizView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, topic_id):
        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        num_questions = int(request.data.get('num_questions', 25))

        pdf_content = ""
        # Check for uploaded PDF file in request
        if 'pdf_file' in request.FILES:
            reader = PdfReader(request.FILES['pdf_file'])
            for page in reader.pages:
                pdf_content += page.extract_text()
        else:
            # Or use existing study materials if they are PDFs
            for mat in topic.materials.filter(material_type='pdf'):
                if not mat.file:
                    continue
                try:
                    reader = PdfReader(mat.file.path)
                except (FileNotFoundError, OSError, ValueError):
                    continue  # Skip if the file is missing locally
                for page in reader.pages:
                    pdf_content += page.extract_text()

        try:
            quiz = GeminiService().generate_quiz(
                topic_name=topic.name,
                topic_notes=topic.description,
                pdf_content=pdf_content[:15000],  # Truncate for token limits
                num_questions=num_questions,
                difficulty=request.data.get('difficulty', 'medium'),
                question_type=request.data.get('question_type', 'mcq'),
            )
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'quiz': quiz})


class GenerateQuizFromPromptView(APIView):
    """Quiz generation for the standalone AI Quiz Generator page (no topic row required)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        topic_name = (request.data.get('topic') or '').strip()
        if not topic_name:
            return Response({'error': 'Topic is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            num_questions = int(request.data.get('num_questions', 5))
        except (TypeError, ValueError):
            return Response({'error': 'num_questions must be a number'}, status=status.HTTP_400_BAD_REQUEST)
        num_questions = max(1, min(num_questions, 30))

        pdf_content = ""
        if 'pdf_file' in request.FILES:
            reader = PdfReader(request.FILES['pdf_file'])
            for page in reader.pages:
                pdf_content += page.extract_text()

        try:
            quiz = GeminiService().generate_quiz(
                topic_name=topic_name,
                topic_notes=request.data.get('notes', ''),
                pdf_content=pdf_content[:15000],
                num_questions=num_questions,
                difficulty=request.data.get('difficulty', 'medium'),
                question_type=request.data.get('question_type', 'mcq'),
            )
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'quiz': quiz})


class GenerateLessonPlanView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        subject = (request.data.get('subject') or '').strip()
        topic = (request.data.get('topic') or '').strip()

        if not subject or not topic:
            return Response({'error': 'Subject and topic are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            duration = int(request.data.get('duration', 60))
        except (TypeError, ValueError):
            return Response({'error': 'duration must be a number'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = GeminiService().generate_lesson_plan(
                subject=subject,
                topic=topic,
                duration=duration,
                grade_level=request.data.get('grade_level', 'Undergraduate'),
                focus=request.data.get('focus', ''),
            )
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'plan': plan})


class SuggestModulesView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            modules = GeminiService().generate_modules(course.name, course.description)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'modules': modules})


class AnalyzeSyllabusView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        structure = [
            {
                "id": m.id,
                "name": m.name,
                "order": m.order,
                "topics": [
                    {"id": t.id, "name": t.name, "order": t.order}
                    for t in m.topics.all().order_by('order')
                ],
            }
            for m in course.modules.all().order_by('order')
        ]

        try:
            analysis = GeminiService().analyze_syllabus_structure(course.name, structure)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response(analysis)


class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')

        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            answer = GeminiService().chat(prompt, context)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response({'response': answer})


class NodeIntelligenceView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrTeacher]

    def post(self, request):
        node_type = request.data.get('type')
        node_name = request.data.get('name')
        context_name = request.data.get('context_name', '')

        if not node_type or not node_name:
            return Response({'error': 'type and name are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intelligence = GeminiService().generate_node_intelligence(node_type, node_name, context_name)
        except AIServiceError as e:
            return ai_error_response(e)

        return Response(intelligence)
