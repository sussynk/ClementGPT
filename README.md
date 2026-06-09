# ClementGPT

A chatbot powered by **Gemini 2.5 Flash**. Supports multiple chat sessions and file uploads (images, PDFs, text files).

---

## Quick start

```bash
git clone https://github.com/sussynk/ClementGPT.git
cd ClementGPT

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Add your GEMINI_API_KEY to .env

python app.py
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey

---

## Features

- Multiple independent chat sessions
- File upload support — images, PDFs, plain text, code files
- Markdown rendering in bot responses
- Mobile responsive

---

## Changelog

### Phase 4 *(upcoming)*
- GitHub Actions CI/CD pipeline with SAST and dependency CVE audit

---

### Phase 3 — Session security
- Added `SECRET_KEY` loaded from `.env` — app exits at startup if missing
- Added `config.py` with `DevelopmentConfig` and `ProductionConfig` — environment-aware settings
- Session cookies set with `httponly=True` and `samesite=Lax` — blocks XSS-based session theft and CSRF
- Capped chats per session at 20 — prevents unbounded server memory growth

### Phase 2 — Input validation & rate limiting
- Added rate limiting: 30 requests/min per IP on the chat endpoint
- Enforced 4000 character max on incoming messages — oversized input is rejected server-side
- Hardened system prompt to resist prompt injection and jailbreak attempts
- Bot responses are HTML-escaped before rendering — patched reflected XSS vector
- File uploads validated against allowed MIME type list and 10 MB size cap

### Phase 1 — Security hardening
- Added startup validation: app now exits immediately if `GEMINI_API_KEY` is missing or invalid
- Added `detect-secrets` pre-commit hook to block accidental credential commits
- Patched silent failure on bad API key — error is now surfaced at launch, not mid-request

### Phase 0 — Rewrite
- Migrated from single-session to multi-chat with per-browser session isolation
- Added file upload support (images, PDFs, text files, code files)
- Rebuilt frontend with sidebar chat list, attach button, and markdown rendering
- Removed auth pages — straight to the chatbot
- Added `.gitignore`, `.env.example`, `requirements.txt`
