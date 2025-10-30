# backend/utils/auth.py
from functools import wraps
from flask import request, jsonify
import jwt
import os

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check for 'Authorization' header (Bearer token)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        # Also check for custom 'auth-token' header (optional)
        if not token and 'auth-token' in request.headers:
            token = request.headers['auth-token']

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, os.environ.get("JWT_SECRET"), algorithms=["HS256"])
            current_user_id = data["user_id"]
        except Exception as e:
            return jsonify({"message": "Token is invalid!"}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated
