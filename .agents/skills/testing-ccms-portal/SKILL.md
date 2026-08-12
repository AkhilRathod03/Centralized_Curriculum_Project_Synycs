---
name: testing-ccms-portal
description: How to bring up and end-to-end test the CCMS Pro portal (Django REST + React) locally, including JWT/CORS verification, seeded credentials, and known data gaps that look like bugs but usually are not caused by the change under test.
---

# Testing the CCMS Pro portal locally

## Bring-up

1. Postgres: `sudo service postgresql start`; database `ccms`, user/password `postgres`/`postgres`.
2. Python venv must be Python >= 3.12 (Django 6.x refuses older). Create from a pyenv 3.12 install if the system Python is older.
3. `requirements.txt` may be UTF-16 encoded and unreadable by pip. Convert first:
   `iconv -f UTF-16 -t UTF-8 requirements.txt > /tmp/req.txt && venv/bin/pip install -r /tmp/req.txt`
4. `.env` at repo root needs `SECRET_KEY`, `DEBUG=True`, `DB_*`. `GEMINI_API_KEY` may be a dummy value — in that case every AI/assistant feature fails by design; do not report it as a regression.
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

## Known gaps that are usually pre-existing, not caused by your change

Check these against `main` before reporting them as regressions:
- Curriculum Studio can be empty because the DB has zero `Curriculum` rows even after seeding; the API returns 200 with an empty page.
- `student_rao.program` may be NULL, so that account shows zero active courses despite having enrollments.
- `UserSerializer` may omit `is_approved`, so the admin User Management badge shows "Pending" for approved users.
- Some pages render hardcoded fixtures instead of API data (e.g. `StudentAssignments.jsx`). Confirm against `/tmp/backend.log` whether a request was actually made before crediting a page as data-driven.
- Schedule export is unreliable: it may 404 (no route) for students and 403 for teachers, since the export view is student-only by design.
- Teacher accounts can be left unapproved, in which case login legitimately fails with "pending admin approval" and logs a 400. Approve the user in admin User Management and retry.

## Devin Secrets Needed

None for local testing. A real `GEMINI_API_KEY` would be required to exercise AI/assistant features.
