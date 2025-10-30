import os
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError
import pytesseract
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def analyze_tablet_image(input_path: str):
    try:
        image = Image.open(input_path).convert("RGB")
        extracted_text = pytesseract.image_to_string(image)
        cleaned_text = extracted_text.strip().replace("\n", " ")
        if not cleaned_text:
            return "No text detected in the image."

        system_prompt = (
            "You are a skilled pharmacist. Based on the medicine name or composition given, "
            "describe what the tablet is used for, the medical condition it treats, how it works, it's side effects, and situations where the tablet should be avoided. "
            "Keep it simple and clear for patients."
        )

        human_prompt = (
            "Medicine or composition: {medicine_text}. Explain what it does, and what condition it is commonly used for."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", human_prompt)
        ])

        chat = ChatGroq(
            temperature=0.3,
            model_name="llama-3.1-8b-instant",
            groq_api_key=GROQ_API_KEY
        )

        chain = prompt | chat
        full_response = ""
        for chunk in chain.stream({"medicine_text": cleaned_text}):
            full_response += chunk.content
        return full_response

    except UnidentifiedImageError:
        return "Invalid image file or unsupported format."
    except Exception as e:
        return f"Error: {str(e)}"
