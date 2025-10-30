# routes/faq_routes.py
from flask import Blueprint, request, jsonify
from agents.faq_generator import generate_faqs

faq_bp = Blueprint("faq", __name__)

@faq_bp.route("/api/faqs", methods=["POST"])
def create_faqs():
    try:
        data = request.get_json() or {}
        content = data.get("content", "")
        # Ensure content is string
        if not isinstance(content, str):
            content = str(content)

        # Call the agent (keeps same function name and return type: list)
        faqs = generate_faqs(content)

        # Normalize/sanitize output: ensure it is a list of dicts with question & answer
        cleaned = []
        if isinstance(faqs, list):
            for item in faqs:
                if isinstance(item, dict) and "question" in item and "answer" in item:
                    cleaned.append({
                        "question": str(item["question"]),
                        "answer": str(item["answer"])
                    })

        # If nothing valid was returned, fall back to the agent's fallback or an absolute fallback
        if not cleaned:
            # try to use faqs if it was already okay (defensive), else absolute fallback
            if isinstance(faqs, list):
                cleaned = faqs
            else:
                cleaned = [
                    {"question": "Why don’t I see my FAQs?",
                     "answer": "The AI service encountered an issue. Please try again later."}
                ]

        # *** IMPORTANT: return an object with a `faqs` key so frontend's `data.faqs` works ***
        return jsonify({"faqs": cleaned}), 200

    except Exception as e:
        # Simple server-side logging for debugging
        print("Error in /api/faqs:", e)
        return jsonify({"faqs": [
            {"question": "Why don’t I see my FAQs?",
             "answer": "The server encountered an issue. Please try again later."}
        ]}), 500
