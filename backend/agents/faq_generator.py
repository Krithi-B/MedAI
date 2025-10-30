# backend/agents/faq_generator.py
import os
import json
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

groq_api_key = os.getenv("GROQ_API_KEY")

chat = ChatGroq(
    temperature=0.3,
    model_name="openai/gpt-oss-120b",
    groq_api_key=groq_api_key
)

faq_prompt = ChatPromptTemplate.from_template("""
You are a helpful medical FAQ generator for a Health Assistant app.
Based ONLY on the following content:
---
{content}
---
Generate 3 to 5 very relevant FAQs that a patient might naturally ask.
Keep answers short, clear, and medically safe.
❌ Do not explain what the assistant is or give generic FAQs.
✅ Only focus on the medical issue, treatment, lifestyle, or diet from the text.

Return strictly as JSON:
[
  {{"question": "string","answer":"string"}},
  {{"question": "string","answer":"string"}}
]
""")

def generate_faqs(content: str):
    try:
        prompt = faq_prompt.format_messages(content=content)
        response = chat.invoke(prompt).content.strip()

        # Debugging helper (uncomment if you want server logs)
        # print("Raw model response:", response)

        # If model wrapped JSON in a code fence, try to extract inner content
        if "```" in response:
            try:
                first = response.find("```")
                last = response.rfind("```")
                if first != -1 and last != -1 and last > first:
                    inner = response[first+3:last].strip()
                    # prefer inner if it looks like JSON array
                    if inner.startswith("["):
                        response = inner
            except Exception:
                # ignore and continue to other extraction attempts
                pass

        # 1) Try parsing JSON directly
        try:
            faqs = json.loads(response)
            if isinstance(faqs, list) and all("question" in f and "answer" in f for f in faqs):
                return faqs
        except Exception:
            pass

        # 2) Try extracting JSON substring if model adds text around it
        start = response.find("[")
        end = response.rfind("]") + 1
        if start != -1 and end != -1 and end > start:
            try:
                candidate = response[start:end]
                faqs = json.loads(candidate)
                if isinstance(faqs, list) and all("question" in f and "answer" in f for f in faqs):
                    return faqs
            except Exception:
                pass

        # 3) Final structured fallback (keeps same fallback structure you had)
        fallback = [
            {"question": "What should I focus on from this report?",
             "answer": content.split(".")[0][:120] + "..."},
            {"question": "Do I need professional consultation?",
             "answer": "Yes. Always discuss these findings with a qualified healthcare provider."}
        ]
        return fallback

    except Exception as e:
        # log exception server-side to help debugging
        print("generate_faqs exception:", e)
        # Absolute fallback if everything fails
        return [
            {"question": "Why don’t I see my FAQs?",
             "answer": "The AI service encountered an issue. Please try again later."}
        ]
