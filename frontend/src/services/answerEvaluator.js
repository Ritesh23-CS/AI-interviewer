import { callGemini } from './geminiService';
import { detectFillerWords } from '../utils/fillerWordDetector';
import { countWords } from '../utils/wordCounter';

/**
 * Evaluates a single answer (kept for optional use).
 */
export async function evaluateAnswer({ role, difficulty, interviewType, question, answer, questionNumber }) {
  const { count: wordCount, isValid } = countWords(answer);
  const fillerCheck = detectFillerWords(answer);
  if (!isValid) return { error: "too_short", wordCount };

  const prompt = `You are a strict but fair interview coach evaluating a candidate for a ${role} position.
Interview Type: ${interviewType}, Difficulty Level: ${difficulty}
Question: ${question}
Candidate's Answer: ${answer}

Return ONLY a valid JSON object:
{
  "verdict": "Good" | "Needs Improvement" | "Poor",
  "score": <integer 1-10>,
  "scores": { "communication": <1-10>, "technical_knowledge": <1-10>, "clarity_structure": <1-10>, "confidence_indicators": <1-10>, "relevance": <1-10> },
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "better_answer": "A brief 2-3 sentence improved version",
  "keywords_missed": ["keyword1", "keyword2"],
  "star_method_used": true | false,
  "filler_word_count": <number>
}`;

  const aiEvaluation = await callGemini(prompt, true);
  return { ...aiEvaluation, fillers: { count: fillerCheck.count, wordsDetected: fillerCheck.words }, wordCount };
}

/**
 * Batch-evaluates all 5 Q&A pairs in a single Gemini API call.
 *
 * @param {Object} params
 * @param {string} params.role
 * @param {string} params.difficulty
 * @param {string} params.interviewType
 * @param {{ question: string, answer: string }[]} params.qaList
 * @returns {Promise<Object[]>} Array of evaluation objects matching qaList order.
 */
export async function evaluateAllAnswers({ role, difficulty, interviewType, qaList }) {
  // Run local filler/word checks for each answer
  const localChecks = qaList.map(qa => {
    const fillerCheck = detectFillerWords(qa.answer);
    const { count: wordCount } = countWords(qa.answer);
    return { fillers: { count: fillerCheck.count, wordsDetected: fillerCheck.words }, wordCount };
  });

  const qaSummary = qaList.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}`
  ).join('\n\n');

  const prompt = `You are a strict but fair interview coach evaluating ${qaList.length} answers from a candidate applying for a ${role} role.
Interview Type: ${interviewType}, Difficulty: ${difficulty}

Here are all the Q&A pairs:
${qaSummary}

Evaluate each answer and return ONLY a valid JSON object with a single key "evaluations" containing an array of ${qaList.length} objects, in exact order:
{
  "evaluations": [
    {
      "verdict": "Good" | "Needs Improvement" | "Poor",
      "score": <integer 1-10>,
      "scores": {
        "communication": <1-10>,
        "technical_knowledge": <1-10>,
        "clarity_structure": <1-10>,
        "confidence_indicators": <1-10>,
        "relevance": <1-10>
      },
      "strengths": ["specific strength 1", "specific strength 2"],
      "weaknesses": ["specific weakness 1", "specific weakness 2"],
      "better_answer": "A brief 2-3 sentence improved version",
      "keywords_missed": ["keyword1", "keyword2"],
      "star_method_used": true | false,
      "filler_word_count": <number>
    }
  ]
}

Scoring: 8-10 = Excellent | 5-7 = Decent, missing depth | 1-4 = Vague or irrelevant`;

  const aiResponse = await callGemini(prompt, true);

  // GPT returns { evaluations: [...] } — unwrap the array
  const evalArray = Array.isArray(aiResponse)
    ? aiResponse
    : Array.isArray(aiResponse.evaluations)
    ? aiResponse.evaluations
    : Object.values(aiResponse);

  // Merge local checks into AI evaluations
  return evalArray.map((ev, i) => ({
    ...ev,
    fillers: localChecks[i]?.fillers || { count: 0, wordsDetected: [] },
    wordCount: localChecks[i]?.wordCount || 0,
  }));
}
