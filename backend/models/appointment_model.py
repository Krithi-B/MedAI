# backend/models/appointment_model.py
from datetime import datetime
from bson import ObjectId

class Appointment:
    def __init__(self, user_id, hospital_name, date, time, _id=None):
        self._id = _id or ObjectId()  # Unique appointment ID
        self.user_id = ObjectId(user_id)  # Store as ObjectId, not string
        self.hospital_name = hospital_name
        self.date = date
        self.time = time
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "hospital_name": self.hospital_name,
            "date": self.date,
            "time": self.time,
            "created_at": self.created_at
        }
