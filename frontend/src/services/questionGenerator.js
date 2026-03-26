import { getQuestionsForRole } from '../utils/questionBank';

// In-memory session store so we don't repeat questions within a session
let sessionQuestions = [];
let sessionRole = null;
let sessionDifficulty = null;

/**
 * Resets the question queue when a new session starts.
 * Call this from HomeScreen/SessionProvider when a session begins.
 */
export function resetQuestionQueue() {
  sessionQuestions = [];
  sessionRole = null;
  sessionDifficulty = null;
}

/**
 * Returns the next question from the local bank — NO API call.
 * Questions are shuffled per session and served in order.
 *
 * @param {Object} params
 * @param {string} params.role - The job role.
 * @param {string} params.difficulty - The difficulty level.
 * @param {string} params.interviewType - Not used for fetching, kept for compatibility.
 * @param {number} params.questionNumber - The 1-based index of the current question.
 * @param {string[]} params.previousQuestions - Already asked questions (safety dedup).
 * @returns {{ question: string }} The next question.
 */
export function generateQuestion({
  role,
  difficulty,
  questionNumber,
}) {
  // If role/difficulty changed or first call, reload the bank for this session
  if (role !== sessionRole || difficulty !== sessionDifficulty || sessionQuestions.length === 0) {
    sessionQuestions = getQuestionsForRole(role, difficulty);
    sessionRole = role;
    sessionDifficulty = difficulty;
  }

  // Pick question by index (0-based), clamp to array length
  const index = Math.min(questionNumber - 1, sessionQuestions.length - 1);
  const question = sessionQuestions[index];

  return { question };
}
