# backend/agents/bmi_agent.py
import os
import json
import re
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

def calculate_bmi(height_cm: float, weight_kg: float):
    try:
        GROQ_API_KEY = os.getenv("GROQ_API_KEY")
        if not GROQ_API_KEY:
            raise ValueError("Missing GROQ_API_KEY in .env file")

        height_m = height_cm / 100
        bmi = round(weight_kg / (height_m ** 2), 1)

        if bmi < 18.5:
            category = "Underweight"
        elif 18.5 <= bmi < 25:
            category = "Normal weight"
        elif 25 <= bmi < 30:
            category = "Overweight"
        else:
            category = "Obese"

        # System and Human Prompts (Properly Escaped)
        system_prompt = """
        You are a certified health and nutrition expert.
        You must ONLY return a valid JSON response (no markdown, no explanations outside JSON).
        """

        human_prompt = """
        You are a health assistant. Given a user's BMI details, return a JSON response
        with an interpretation, normalWeightRange, and 5 recommendations.

        The JSON must strictly follow this format:
        {{
        "interpretation": "<short interpretation text>",
        "normalWeightRange": "<healthy weight range based on height>",
        "recommendations": ["tip1", "tip2", "tip3", "tip4", "tip5"]
        }}

        Height: {height_cm} cm
        Weight: {weight_kg} kg
        BMI: {bmi}
        Category: {category}


        The recommendations must be unique, realistic, and tailored to the given BMI category:
        - For Underweight → focus on healthy weight gain, calorie surplus, strength training
        - For Normal weight → focus on maintaining balance, consistency, and hydration
        - For Overweight → focus on controlled calorie deficit, cardio, and portion control
        - For Obese → focus on medical supervision, safe fat loss, and habit restructuring
        """

        # Create prompt chain
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

        # Run and collect text
        response = chain.invoke({
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "bmi": bmi,
            "category": category
        })

        result_text = response.content.strip()

        # Extract valid JSON using regex
        json_match = re.search(r"\{.*\}", result_text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
        else:
            clean_json = result_text

        # Try loading JSON
        try:
            data = json.loads(clean_json)
        except json.JSONDecodeError:
            print("⚠️ AI returned malformed JSON — fallback activated.")
            normal_weight_min = round(18.5 * (height_m ** 2), 1)
            normal_weight_max = round(24.9 * (height_m ** 2), 1)
            data = {
                "interpretation": f"Your BMI is {bmi}, categorized as {category}.",
                "normalWeightRange": f"{normal_weight_min}-{normal_weight_max} kg",
                "recommendations": [
                    "Eat a balanced diet and exercise regularly.",
                    "Maintain healthy sleep habits.",
                    "Stay hydrated and avoid processed foods.",
                    "Monitor your weight weekly.",
                    "Consult a nutritionist for personalized advice."
                ]
            }

        return {
            "bmi": bmi,
            "category": category,
            **data
        }

    except Exception as e:
        print("Error in calculate_bmi:", e)
        return {"error": str(e)}
