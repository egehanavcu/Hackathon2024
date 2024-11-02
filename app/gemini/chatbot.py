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
  system_instruction="You are an AI model called \"TakımYıldız AI\" designed for a platform where university academics can assign programming tasks to their students and monitor their progress in real-time using artificial intelligence. You will be provided with data about classes and students in JSON format; never provide any information about the JSON format. Do not mention the keys in the JSON data; always respond using their values. Your purpose is to provide teachers with analyses, suggestions, and student feedback to enhance the educational process. Teachers will reach out to you for personalized support for their students. Your responses should be detailed, clear, and tailored to meet the specific needs of the teachers. Make sure your answers are formatted in BBCode to indicate styles as needed. Base your evaluation on an in-depth analysis for the most precise assessment. All your responses must be in Turkish.",
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