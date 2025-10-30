# agents/diagnosis_agent.py

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
load_dotenv()

def suggest_diagnosis(symptoms: str) -> list:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found in environment.")

    system_prompt = (
        "You are a doctor with excellent knowledge about the human body and all diseases with their cures. "
        "Just give the name of the possible disease, comma-separated if more than one."
    )
    human_prompt = (
        "Give the diagnosis report based on the symptoms: {topic}. Confine it to the top three possibilities. "
        "Tell it like: Top 3 possible diagnosis"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", human_prompt)
    ])

    try:
        chat = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=GROQ_API_KEY)
        chain = prompt | chat
        response = "".join(chunk.content for chunk in chain.stream({"topic": symptoms}))
    except Exception as e:
        raise RuntimeError(f"Error while calling Groq API: {str(e)}")

    if not response:
        raise ValueError("No response received from Groq API")

    # Parse response for disease names (simplified)
    lines = response.split("\n")
    diseases = []
    for line in lines:
        if line.strip() and any(c.isdigit() for c in line[:3]):
            name = line.split(".", 1)[-1]  # after number
            # name = name.split("-")[0]      # remove descriptions
            name = name.split("(")[0]      # remove brackets
            name = name.replace("**", "")  # remove markdown bold
            diseases.append(name.strip())

    return diseases[:3]
