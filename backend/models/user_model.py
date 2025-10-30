#models/user_model.py

from bson import ObjectId

class User:
    def __init__(self, username, email, password, gender=None, age=None,
                 known_medical_conditions=None, current_symptom=None, _id=None):
        self._id = _id or ObjectId()
        self.username = username
        self.email = email
        self.password = password
        self.gender = gender
        self.age = age
        self.known_medical_conditions = known_medical_conditions or []
        self.current_symptom = current_symptom

    def to_dict(self):
        return {
            "_id": self._id,
            "username": self.username,
            "email": self.email,
            "password": self.password,
            "gender": self.gender,
            "age": self.age,
            "known_medical_conditions": self.known_medical_conditions,
            "current_symptom": self.current_symptom
        }
