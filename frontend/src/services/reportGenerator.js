import { callGemini } from './geminiService';

/**
 * Generates the final performance report using Gemini API.
 * 
 * @param {Object} params - The inputs for the report data.
 * @param {string} params.candidateName - The candidate's name.
 * @param {string} params.role - Job role.
 * @param {string} params.difficulty - Difficulty level.
 * @param {string} params.interviewType - Interview type.
 * @param {number} params.duration - Total duration in minutes.
 * @param {Array} params.qaHistory - Array of all Q&A + their evaluations.
 * @returns {Promise<Object>} A parsed JSON report matching the specified schema.
 */
export async function generateFinalReport({
  candidateName,
  role,
  difficulty,
  interviewType,
  duration,
  qaHistory
}) {

  const prompt = `You are an expert HR consultant reviewing a complete mock interview session.

Candidate: ${candidateName}
Role Applied: ${role}
Difficulty: ${difficulty}
Duration: ${duration} minutes
Total Questions: ${qaHistory.length}
Interview Type: ${interviewType}

Interview Data:
${JSON.stringify(qaHistory)}

Analyze the full session and return ONLY this exact JSON structure:

{
  "overall_score": <integer 1-100>,
  "category_scores": {
    "communication": <integer 1-10>,
    "technical_knowledge": <integer 1-10>,
    "clarity_structure": <integer 1-10>,
    "confidence_indicators": <integer 1-10>,
    "relevance": <integer 1-10>
  },
  "top_strengths": [
    "detailed strength 1",
    "detailed strength 2",
    "detailed strength 3"
  ],
  "areas_to_improve": [
    "specific improvement 1",
    "specific improvement 2",
    "specific improvement 3"
  ],
  "overall_summary": "3-4 sentence honest assessment of the candidate's performance",
  "hiring_recommendation": "Strong Yes" | "Yes" | "Maybe" | "No",
  "recommended_resources": [
    {
      "topic": "topic name",
      "reason": "why this candidate needs this"
    }
  ]
}`;

  const reportData = await callGemini(prompt, true);
  return reportData;
}
