import os
import json
import google.generativeai as genai

def setup_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        genai.configure(api_key=api_key)
        return True
    return False

def get_model():
    # Use gemini-1.5-flash as the default model
    return genai.GenerativeModel("gemini-1.5-flash")

async def generate_question(role: str, difficulty: str, interview_type: str) -> str:
    is_configured = setup_gemini()
    prompt = f"""You are an expert interviewer for {role} positions.
Generate 1 {interview_type} interview question for a {difficulty} level candidate. 
Return ONLY the question. No numbering, no explanation."""

    if not is_configured:
        # Mock logic if no API key
        return f"Mock API: As a {role}, can you describe a time you handled a {difficulty} {interview_type} situation?"

    model = get_model()
    response = model.generate_content(prompt)
    return response.text.strip()

async def evaluate_answer(role: str, question: str, answer: str, difficulty: str) -> dict:
    is_configured = setup_gemini()
    prompt = f"""You are an expert interview coach. Evaluate this interview answer strictly and fairly.

Role: {role}
Question: {question}
Candidate Answer: {answer}

Return your evaluation as JSON only (no extra text):
{{
  "verdict": "Good" | "Needs Improvement" | "Poor",
  "score": <number 1-10>,
  "strengths": ["point1", "point2"],
  "weaknesses": ["point1", "point2"],
  "better_answer": "<brief improved version>",
  "keywords_missed": ["word1", "word2", "word3"]
}}"""

    if not is_configured:
        # Mock Response
        return {
            "verdict": "Good",
            "score": 7,
            "strengths": ["Answered the prompt directly (Mocked)"],
            "weaknesses": ["Needs more real-world examples (Mocked)"],
            "better_answer": "Use the STAR format to structure your response... (Mocked)",
            "keywords_missed": ["collaboration", "metrics"]
        }

    model = get_model()
    response = model.generate_content(prompt)
    
    # Try parsing the JSON. Often Gemini returns markdown wrapped JSON
    content = response.text.strip()
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    return json.loads(content.strip())

async def generate_report_summary(session_data: dict) -> dict:
    is_configured = setup_gemini()
    prompt = f"""Based on this interview session data: {json.dumps(session_data)}
Generate a final performance summary with:
- 3 key strengths
- 3 areas to improve
- Overall assessment in 2-3 sentences
Return as JSON only in exactly this format:
{{
  "strengths": ["str1", "str2", "str3"],
  "improvements": ["imp1", "imp2", "imp3"],
  "summary": "overall assessment text..."
}}"""

    if not is_configured:
        return {
            "strengths": ["Communication (Mocked)", "Technical Depth", "Structure"],
            "improvements": ["More specific metrics", "Conciseness", "Energy"],
            "summary": "You demonstrated solid knowledge of the domain. Make sure to align your examples more closely with concrete data metrics."
        }

    model = get_model()
    response = model.generate_content(prompt)
    
    content = response.text.strip()
    if content.startswith("```json"):
        content = content[7:-3]
    elif content.startswith("```"):
        content = content[3:-3]
        
    return json.loads(content.strip())
