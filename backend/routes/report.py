from fastapi import APIRouter, HTTPException
from models.schemas import GenerateReportRequest, GenerateReportResponse
from services.gemini_service import generate_report_summary

router = APIRouter()

@router.post("/generate-report", response_model=GenerateReportResponse)
async def api_generate_report(req: GenerateReportRequest):
    try:
        # We process the session to calculate some basic metrics before sending to AI
        session = req.session
        avg_score = sum(session.scores) / len(session.scores) if session.scores else 0
        
        # In a real app we might pass the entire Q/A history to Claude
        # but to save tokens, we pass scores and an abstraction
        session_data = {
            "role": session.role,
            "average_score": avg_score,
            "duration_minutes": session.duration,
            "number_of_questions_answered": len(session.qa_pairs)
        }
        
        ai_summary = await generate_report_summary(session_data)
        
        # Calculate category scores logically based on averge score for mocking
        # A real implementation would ask Claude to grade the 5 categories
        base = int(avg_score * 10)
        
        response = {
            "overall_score": base,
            "strengths": ai_summary.get("strengths", []),
            "improvements": ai_summary.get("improvements", []),
            "summary": ai_summary.get("summary", ""),
            "category_scores": {
                "Communication": min(10, int(avg_score + 1)),
                "Technical Knowledge": min(10, int(avg_score)),
                "Clarity & Structure": min(10, int(avg_score - 1) if avg_score > 1 else 1),
                "Confidence Indicators": min(10, int(avg_score)),
                "Relevance of Answers": min(10, int(avg_score + 1))
            }
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
