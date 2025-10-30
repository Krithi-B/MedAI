from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash , check_password_hash
from models.user_model import User
from utils.db import db
from utils.jwt_helper import generate_token, verify_token
from utils.auth import token_required
from bson import ObjectId

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    # Required fields
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    # Validate required fields
    if not all([username, email, password, confirm_password]):
        return jsonify({'error': 'Please fill all required fields'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400

    # Check if email already exists
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400

    # Hash password
    hashed_password = generate_password_hash(password)

    # Optional fields
    gender = data.get('gender')
    age = data.get('age')
    known_medical_conditions = data.get('known_medical_conditions', [])
    if isinstance(known_medical_conditions, str):
        known_medical_conditions = [cond.strip() for cond in known_medical_conditions.split(',') if cond.strip()]
    current_symptom = data.get('current_symptom')

    # Create user instance
    user = User(
        username=username,
        email=email,
        password=hashed_password,
        gender=gender,
        age=age,
        known_medical_conditions=known_medical_conditions,
        current_symptom=current_symptom
    )

    # Insert user into DB
    db.users.insert_one(user.to_dict())

    return jsonify({'message': 'User registered successfully'}), 201


@auth_routes.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not (username and email and password):
        return jsonify({"error": "Please fill in all fields"}), 400

    user = db.users.find_one({
        "username": username,
        "email": email
    })

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user["_id"])
    return jsonify({
        "message": "Login successful",
        "token": token
    }), 200


@auth_routes.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    email = data.get("email")
    new_password = data.get("new_password")
    confirm_new_password = data.get("confirm_new_password")

    if not all([email, new_password, confirm_new_password]):
        return jsonify({"error": "Please fill in all fields"}), 400

    if new_password != confirm_new_password:
        return jsonify({"error": "Passwords do not match"}), 400

    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    hashed_password = generate_password_hash(new_password)

    db.users.update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )

    return jsonify({"message": "Password updated successfully"}), 200


@auth_routes.route("/api/protected", methods=["GET"])
def protected():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"error": "Token missing"}), 401

    user_id = verify_token(token)
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({"message": "Access granted", "user_id": user_id}), 200


@auth_routes.route("/api/user/profile", methods=["GET"])
@token_required
def user_profile(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})  # exclude password

    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])  # convert ObjectId to string
    return jsonify({"profile": user}), 200


# ------------------ UPDATE USER PROFILE ------------------
@auth_routes.route("/api/user/update", methods=["PUT"])
@cross_origin()
@token_required
def update_user(user_id):
    try:
        # Extract JSON data from request
        data = request.get_json(force=True)

        # Verify user exists
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        allowed_fields = [
            "username",
            "email",
            "gender",
            "age",
            "known_medical_conditions",
            "current_symptom",
        ]

        update_fields = {}
        for field in allowed_fields:
            if field in data:
                if field == "age":
                    try:
                        update_fields[field] = int(data[field])
                    except ValueError:
                        return jsonify({"error": "Age must be a valid number"}), 400
                else:
                    update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields provided"}), 400

        # Update user document
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        # Fetch and prepare updated user data
        updated_user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        updated_user["_id"] = str(updated_user["_id"])

        return jsonify({
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500


