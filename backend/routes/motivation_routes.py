# routes/motivation_routes.py
from agents.quote_agent import generate_motivational_quote
from flask import Blueprint, jsonify

motivation_route = Blueprint('motivation_route', __name__)

def fetch_motivational_quote():
    try:
        quote = generate_motivational_quote()
        return {"quote": quote}
    except Exception as e:
        return {"error": str(e)}

@motivation_route.route('/api/motivation', methods=['GET'])
def get_motivational_quote():
    result = fetch_motivational_quote()
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)
