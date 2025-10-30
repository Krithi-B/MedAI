from flask import Blueprint, request, jsonify
from utils.auth import token_required
from models import user_model
from bson import ObjectId
from utils.db import db  # make sure you import your database

user_route = Blueprint('user', __name__)

@user_route.route('/api/user', methods=['GET'])
@token_required
def get_user(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify({"user": user}), 200

