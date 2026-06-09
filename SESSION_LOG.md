# ClementGPT — Session Log

A record of how this project started and where it is now.

---

## Where it started

Originally a **group assignment** (WEB1201/WEB2014) — a static multi-page website with:

- `index.html` — a chatbot UI with a hacker-green terminal aesthetic
- `auth.html` — a login/signup page with zero backend (just localStorage)
- `about.html` — team profiles page
- `script.js`, `style.css` — frontend only, no server

The "chatbot" sent messages to a Flask backend (`app.py`) using a single global `chat_history` list shared across all users. One Gemini API key, one conversation, no session isolation.

**Security state at the start:**
- `.env` file with real API key sitting in the repo
- `debug=True` in production
- Auth forms with no backend — `localStorage.getItem('isLoggedIn')` was the entire auth system
- Raw user input piped directly to the Gemini API with no validation
- No rate limiting, no input caps, no file validation
- `chat_history` global — every browser shared the same conversation

---

## What changed (this session)

### Phase 0 — Full rewrite
**Date:** June 2026

The group assignment shell was stripped and rebuilt as a real, solo-owned chatbot app.

- Dropped auth pages entirely — no login, no signup, straight to the chatbot
- Replaced the global `chat_history` with a per-browser server-side session store
- Added **multi-chat support** — sidebar with chat list, new chat button, delete chat, switch between chats
- Added **file upload** — images, PDFs, text files, code files sent to Gemini inline
- Added markdown rendering in bot responses (safe — HTML escaped before transform)
- Rebuilt `script.js` and `style.css` from scratch
- Added `requirements.txt`, `.gitignore`, `.env.example`

---

### Phase 1 — Secrets management
**Date:** June 2026

- App now **exits immediately at startup** if `GEMINI_API_KEY` is missing or invalid — no silent failures
- Added `.pre-commit-config.yaml` with `detect-secrets` — scans every staged file before a commit lands, blocks if credentials are detected
- `.env` locked out of git via `.gitignore`

---

### Phase 2 — Input validation & rate limiting
**Date:** June 2026

- Added **rate limiting** via `flask-limiter` — 30 requests/min per IP on `/chat`
- Server-side **message length cap** — messages over 4000 characters are rejected before hitting the API
- **File upload validation** — allowed MIME types only, 10 MB max size
- **Hardened system prompt** — resists prompt injection and jailbreak attempts
- **XSS patched** — bot responses are HTML-escaped before markdown rendering

---

## Current state

| Area | Before | Now |
|------|--------|-----|
| Auth | Fake localStorage auth | No auth — direct chatbot access |
| Chat sessions | Single global history | Per-browser multi-chat with sidebar |
| File support | None | Images, PDFs, text, code files |
| API key | Unvalidated, possibly exposed | Validated at startup, gitignored |
| Rate limiting | None | 30 req/min per IP |
| Input validation | None | 4000 char cap, MIME/size checks |
| XSS | Unprotected | HTML escaped before render |
| Prompt injection | One-liner system prompt | Hardened system prompt |
| Secret scanning | None | detect-secrets pre-commit hook |

---

## Phases still ahead

| Phase | Topic |
|-------|-------|
| 3 | Session security — `SECRET_KEY` from env, secure cookie flags |
| 4 | CI/CD — GitHub Actions SAST + dependency CVE audit |
| 5 | Production hardening — gunicorn, split config, deployment |
