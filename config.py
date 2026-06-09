import os


class Config:
    """Base config — shared across all environments."""

    # Phase 3 — SECRET_KEY must come from .env, never hardcoded.
    # Flask uses this to cryptographically sign cookies and session data.
    # If this leaks, an attacker can forge any session cookie.
    SECRET_KEY = os.getenv('SECRET_KEY')

    # Phase 3 — secure cookie flags
    # httponly: JS cannot read the cookie — blocks XSS-based session theft
    # samesite: cookie is not sent on cross-site requests — blocks CSRF
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # Phase 3 — cap how many chats a session can store
    MAX_CHATS_PER_SESSION = 20


class DevelopmentConfig(Config):
    """Local development — debug on, no HTTPS required."""
    DEBUG = True
    # secure=False so cookies work over plain HTTP locally
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    """Production — debug off, HTTPS required."""
    DEBUG = False
    # Phase 5 — secure=True forces cookie to HTTPS only
    SESSION_COOKIE_SECURE = True
