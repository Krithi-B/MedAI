# backend/routes/routine_routes.py

from flask import Blueprint, request, jsonify
from agents.routine_agent import suggest_routine

routine_bp = Blueprint('routine_bp', __name__)

@routine_bp.route('/api/routine', methods=['GET'])
def get_routine():
    name = request.args.get('name')
    email = request.args.get('email')

    if not name or not email:
        return jsonify({"error": "Missing 'name' or 'email' parameter"}), 400

    try:
        routine_plan = suggest_routine(name, email)
        return jsonify({"routinePlan": routine_plan}), 200  
    except Exception as e:
        return jsonify({"error": str(e)}), 500
