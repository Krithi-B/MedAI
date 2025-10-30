# backend/routes/dietplan_routes.py

from flask import Blueprint, request, jsonify
from agents.diet_agent import suggest_diet

dietplan_bp = Blueprint("dietplan_bp", __name__)

@dietplan_bp.route("/api/dietplan", methods=["GET"])
def get_dietplan():
    try:
        name = request.args.get("name")
        email = request.args.get("email")

        if not name or not email:
            return jsonify({"error": "Missing name or email parameters"}), 400

        plan = suggest_diet(name, email)
        return jsonify({"dietPlan": plan}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
