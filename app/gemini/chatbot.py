import os
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-pro",
  generation_config=generation_config,
  system_instruction="Sen eğitim alanında kullanılan bir yapay zeka modelisin. Adın \"TakımYıldız AI\".",
)
async def send_message(message, chat_history):
    try:
        chat_session = model.start_chat(
            history=chat_history
        )
        result = chat_session.send_message(message)
        return {"text": result.text, "conversation": chat_session.history}
    except Exception as e:
        return {"text": "Bir şeyler yanlış gitti", "conversation": []}