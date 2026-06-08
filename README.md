# ClementGPT

A terminal-aesthetic chatbot powered by **Gemini 2.5 Flash** (free tier). Supports multiple concurrent chats and file uploads (images, PDFs, text files).

Built as a personal **DevSecOps learning project** — each git phase introduces a real vulnerability class and then fixes it.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/sussynk/ClementGPT.git
cd ClementGPT

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your API key
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 5. Run
flask run
# Open http://127.0.0.1:5000
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey

---

## Features

- Multiple independent chat sessions with persistent history
- File upload support: images, PDFs, plain text, code files
- Hacker-green terminal aesthetic
- Mobile responsive

---

## DevSecOps learning phases

| Phase | Topic | Status |
|-------|-------|--------|
| 0 | Core app — multi-chat, file upload | ✅ |
| 1 | Secrets management & pre-commit hooks | ✅ |
| 2 | Input validation, rate limiting, XSS hardening | 🔜 |
| 3 | Session security & secure cookie flags | 🔜 |
| 4 | CI/CD — GitHub Actions SAST + dependency audit | 🔜 |
| 5 | Production hardening — gunicorn, config split | 🔜 |

Each phase is a separate set of commits. The git log is the learning trail.

---

## Phase 1 — Secrets management

**Vulnerability:** accidentally committing `.env` (your real API key) to git. Once pushed, a key is compromised — bots scrape GitHub for them within seconds.

**What's in place:**
- `.env` is in `.gitignore` — it will never be staged
- `app.py` exits immediately at startup with a clear message if `GEMINI_API_KEY` is missing
- `.pre-commit-config.yaml` uses `detect-secrets` to scan every commit for leaked credentials

**Activate the pre-commit hook (one-time setup):**
```bash
pip install pre-commit detect-secrets
detect-secrets scan > .secrets.baseline   # create baseline of known non-secrets
pre-commit install                        # wire the hook into git
```

After this, every `git commit` will be scanned. If a secret is detected, the commit is blocked.

**If your key leaks:** rotate it immediately at https://aistudio.google.com/app/apikey — don't just delete the commit, because it lives in git history.
