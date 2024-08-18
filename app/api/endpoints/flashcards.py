from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()

print("GROQ_API_KEY:", os.getenv('GROQ_API_KEY'))

client = Groq(api_key=os.getenv('GROQ_API_KEY'))
model_engine = 'llama3-8b-8192'

class ClientPrompt(BaseModel):
    prompt: str

def generate_flashcards(topic: str):
    prompt = f"Create a list of flashcards for topic '{topic}'. The flashcard will have the term on the front and its definition or explanation in one to two sentences on the back, where the front and back are separated using colon, :"

    response = client.chat.completions.create(
        model=model_engine,
        messages=[{'role': 'user', 'content': prompt}],
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.7
    )

    ai_response = response.choices[0].message.content

    flashcards = []
    for line in ai_response.split('\n'):
        if ':' in line:
            front, back = line.split(':', 1)
            flashcards.append({'front': front.strip(), 'back': back.strip()})

    return flashcards

@router.post('/generate')
async def generate_flashcards_page(prompt: ClientPrompt):
    try:
        flashcards = generate_flashcards(prompt.prompt)
        return {'flashcards': flashcards}
    except Exception as e:
        print(f"Error in /generate endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
