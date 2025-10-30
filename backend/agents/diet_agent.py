from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from utils.db import db
import os

load_dotenv()

def suggest_diet(name: str, email: str) -> str:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY") 

    # ✅ Match actual collection and fields
    patient = db.users.find_one(
        {"username": name, "email": email},
        {"_id": 0, "username": 1, "current_symptom": 1, "known_medical_conditions": 1}
    )
    
    print("Fetched Patient:", patient)

    if not patient:
        return f"No patient found with name '{name}' and email '{email}'."

    symptoms = patient.get("current_symptom", "")
    conditions = patient.get("known_medical_conditions", [])
    display_name = patient.get("username", "Unknown")

    system_prompt = """
    You are a kind dietician. You know a lot about food, diets, and cooking.
You will give diets and recipes for both vegan and non-vegan foods.
Do not give any recipe with beef or pork.
Always talk to the patient using their name instead of 'he', 'she', or 'they'.

Recipe Formatting Rules:
- Every recipe must look like this example:

Recipe 1: Apple Soup

Ingredients:
- 2 apples
- 1 cup water
- 1 spoon sugar

Steps:
Step 1: Wash the apples.
Step 2: Cut the apples into small pieces.
Step 3: Put apples and water in a pot.
Step 4: Cook for 10 minutes.
Step 5: Blend until smooth.
Step 6: Serve warm.

- Notice: Each step is on a **new line**. Never put two steps in the same line.
- Do not write "Steps: Step 1... Step 2..." on one line.
- Write each step clearly on its own line.
- Use simple English, short sentences, easy for a 3-year-old to understand.
- Give at least 2 Veg recipes and 2 Non-Veg recipes.
    """

    human_prompt = """
        Make a diet plan for patient {name}.
The symptoms are: {symptoms}.
The conditions are: {conditions}.

Give the diet plan, food list, and at least 3 Veg recipes and 3 Non-Veg recipes.
"""

    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", human_prompt)])
    chat = ChatGroq(temperature=0, model_name="llama-3.1-8b-instant", groq_api_key=GROQ_API_KEY)
    chain = prompt | chat

    output = "".join(chunk.content for chunk in chain.stream({
        "name": display_name,
        "symptoms": symptoms,
        "conditions": conditions
    }))

    return (
    f"Symptoms: {symptoms}\n\n"
    f"Conditions: {', '.join(conditions)}\n\n"
    f"Recommended Diet & Recipes:\n{output}"
)

