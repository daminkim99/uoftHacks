from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json
from pydantic import BaseModel

app = FastAPI()
from bert import keyword_pull_article, extract_keywords, NER_with_SciBERT

class TextInput(BaseModel):
    text: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend's URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/save-keywords/")
async def save_keywords(request: Request):
    data = await request.json()
    with open("keywords.json", "w") as f:
        json.dump(data, f)
    return {"message": "Keywords saved successfully!"}

@app.post("/extract_keywords")
def extract_keywords_endpoint(input: TextInput):
    print(input.text)
    keywords = NER_with_SciBERT(input.text)
    
    keywords_list = [k["keyword"] for k in keywords]
    similarities  = [k["similarity"] for k in keywords]
    return(keyword_pull_article(input.text,keywords_list,similarities))

