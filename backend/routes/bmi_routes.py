# backend/routes/bmi_routes.py
from flask import Blueprint, request, jsonify
from agents.bmi_agent import calculate_bmi

bmi_bp = Blueprint("bmi_bp", __name__)

@bmi_bp.route("/api/bmi", methods=["POST"])
def get_bmi():
    try:
        data = request.get_json()

        # Extract values
        height = data.get("height")
        weight = data.get("weight")

        # Validate input
        if height is None or weight is None:
            return jsonify({"error": "Missing height or weight"}), 400

        # Ensure correct types
        try:
            height = float(height)
            weight = float(weight)
        except ValueError:
            return jsonify({"error": "Height and weight must be numbers"}), 400

        # Call BMI agent safely
        result = calculate_bmi(height, weight)

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500