from pydantic import BaseModel, Field
from typing import List, Optional

class GenerateQuestionRequest(BaseModel):
    role: str
    difficulty: str
    interview_type: str
    question_number: int
    previous_questions: List[str] = []

class GenerateQuestionResponse(BaseModel):
    question: str

class EvaluateAnswerRequest(BaseModel):
    role: str
    difficulty: str
    question: str
    answer: str

class EvaluateAnswerResponse(BaseModel):
    verdict: str
    score: int
    strengths: List[str]
    weaknesses: List[str]
    better_answer: str
    keywords_missed: List[str]

class QAPair(BaseModel):
    question: str
    answer: str
    evaluation: EvaluateAnswerResponse

class SessionData(BaseModel):
    name: str
    role: str
    qa_pairs: List[QAPair]
    scores: List[int]
    duration: int

class GenerateReportRequest(BaseModel):
    session: SessionData

class CategoryScores(BaseModel):
    Communication: int
    Technical_Knowledge: int = Field(alias="Technical Knowledge")
    Clarity_Structure: int = Field(alias="Clarity & Structure")
    Confidence_Indicators: int = Field(alias="Confidence Indicators")
    Relevance_of_Answers: int = Field(alias="Relevance of Answers")
    
    class Config:
        populate_by_name = True

class GenerateReportResponse(BaseModel):
    overall_score: int
    strengths: List[str]
    improvements: List[str]
    summary: str
    category_scores: dict # using dict for flexibility with spaced keys
