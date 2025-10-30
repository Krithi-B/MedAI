# backend/models/records_model.py

from datetime import datetime
from bson import ObjectId

class Record:
    def __init__(self, email, question, answer, _id=None, timestamp=None):
        self._id = _id or ObjectId()   # Unique record ID
        self.email = email
        self.question = question
        self.answer = answer
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "_id": self._id,
            "email": self.email,
            "question": self.question,
            "answer": self.answer,
            "timestamp": self.timestamp
        }
