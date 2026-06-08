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

### Phase 2 *(upcoming)*
- Rate limiting on chat endpoint
- Input length validation
- XSS hardening on bot responses

---

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
