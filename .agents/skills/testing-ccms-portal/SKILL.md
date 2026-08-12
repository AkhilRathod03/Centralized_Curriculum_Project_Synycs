---
name: testing-ccms-portal
description: How to bring up and end-to-end test the CCMS Pro portal (Django REST + React) locally, including JWT/CORS verification, seeded credentials, AI/Gemini feature testing (real vs mock pages, quota limits), and known data gaps that look like bugs but usually are not caused by the change under test.
---

# Testing the CCMS Pro portal locally

## Bring-up

1. Postgres: `sudo service postgresql start`; database `ccms`, user/password `postgres`/`postgres`.
2. Python venv must be Python >= 3.12 (Django 6.x refuses older). Create from a pyenv 3.12 install if the system Python is older.
3. `requirements.txt` may be UTF-16 encoded and unreadable by pip. Convert first:
   `iconv -f UTF-16 -t UTF-8 requirements.txt > /tmp/req.txt && venv/bin/pip install -r /tmp/req.txt`
4. `.env` at repo root needs `SECRET_KEY`, `DEBUG=True`, `DB_*`. `GEMINI_API_KEY` may be a dummy value — in that case `GeminiService` runs in `is_mock` mode and serves canned content rather than failing outright; do not report that as a regression, but see the AI section below before crediting any AI output as real.
5. Migrate, then run every `seed_*.py` script; without them the portal renders empty states that look like failures.
6. Backend: `venv/bin/python manage.py runserver 0.0.0.0:8000` (tee to `/tmp/backend.log`).
   Frontend: `cd frontend && BROWSER=none npm start` (tee to `/tmp/frontend.log`), served at http://localhost:3000.

## Credentials

`admin_akhil/admin123`, `teacher_kumar/teacher123`, `student_rao/student123`.
`seed_custom.py` also creates `admin_main`, `teacher_1..4`, `student_1..3` — read that script for their passwords.
Prefer `student_1` for student-portal testing: it has a program and enrollments, so pages render real data.

## Verifying JWT + CORS (the usual regression risk)

These settings live in `core/settings.py`: `AUTH_USER_MODEL`, `SIMPLE_JWT`, `REST_FRAMEWORK`
(JWT auth + `IsAuthenticated` + pagination), `CORS_ALLOWED_ORIGINS`. If any is missing, Django may not
start, DRF silently falls back to session auth, or the React dev server is CORS-blocked.

Fast, reliable checks that do not need DevTools:
- `grep -c " 401 " /tmp/backend.log` should be 0 after an authenticated run.
- `grep -c "OPTIONS" /tmp/backend.log` should be non-zero and those preflights should return 200 — that is CORS working.
- Read the browser console with the console tool and grep for `CORS` / `Access-Control-Allow-Origin`; there should be no hits.
- Negative test that proves auth is enforced: delete `access_token` from localStorage and reload a protected route; the app should bounce to `/login`.

Role gating is enforced client-side in `frontend/src/components/routing/ProtectedRoute.jsx` with
`allowedRoles`; a student visiting `/curriculum` should land on `/unauthorized` showing "403 - Unauthorized".

## Testing the AI / Gemini features

Endpoints live in `ai_engine/urls.py`; request shapes are enforced in `ai_engine/views.py`:
- `POST /api/ai/chat/` wants `{"prompt": ...}` (optional `context`). `IsAuthenticated` only, so students may call it.
- `POST /api/ai/suggest-objectives/` wants `{"name": ...}` (optional `description`).
- `POST /api/ai/node-intelligence/` wants `{"type": ..., "name": ...}` (optional `context_name`).
- `analyze-syllabus`, `suggest-modules`, `generate-quiz` take the id in the URL and build context server-side.
All AI views except chat require admin/teacher (`IsAdminOrTeacher`).

