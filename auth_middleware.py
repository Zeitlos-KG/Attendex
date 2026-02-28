"""
Supabase authentication middleware for Flask API.

Verifies tokens by calling Supabase's /auth/v1/user endpoint directly.
This approach works regardless of JWT algorithm (HS256, RS256, etc.)
and is always in sync with Supabase's auth system.
"""
import os
import time
import requests
from functools import wraps
from flask import request, jsonify

# Try multiple env var name conventions (Render uses SUPABASE_URL, frontend uses NEXT_PUBLIC_*)
SUPABASE_URL = (
    os.getenv('SUPABASE_URL') or
    os.getenv('NEXT_PUBLIC_SUPABASE_URL') or
    ''
).rstrip('/')

SUPABASE_API_KEY = (
    os.getenv('SUPABASE_SERVICE_ROLE_KEY') or   # Highest privilege — set in Render
    os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or
    os.getenv('SUPABASE_ANON_KEY') or
    ''
)

# ── Token cache: token → (user_dict, expiry_timestamp) ──────────────────────
# Avoids a Supabase HTTP round-trip on every API call. TTL = 5 minutes.
_TOKEN_CACHE: dict = {}
_CACHE_TTL = 300  # seconds


def _get_cached(token: str):
    entry = _TOKEN_CACHE.get(token)
    if entry and time.time() < entry[1]:
        return entry[0]        # return cached user dict
    if token in _TOKEN_CACHE:
        del _TOKEN_CACHE[token]  # expired — remove
    return None


def _set_cached(token: str, user: dict):
    _TOKEN_CACHE[token] = (user, time.time() + _CACHE_TTL)
    # Prune if cache grows large
    if len(_TOKEN_CACHE) > 500:
        oldest = sorted(_TOKEN_CACHE, key=lambda t: _TOKEN_CACHE[t][1])[:100]
        for t in oldest:
            del _TOKEN_CACHE[t]


def verify_supabase_token(token: str):
    """
    Verify a Supabase access token by calling /auth/v1/user.
    Result is cached for 5 minutes to avoid repeated HTTP round-trips.
    Returns the user dict if valid, None if invalid/expired.
    """
    # Check cache first — avoids Supabase HTTP call on every API request
    cached = _get_cached(token)
    if cached is not None:
        return cached

    if not SUPABASE_URL:
        print("⚠️  SUPABASE_URL not set — cannot verify token")
        return None

    try:
        resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_API_KEY,
            },
            timeout=5,
        )
        if resp.status_code == 200:
            user = resp.json()
            _set_cached(token, user)   # cache for next requests
            return user
        print(f"⚠️  Token rejected by Supabase: {resp.status_code} {resp.text[:120]}")
        return None
    except Exception as e:
        print(f"⚠️  Token verification error: {e}")
        return None



def _extract_token(request):
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get('Authorization', '')
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return None


def require_auth(f):
    """
    Decorator: route requires a valid Supabase session.
    Sets request.user_id and request.user_email on success.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = _extract_token(request)
        if not token:
            return jsonify({'error': 'No authorization token provided'}), 401

        user_data = verify_supabase_token(token)
        if not user_data:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.user_id    = user_data.get('id')
        request.user_email = user_data.get('email')
        return f(*args, **kwargs)

    return decorated_function


def optional_auth(f):
    """
    Decorator: auth is optional.
    If a valid token is present, sets request.user_id / request.user_email.
    If absent or invalid, those attributes are simply not set.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = _extract_token(request)
        if token:
            user_data = verify_supabase_token(token)
            if user_data:
                request.user_id    = user_data.get('id')
                request.user_email = user_data.get('email')
        return f(*args, **kwargs)

    return decorated_function
