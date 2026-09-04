# Debug internal server error on churchweb

**Session ID:** ses_f92c54ac0ffe6KljQdfjCqvKSZ
**Created:** 9/4/2026, 7:22:39 PM
**Updated:** 9/4/2026, 7:28:55 PM

---

## User

help me debug server error on my churchweb ,internal server error when i try to automate a 

---

## Assistant (Build · Big Pickle · 8.5s)

---

## User

help me debug server error on my churchweb ,internal server error when i try to automate a prompt

---

## Assistant (Build · Big Pickle · 131.7s)

_Thinking:_

The user is experiencing an internal server error when trying to automate a prompt in their churchweb application. I'm in plan mode, so I need to explore the codebase to understand the structure and identify potential sources of the error.

Let me start by exploring the project structure to understand what kind of application this is and where the server-side code might be located.

I'll help you debug the internal server error. Let me first explore your project structure to understand the codebase and identify potential error sources.

**Tool: task**

**Input:**
```json
{
  "description": "Explore project structure",
  "prompt": "Explore the churchweb project structure in the current working directory. I need to understand:\n1. What type of application this is (framework, language, etc.)\n2. The directory structure and key files\n3. Any server-side code, API routes, or backend logic\n4. Configuration files (package.json, etc.)\n\nReturn a comprehensive summary of the project structure and technology stack.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_f92c4d481ffewhJvLiurCu8lJv" state="completed">
<task_result>
Here is a comprehensive summary of the **Kingdom Ways Church CMS** project.

---

## 1. Application Type and Technology Stack

| Layer | Technology |
|---|---|
| **Language** | Python 3.12 |
| **Web Framework** | FastAPI (v0.139.2) |
| **ASGI Server** | Uvicorn (v0.51.0) |
| **ORM** | SQLAlchemy (v2.0.51) |
| **Migrations** | Alembic (v1.18.5) |
| **Validation/Schemas** | Pydantic (v2.13.4) |
| **Authentication** | JWT via `python-jose`, bcrypt via `passlib` |
| **Database** | SQLite (local dev) or PostgreSQL/Neon (production) |
| **Image/CDN** | Cloudinary (free tier, optional; falls back to local disk) |
| **Payments** | Safaricom M-Pesa Daraja API (STK Push) |
| **SMS** | Stub provider (designed for Africa's Talking / Twilio swap-in) |
| **OCR** | Tesseract via `pytesseract` (for scanning membership books) |
| **Frontend** | Vanilla HTML/CSS/JS (SPA-like pages served as static files) |
| **Real-time** | WebSockets (FastAPI native) |
| **Testing** | pytest (v9.1.1) with FastAPI TestClient |
| **Containerization** | Docker + Docker Compose |
| **Deployment Targets** | Render (render.yaml), Docker, Heroku-style (Procfile) |

---

## 2. Directory Structure

```
churchweb/
|-- app/                          # Main Python application package
|   |-- main.py                   # FastAPI app entry point, middleware, lifespan, static mount
|   |-- config.py                 # Environment variable loading (DB, secrets, M-Pesa, Cloudinary)
|   |-- database.py               # SQLAlchemy engine, session factory, Base, get_db()
|   |-- models.py                 # All SQLAlchemy ORM models (18 models)
|   |-- schema.py                 # Pydantic request/response schemas
|   |-- auth.py                   # Password hashing, JWT token creation (admin + member)
|   |-- dependencies.py           # FastAPI dependencies: get_current_admin, get_current_member
|   |-- permissions.py            # RBAC permission checker (super_admin bypass)
|   |-- middleware.py              # ErrorHandlerMiddleware (catches unhandled exceptions)
|   |-- cache.py                  # In-memory TTL cache for read-heavy public endpoints
|   |-- ratelimit.py              # Sliding-window in-memory rate limiter (by IP)
|   |-- mpesa.py                  # Safaricom M-Pesa Daraja API client (token, STK Push, callback)
|   |-- sms_provider.py           # SMS stub (swap-in point for Africa's Talking, Twilio, etc.)
|   |-- ocr_utils.py              # Tesseract OCR: extract names/phones from scanned book images
|   |-- utils.py                  # File upload validation, username generation
|   |-- create_super_admin.py     # CLI script to seed a super admin
|   |-- create_permissions.py     # CLI script to seed permission records
|   |-- routes/                   # API route modules (15 route files)
|   |   |-- auth_routes.py        # POST /admin/login (rate-limited, lockout after 5 failures)
|   |   |-- admin_routes.py       # CRUD for admin accounts, role management
|   |   |-- member_routes.py      # Member registration, login, approval, profile, logout
|   |   |-- giving_routes.py      # M-Pesa STK Push, callback, receipts, finance dashboard
|   |   |-- events_routes.py      # CRUD for church events (with file uploads)
|   |   |-- sermon_routes.py      # CRUD for sermons (video, notes, thumbnail uploads)
|   |   |-- gallery_routes.py     # CRUD for photo gallery
|   |   |-- attendance_routes.py  # Daily attendance report (present, absent, online)
|   |   |-- ai_attendance_routes.py # AI camera-based attendance sessions
|   |   |-- dashboard_routes.py   # Dashboard statistics
|   |   |-- chat_routes.py        # Member-to-member chat (REST endpoints)
|   |   |-- websocket_routes.py   # WebSocket real-time chat
|   |   |-- communication_routes.py # SMS broadcast, internal notifications, OCR book scan
|   |   |-- settings_routes.py    # Admin settings, theme/vision, giving accounts, church contacts
|   |   |-- card_background_routes.py # Per-card background image management
|   |-- services/
|   |   |-- storage.py            # Dual-mode file storage: Cloudinary CDN or local filesystem
|   |   |-- file_service.py       # High-level save_image/video/pdf helpers
|   |-- static/                   # (empty or minimal static assets)
|   |-- uploads/                  # Local upload staging area
|
|-- public/                       # Frontend HTML/CSS/JS (served as static files at "/")
|   |-- index.html                # Landing page
|   |-- login.html / login.js     # Admin/member login
|   |-- dashboard.html / .js / .css # Admin dashboard
|   |-- members.html / .js        # Member management
|   |-- events.html / .js         # Event management
|   |-- sermons-admin.html        # Sermon management (admin)
|   |-- sermonsclient.html        # Sermons viewer (public/member)
|   |-- gallery.html / galleryadmin.html # Gallery views
|   |-- offering.html / donations.html  # Giving/donations UI
|   |-- attendance.html           # Attendance tracking
|   |-- connect.html              # Member chat ("Connect Hub")
|   |-- communication.html        # SMS/internal messaging
|   |-- clientMode.html           # Member-facing mobile-optimized UI
|   |-- eventclient.html          # Public event sharing page (with OG tags)
|   |-- settings.html             # Admin settings
|   |-- images/                   # Static images (logos, church photos)
|   |-- vendor/                   # TensorFlow.js, COCO-SSD (for AI attendance)
|   |-- uploads/                  # User-generated content
|       |-- sermons/videos/       # Uploaded sermon videos
|       |-- sermons/images/       # Uploaded sermon thumbnails
|       |-- sermons/notes/        # Uploaded sermon PDF notes
|       |-- gallery/              # Uploaded gallery images
|       |-- events/               # Uploaded event banners/attachments
|
|-- alembic/                      # Alembic migration environment
|   |-- env.py                    # Migration runner (reads DATABASE_URL from config)
|   |-- versions/                 # Migration scripts
|
|-- tests/
|   |-- conftest.py               # Pytest fixtures (SQLite test DB, TestClient)
|   |-- test_giving.py            # Giving/M-Pesa flow tests (auth, validation, callback, security)
|
|-- scripts/
|   |-- backup.py                 # Database backup (gzip JSON snapshots + optional Cloudinary offsite)
|   |-- restore.py                # Database restore from backup snapshots
|
|-- .env.example                  # Documented environment variable template
|-- .env                          # Active environment config (gitignored)
|-- .env.production               # Production environment overrides
|-- requirements.txt              # Production Python dependencies (32 packages)
|-- requirements-dev.txt          # Dev dependencies (adds pytest)
|-- Dockerfile                    # Python 3.12-slim image, uvicorn entrypoint
|-- docker-compose.yml            # Single-service web container with volume for uploads
|-- render.yaml                   # Render.com deployment blueprint (PostgreSQL + web service)
|-- Procfile                      # Heroku/Render process definition
|-- alembic.ini                   # Alembic configuration
|-- pytest.ini                    # Pytest configuration
|-- .gitignore                    # Comprehensive gitignore
|-- README.md                     # Minimal readme ("Masa-Trials")
|-- church_cms.db                 # SQLite database (local dev, gitignored)
|-- server_out.log / server_err.log # Server logs
|-- migrate_to_neon.py            # Migration script to move data to Neon PostgreSQL
|-- reset_superadmin.py           # Script to reset super admin credentials
|-- add_message_type_column.py    # One-off migration script
```

---

## 3. Server-Side Code and API Routes

### Core Application Entry (`app/main.py`)
- Creates the FastAPI app titled "Kingdom Ways Church CMS" v1.0.0
- Configures CORS, GZip compression, error handling middleware, and clean URL middleware
- Auto-creates all database tables via `Base.metadata.create_all()`
- Runs idempotent PostgreSQL column migrations on startup
- Seeds a default super admin if `SEED_ADMIN=true`
- Starts a DB keep-alive thread for Neon PostgreSQL (pings every 4 minutes)
- Mounts the `public/` directory as static files with cache headers
- Provides a `/health` endpoint that verifies database connectivity

### API Routes Summary (15 route modules)

| Router | Prefix | Key Endpoints | Auth |
|---|---|---|---|
| `auth_routes` | `/admin/login` | `POST /admin/login` (rate-limited: 5/60s, lockout after 5 failures) | Public |
| `admin_routes` | `/admin` | `POST /admin/create`, `DELETE /admin/{id}`, `PUT /admin/{id}/role` | Admin |
| `member_routes` | `/member`, `/members` | `POST /member/register`, `POST /member/login`, `GET /members` (paginated), `PUT /member/{id}/approve`, `DELETE /member/{id}`, `PUT /member/profile/{id}`, `POST /member/logout`, `POST /member/activate` | Mixed |
| `giving_routes` | `/api/finance` | `POST /api/finance/stk-push`, `POST /api/finance/mpesa-callback`, `GET /api/finance/mpesa/status/{id}`, `GET /api/finance/receipt/{id}`, `GET /api/finance/member-history/{number}`, `GET /api/finance/accounts`, `GET /api/finance/transactions`, `POST /api/finance/transaction`, `PUT /api/finance/transaction/edit` | Member/Admin |
| `events_routes` | `/api/events` | `GET /api/events/`, `POST /api/events/`, `PUT /api/events/{id}`, `DELETE /api/events/{id}` | Admin (write) |
| `sermon_routes` | `/api/sermons` | `GET /api/sermons/`, `GET /api/sermons/{id}`, `POST /api/sermons/`, `PUT /api/sermons/{id}`, `DELETE /api/sermons/{id}` | Admin (write) |
| `gallery_routes` | `/api/gallery` | `GET /api/gallery/`, `POST /api/gallery/`, `DELETE /api/gallery/{id}` | Admin (write) |
| `attendance_routes` | `/attendance` | `GET /attendance/today` | Public |
| `ai_attendance_routes` | `/attendance/ai` | `POST /attendance/ai/session`, `GET /attendance/ai/latest` | Admin |
| `dashboard_routes` | `/dashboard` | `GET /dashboard/stats` | Public |
| `chat_routes` | `/api/chat` | `POST /api/chat/heartbeat`, `GET /api/chat/conversations/{number}`, `POST /api/chat/private`, `POST /api/chat/messages`, `GET /api/chat/messages/{id}`, `PUT /api/chat/messages/{id}`, `DELETE /api/chat/messages/{id}`, `GET /api/chat/members/{number}` | Public |
| `websocket_routes` | (none) | `WS /ws/chat/{member_number}` | Public |
| `communication_routes` | `/communication` | `POST /communication/sms/send`, `POST /communication/internal/send`, `GET /communication/history`, `GET /communication/history/export` (CSV), `GET /communication/statistics`, `POST /communication/scan-book` (OCR), `GET/POST/PATCH /communication/scan-review/*`, `GET/POST /communication/contacts` | Admin |
| `settings_routes` | `/api` | `GET/PUT /api/theme`, `GET/PUT /api/vision`, `GET /api/settings/profile`, `GET /api/settings/users`, `GET/POST /api/settings/giving-accounts`, `GET/PUT /api/giving-accounts` (public), `GET/PUT /api/church/contact`, `POST /api/login` (portal key auth), `GET /api/members/{number}/presence`, `GET /api/current-user` | Admin (most) |
| `card_background_routes` | `/api/card-backgrounds` | `GET /api/card-backgrounds`, `POST /api/card-backgrounds/{key}`, `DELETE /api/card-backgrounds/{key}` | Admin (write) |

### Database Models (18 tables)

| Model | Table | Purpose |
|---|---|---|
| `Admin` | `admins` | Church administrators with roles, permissions, lockout |
| `Permission` | `permissions` | Granular permission names (RBAC) |
| `Member` | `members` | Church members with approval workflow |
| `Giving` | `givings` | M-Pesa giving/offering records |
| `GivingAccount` | `giving_accounts` | Configured PayBill / phone receiving accounts |
| `Event` | `events` | Church events with rich metadata |
| `Sermon` | `sermons` | Sermon recordings (video, notes, thumbnail) |
| `Attendance` | `attendance` | Member attendance records (time in/out) |
| `AIAttendanceSession` | `ai_attendance_sessions` | Camera-based attendance tracking |
| `Gallery` | `gallery` | Photo gallery items |
| `Transaction` | `transactions` | Finance ledger (income/expense) |
| `Conversation` | `conversations` | Chat conversations |
| `ConversationMember` | `conversation_members` | Many-to-many: conversations to members |
| `Message` | `messages` | Chat messages (edit/delete support) |
| `CommunicationLog` | `communication_logs` | SMS and internal message broadcast logs |
| `MemberNotification` | `member_notifications` | Per-member in-app notifications |
| `ChurchContact` | `church_contacts` | Church contact info (phone, social, email) |
| `ScannedContact` | `scanned_contacts` | OCR review queue for scanned membership books |
| `CardBackground` | `card_backgrounds` | Per-card customizable background images |
| `AuditLog` | `audit_logs` | Admin action audit trail |

---

## 4. Key Architectural Patterns and Features

- **Dual database support**: SQLite for offline/local development, PostgreSQL (Neon) for production -- auto-detected from the `DATABASE_URL` environment variable.
- **Role-based access control (RBAC)**: Super admin bypasses permissions; other admin roles (admin, secretary, treasurer, pastor) checked per-endpoint.
- **JWT authentication**: Separate token types for admin and member roles with configurable expiry (default 180 minutes).
- **Security hardening**: Account lockout after 5 failed login attempts (15-minute lockout), IP-based rate limiting on login and STK Push, centralized error handling middleware.
- **In-memory caching**: TTL-based cache (60-second default) on all read-heavy public endpoints (gallery, sermons, events, card backgrounds) to reduce database load.
- **Dual-mode file storage**: Cloudinary CDN (production) with local filesystem fallback (development). Images are optimized (resized, compressed to JPEG) before upload.
- **Real-time chat**: WebSocket-based messaging with online presence tracking (60-second heartbeat threshold).
- **M-Pesa integration**: Full STK Push flow with callback handling, receipt generation, and payment status polling. Designed for Safaricom's Daraja API.
- **OCR member import**: Scan physical membership books with Tesseract, extract names/phones, and review before adding to the members database.
- **AI attendance**: Browser-side TensorFlow.js person detection (COCO-SSD model) for camera-based attendance counting.
- **Database backup/restore**: CLI scripts that dump all tables to gzipped JSON and optionally push offsite copies to Cloudinary.
- **Clean URL middleware**: `/login` serves `login.html`, `/dashboard` serves `dashboard.html`, etc.
- **Public shareable links**: `/join` and `/invite` serve the events page with Open Graph meta tags for social media sharing.
- **Frontend**: Vanilla HTML/CSS/JavaScript -- no framework. Each page is a standalone HTML file with its own CSS and JS files, served from the `public/` directory. TensorFlow.js and COCO-SSD are bundled in `public/vendor/`.

---

## 5. Deployment Configuration

| File | Purpose |
|---|---|
| `Dockerfile` | Python 3.12-slim image, installs deps, runs uvicorn with 2 workers on port 8000 |
| `docker-compose.yml` | Single `web` service with persistent `uploads` volume and health check |
| `render.yaml` | Render.com blueprint: Python runtime, PostgreSQL database, environment variables for secrets, Cloudinary, and M-Pesa |
| `Procfile` | `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Heroku/Render) |
| `.env.example` | Documents all 20+ environment variables: database URL, secrets, M-Pesa, Cloudinary, CORS |
</task_result>
</task>
```

---

## Assistant (Build · Big Pickle · 17.5s)

_Thinking:_

Now I have a good understanding of the project. It's a FastAPI-based church management system. The user is experiencing an internal server error when trying to "automate a prompt." I need to understand what "automate a prompt" means in this context. It could be:

1. Some kind of automated task or scheduled job
2. A prompt for AI features (like the AI attendance feature)
3. An automated message or communication
4. Some kind of automated workflowLet me ask the user for clarification on what they mean by "automate a prompt" and also check for any error logs.

I understand you're experiencing an internal server error in your Kingdom Ways Church CMS (FastAPI/Python application). To help debug this, I need a bit more information:

1. **What exactly do you mean by "automate a prompt"?** For example:
   - Are you trying to use the AI attendance feature (camera-based)?
   - Are you trying to send automated SMS/communications?
   - Are you trying to schedule or trigger some automated workflow?
   - Is this related to the chat/messaging system?

2. **Which page/endpoint are you accessing when the error occurs?** (e.g., `/attendance/ai`, `/communication/sms/send`, etc.)

3. **Can you check the server error logs?** There should be `server_err.log` in your project directory that may contain the full traceback.

In the meantime, let me check the error logs and the middleware that handles errors to understand what might be failing:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\server_err.log",
  "limit": 100
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\server_err.log</path>
<type>file</type>
<content>
1: INFO:     Started server process [12920]
2: INFO:     Waiting for application startup.
3: 2026-08-28 13:37:19 [WARNING] churchweb: CRITICAL: SECRET_KEY is still the default placeholder! Change it in .env immediately.
4: 2026-08-28 13:37:19 [INFO] churchweb: SEED_ADMIN is not enabled � skipping default admin seed.
5: 2026-08-28 13:37:19 [INFO] churchweb: DB keep-alive started (pings every 4 min)
6: INFO:     Application startup complete.
7: INFO:     Uvicorn running on http://127.0.0.1:8040 (Press CTRL+C to quit)

(End of file - total 7 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\middleware.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\middleware.py</path>
<type>file</type>
<content>
1: import logging
2: import time
3: from fastapi import Request
4: from fastapi.responses import JSONResponse
5: from starlette.middleware.base import BaseHTTPMiddleware
6: 
7: logger = logging.getLogger("churchweb.middleware")
8: 
9: 
10: class ErrorHandlerMiddleware(BaseHTTPMiddleware):
11:     """Catch unhandled exceptions and return structured JSON errors."""
12: 
13:     async def dispatch(self, request: Request, call_next):
14:         start = time.time()
15:         try:
16:             response = await call_next(request)
17:             elapsed = time.time() - start
18:             if elapsed > 5.0:
19:                 logger.warning("Slow request: %s %s (%.1fs)", request.method, request.url.path, elapsed)
20:             return response
21:         except Exception as e:
22:             logger.exception("Unhandled error: %s %s -> %s", request.method, request.url.path, e)
23:             return JSONResponse(
24:                 status_code=500,
25:                 content={
26:                     "success": False,
27:                     "message": "Internal server error. Please try again later.",
28:                 },
29:             )

(End of file - total 29 lines)
</content>
```

---

## Assistant (Build · Big Pickle · 19.9s)

_Thinking:_

The error log is clean - only shows startup messages. The user hasn't triggered the error yet during this server session, or the logs were cleared. Let me look more closely at what "automate a prompt" might mean - perhaps they're referring to some AI-related feature, or maybe the automated attendance, or maybe the OCR scanning. Let me ask the user for clarification since I can't see the error in the logs.

The error log is clean — no errors have been captured yet in the current server session. 

Could you clarify what you mean by **"automate a prompt"**? Which feature or page are you trying to use when you get the 500 error? For example:

- **AI Attendance** (camera-based)?
- **OCR Book Scan** (scan membership book)?
- **SMS broadcast** / communication?
- Something else?

Also, please **reproduce the error** so it gets logged, then share the error details with me (either from the terminal output or `server_err.log`).

---

## User

on giving page when i ty to sent mpesa prompt to phone on render

---

## Assistant (Build · Big Pickle · 17.7s)

_Thinking:_

The user is getting an internal server error when trying to send an M-Pesa STK Push prompt from the giving page on their Render deployment. Let me investigate the giving routes, M-Pesa integration, and the frontend code for the giving page.

Let me investigate the M-Pesa STK Push flow — the giving routes, the mpesa client, and the frontend giving page.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\routes\\giving_routes.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\routes\giving_routes.py</path>
<type>file</type>
<content>
1: # =====================================================
2: # FINANCE ROUTES
3: # Kingdom Ways Church CMS
4: # PART 1
5: # =====================================================
6: 
7: from datetime import datetime, timezone
8: from uuid import uuid4
9: import json
10: import logging
11: import random
12: import string
13: 
14: from fastapi import APIRouter, Depends, HTTPException, Request
15: from sqlalchemy.orm import Session
16: from app.mpesa import stk_push as mpesa_stk_push, normalize_callback, MpesaError
17: from app.database import get_db
18: from app.models import Member, Giving, Transaction, GivingAccount
19: from app.dependencies import get_current_member
20: from app.ratelimit import rate_limit
21: from app.schema import (
22:     STKPushRequest,
23:     STKPushResponse,
24:     PaymentStatusResponse,
25:     GivingHistory,
26:     GivingHistoryResponse,
27:     GivingResponse,
28:     ReceiptResponse,
29:     MpesaCallbackResponse
30: )
31: 
32: router = APIRouter(
33:     prefix="/api/finance",
34:     tags=["Finance"]
35: )
36: 
37: logger = logging.getLogger(__name__)
38: 
39: 
40: # =====================================================
41: # STK PUSH
42: # =====================================================
43: 
44: @router.post(
45:     "/stk-push",
46:     response_model=STKPushResponse,
47:     dependencies=[
48:         Depends(rate_limit(max_requests=10, window_seconds=60, label="stk-push"))
49:     ],
50: )
51: async def stk_push(
52:     request: STKPushRequest,
53:     current_member: Member = Depends(get_current_member),
54:     db: Session = Depends(get_db)
55: ):
56:     """
57:     Initiate M-Pesa STK Push.
58: 
59:     Requires a valid logged-in member session. The member is resolved from the
60:     JWT, not from the request body, so a logged-in user cannot initiate a
61:     payment on behalf of another member.
62:     """
63: 
64:     member = (
65:         db.query(Member)
66:         .filter(Member.id == current_member.id)
67:         .first()
68:     )
69: 
70:     if not member:
71:         raise HTTPException(
72:             status_code=404,
73:             detail="Member not found"
74:         )
75: 
76:     validate_payment(request)
77: 
78:     account_type = (request.account_type or "paybill").strip().lower()
79:     if account_type not in ("paybill", "phone"):
80:         raise HTTPException(status_code=400, detail="Unsupported account type.")
81: 
82:     # Resolve the configured receiving account
83:     receiving_account = None
84:     if request.account_number:
85:         receiving_account = (
86:             db.query(GivingAccount)
87:             .filter(
88:                 GivingAccount.number == request.account_number,
89:                 GivingAccount.account_type == account_type,
90:                 GivingAccount.is_active == True,  # noqa: E712
91:             )
92:             .first()
93:         )
94: 
95:     # ---- PHONE account: display-only, record pending giving to pay manually ----
96:     if account_type == "phone":
97:         giving = Giving(
98:             member_id=member.id,
99:             phone_number=request.phone_number,
100:             category=request.category,
101:             amount=request.amount,
102:             status="Pending",
103:             reference=request.reference,
104:             safaricom_name=receiving_account.account_name if receiving_account else None,
105:             checkout_request_id=f"PHONE-{uuid4().hex[:20]}",
106:         )
107:         db.add(giving)
108:         db.commit()
109: 
110:         target = (
111:             receiving_account.number
112:             if receiving_account
113:             else (request.account_number or "")
114:         )
115: 
116:         return STKPushResponse(
117:             success=True,
118:             message=f"Pay {request.amount} to M-Pesa {account_type} {target} to complete your giving.",
119:             checkout_request_id="",
120:             merchant_request_id=None,
121:             customer_message=f"Pay to number {target} (Account: {receiving_account.account_name if receiving_account else 'Giving'}) "
122:             f"and confirm from your phone. Your giving will be recorded.",
123:         )
124: 
125:     # ---- PAYBILL account: real STK push ----
126:     shortcode = None
127:     account_ref = member.member_number
128:     if receiving_account:
129:         shortcode = receiving_account.number.strip()
130:         if shortcode.isdigit() and len(shortcode) == 5:
131:             account_ref = shortcode
132: 
133:     try:
134:         result = await mpesa_stk_push(
135:             phone=request.phone_number,
136:             amount=request.amount,
137:             account_reference=account_ref,
138:             transaction_desc=request.category,
139:             shortcode=shortcode,
140:         )
141:     except MpesaError as e:
142:         logger.error("STK push failed for member %s: %s", member.id, e)
143:         return STKPushResponse(
144:             success=False,
145:             message=str(e),
146:             checkout_request_id=None,
147:             merchant_request_id=None,
148:             customer_message=str(e),
149:         )
150:     except Exception as e:
151:         logger.exception("Unexpected STK push failure for member %s", member.id)
152:         return STKPushResponse(
153:             success=False,
154:             message="We couldn't initiate your M-Pesa request. Please try again.",
155:             checkout_request_id=None,
156:             merchant_request_id=None,
157:             customer_message="Unable to reach M-Pesa right now. Please try again.",
158:         )
159: 
160:     if result["success"]:
161:         giving = Giving(
162:             member_id=member.id,
163:             phone_number=request.phone_number,
164:             category=request.category,
165:             amount=request.amount,
166:             status="Pending",
167:             checkout_request_id=result["checkout_request_id"],
168:             merchant_request_id=result["merchant_request_id"],
169:             reference=request.reference
170:         )
171: 
172:         db.add(giving)
173: 
174:         try:
175:             db.flush()
176:             db.commit()
177:         except Exception as e:
178:             db.rollback()
179:             logger.error("STK push DB commit failed: %s: %s", type(e).__name__, e)
180:             # The prompt was sent to the phone, so the user may still pay.
181:             # Try to persist the record so it isn't lost.
182:             try:
183:                 fresh_giving = Giving(
184:                     member_id=member.id,
185:                     phone_number=request.phone_number,
186:                     category=request.category,
187:                     amount=request.amount,
188:                     status="Pending",
189:                     checkout_request_id=result["checkout_request_id"],
190:                     merchant_request_id=result["merchant_request_id"],
191:                     reference=request.reference,
192:                 )
193:                 db.add(fresh_giving)
194:                 db.commit()
195:             except Exception as e2:
196:                 db.rollback()
197:                 logger.error(
198:                     "STK push DB retry commit also failed: %s: %s",
199:                     type(e2).__name__, e2,
200:                 )
201: 
202:             return STKPushResponse(
203:                 success=True,
204:                 message=result["response_description"],
205:                 checkout_request_id=result["checkout_request_id"],
206:                 merchant_request_id=result["merchant_request_id"],
207:                 customer_message="Check your phone and complete the payment. "
208:                 "It may take a moment to appear in your history.",
209:             )
210: 
211:     return STKPushResponse(
212:         success=result["success"],
213:         message=result["response_description"],
214:         checkout_request_id=result["checkout_request_id"],
215:         merchant_request_id=result["merchant_request_id"],
216:         customer_message=result["customer_message"]
217:     )
218: 
219: 
220: # =====================================================
221: # PAYMENT STATUS (polling)
222: # =====================================================
223: 
224: STATUS_MESSAGES = {
225:     "Pending": "Waiting for payment confirmation.",
226:     "Processing": "Processing your payment.",
227:     "Success": "Payment completed successfully.",
228:     "Cancelled": "Payment was cancelled.",
229:     "Failed": "Payment failed."
230: }
231: 
232: 
233: @router.get(
234:     "/mpesa/status/{checkout_request_id}",
235:     response_model=PaymentStatusResponse
236: )
237: def payment_status(
238:     checkout_request_id: str,
239:     db: Session = Depends(get_db)
240: ):
241:     """
242:     Polled by the frontend after STK push to check
243:     whether the M-Pesa callback has landed yet.
244:     """
245: 
246:     giving = get_giving_by_checkout(checkout_request_id, db)
247: 
248:     return PaymentStatusResponse(
249:         success=giving.status == "Success",
250:         status=giving.status,
251:         result_code=None,
252:         message=STATUS_MESSAGES.get(
253:             giving.status, "Unknown payment status."
254:         ),
255:         receipt_number=giving.receipt_number,
256:         transaction_id=giving.transaction_id,
257:         mpesa_receipt=giving.mpesa_receipt,
258:         safaricom_name=giving.safaricom_name,
259:         phone=giving.phone_number,
260:         amount=giving.amount,
261:         category=giving.category,
262:         transaction_date=str(giving.transaction_date) if giving.transaction_date else None
263:     )
264: 
265: 
266: # =====================================================
267: # RECEIPT
268: # =====================================================
269: 
270: @router.get(
271:     "/receipt/{transaction_id}",
272:     response_model=ReceiptResponse
273: )
274: def get_receipt(
275:     transaction_id: str,
276:     db: Session = Depends(get_db)
277: ):
278:     """
279:     Returns receipt details for a confirmed payment.
280:     """
281: 
282:     giving = get_giving_by_transaction(transaction_id, db)
283: 
284:     if giving.status != "Success":
285:         raise HTTPException(
286:             status_code=400,
287:             detail="Receipt is not available until payment is confirmed."
288:         )
289: 
290:     member = get_member_or_404(giving.member_id, db)
291: 
292:     return ReceiptResponse(
293:         success=True,
294:         receipt_number=giving.receipt_number or "",
295:         transaction_id=giving.transaction_id,
296:         member_name=member.full_name,
297:         member_number=member.member_number or "",
298:         phone_number=giving.phone_number,
299:         category=giving.category,
300:         amount=giving.amount,
301:         mpesa_receipt=giving.mpesa_receipt,
302:         status=giving.status,
303:         created_at=giving.created_at,
304:         confirmed_at=giving.confirmed_at
305:     )
306: 
307: 
308: # =====================================================
309: # MEMBER GIVING HISTORY
310: # =====================================================
311: 
312: @router.get(
313:     "/member-history/{member_number}",
314:     response_model=GivingHistoryResponse
315: )
316: def member_history(
317:     member_number: str,
318:     current_member: Member = Depends(get_current_member),
319:     db: Session = Depends(get_db)
320: ):
321:     """
322:     All giving records for a member, most recent first.
323:     Members may only view their own history.
324:     """
325: 
326:     member = (
327:         db.query(Member)
328:         .filter(Member.member_number == member_number)
329:         .first()
330:     )
331: 
332:     if not member:
333:         raise HTTPException(
334:             status_code=404,
335:             detail="Member not found."
336:         )
337: 
338:     if member.id != current_member.id:
339:         raise HTTPException(
340:             status_code=403,
341:             detail="You are not allowed to view another member's giving history."
342:         )
343: 
344:     records = (
345:         db.query(Giving)
346:         .filter(Giving.member_id == member.id)
347:         .order_by(Giving.created_at.desc())
348:         .all()
349:     )
350: 
351:     # receipt_number can be NULL until a payment succeeds,
352:     # but the schema requires a str — coerce explicitly
353:     # rather than passing ORM objects straight through.
354:     history = [
355:         GivingHistory(
356:             id=g.id,
357:             receipt_number=g.receipt_number or "",
358:             category=g.category,
359:             amount=g.amount,
360:             phone_number=g.phone_number,
361:             reference=None,
362:             status=g.status,
363:             mpesa_receipt=g.mpesa_receipt,
364:             created_at=g.created_at,
365:             confirmed_at=g.confirmed_at
366:         )
367:         for g in records
368:     ]
369: 
370:     return GivingHistoryResponse(
371:         success=True,
372:         total=len(history),
373:         history=history
374:     )
375: 
376: 
377: # =====================================================
378: # M-PESA CALLBACK
379: # =====================================================
380: 
381: @router.post(
382:     "/mpesa-callback",
383:     response_model=MpesaCallbackResponse,
384:     dependencies=[
385:         Depends(rate_limit(max_requests=120, window_seconds=60, label="mpesa-callback"))
386:     ],
387: )
388: async def mpesa_callback(
389:     request: Request,
390:     db: Session = Depends(get_db)
391: ):
392:     """
393:     Safaricom Daraja STK Push callback.
394:     Safaricom retries this endpoint if it doesn't get
395:     a 200 response, so we always return one — even on
396:     empty/invalid bodies or internal errors.
397:     """
398: 
399:     # Log caller origin for security audit
400:     client_host = request.client.host if request.client else "unknown"
401:     logger.info("M-Pesa callback from IP: %s", client_host)
402: 
403:     raw_body = await request.body()
404: 
405:     if not raw_body:
406:         logger.warning("Empty M-Pesa callback body received")
407:         return MpesaCallbackResponse(
408:             success=False,
409:             message="Empty callback body."
410:         )
411: 
412:     try:
413:         callback_data = json.loads(raw_body)
414:     except json.JSONDecodeError:
415:         logger.warning(
416:             "Invalid JSON in M-Pesa callback body: %r", raw_body
417:         )
418:         return MpesaCallbackResponse(
419:             success=False,
420:             message="Invalid JSON in callback body."
421:         )
422: 
423:     parsed = normalize_callback(callback_data)
424: 
425:     giving = (
426:         db.query(Giving)
427:         .filter(
428:             Giving.checkout_request_id
429:             == parsed["checkout_request_id"]
430:         )
431:         .first()
432:     )
433: 
434:     if not giving:
435:         return MpesaCallbackResponse(
436:             success=False,
437:             message="Transaction not found."
438:         )
439: 
440:     if parsed["result_code"] == 0:
441: 
442:         giving.status = "Success"
443:         giving.mpesa_receipt = parsed["mpesa_receipt"]
444:         giving.transaction_date = parsed["transaction_date"]
445:         giving.confirmed_at = datetime.now(timezone.utc)
446: 
447:         if parsed.get("amount"):
448:             giving.amount = float(parsed["amount"])
449: 
450:         if not giving.transaction_id:
451:             giving.transaction_id = generate_transaction_id()
452: 
453:         if not giving.receipt_number:
454:             giving.receipt_number = generate_receipt_number(db)
455: 
456:     elif parsed["result_code"] == 1032:
457: 
458:         giving.status = "Cancelled"
459:         giving.confirmed_at = datetime.now(timezone.utc)
460: 
461:     else:
462: 
463:         giving.status = "Failed"
464:         giving.confirmed_at = datetime.now(timezone.utc)
465: 
466:     try:
467:         db.commit()
468:         db.refresh(giving)
469: 
470:     except Exception as e:
471:         db.rollback()
472:         logger.error(
473:             "CALLBACK DATABASE ERROR: %s: %s",
474:             type(e).__name__, str(e)
475:         )
476: 
477:         # Neon (serverless Postgres) can drop a connection or cold-start
478:         # between requests, causing a transient commit failure. Retry a
479:         # couple of times before giving up — but ALWAYS return 200 to
480:         # Safaricom per Daraja's contract so it does not retry a webhook
481:         # whose write already succeeded.
482:         for attempt in range(2):
483:             try:
484:                 db.commit()
485:                 db.refresh(giving)
486:                 return MpesaCallbackResponse(
487:                     success=True,
488:                     message="Callback processed.",
489:                 )
490:             except Exception as retry_err:
491:                 db.rollback()
492:                 logger.error(
493:                     "CALLBACK DB retry %d failed: %s: %s",
494:                     attempt + 1, type(retry_err).__name__, retry_err,
495:                 )
496: 
497:         return MpesaCallbackResponse(
498:             success=False,
499:             message="Internal error while processing callback."
500:         )
501: 
502:     return MpesaCallbackResponse(
503:         success=True,
504:         message="Callback processed."
505:     )
506: 
507: 
508: # =====================================================
509: # HEALTH CHECK
510: # =====================================================
511: 
512: @router.get("/health")
513: def finance_health():
514:     return {
515:         "success": True,
516:         "service": "Finance API",
517:         "status": "Running",
518:         "time": datetime.now(timezone.utc)
519:     }
520: 
521: 
522: # =====================================================
523: # RECEIPT NUMBER
524: # Example:
525: # KWC-RCP-2026-000001
526: # =====================================================
527: 
528: def generate_receipt_number(db: Session) -> str:
529:     year = datetime.now().year
530:     total = db.query(Giving).count() + 1
531:     return f"KWC-RCP-{year}-{total:06d}"
532: 
533: 
534: # =====================================================
535: # INTERNAL TRANSACTION ID
536: # =====================================================
537: 
538: def generate_transaction_id() -> str:
539:     return str(uuid4())
540: 
541: 
542: # =====================================================
543: # RANDOM REFERENCE
544: # =====================================================
545: 
546: def generate_reference(length: int = 8) -> str:
547:     chars = string.ascii_uppercase + string.digits
548:     return "".join(
549:         random.choice(chars)
550:         for _ in range(length)
551:     )
552: 
553: 
554: # =====================================================
555: # FIND MEMBER
556: # =====================================================
557: 
558: def get_member_or_404(
559:     member_id: int,
560:     db: Session
561: ):
562:     member = (
563:         db.query(Member)
564:         .filter(Member.id == member_id)
565:         .first()
566:     )
567: 
568:     if not member:
569:         raise HTTPException(
570:             status_code=404,
571:             detail="Member not found."
572:         )
573: 
574:     return member
575: 
576: 
577: # =====================================================
578: # FIND GIVING (by checkout request id)
579: # =====================================================
580: 
581: def get_giving_by_checkout(
582:     checkout_request_id: str,
583:     db: Session
584: ):
585:     giving = (
586:         db.query(Giving)
587:         .filter(
588:             Giving.checkout_request_id == checkout_request_id
589:         )
590:         .first()
591:     )
592: 
593:     if not giving:
594:         raise HTTPException(
595:             status_code=404,
596:             detail="Transaction not found."
597:         )
598: 
599:     return giving
600: 
601: 
602: # =====================================================
603: # FIND RECEIPT (by transaction id)
604: # =====================================================
605: 
606: def get_giving_by_transaction(
607:     transaction_id: str,
608:     db: Session
609: ):
610:     giving = (
611:         db.query(Giving)
612:         .filter(
613:             Giving.transaction_id == transaction_id
614:         )
615:         .first()
616:     )
617: 
618:     if not giving:
619:         raise HTTPException(
620:             status_code=404,
621:             detail="Receipt not found."
622:         )
623: 
624:     return giving
625: 
626: 
627: # =====================================================
628: # VALIDATE PAYMENT
629: # =====================================================
630: 
631: def validate_payment(
632:     request: STKPushRequest
633: ):
634:     if request.amount <= 0:
635:         raise HTTPException(
636:             status_code=400,
637:             detail="Amount must be greater than zero."
638:         )
639: 
640:     if request.category.strip() == "":
641:         raise HTTPException(
642:             status_code=400,
643:             detail="Category is required."
644:         )
645: 
646:     phone = request.phone_number.strip()
647: 
648:     if not (
649:         phone.startswith("254")
650:         or phone.startswith("07")
651:         or phone.startswith("01")
652:     ):
653:         raise HTTPException(
654:             status_code=400,
655:             detail="Invalid phone number."
656:         )
657: 
658:     return True
659: 
660: 
661: # =====================================================
662: # ADMIN FINANCE DASHBOARD ENDPOINTS
663: # =====================================================
664: 
665: from app.dependencies import get_current_admin
666: 
667: 
668: @router.get("/accounts")
669: def get_accounts(
670:     current_admin = Depends(get_current_admin),
671:     db: Session = Depends(get_db)
672: ):
673:     transactions = db.query(Transaction).all()
674: 
675:     accounts = {
676:         "main": {"name": "Main Account", "balance": 0},
677:         "bank": {"name": "Bank Account", "balance": 0},
678:         "cash": {"name": "Cash", "balance": 0},
679:         "mpesa": {"name": "M-Pesa", "balance": 0},
680:         "petty": {"name": "Petty Cash", "balance": 0},
681:     }
682: 
683:     for tx in transactions:
684:         key = tx.account_key or "main"
685:         if key in accounts:
686:             if tx.tx_type == "income":
687:                 accounts[key]["balance"] += tx.amount
688:             else:
689:                 accounts[key]["balance"] -= tx.amount
690: 
691:     return {"success": True, "accounts": accounts}
692: 
693: 
694: @router.get("/transactions")
695: def get_transactions(
696:     current_admin = Depends(get_current_admin),
697:     db: Session = Depends(get_db)
698: ):
699:     transactions = (
700:         db.query(Transaction)
701:         .order_by(Transaction.created_at.desc())
702:         .limit(200)
703:         .all()
704:     )
705: 
706:     return {
707:         "success": True,
708:         "transactions": [
709:             {
710:                 "tx_id": tx.id,
711:                 "tx_date": tx.created_at.strftime("%Y-%m-%d %H:%M") if tx.created_at else "",
712:                 "tx_type": tx.tx_type,
713:                 "category": tx.category or "",
714:                 "account_key": tx.account_key or "main",
715:                 "amount": str(tx.amount),
716:                 "tx_status": tx.status,
717:                 "description": tx.description or "",
718:             }
719:             for tx in transactions
720:         ]
721:     }
722: 
723: 
724: @router.post("/transaction")
725: async def create_transaction(
726:     request: Request,
727:     current_admin = Depends(get_current_admin),
728:     db: Session = Depends(get_db)
729: ):
730:     body = await request.json()
731: 
732:     tx_payload = body.get("txPayload", body)
733: 
734:     tx = Transaction(
735:         tx_type=tx_payload.get("type", "income"),
736:         category=tx_payload.get("category", ""),
737:         description=tx_payload.get("desc", ""),
738:         account_key=tx_payload.get("account", "main"),
739:         amount=float(tx_payload.get("amount", 0)),
740:         status="confirmed",
741:         created_by=current_admin.id,
742:     )
743: 
744:     db.add(tx)
745:     db.commit()
746:     db.refresh(tx)
747: 
748:     return {"success": True, "tx_id": tx.id}
749: 
750: 
751: @router.put("/transaction/edit")
752: async def edit_transaction(
753:     request: Request,
754:     current_admin = Depends(get_current_admin),
755:     db: Session = Depends(get_db)
756: ):
757:     body = await request.json()
758: 
759:     tx_id = body.get("tx_id")
760:     if not tx_id:
761:         return {"success": False, "error": "Transaction ID required."}
762: 
763:     tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
764:     if not tx:
765:         return {"success": False, "error": "Transaction not found."}
766: 
767:     updates = body.get("txPayload", body)
768:     if "type" in updates:
769:         tx.tx_type = updates["type"]
770:     if "category" in updates:
771:         tx.category = updates["category"]
772:     if "desc" in updates:
773:         tx.description = updates["desc"]
774:     if "account" in updates:
775:         tx.account_key = updates["account"]
776:     if "amount" in updates:
777:         tx.amount = float(updates["amount"])
778: 
779:     db.commit()
780: 
781:     return {"success": True}

(End of file - total 781 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\mpesa.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\mpesa.py</path>
<type>file</type>
<content>
1: import base64
2: import logging
3: from datetime import datetime, timezone, timedelta
4: import httpx
5: 
6: from app.config import settings
7: 
8: logger = logging.getLogger(__name__)
9: 
10: BASE_URL = (
11:     "https://sandbox.safaricom.co.ke"
12:     if settings.MPESA_ENV == "sandbox"
13:     else "https://api.safaricom.co.ke"
14: )
15: 
16: 
17: class MpesaError(Exception):
18:     """Raised for any M-Pesa API failure with a user-safe message."""
19: 
20: 
21: def _check_config() -> None:
22:     """Fail fast with a clear message when M-Pesa credentials are missing."""
23:     missing = [
24:         name
25:         for name, value in (
26:             ("consumer key", settings.MPESA_CONSUMER_KEY),
27:             ("consumer secret", settings.MPESA_CONSUMER_SECRET),
28:             ("shortcode", settings.MPESA_SHORTCODE),
29:             ("passkey", settings.MPESA_PASSKEY),
30:             ("callback url", settings.MPESA_CALLBACK_URL),
31:         )
32:         if not value
33:     ]
34:     if missing:
35:         raise MpesaError(
36:             "M-Pesa is not fully configured on the server "
37:             f"(missing: {', '.join(missing)}). Please contact the church office."
38:         )
39: 
40: 
41: async def get_access_token() -> str:
42:     """
43:     Requests a fresh OAuth token from Daraja.
44:     Valid for about 1 hour — call this fresh for every STK Push.
45:     Raises MpesaError on any failure so callers can show a friendly message.
46:     """
47:     _check_config()
48: 
49:     url = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
50: 
51:     try:
52:         async with httpx.AsyncClient(timeout=15) as client:
53:             response = await client.get(
54:                 url,
55:                 auth=(
56:                     settings.MPESA_CONSUMER_KEY,
57:                     settings.MPESA_CONSUMER_SECRET
58:                 )
59:             )
60:     except httpx.TimeoutException:
61:         logger.error("M-Pesa token request timed out")
62:         raise MpesaError(
63:             "M-Pesa service timed out. Please try again in a moment."
64:         )
65:     except httpx.HTTPError as e:
66:         logger.error("M-Pesa token request network error: %s", e)
67:         raise MpesaError(
68:             "Could not reach the M-Pesa service. Please try again later."
69:         )
70: 
71:     if response.status_code != 200:
72:         logger.error(
73:             "M-Pesa token request failed: HTTP %s - %s",
74:             response.status_code, response.text[:200],
75:         )
76:         raise MpesaError(
77:             "M-Pesa authorization failed. The configured credentials may be "
78:             "invalid. Please contact the church office."
79:         )
80: 
81:     try:
82:         data = response.json()
83:     except ValueError:
84:         logger.error("M-Pesa token response was not valid JSON")
85:         raise MpesaError("Received an invalid response from M-Pesa. Try again.")
86: 
87:     token = data.get("access_token")
88:     if not token:
89:         logger.error("M-Pesa token response missing access_token: %s", data)
90:         raise MpesaError("M-Pesa did not grant access. Try again later.")
91: 
92:     return token
93: 
94: 
95: def generate_password(timestamp: str, shortcode: str = None) -> str:
96:     """
97:     Daraja requires Base64(Shortcode + Passkey + Timestamp).
98:     Uses the env shortcode by default, or an override shortcode.
99:     """
100:     sc = shortcode or settings.MPESA_SHORTCODE
101:     raw = f"{sc}{settings.MPESA_PASSKEY}{timestamp}"
102: 
103:     return base64.b64encode(raw.encode()).decode()
104: 
105: 
106: def format_phone(phone: str) -> str:
107:     """
108:     Daraja expects phone numbers in 2547XXXXXXXX format.
109:     """
110: 
111:     phone = phone.strip().replace(" ", "")
112: 
113:     if phone.startswith("0"):
114:         phone = "254" + phone[1:]
115:     elif phone.startswith("+"):
116:         phone = phone[1:]
117: 
118:     return phone
119: 
120: 
121: async def stk_push(
122:     phone: str,
123:     amount: float,
124:     account_reference: str,
125:     transaction_desc: str,
126:     shortcode: str = None
127: ) -> dict:
128:     """
129:     Sends an STK Push request to the customer's phone.
130:     Returns a dict matching what giving_routes.py expects.
131:     """
132:     sc = shortcode or settings.MPESA_SHORTCODE
133: 
134:     token = await get_access_token()
135: 
136:     timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
137:     password = generate_password(timestamp, sc)
138:     formatted_phone = format_phone(phone)
139: 
140:     payload = {
141:         "BusinessShortCode": sc,
142:         "Password": password,
143:         "Timestamp": timestamp,
144:         "TransactionType": "CustomerPayBillOnline",
145:         "Amount": int(amount),
146:         "PartyA": formatted_phone,
147:         "PartyB": sc,
148:         "PhoneNumber": formatted_phone,
149:         "CallBackURL": settings.MPESA_CALLBACK_URL,
150:         "AccountReference": account_reference,
151:         "TransactionDesc": transaction_desc
152:     }
153: 
154:     headers = {
155:         "Authorization": f"Bearer {token}",
156:         "Content-Type": "application/json"
157:     }
158: 
159:     url = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"
160: 
161:     try:
162:         async with httpx.AsyncClient(timeout=30) as client:
163:             response = await client.post(url, json=payload, headers=headers)
164:     except httpx.TimeoutException:
165:         logger.error("M-Pesa STK push request timed out")
166:         raise MpesaError(
167:             "The M-Pesa request timed out. Please try again in a moment."
168:         )
169:     except httpx.HTTPError as e:
170:         logger.error("M-Pesa STK push network error: %s", e)
171:         raise MpesaError(
172:             "Could not reach the M-Pesa service. Please try again later."
173:         )
174: 
175:     try:
176:         data = response.json()
177:     except ValueError:
178:         logger.error(
179:             "M-Pesa STK push returned HTTP %s with non-JSON body: %s",
180:             response.status_code, response.text[:200],
181:         )
182:         raise MpesaError(
183:             "Received an invalid response from M-Pesa. Please try again."
184:         )
185: 
186:     return {
187:         "success": data.get("ResponseCode") == "0",
188:         "response_description": data.get("ResponseDescription", ""),
189:         "checkout_request_id": data.get("CheckoutRequestID"),
190:         "merchant_request_id": data.get("MerchantRequestID"),
191:         "customer_message": data.get("CustomerMessage", "")
192:     }
193: 
194: 
195: def normalize_callback(callback_data: dict) -> dict:
196:     """
197:     Flattens Safaricom's nested callback payload into a
198:     simple dict for giving_routes.py to consume.
199:     """
200: 
201:     stk_callback = (
202:         callback_data
203:         .get("Body", {})
204:         .get("stkCallback", {})
205:     )
206: 
207:     result_code = stk_callback.get("ResultCode")
208:     checkout_request_id = stk_callback.get("CheckoutRequestID")
209: 
210:     parsed = {
211:         "checkout_request_id": checkout_request_id,
212:         "result_code": result_code,
213:         "mpesa_receipt": None,
214:         "transaction_date": None,
215:         "amount": None,
216:         "phone_number": None
217:     }
218: 
219:     if result_code == 0:
220: 
221:         items = (
222:             stk_callback
223:             .get("CallbackMetadata", {})
224:             .get("Item", [])
225:         )
226: 
227:         for item in items:
228: 
229:             name = item.get("Name")
230:             value = item.get("Value")
231: 
232:             if name == "MpesaReceiptNumber":
233:                 parsed["mpesa_receipt"] = value
234:             elif name == "TransactionDate":
235:                 parsed["transaction_date"] = _parse_mpesa_date(value)
236:             elif name == "Amount":
237:                 parsed["amount"] = value
238:             elif name == "PhoneNumber":
239:                 parsed["phone_number"] = str(value) if value else None
240: 
241:     return parsed
242: 
243: 
244: def _parse_mpesa_date(value):
245:     """
246:     Safaricom sends TransactionDate as YYYYMMDDHHMMSS (local time, EAT).
247:     Convert to an aware datetime so it can be stored in a DateTime column.
248:     Returns None on any unexpected value instead of crashing the callback.
249:     """
250:     if not value:
251:         return None
252: 
253:     try:
254:         raw = str(value).strip()
255:         if not raw.isdigit():
256:             return None
257:         # Safaricom timestamp is local East Africa Time (EAT = UTC+3).
258:         local = datetime.strptime(raw, "%Y%m%d%H%M%S")
259:         return local.replace(tzinfo=timezone(timedelta(hours=3)))
260:     except (ValueError, TypeError):
261:         logger.warning("Unparseable M-Pesa transaction date: %r", value)
262:         return None

(End of file - total 262 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\config.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\config.py</path>
<type>file</type>
<content>
1: from dotenv import load_dotenv
2: import os
3: 
4: load_dotenv()
5: 
6: # ===========================================
7: # DATABASE CONFIGURATION
8: # Supports both PostgreSQL and SQLite
9: # ===========================================
10: 
11: DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./church_cms.db")
12: 
13: # Auto-detect database type from URL
14: DATABASE_TYPE = "postgresql" if DATABASE_URL.startswith("postgresql") else "sqlite"
15: 
16: # ===========================================
17: # SECURITY
18: # ===========================================
19: 
20: SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_long_random_secret_key")
21: ALGORITHM = os.getenv("ALGORITHM", "HS256")
22: ACCESS_TOKEN_EXPIRE_MINUTES = int(
23:     os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 180)
24: )
25: 
26: # ===========================================
27: # CORS
28: # ===========================================
29: 
30: CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:8000").split(",")
31: 
32: # ===========================================
33: # M-PESA (Sandbox)
34: # ===========================================
35: 
36: MPESA_ENV = os.getenv("MPESA_ENV", "sandbox")
37: MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "")
38: MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "")
39: MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "")
40: MPESA_PASSKEY = os.getenv("MPESA_PASSKEY", "")
41: MPESA_CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL", "")
42: MPESA_CALLBACK_SECRET = os.getenv("MPESA_CALLBACK_SECRET", "")
43: 
44: # ===========================================
45: # CLOUDINARY IMAGE HOSTING + CDN
46: # Uploads go to Cloudinary when configured (free tier).
47: # Falls back to local disk otherwise (local dev).
48: # ===========================================
49: CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
50: CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
51: CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
52: CLOUDINARY_FOLDER = os.getenv(
53:     "CLOUDINARY_FOLDER", "churchweb"
54: ).strip("/")
55: 
56: 
57: class Settings:
58:     DATABASE_URL = DATABASE_URL
59:     DATABASE_TYPE = DATABASE_TYPE
60:     SECRET_KEY = SECRET_KEY
61:     ALGORITHM = ALGORITHM
62:     ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES
63: 
64:     MPESA_ENV = MPESA_ENV
65:     MPESA_CONSUMER_KEY = MPESA_CONSUMER_KEY
66:     MPESA_CONSUMER_SECRET = MPESA_CONSUMER_SECRET
67:     MPESA_SHORTCODE = MPESA_SHORTCODE
68:     MPESA_PASSKEY = MPESA_PASSKEY
69:     MPESA_CALLBACK_URL = MPESA_CALLBACK_URL
70:     MPESA_CALLBACK_SECRET = MPESA_CALLBACK_SECRET
71: 
72:     CORS_ORIGINS = CORS_ORIGINS
73: 
74:     CLOUDINARY_CLOUD_NAME = CLOUDINARY_CLOUD_NAME
75:     CLOUDINARY_API_KEY = CLOUDINARY_API_KEY
76:     CLOUDINARY_API_SECRET = CLOUDINARY_API_SECRET
77: 
78: 
79: settings = Settings()

(End of file - total 79 lines)
</content>
```

---

## Assistant (Build · Big Pickle · 85.9s)

_Thinking:_

Now let me look at the frontend giving page and the dependencies (auth) to understand the full flow. The STK Push endpoint requires `get_current_member` dependency. Let me check if the issue might be with authentication or with the M-Pesa configuration on Render.

Let me also check the dependencies and the frontend code.

Now let me check the authentication dependency and the frontend giving page to trace the full flow:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\dependencies.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\dependencies.py</path>
<type>file</type>
<content>
1: from fastapi import Depends, HTTPException
2: from fastapi.security import OAuth2PasswordBearer
3: from jose import JWTError, jwt
4: from sqlalchemy.orm import Session
5: 
6: from app.config import SECRET_KEY, ALGORITHM
7: from app.database import get_db
8: from app.models import Admin, Member
9: 
10: 
11: oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")
12: 
13: def get_current_admin(
14:     token: str = Depends(oauth2_scheme),
15:     db: Session = Depends(get_db)
16: ):
17:     credentials_exception = HTTPException(
18:         status_code=401,
19:         detail="Could not validate credentials"
20:     )
21: 
22:     try:
23:         payload = jwt.decode(
24:             token,
25:             SECRET_KEY,
26:             algorithms=[ALGORITHM]
27:         )
28: 
29:         admin_id = payload.get("sub")
30:         role = payload.get("role", "admin")
31: 
32:         if admin_id is None:
33:             raise credentials_exception
34: 
35:     except JWTError:
36:         raise credentials_exception
37: 
38:     admin = (
39:         db.query(Admin)
40:         .filter(Admin.id == int(admin_id))
41:         .first()
42:     )
43: 
44:     if admin is None:
45:         raise credentials_exception
46: 
47:     return admin
48: 
49: 
50: # ==========================================
51: # MEMBER AUTH
52: # ==========================================
53: 
54: oauth2_member_scheme = OAuth2PasswordBearer(tokenUrl="/member/login", auto_error=False)
55: 
56: def get_current_member(
57:     token: str = Depends(oauth2_member_scheme),
58:     db: Session = Depends(get_db)
59: ):
60:     credentials_exception = HTTPException(
61:         status_code=401,
62:         detail="Could not validate member credentials"
63:     )
64: 
65:     if token is None:
66:         raise credentials_exception
67: 
68:     try:
69:         payload = jwt.decode(
70:             token,
71:             SECRET_KEY,
72:             algorithms=[ALGORITHM]
73:         )
74: 
75:         member_id = payload.get("sub")
76:         role = payload.get("role", "member")
77: 
78:         if member_id is None or role != "member":
79:             raise credentials_exception
80: 
81:     except JWTError:
82:         raise credentials_exception
83: 
84:     member = (
85:         db.query(Member)
86:         .filter(Member.id == int(member_id))
87:         .first()
88:     )
89: 
90:     if member is None:
91:         raise credentials_exception
92: 
93:     return member

(End of file - total 93 lines)
</content>
```

**Tool: task**

**Input:**
```json
{
  "description": "Find giving frontend code",
  "prompt": "In the churchweb project at C:\\Users\\Doublem Mickaelz\\churchweb, find and read the frontend files related to the giving/offering page. Look in the `public/` directory for files like `offering.html`, `donations.html`, or similar. Read the JavaScript that handles the STK push / M-Pesa payment flow — specifically the function that calls `/api/finance/stk-push`. Return the full content of the relevant JS code that initiates the STK push request.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_f92c0c0e7ffe1k3rZWOfR9AbkI" state="completed">
<task_result>
Here are my complete findings.

---

## Giving/Offering Page — Frontend Files

There are **three** frontend files for the giving/offering page in the `public/` directory:

| File | Absolute Path |
|---|---|
| HTML | `C:\Users\Doublem Mickaelz\churchweb\public\offerings.html` |
| JavaScript | `C:\Users\Doublem Mickaelz\churchweb\public\offering.js` |
| CSS | `C:\Users\Doublem Mickaelz\churchweb\public\offering.css` |

The HTML file loads the JS via `<script src="offering.js?v=3"></script>` (line 850 of `offerings.html`).

There is also an admin-facing **donations** page at `C:\Users\Doublem Mickaelz\churchweb\public\donations.html` (with `donations.css`), which displays giving accounts and M-Pesa balances but does not contain STK push logic itself.

---

## The STK Push / M-Pesa Payment Flow in `offering.js`

The file is 3285 lines long and is structured in parts. The entire payment initiation lives in the file at `C:\Users\Doublem Mickaelz\churchweb\public\offering.js`. Below is the full relevant code, organized by section:

### 1. Configuration (line 12-14)

```js
const API = "";
const API_BASE = "/api/finance";
```

So the STK push endpoint resolves to `/api/finance/stk-push`.

### 2. Payment Object (lines 95-131)

```js
// PAYMENT OBJECT
let payment = {
    member_id:       null,
    member_number:   "",
    member_name:     "",
    registered_phone:"",
    phone_used:      "",
    amount:          0,
    category:        "",
    account_type:    "",
    account_number:  "",
    notes:           "",
    transaction_id:  "",
    checkout_request_id: "",
    mpesa_receipt:   "",
    safaricom_name:  "",
    status:          "Pending"
};
```

### 3. Phone Resolution (lines 401-417)

```js
function getPaymentPhone(){
    if(
        useDifferentPhone.checked &&
        optionalPhone.value.trim() !== ""
    ){
        return optionalPhone.value.trim();
    }
    return currentMember.phone;
}
```

### 4. Validation (lines 1120-1202)

```js
function validatePayment() {
    payment.amount = Number(amount.value);
    payment.notes = notes.value.trim();
    payment.phone_used = normalizePhone(getPaymentPhone());

    if (!payment.category) {
        showToast("Please select a giving category.", "error");
        return false;
    }
    if (givingAccount && !givingAccount.value) {
        showToast("Please select a giving account.", "error");
        givingAccount.focus();
        return false;
    }
    onGivingAccountChange();
    if (!payment.amount || payment.amount <= 0) {
        showToast("Enter a valid amount.", "error");
        amount.focus();
        return false;
    }
    if (!validPhone(payment.phone_used)) {
        showToast("Invalid M-Pesa phone number.", "error");
        optionalPhone.focus();
        return false;
    }
    return true;
}
```

### 5. Form Submit -> Confirmation Modal -> STK Push Trigger (lines 1249-1289)

```js
// FORM SUBMIT
if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
        e.preventDefault();
        openConfirmationModal();
    });
}

// CANCEL BUTTON
if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        closeConfirmationModal();
    });
}

// CONFIRM BUTTON
if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
        closeConfirmationModal();
        await requestSTKPush();   // <--- triggers the STK push
    });
}
```

### 6. **The Core STK Push Function** (lines 1628-1821)

```js
// POLLING VARIABLES
let pollingTimer = null;
const POLLING_INTERVAL = 5000;
const MAX_POLLING_ATTEMPTS = 60;
let pollingAttempts = 0;

// ======================================================
// REQUEST STK PUSH
// ======================================================

async function requestSTKPush() {

    payBtn.disabled = true;
    payBtn.classList.add("loading");
    showWaitingCard();
    updateWaitingMessage("Sending M-Pesa request...");

    try {
        const response = await fetch(
            `${API_BASE}/stk-push`,            // POST /api/finance/stk-push
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": getMemberBearer()
                },
                body: JSON.stringify({
                    member_id:      payment.member_id,
                    phone_number:   payment.phone_used,
                    amount:         payment.amount,
                    category:       payment.category,
                    reference:      payment.notes,
                    account_type:   payment.account_type,
                    account_number: payment.account_number
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            let message =
                (result && result.customer_message) ||
                (result && result.detail) ||
                result.message ||
                "Unable to initiate payment.";
            if (Array.isArray(message)) {
                const parts = message.map(m => m && m.msg);
                message = parts.filter(Boolean).join("; ") ||
                    "The payment request is invalid.";
            }
            throw new Error(message);
        }

        if (result && result.success === false) {
            throw new Error(
                result.message ||
                result.customer_message ||
                "The payment could not be initiated."
            );
        }

        payment.checkout_request_id =
            result.checkout_request_id || "";
        payment.transaction_id = "";
        payment.status = "Pending";
        saveActivePayment();

        // ---- PHONE account: no STK push / no polling ----
        if (payment.account_type === "phone") {
            updateWaitingMessage(
                result.customer_message ||
                result.message ||
                "Pay to the M-Pesa number shown to complete your giving."
            );
            showToast(
                result.customer_message || result.message ||
                "Pay to the M-Pesa number shown."
            );
            payBtn.disabled = false;
            payBtn.classList.remove("loading");
            return;
        }

        showToast("M-Pesa prompt sent successfully.");
        updateWaitingMessage("Check your phone and enter your M-Pesa PIN.");
        startPaymentPolling();

    } catch (error) {
        console.error(error);
        const isNetworkError =
            error instanceof TypeError ||
            (error && error.name === "TypeError");
        const message =
            isNetworkError ?
            "Unable to reach the server. Check your internet connection and try again." :
            (error.message || "Unable to send M-Pesa request.");
        paymentFailed(message);
        if (isNetworkError) {
            showRetryHint();
        }
    }
}
```

### 7. Payment Status Polling (lines 1827-2039)

```js
function startPaymentPolling() {
    stopPaymentPolling();
    pollingAttempts = 0;
    pollPaymentStatus();
    pollingTimer = setInterval(pollPaymentStatus, POLLING_INTERVAL);
}

function stopPaymentPolling() {
    if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
    }
}

async function pollPaymentStatus() {
    pollingAttempts++;
    try {
        const response = await fetch(
            `${API_BASE}/mpesa/status/${payment.checkout_request_id}`
        );
        const result = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                stopPaymentPolling();
                paymentFailed(
                    result.customer_message || result.detail ||
                    result.message || "Your payment could not be found..."
                );
                return;
            }
            throw new Error(
                result.customer_message || result.detail ||
                result.message || "Unable to verify payment."
            );
        }

        switch (result.status) {
            case "Pending":
                updateWaitingMessage("Waiting for PIN confirmation...");
                break;
            case "Processing":
                updateWaitingMessage("Processing your payment...");
                break;
            case "Success":
                payment.transaction_id = result.transaction_id || "";
                stopPaymentPolling();
                paymentSuccessful(result);
                break;
            case "Failed":
                stopPaymentPolling();
                paymentFailed(result.message || "Payment failed.");
                break;
            case "Cancelled":
                stopPaymentPolling();
                paymentFailed("Payment cancelled from phone.");
                break;
        }

        if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
            stopPaymentPolling();
            paymentFailed("Payment request timed out.");
        }

    } catch (error) {
        console.error(error);
        const isNetworkError =
            error instanceof TypeError ||
            (error && error.name === "TypeError");
        if (isNetworkError) {
            showToast("Connection lost. Retrying to check payment status...", "error");
            updateWaitingMessage("Connection lost. Keeping your payment request alive...");
            return;
        }
        stopPaymentPolling();
        paymentFailed(error.message || "Unable to verify payment.");
    }
}
```

### 8. Payment Success Handler (lines 2045-2092)

```js
function paymentSuccessful(result) {
    showSuccessCard();
    payBtn.disabled = false;
    payBtn.classList.remove("loading");
    payment.status = "Success";
    payment.transaction_id       = result.transaction_id;
    payment.checkout_request_id  = result.checkout_request_id;
    payment.mpesa_receipt        = result.mpesa_receipt;
    payment.safaricom_name       = result.safaricom_name;
    payment.phone_used           = result.phone;
    payment.amount               = result.amount;
    payment.category             = result.category;
    generateReceipt(result);
    showVerifiedThankYou(payment.member_name, payment.category);
    showToast("Payment received successfully.");
}
```

---

## Summary of the Flow

1. **User fills the form** on `offerings.html` -- selects category, amount, giving account, and phone number.
2. **Form submit** calls `openConfirmationModal()`, which runs `validatePayment()` to populate the `payment` object and show a confirmation modal.
3. **User clicks Confirm** -- the confirm button handler calls `requestSTKPush()`.
4. **`requestSTKPush()`** sends a `POST` to `/api/finance/stk-push` with the JSON body containing `member_id`, `phone_number`, `amount`, `category`, `reference`, `account_type`, and `account_number`, authenticated via `getMemberBearer()`.
5. On success, if the account type is `"phone"` (direct M-Pesa number), it simply shows a message to pay manually. Otherwise, it stores the `checkout_request_id` and calls `startPaymentPolling()`.
6. **`startPaymentPolling()`** polls `GET /api/finance/mpesa/status/{checkout_request_id}` every 5 seconds (up to 60 attempts / ~5 minutes), handling `Pending`, `Processing`, `Success`, `Failed`, and `Cancelled` statuses.
7. On `Success`, `paymentSuccessful()` updates the UI, generates a receipt, and shows a thank-you screen with the M-Pesa receipt number and Safaricom-verified name.
</task_result>
</task>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Doublem Mickaelz\\churchweb\\app\\schema.py"
}
```

**Output:**
```
<path>C:\Users\Doublem Mickaelz\churchweb\app\schema.py</path>
<type>file</type>
<content>
1: from pydantic import BaseModel
2: from datetime import date, datetime, time
3: from typing import Optional
4: 
5: 
6: class AdminLogin(BaseModel):
7:     username: str
8:     password: str
9: class AdminCreate(BaseModel):
10: 
11:     full_name: str
12: 
13:     username: str
14: 
15:     email: str
16: 
17:     phone: str | None = None
18: 
19:     password: str
20: 
21:     role: str = "admin"
22: 
23:     permissions: list[int] = []
24: 
25: class MemberRegister(BaseModel):
26:     full_name: str
27:     phone: str
28: 
29: class MemberActivate(BaseModel):
30:     member_number: str
31:     password: str
32:     confirm_password: str
33: 
34: class MemberLogin(BaseModel):
35:     full_name: str
36:     phone: str
37: 
38: class MemberProfileUpdate(BaseModel):
39:     gender: str | None = None
40:     date_of_birth: datetime | None = None
41:     email: str | None = None
42:     national_id: str | None = None
43:     occupation: str | None = None
44:     marital_status: str | None = None
45:     address: str | None = None
46:     emergency_contact: str | None = None
47:     emergency_phone: str | None = None
48:     ministry: str | None = None
49:     baptism_status: bool | None = False
50:     baptism_date: datetime | None = None
51: 
52: # ==========================================
53: # SERMON SCHEMAS
54: # ==========================================
55: 
56: 
57: class SermonCreate(BaseModel):
58: 
59:     title: str
60: 
61:     preacher: str
62: 
63:     bible_reading: Optional[str] = None
64: 
65:     description: Optional[str] = None
66: 
67:     sermon_date: Optional[date] = None
68: 
69:     thumbnail: Optional[str] = None
70: 
71:     video_file: Optional[str] = None
72: 
73:     youtube_url: Optional[str] = None
74: 
75:     notes_file: Optional[str] = None
76: 
77:     featured: bool = False
78: 
79: 
80: 
81: class SermonResponse(SermonCreate):
82: 
83:     id: int
84: 
85:     views: int
86: 
87:     created_at: datetime
88: 
89: 
90:     model_config = {"from_attributes": True}
91: 
92: 
93: class MemberLogout(BaseModel):
94:     member_id: int
95: 
96: # =====================================================
97: # GALLERY SCHEMAS
98: # =====================================================
99: 
100: 
101: class GalleryCreate(BaseModel):
102: 
103:     title: str
104: 
105:     description: Optional[str] = None
106: 
107:     category: Optional[str] = None
108: 
109:     event_date: Optional[date] = None
110: 
111: 
112: class GalleryResponse(BaseModel):
113: 
114:     id: int
115: 
116:     title: str
117: 
118:     description: Optional[str] = None
119: 
120:     category: Optional[str] = None
121: 
122:     image: str
123: 
124:     event_date: Optional[date] = None
125: 
126:     created_at: datetime
127: 
128:     model_config = {
129:         "from_attributes": True
130:     }
131: 
132: # ============================================
133: # EVENTS SCHEMAS
134: # Kingdom Ways Church CMS
135: # ============================================
136: 
137: 
138: # ============================================
139: # BASE EVENT SCHEMA
140: # ============================================
141: 
142: 
143: class EventBase(BaseModel):
144: 
145:     title: str
146: 
147:     subtitle: Optional[str] = None
148: 
149:     description: str
150: 
151:     category: Optional[str] = None
152: 
153:     speaker: Optional[str] = None
154: 
155:     host: Optional[str] = None
156: 
157:     bible_reading: Optional[str] = None
158: 
159: 
160: 
161:     # Date & Time
162: 
163:     start_date: date
164: 
165:     end_date: Optional[date] = None
166: 
167:     start_time: Optional[time] = None
168: 
169:     end_time: Optional[time] = None
170: 
171: 
172: 
173:     # Location
174: 
175:     venue: str
176: 
177:     maps_link: Optional[str] = None
178: 
179: 
180: 
181:     # Registration
182: 
183:     capacity: Optional[int] = None
184: 
185:     registration_required: bool = False
186: 
187:     registration_deadline: Optional[datetime] = None
188: 
189: 
190: 
191:     # Settings
192: 
193:     featured: bool = False
194: 
195:     public_event: bool = True
196: 
197:     allow_comments: bool = False
198: 
199:     send_notification: bool = False
200: 
201: 
202: 
203:     # Status
204: 
205:     status: str = "draft"
206: 
207: 
208: 
209: 
210: # ============================================
211: # CREATE EVENT
212: # ============================================
213: 
214: 
215: class EventCreate(EventBase):
216: 
217:     pass
218: 
219: 
220: 
221: 
222: # ============================================
223: # UPDATE EVENT
224: # ============================================
225: 
226: 
227: class EventUpdate(BaseModel):
228: 
229: 
230:     title: Optional[str] = None
231: 
232:     subtitle: Optional[str] = None
233: 
234:     description: Optional[str] = None
235: 
236:     category: Optional[str] = None
237: 
238:     speaker: Optional[str] = None
239: 
240:     host: Optional[str] = None
241: 
242:     bible_reading: Optional[str] = None
243: 
244: 
245: 
246:     start_date: Optional[date] = None
247: 
248:     end_date: Optional[date] = None
249: 
250:     start_time: Optional[time] = None
251: 
252:     end_time: Optional[time] = None
253: 
254: 
255: 
256:     venue: Optional[str] = None
257: 
258:     maps_link: Optional[str] = None
259: 
260: 
261: 
262:     capacity: Optional[int] = None
263: 
264:     registration_required: Optional[bool] = None
265: 
266:     registration_deadline: Optional[datetime] = None
267: 
268: 
269: 
270:     featured: Optional[bool] = None
271: 
272:     public_event: Optional[bool] = None
273: 
274:     allow_comments: Optional[bool] = None
275: 
276:     send_notification: Optional[bool] = None
277: 
278: 
279: 
280:     status: Optional[str] = None
281: 
282: 
283: 
284: 
285: # ============================================
286: # EVENT RESPONSE
287: # ============================================
288: 
289: 
290: class EventResponse(EventBase):
291: 
292:     id: int
293: 
294: 
295:     banner: Optional[str] = None
296: 
297:     attachment: Optional[str] = None
298: 
299: 
300:     created_by: Optional[int] = None
301: 
302: 
303:     created_at: datetime
304: 
305:     updated_at: Optional[datetime] = None
306: 
307: 
308: 
309:     model_config = {"from_attributes": True}
310: 
311: 
312: 
313: 
314: # ============================================
315: # EVENT LIST RESPONSE
316: # ============================================
317: 
318: 
319: class EventListResponse(BaseModel):
320: 
321:     success: bool
322: 
323:     message: Optional[str] = None
324: 
325:     events: list[EventResponse]
326: 
327: 
328: 
329: # ============================================
330: # EVENT REGISTRATION SCHEMA
331: # (Prepared for Part 7)
332: # ============================================
333: 
334: 
335: class EventRegistrationCreate(BaseModel):
336: 
337:     event_id: int
338: 
339:     member_id: int
340: 
341: # =====================================================
342: # GIVING SCHEMAS
343: # Kingdom Ways Church CMS
344: # =====================================================
345: 
346: class GivingCreate(BaseModel):
347:     member_id: int
348:     phone_number: str
349:     category: str
350:     amount: float
351:     reference: Optional[str] = None
352: 
353: 
354: # =====================================================
355: # STK PUSH REQUEST
356: # =====================================================
357: 
358: class STKPushRequest(BaseModel):
359:     member_id: int
360:     phone_number: str
361:     category: str
362:     amount: float
363:     reference: Optional[str] = None
364:     account_type: Optional[str] = "paybill"
365:     account_number: Optional[str] = None
366: 
367: 
368: # =====================================================
369: # GIVING RESPONSE
370: # =====================================================
371: 
372: class GivingResponse(BaseModel):
373:     success: bool
374:     message: str
375:     receipt_number: Optional[str] = None
376:     checkout_request_id: Optional[str] = None
377: 
378: 
379: # =====================================================
380: # GIVING HISTORY
381: # =====================================================
382: 
383: class GivingHistory(BaseModel):
384:     id: int
385:     receipt_number: str
386:     category: str
387:     amount: float
388:     phone_number: str
389:     reference: Optional[str] = None
390:     status: str
391:     mpesa_receipt: Optional[str] = None
392:     created_at: datetime
393:     confirmed_at: Optional[datetime] = None
394: 
395:     model_config = {"from_attributes": True}
396: 
397: 
398: # =====================================================
399: # GIVING HISTORY LIST
400: # =====================================================
401: 
402: class GivingHistoryResponse(BaseModel):
403:     success: bool
404:     total: int
405:     history: list[GivingHistory]
406: 
407: 
408: # =====================================================
409: # M-PESA CALLBACK
410: # =====================================================
411: 
412: class MpesaCallbackResponse(BaseModel):
413:     success: bool
414:     message: str
415: 
416: # =====================================================
417: # STK PUSH RESPONSE
418: # =====================================================
419: 
420: class STKPushResponse(BaseModel):
421:     success: bool
422:     message: str
423:     checkout_request_id: str | None = None
424:     merchant_request_id: str | None = None
425:     customer_message: str | None = None
426: 
427: 
428: # =====================================================
429: # PAYMENT STATUS RESPONSE
430: # =====================================================
431: 
432: class PaymentStatusResponse(BaseModel):
433:     success: bool
434:     status: str
435:     result_code: str | None = None
436:     message: str
437:     receipt_number: str | None = None
438:     transaction_id: str | None = None
439:     mpesa_receipt: str | None = None
440:     safaricom_name: str | None = None
441:     phone: str | None = None
442:     amount: float | None = None
443:     category: str | None = None
444:     transaction_date: str | None = None
445: 
446: 
447: # =====================================================
448: # RECEIPT RESPONSE
449: # =====================================================
450: 
451: class ReceiptResponse(BaseModel):
452:     success: bool
453:     receipt_number: str
454:     transaction_id: str
455:     member_name: str
456:     member_number: str
457:     phone_number: str
458:     category: str
459:     amount: float
460:     mpesa_receipt: str | None = None
461:     status: str
462:     created_at: datetime
463:     confirmed_at: datetime | None = None
464: 
465: 
466: # ==========================================================
467: # APPEND THIS BLOCK TO THE END OF app/schema.py
468: # (uses BaseModel / Optional / datetime, already imported
469: #  at the top of schema.py)
470: # ==========================================================
471: 
472: # =====================================================
473: # COMMUNICATION SCHEMAS
474: # Kingdom Ways Church CMS
475: # =====================================================
476: 
477: class MemberSummary(BaseModel):
478:     id: int
479:     full_name: str
480:     member_number: Optional[str] = None
481:     phone: str
482:     photo: Optional[str] = None
483:     online: bool = False
484: 
485:     model_config = {"from_attributes": True}
486: 
487: 
488: class MemberListResponse(BaseModel):
489:     members: list[MemberSummary]
490: 
491: 
492: class SMSSendRequest(BaseModel):
493:     members: list[int] = []          # explicit member ids; ignored if send_to_all=True
494:     send_to_all: bool = False
495:     category: str
496:     message: str
497: 
498: 
499: class InternalSendRequest(BaseModel):
500:     members: list[int] = []          # explicit member ids; ignored if send_to_all=True
501:     send_to_all: bool = False
502:     subject: str
503:     message: str
504:     priority: str = "normal"
505: 
506: 
507: class CommunicationSendResponse(BaseModel):
508:     success: bool
509:     message: str
510:     recipient_count: int = 0
511:     sent: int = 0
512:     failed: int = 0
513: 
514: 
515: class CommunicationHistoryItem(BaseModel):
516:     id: int
517:     type: str
518:     category: Optional[str] = None
519:     subject: Optional[str] = None
520:     message: str
521:     recipient_count: int
522:     status: str
523:     administrator: Optional[str] = None
524:     created_at: datetime
525: 
526:     model_config = {"from_attributes": True}
527: 
528: 
529: class CommunicationHistoryResponse(BaseModel):
530:     history: list[CommunicationHistoryItem]
531: 
532: 
533: class CommunicationStatisticsResponse(BaseModel):
534:     total_members: int
535:     sms_today: int
536:     internal_messages: int
537:     pending_delivery: int
538: 
539: 
540: class ChurchContactUpdate(BaseModel):
541:     phone: Optional[str] = None
542:     whatsapp: Optional[str] = None
543:     facebook: Optional[str] = None
544:     instagram: Optional[str] = None
545:     youtube: Optional[str] = None
546:     website: Optional[str] = None
547:     email: Optional[str] = None
548:     maps_link: Optional[str] = None
549:     office_hours: Optional[str] = None
550: 
551: 
552: class ChurchContactResponse(ChurchContactUpdate):
553:     id: int
554:     updated_at: Optional[datetime] = None
555: 
556:     model_config = {"from_attributes": True}
557: 
558: 
559: # =====================================================
560: # BOOK SCAN / OCR REVIEW SCHEMAS
561: # =====================================================
562: 
563: class ScannedContactOut(BaseModel):
564:     id: int
565:     full_name: Optional[str] = None
566:     phone: Optional[str] = None
567:     ministry: Optional[str] = None
568:     raw_line: Optional[str] = None
569:     confidence: Optional[str] = None
570:     status: str
571: 
572:     model_config = {"from_attributes": True}
573: 
574: 
575: class ScannedContactUpdate(BaseModel):
576:     full_name: Optional[str] = None
577:     phone: Optional[str] = None
578:     ministry: Optional[str] = None
579: 
580: 
581: class ScanBookResponse(BaseModel):
582:     success: bool
583:     message: str
584:     extracted: list[ScannedContactOut] = []
585: 
586: 
587: # ==========================================================
588: # CARD BACKGROUND SCHEMAS
589: # ==========================================================
590: 
591: class CardBackgroundOut(BaseModel):
592:     card_key: str
593:     image_url: Optional[str] = None
594:     updated_at: Optional[datetime] = None
595: 
596:     model_config = {"from_attributes": True}

(End of file - total 596 lines)
</content>
```

---

## Assistant (Build · Big Pickle)

---

