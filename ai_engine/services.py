import google.generativeai as genai
from django.conf import settings
import json
import re


class AIServiceError(Exception):
    """Raised when the Gemini backend cannot produce a usable answer.

    Views translate this into a non-2xx response so the UI shows a real failure
    instead of silently rendering placeholder content.
    """

    def __init__(self, message, quota_exceeded=False):
        super().__init__(message)
        self.quota_exceeded = quota_exceeded


def _is_quota_error(error):
    text = str(error).lower()
    return '429' in text or 'quota' in text or 'exhausted' in text


# Structured answers (lesson plans, quizzes) are long; a small cap truncates the
# JSON mid-object and makes every response unparsable.
GENERATION_CONFIG = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}


class GeminiService:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.is_mock = True
        self.available_models = []
        self.current_model_index = 0
        
        if self.api_key and self.api_key.strip() != '' and self.api_key != 'your-gemini-api-key-here':
            try:
                genai.configure(api_key=self.api_key)
                
                # Auto-detect available models
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                        self.available_models.append(m.name.replace('models/', ''))
                
                # Fastest current models first; the 1.5 family is retired.
                priorities = [
                    'gemini-2.5-flash',
                    'gemini-2.5-flash-lite',
                    'gemini-2.0-flash',
                    'gemini-2.0-flash-lite',
                    'gemini-2.5-pro',
                ]
                
                sorted_models = []
                for p in priorities:
                    if p in self.available_models:
                        sorted_models.append(p)
                
                for m in self.available_models:
                    if m not in sorted_models:
                        sorted_models.append(m)
                
                self.available_models = sorted_models
                
                if self.available_models:
                    self.model = genai.GenerativeModel(
                        model_name=self.available_models[0],
                        generation_config=GENERATION_CONFIG
                    )
                    self.is_mock = False
                    print(f"AI Turbo Engine active: {self.available_models[0]}")
            except Exception as e:
                print(f"Gemini Initialization Error: {e}")
                self.is_mock = True

    def rotate_model(self):
        """Switches to the next available model if current one fails."""
        if not self.available_models:
            return False
        
        self.current_model_index = (self.current_model_index + 1) % len(self.available_models)
        next_model_name = self.available_models[self.current_model_index]
        self.model = genai.GenerativeModel(
            next_model_name,
            generation_config=GENERATION_CONFIG
        )
        print(f"⚡ Turbo-Switching Core: {next_model_name}")
        return True

    def _generate(self, prompt):
        """Calls Gemini, rotating models on quota errors. Raises AIServiceError."""
        last_error = None
        attempts = min(3, max(1, len(self.available_models)))
        for attempt in range(attempts):
            try:
                return self.model.generate_content(prompt).text
            except Exception as e:
                last_error = e
                print(f"Gemini Error: {e}")
                if _is_quota_error(e) and attempt < attempts - 1 and self.rotate_model():
                    continue
                break
        raise AIServiceError(str(last_error), quota_exceeded=_is_quota_error(last_error))

    def _generate_json(self, prompt, expected=(dict, list)):
        """Calls Gemini and parses the JSON payload out of the reply."""
        text = self._generate(prompt).strip()
        fenced = re.search(r'```(?:json)?\s*(.*?)```', text, re.DOTALL)
        if fenced:
            text = fenced.group(1).strip()
        data = None
        for candidate in (text, self._largest_json_span(text)):
            if not candidate:
                continue
            try:
                data = json.loads(candidate)
                break
            except ValueError:
                continue
        if data is None:
            raise AIServiceError('The AI returned a response that could not be parsed as JSON.')
        if not isinstance(data, expected):
            raise AIServiceError('The AI returned an unexpected response shape.')
        return data

    @staticmethod
    def _largest_json_span(text):
        match = re.search(r'[\[{].*[\]}]', text, re.DOTALL)
        return match.group(0) if match else None

    def chat(self, prompt, context=None):
        """
        Handles general-purpose AI prompts for any user doubt or query.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to enable the assistant.')

        # Condensed system instruction to save tokens/time
        sys_instr = "You are 'CCMS AI', a helpful Academic Assistant. Be accurate, concise, and use Markdown."

        full_prompt = f"{sys_instr}\n\n"
        if context:
            full_prompt += f"CONTEXT: {context}\n\n"
        full_prompt += f"QUERY: {prompt}"

        return self._generate(full_prompt)

    def generate_node_intelligence(self, node_type, node_name, context_name=""):
        """
        Generates deep intelligence for a specific node (Module or Topic).
        For Modules: Suggests topics.
        For Topics: Generates objectives and summary.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to enable node intelligence.')

        prompt = f"""
        You are a Subject Matter Expert. 
        TASK: Provide educational content for the {node_type} named "{node_name}" 
        in the context of the course/module "{context_name}".

        INSTRUCTIONS:
        1. If this is a MODULE, suggest 3-5 standard academic topics that belong inside it.
        2. If this is a TOPIC, generate 3 clear Learning Objectives (Bloom's) and a 3-sentence conceptual summary.

        Return a JSON object:
        For Module: {{ "type": "topics", "suggestions": ["topic1", "topic2", ...] }}
        For Topic: {{ "type": "content", "objectives": ["...", "..."], "summary": "..." }}

        Return ONLY the JSON.
        """

        return self._generate_json(prompt, expected=dict)

    def generate_objectives(self, topic_name, topic_description):
        """
        Generates 3-5 learning objectives for a given topic.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to generate objectives.')

        prompt = f"""
        You are an expert curriculum designer.
        Based on the topic name "{topic_name}" and its description "{topic_description}",
        generate 3 to 5 clear, measurable learning objectives using Bloom's Taxonomy.
        Format the output as a JSON list of strings.
        Example: ["Student can identify core concepts", "Student can apply formulas to problems"]
        """

        return self._generate_json(prompt, expected=list)

    def generate_quiz(self, topic_name, topic_notes=None, pdf_content=None, num_questions=25,
                      difficulty='medium', question_type='mcq'):
        """
        Generates a quiz based on topic notes and/or PDF content.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to generate quizzes.')

        context = ""
        if topic_notes:
            context += f"\nTopic Notes: {topic_notes}"
        if pdf_content:
            context += f"\nPDF Document Content: {pdf_content}"

        type_instruction = {
            'mcq': 'Multiple Choice Questions with exactly 4 options each.',
            'truefalse': 'True/False questions where "options" is exactly ["True", "False"].',
            'short': 'Short-answer questions where "options" is an empty list and "answer" is a model answer.',
        }.get(question_type, 'Multiple Choice Questions with exactly 4 options each.')

        prompt = f"""
        You are an expert examiner. Generate EXACTLY {num_questions} questions for the topic: "{topic_name}".

        QUESTION TYPE: {type_instruction}
        DIFFICULTY: {difficulty}

        {f"Use the following context to create high-quality, relevant questions: {context}" if context else "Create general academic questions for this topic."}

        For each question provide the question text, the options, the correct answer
        (the full text of the correct option) and a brief explanation.

        Format the output as a JSON list of objects ONLY.
        Example: [{{ "question": "...", "options": ["...", "..."], "answer": "...", "explanation": "..." }}]
        """

        return self._generate_json(prompt, expected=list)

    def generate_lesson_plan(self, subject, topic, duration, grade_level='Undergraduate', focus=''):
        """
        Generates a structured lesson plan for a single class session.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to generate lesson plans.')

        prompt = f"""
        You are an experienced instructional designer.
        TASK: Build a lesson plan for a single class session.

        SUBJECT: {subject}
        TOPIC: {topic}
        SESSION DURATION: {duration} minutes
        AUDIENCE: {grade_level}
        {f"TEACHER'S REQUESTED FOCUS: {focus}" if focus else ""}

        The timeline segments MUST sum to exactly {duration} minutes.

        OUTPUT FORMAT (JSON ONLY):
        {{
            "title": "...",
            "summary": "2-3 sentence overview of the session",
            "objectives": ["measurable objective", "..."],
            "timeline": [
                {{ "duration": 10, "phase": "Introduction", "activity": "what the teacher and students do" }}
            ],
            "materials": ["..."],
            "assessment": ["how understanding is checked"],
            "homework": "..."
        }}

        Return ONLY the raw JSON.
        """

        return self._generate_json(prompt, expected=dict)

    def suggest_topic_order(self, topics_data):
        """
        Given a list of topics (id, name, description), suggests a logical order.
        Returns a mapping of id to order.
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to reorder topics.')

        prompt = f"""
        You are an expert educator. I have a list of topics for a module.
        Please arrange them in a logical learning sequence (from basic to advanced).

        Topics:
        {json.dumps(topics_data, indent=2)}

        Return a JSON object mapping the topic 'id' to its suggested 'order' (starting from 0).
        Example: {{"12": 0, "15": 1, "10": 2}}
        """

        return self._generate_json(prompt, expected=dict)

    def analyze_syllabus_structure(self, course_name, structure_data):
        """
        Analyzes and standardizes the syllabus to exactly 5 modules.
        Focus: Standard Academic Curriculum (Commonly taught in colleges).
        Prevention: Strictly avoids duplicating existing topics.
        """
        current_count = len(structure_data)

        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to analyze syllabi.')

        prompt = f"""
        You are a University Academic Dean. 
        TASK: Complete and standardize the syllabus for the course: "{course_name}".
        
        REQUIREMENT: A standard university course MUST have EXACTLY 5 MODULES (Units).
        
        CURRENT STATE:
        The course currently has {current_count} modules:
        {json.dumps(structure_data, indent=2)}
        
        INSTRUCTIONS:
        1. Calculate: 5 - {current_count} = number of new modules needed.
        2. Suggest EXACTLY {5 - current_count if current_count < 5 else 0} NEW modules to reach the total of 5.
        3. For each new module, provide a 'name' and a list of 3-5 'topics'.
        4. Focus on standard academic topics for "{course_name}" that are NOT already in the CURRENT STATE.
        5. If the current {current_count} modules are in the wrong order, suggest a sequence in "reorders".
        
        OUTPUT FORMAT (JSON ONLY):
        {{
            "new_modules": [
                {{ "name": "Unit Name", "topics": ["Topic A", "Topic B"] }}
            ],
            "reorders": [
                {{ "id": module_id, "suggested_order": 0, "type": "module" }}
            ],
            "reasoning": "Brief academic justification"
        }}

        Return ONLY the raw JSON. No markdown blocks.
        """

        return self._generate_json(prompt, expected=dict)

    def generate_modules(self, course_name, course_description):
        """
        Suggests EXACTLY 5 modules for a new course.
        Focus: Academic curriculum (College/University style).
        """
        if self.is_mock:
            raise AIServiceError('AI is not configured. Set GEMINI_API_KEY to generate modules.')

        prompt = f"""
        You are an expert Academic Curriculum Designer for a University. 
        TASK: Design a semester-based course structure for: "{course_name}".
        DESCRIPTION: "{course_description}"
        
        CRITICAL ACADEMIC INSTRUCTIONS:
        1. Design EXACTLY 5 MODULES.
        2. Focus on THEORETICAL FOUNDATIONS and CORE PRINCIPLES.
        3. DO NOT use prefixes like "Unit 1:" or "Module 1:". Just give the Name of the topic/subject.
        4. For each Module, provide a 'name', 'description', and a list of 'topics'.
        5. The number of topics per module should be natural (between 2 to 5).
        
        Format the output as a JSON list of objects ONLY.
        Example: [{{ "name": "Introduction to Logic", "description": "...", "topics": ["Theory 1", "Concept 2"] }}]
        """

        return self._generate_json(prompt, expected=list)
