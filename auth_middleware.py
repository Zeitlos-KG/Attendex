"""
Supabase JWT authentication middleware for Flask API.
"""
import jwt
import os
from functools import wraps
from flask import request, jsonify
import requests

# Supabase JWT configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://your-project.supabase.co')
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', '')  # Get from Supabase Settings → API

def get_supabase_jwt_secret():
    """Get Supabase JWT secret from environment or fetch from Supabase."""
    if SUPABASE_JWT_SECRET:
        return SUPABASE_JWT_SECRET
    
    # If not set, you can get it from Supabase Settings → API → JWT Secret
    # For now, return None and let verification fail gracefully
    return None

def verify_supabase_token(token):
    """
    Verify Supabase JWT token.
    Returns user data if valid, None if invalid.
    """
    try:
        # Get JWT secret
        secret = get_supabase_jwt_secret()
        if not secret:
            print("Warning: SUPABASE_JWT_SECRET not set!")
            return None
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            secret,
            algorithms=['HS256'],
            audience='authenticated'
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def require_auth(f):
    """
    Decorator to protect API routes.
    Expects Authorization: Bearer <token> header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization token provided'}), 401
        
        # Extract token from "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        token = parts[1]
        
        # Verify token
        user_data = verify_supabase_token(token)
        if not user_data:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user data to request context
        request.user_id = user_data.get('sub')
        request.user_email = user_data.get('email')
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """
    Decorator for routes where auth is optional.
    If token present, verifies it and adds user data to request.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            # Extract token
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                user_data = verify_supabase_token(token)
                
                if user_data:
                    request.user_id = user_data.get('sub')
                    request.user_email = user_data.get('email')
        
        return f(*args, **kwargs)
    
    return decorated_function
