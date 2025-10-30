# backend/routes/chatbot_routes.py
from flask import Blueprint, request, jsonify
import os
import jwt
import traceback
from datetime import datetime
from agents.chatbot_agent import chat_with_patient

chatbot_bp = Blueprint("chatbot_bp", __name__)


def get_email_from_token(auth_header: str):
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        secret = os.getenv("JWT_SECRET")
        if not secret:
            print("JWT_SECRET not set in environment")
            return None
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload.get("email")
    except Exception as e:
        print("JWT decode error:", e)
        return None


@chatbot_bp.route("/api/chatbot/message", methods=["POST"])
def send_message():
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        email = data.get("email")

        if not message:
            return jsonify({"error": "Missing 'message'"}), 400

        if not email:
            auth = request.headers.get("Authorization")
            email = get_email_from_token(auth)

        if not email:
            return jsonify({"error": "Email missing (body or token)"}), 400

        result = chat_with_patient(email, message)

        # result should be a dict -- handle agent-stated errors gracefully
        if not isinstance(result, dict):
            return jsonify({"error": "Agent returned invalid response"}), 500

        if "error" in result:
            # agent reported a failure — return 400 so frontend can show message
            return jsonify({"error": result["error"]}), 400

        answer = result.get("answer")
        ts = result.get("timestamp") or datetime.utcnow().isoformat()

        if not answer:
            return jsonify({"error": "No answer from chatbot"}), 500

        return jsonify(
            {
                "email": email,
                "question": message,
                "answer": answer,
                "timestamp": ts,
            }
        ), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Server crash: {str(e)}"}), 500
