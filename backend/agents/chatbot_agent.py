# backend/agents/chatbot_agent.py
import os
from datetime import datetime
from dotenv import load_dotenv
from typing import Any, Dict, List, Optional

# langchain imports (keep same as your environment)
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from utils.db import db  # your utils/db.py that exports `db` with collections

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# create ChatGroq client (same model+temp as in your streamlit)
chat = ChatGroq(
    temperature=0.4,
    model_name="llama-3.1-8b-instant",
    groq_api_key=GROQ_API_KEY,
)


def ensure_datetime(value) -> Optional[datetime]:
    """Accept either a datetime or ISO string or numeric timestamp; return datetime or None."""
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except Exception:
            try:
                # try unix timestamp string
                return datetime.fromtimestamp(float(value))
            except Exception:
                return None
    try:
        # If it's a numeric type
        return datetime.fromtimestamp(float(value))
    except Exception:
        return None


def get_next_appointment(appointments: List[Dict[str, Any]]):
    now = datetime.now()
    upcoming = []
    for a in appointments:
        start_dt = ensure_datetime(a.get("start"))
        if start_dt and start_dt > now:
            a_copy = dict(a)
            a_copy["_start_dt"] = start_dt
            upcoming.append(a_copy)
    upcoming.sort(key=lambda x: x["_start_dt"])
    return upcoming[0] if upcoming else None


def build_context(patient: Dict[str, Any], appointments: List[Dict[str, Any]]):
    name = patient.get("name", "there")
    email = patient.get("email", "Not specified")
    symptoms = patient.get("symptoms", "Not specified")
    conditions = patient.get("conditions", "Not specified")
    medications = patient.get("medications", "Not specified")

    next_apt = get_next_appointment(appointments)
    if next_apt:
        start_dt = next_apt.get("_start_dt") or ensure_datetime(next_apt.get("start"))
        if start_dt:
            apt_time = start_dt.strftime("%A at %I:%M %p")
        else:
            apt_time = "unknown time"
        apt_title = next_apt.get("title", "No title provided")
        apt_info = f"Your next appointment is '{apt_title}' scheduled for {apt_time}."
    else:
        apt_info = "You have no upcoming appointments at the moment."

    appointment_lines = []
    for a in appointments:
        sd = ensure_datetime(a.get("start"))
        if sd:
            appointment_lines.append(f"- {a.get('title','No title')} on {sd.strftime('%Y-%m-%d %I:%M %p')}")
        else:
            appointment_lines.append(f"- {a.get('title','No title')} (start: {a.get('start')})")

    appointment_summary = "\n".join(appointment_lines) or "No appointments on record."

    full_context = f"""
Patient Name: {name}
Email: {email}
Symptoms: {symptoms}
Conditions: {conditions}
Medications: {medications}

All Appointments:
{appointment_summary}

Upcoming Appointment Info:
{apt_info}
    """
    return full_context


def chat_with_patient(email: str, user_message: str) -> Dict[str, Any]:
    """
    Returns dict:
      - on success: {"answer": "...", "timestamp": "ISOtimestamp"}
      - on failure: {"error": "..."}
    """
    if not email:
        return {"error": "Email required for personalized chat."}

    try:
        # load patient + appointments
        patient = db.users.find_one({"email": email})
        appointments = list(db.appointments.find({"email": email}) or [])

        if not patient:
            return {"error": "Patient record not found."}

        full_context = build_context(patient, appointments)

        # Build prompt
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "You are a helpful health assistant with medical knowledge only. Be concise and kind. politely ignore to respond to any other questions which are not medical related."),
                ("human", "Patient Record:\n{context}\n\nUser Question: {question}"),
            ]
        )

        chain = prompt | chat

        # invoke chain
        response = chain.invoke({"context": full_context, "question": user_message})

        # extract text robustly
        answer = None
        if hasattr(response, "content"):
            answer = response.content
        elif isinstance(response, dict):
            answer = response.get("answer") or response.get("content") or response.get("text")
        elif isinstance(response, str):
            answer = response
        else:
            answer = str(response)

        if not answer:
            return {"error": "Agent returned empty answer."}

        # store record in DB with UTC timestamp
        record = {
            "email": email,
            "question": user_message,
            "answer": answer,
            "timestamp": datetime.utcnow(),
        }
        try:
            db.records.insert_one(record)
        except Exception:
            # don't fail the whole chat if logging fails
            pass

        return {"answer": answer, "timestamp": record["timestamp"].isoformat()}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Agent error: {str(e)}"}
