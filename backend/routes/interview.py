from fastapi import APIRouter, HTTPException
from models.schemas import (
    GenerateQuestionRequest, GenerateQuestionResponse,
    EvaluateAnswerRequest, EvaluateAnswerResponse
)
from services.gemini_service import generate_question, evaluate_answer

router = APIRouter()

@router.post("/generate-question", response_model=GenerateQuestionResponse)
async def api_generate_question(req: GenerateQuestionRequest):
    try:
        question = await generate_question(
            role=req.role,
            difficulty=req.difficulty,
            interview_type=req.interview_type
        )
        return {"question": question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def api_evaluate_answer(req: EvaluateAnswerRequest):
    try:
        evaluation = await evaluate_answer(
            role=req.role,
            question=req.question,
            answer=req.answer,
            difficulty=req.difficulty
        )
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
