from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from routes import interview, report

load_dotenv()

app = FastAPI(title="AI Interview Reviewer API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "AI Interview Reviewer API is running"}

app.include_router(interview.router, prefix="/api")
app.include_router(report.router, prefix="/api")
