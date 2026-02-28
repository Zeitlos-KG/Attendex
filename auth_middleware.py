"""
Supabase authentication middleware for Flask API.

Verifies tokens by calling Supabase's /auth/v1/user endpoint directly.
This approach works regardless of JWT algorithm (HS256, RS256, etc.)
and is always in sync with Supabase's auth system.
"""
import os
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


def verify_supabase_token(token: str):
    """
    Verify a Supabase access token by calling /auth/v1/user.
    Returns the user dict if valid, None if invalid/expired.
    """
    if not SUPABASE_URL:
        print("⚠️  SUPABASE_URL not set — cannot verify token")
        return None

    try:
        print(f"🔑 Verifying token via {SUPABASE_URL}/auth/v1/user")
        resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_API_KEY,
            },
            timeout=5,
        )
        if resp.status_code == 200:
            return resp.json()   # {"id": "...", "email": "...", ...}
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