**Which UI pages are real vs mock.** Verify with `/tmp/backend.log`, never by looking at the UI:
several pages show an "AI ACTIVE" badge and a "generated successfully" toast while making **zero**
backend calls. `AILessonPlanner.jsx` and `AIQuizGenerator.jsx` build output inside a `setTimeout` from
hardcoded strings and do not even import axios. The reliable test is to type a distinctive, unguessable
topic and then check whether any `POST /api/ai/...` appears in the log; a template just interpolates the
topic string into a fixed skeleton. Real AI surfaces (as of this writing): `/ai-assistant`,
`/student-assistant`, Curriculum Studio "AI Optimize" and "Neural Intelligence", and the topic detail
page (`/curriculum/topic/<id>`) "AI Suggest" / "AI Generate Quiz".

**Errors are hidden behind HTTP 200.** `ai_engine/services.py` catches every Gemini exception and returns
`[]` or `{"error": ...}` while the view still responds 200. So a quota failure, a truncated response, and a
genuinely empty suggestion list are indistinguishable in the UI — `analyze-syllabus` failures render as the
reassuring "Sequence is optimal / No major gaps identified". Always inspect the **response body size** in
the log (a ~17-70 byte 200 is an error, a ~1000 byte 200 is real content) or replay the call directly.

**Free-tier quota is the usual blocker.** A free Gemini key allows only ~20 `gemini-2.5-flash`
requests/day (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`). This is exhausted very quickly, and
once it is, every AI feature silently degrades. Budget your calls: drive each AI surface through the UI
**once** and avoid diagnostic curl loops. To see the real error instead of the swallowed one, call the
service directly:
`venv/bin/python -c "import os,django;os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings');django.setup();from ai_engine.services import GeminiService;s=GeminiService();print(s.model.generate_content('hi').text)"`

**The model-fallback chain may be broken.** `GeminiService` prioritises `gemini-1.5-*` models that no
longer exist for new API keys, so `rotate_model()` falls through to `gemini-2.5-pro` (404 "no longer
available to new users") and then TTS/Gemma models. On quota exhaustion the chat UI therefore prints a raw
`Neural Core Error: 404 ...` to the end user. If AI chat fails, check the resolved rotation order with
`GeminiService().available_models` before blaming the key.

## Institution scoping blocks curriculum data

Curriculum/program/course endpoints are filtered by the authenticated user's `institution`. `teacher_kumar`
is in institution 1 while the seeded `Curriculum` rows are in institutions 2 and 32, so that account sees an
empty Curriculum Studio and gets 404 on `/api/curriculum/courses/14/`. Use `teacher_1/password123`
(institution 32) to reach seeded course 14 `CS101` → modules `Unit 1: Syntax & Logic` / `Unit 2: Functions`
→ topics 10-14. Check `User.institution_id` against `Curriculum.institution_id` in the DB before concluding
that curriculum data is missing.

## Known gaps that are usually pre-existing, not caused by your change

Check these against `main` before reporting them as regressions:
- Curriculum Studio can be empty because the DB has zero `Curriculum` rows even after seeding; the API returns 200 with an empty page.
- `student_rao.program` may be NULL, so that account shows zero active courses despite having enrollments.
- `UserSerializer` may omit `is_approved`, so the admin User Management badge shows "Pending" for approved users.
- Some pages render hardcoded fixtures instead of API data (e.g. `StudentAssignments.jsx`). Confirm against `/tmp/backend.log` whether a request was actually made before crediting a page as data-driven.
- Schedule export is unreliable: it may 404 (no route) for students and 403 for teachers, since the export view is student-only by design.
- Teacher accounts can be left unapproved, in which case login legitimately fails with "pending admin approval" and logs a 400. Approve the user in admin User Management and retry.
- `AILessonPlanner.jsx` and `AIQuizGenerator.jsx` are mock/template pages that never call the backend, regardless of whether a real Gemini key is configured.
- `POST /api/ai/courses/<id>/suggest-modules/` and `.../suggest-order/` exist server-side but have no frontend caller; they may be dead endpoints rather than broken ones.

## Devin Secrets Needed

`GEMINI_API_KEY` — required to exercise AI/assistant features. Prefer a **billing-enabled** key: a free-tier
key caps out at ~20 requests/day, which is not enough for a full AI regression pass and causes misleading
silent failures. With a dummy/absent key the service runs in `is_mock` mode and returns canned content that
can be mistaken for real AI output — check `GeminiService().is_mock`.
