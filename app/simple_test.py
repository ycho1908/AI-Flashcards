# simple test to debug the .env.local file with GROQ API
from dotenv import load_dotenv
import os

load_dotenv('.env.local')
print("GROQ_API_KEY:", os.getenv('GROQ_API_KEY'))
