from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from datetime import datetime
from bson import ObjectId
from models.appointment_model import Appointment
from utils.db import db
from utils.auth import token_required

appointment_bp = Blueprint("appointment_bp", __name__)

# ---------------- POST: Book appointment ----------------
@appointment_bp.route('/api/appointment', methods=['POST'])
@cross_origin()
@token_required
def book_appointment(current_user_id):
    try:
        data = request.get_json(force=True)

        hospital_name = data.get('hospital_name')
        date = data.get('date')
        time = data.get('time')

        if not hospital_name or not date or not time:
            return jsonify({"error": "All fields (hospital_name, date, time) are required"}), 400

        # Validate date and time format (use consistent YYYY-MM-DD)
        try:
            datetime.strptime(date, "%Y-%m-%d")
            datetime.strptime(time, "%H:%M")
        except ValueError:
            return jsonify({"error": "Invalid date or time format. Expected YYYY-MM-DD and HH:MM"}), 400

        # Create appointment
        appointment = Appointment(  
            user_id=ObjectId(current_user_id),  # store as ObjectId
            hospital_name=hospital_name,
            date=date,
            time=time
        )

        # Insert into DB
        inserted = db.appointments.insert_one(appointment.to_dict())

        # Fetch the stored appointment and prepare for JSON
        saved_appt = db.appointments.find_one({"_id": inserted.inserted_id})
        saved_appt["_id"] = str(saved_appt["_id"])
        saved_appt["user_id"] = str(saved_appt["user_id"])
        if "created_at" in saved_appt:
            saved_appt["created_at"] = saved_appt["created_at"].isoformat()

        return jsonify({
            "message": "Appointment booked successfully",
            "appointment": saved_appt
        }), 201

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500


# ---------------- GET: Fetch user appointments ----------------
@appointment_bp.route('/api/appointment', methods=['GET'])
@cross_origin()
@token_required
def get_appointments(current_user_id):
    try:
        appointments = list(db.appointments.find({"user_id": ObjectId(current_user_id)}))

        for appt in appointments:
            appt["_id"] = str(appt["_id"])
            appt["user_id"] = str(appt["user_id"])
            if "created_at" in appt:
                appt["created_at"] = appt["created_at"].isoformat()

        return jsonify({"appointments": appointments}), 200

    except Exception as e:
        return jsonify({"error": f"Could not fetch appointments: {str(e)}"}), 500


# ------------------ UPDATE APPOINTMENT ------------------
@appointment_bp.route('/api/appointment/<appointment_id>', methods=['PUT'])
@cross_origin()
@token_required
def update_appointment(current_user_id, appointment_id):
    try:
        data = request.get_json(force=True)

        appointment = db.appointments.find_one({
            "_id": ObjectId(appointment_id),
            "user_id": ObjectId(current_user_id)
        })

        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404

        update_fields = {}
        if 'hospital_name' in data:
            update_fields['hospital_name'] = data['hospital_name']
        if 'date' in data:
            try:
                datetime.strptime(data['date'], "%Y-%m-%d")
                update_fields['date'] = data['date']
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        if 'time' in data:
            try:
                datetime.strptime(data['time'], "%H:%M")
                update_fields['time'] = data['time']
            except ValueError:
                return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

        if not update_fields:
            return jsonify({"error": "No valid fields provided"}), 400

        db.appointments.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": update_fields}
        )

        updated_appointment = db.appointments.find_one({"_id": ObjectId(appointment_id)})
        updated_appointment["_id"] = str(updated_appointment["_id"])
        updated_appointment["user_id"] = str(updated_appointment["user_id"])
        if "created_at" in updated_appointment:
            updated_appointment["created_at"] = updated_appointment["created_at"].isoformat()

        return jsonify({"message": "Appointment updated successfully", "appointment": updated_appointment}), 200

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500


# ------------------ DELETE APPOINTMENT ------------------
@appointment_bp.route('/api/appointment/<appointment_id>', methods=['DELETE'])
@cross_origin()
@token_required
def delete_appointment(current_user_id, appointment_id):
    try:
        result = db.appointments.delete_one({
            "_id": ObjectId(appointment_id),
            "user_id": ObjectId(current_user_id)
        })

        if result.deleted_count == 0:
            return jsonify({"error": "Appointment not found or unauthorized"}), 404

        return jsonify({"message": "Appointment deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Something went wrong: {str(e)}"}), 500
