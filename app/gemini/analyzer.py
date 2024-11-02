import os
import json
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_schema": content.Schema(
    type = content.Type.OBJECT,
    required = ["summary", "percentage"],
    properties = {
      "summary": content.Schema(
        type = content.Type.STRING,
      ),
      "percentage": content.Schema(
        type = content.Type.NUMBER,
      ),
    },
  ),
  "response_mime_type": "application/json",
}

def analyze_code(task, language, code):
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        system_instruction=f"You are an AI model responsible for analyzing code on a platform where teachers can assign programming tasks to their students and track their progress. You are responsible for calculating the completion percentage of the code provided by the student who has been assigned the task of writing the '{task}' code in {language} language. The explanation you provide must inform the teacher about the student's progress status. Make sure the explanation is formatted in BBCode to indicate styles as needed. Base your evaluation on an in-depth analysis for the most precise assessment. All your responses must be in Turkish.",
    )

    chat_session = model.start_chat(
        history=[
        ]
    )

    response = chat_session.send_message(code)
    return json.loads(response.text)