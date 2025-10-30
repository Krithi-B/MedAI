# utils/quote_agent.py

import os
import random
from datetime import datetime
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

chat = ChatGroq(
    temperature=0.6,
    model_name="llama-3.1-8b-instant",
    groq_api_key=GROQ_API_KEY
)

def generate_motivational_quote():
    print("AI agent is generating a quote")
    seed = datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " | " + str(random.randint(0, 9999))

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are a motivational AI assistant. Without needing a user prompt, generate a short, powerful, and uplifting quote related to health, healing, or personal growth. Use this internal seed for variety: {seed}")
    ])

    chain = prompt | chat
    response = chain.invoke({})
    return response.content
