# backend/routes/diagnosis_routes.py

from flask import Blueprint, request, jsonify
from agents.diagnosis_agent import suggest_diagnosis

diagnosis_bp = Blueprint('diagnosis_bp', __name__)

@diagnosis_bp.route('/api/diagnosis', methods=['POST'])
def get_diagnosis():
    try:
        data = request.get_json()
        print("Request JSON data:", data)  # <-- Debug log
        symptoms = data.get('symptoms')

        if not symptoms:
            return jsonify({"error": "Missing symptoms in request"}), 400

        print(f"Received symptoms: {symptoms}")  # <-- Debug log

        diseases = suggest_diagnosis(symptoms)

        print(f"Diagnosis result: {diseases}")  # <-- Debug log

        return jsonify({"diseases": diseases}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500


