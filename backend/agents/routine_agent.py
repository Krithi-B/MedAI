#agents/routine_agent.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from utils.db import db

load_dotenv()

def suggest_routine(name: str, email: str) -> dict:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    if not GROQ_API_KEY:
        raise ValueError("Missing GROQ_API_KEY in .env file")

    user_collection = db["users"]

    patient = user_collection.find_one(
        {"username": name, "email": email},
        {"_id": 0, "username": 1, "current_symptom": 1, "known_medical_conditions": 1}
    )

    if not patient:
        return {
            "name": name,
            "symptoms": [],
            "conditions": [],
            "routine": f"No patient found with name '{name}' and email '{email}'."
        }

    symptoms = [patient.get("current_symptom")] if patient.get("current_symptom") else []
    conditions = patient.get("known_medical_conditions", [])
    display_name = patient.get("username", "Unknown")

    system_prompt = """
    You are a doctor by profession and have excellent knowledge about the Human Body and all the diseases with their cures. 
    Give the routine for the patient based on the symptoms and conditions. Use the patient's name instead of their pronouns and be specific.
    """

    human_prompt = (
        "Give the routine for the patient name: {name} based on the symptoms provided in: {symptoms} "
        "and the conditions provided in: {conditions}."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])

    chat = ChatGroq(
        temperature=0,
        model_name="llama-3.1-8b-instant",  
        groq_api_key=GROQ_API_KEY
    )

    chain = prompt | chat

    try:
        result_chunks = chain.stream({
            "name": display_name,
            "symptoms": symptoms,
            "conditions": conditions
        })

        result = "".join(chunk.content for chunk in result_chunks)

    except Exception as e:
        print(f"Error during LangChain streaming: {str(e)}")
        return {
            "symptoms": symptoms,
            "conditions": conditions,
            "routine": f"Error generating routine: {str(e)}"
        }

    return {
        "symptoms": symptoms,
        "conditions": conditions,
        "routine": result
    }
