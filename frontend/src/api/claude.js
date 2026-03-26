/**
 * Mock API calls for Claude Integration 
 * Uses artificial delay to simulate network requests.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestion = async ({ role, difficulty, interviewType }) => {
  await delay(1500); // 1.5 second artificial delay
  
  // Return a generic mock question based on parameters
  return `As a ${difficulty} ${role}, how would you approach a situation where you have to handle a ${interviewType} challenge under tight deadlines?`;
};

export const evaluateAnswer = async ({ role, question, answer, difficulty }) => {
  await delay(2000); // 2 second delay for evaluation
  
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  let score = 7;
  let verdict = 'Good';

  if (wordCount < 40) {
    score = 5;
    verdict = 'Needs Improvement';
  }
  if (wordCount > 80 && !answer.toLowerCase().includes('um')) {
    score = 9;
    verdict = 'Excellent';
  }

  return {
    verdict,
    score,
    strengths: [
      "Structured the answer reasonably well.",
      "Stayed on topic relevant to the question."
    ],
    weaknesses: [
      "Could include more specific metrics or real-world examples.",
      "Lacked a clear STAR format in parts of the answer."
    ],
    better_answer: "A stronger answer would use the STAR method to explicitly detail the Situation, Task, Action, and Result, utilizing measurable outcomes and reflecting deeper domain expertise.",
    keywords_missed: ["metrics", "collaboration", "impact"]
  };
};

export const generateReport = async (sessionData) => {
  await delay(2500);
  
  // Calculate a mock overall average based on provided scores
  const totalScores = sessionData.scores.reduce((a, b) => a + b, 0);
  const avg = sessionData.scores.length ? totalScores / sessionData.scores.length : 0;
  
  return {
    overall_score: Math.round(avg * 10), // Out of 100
    strengths: ["Clear communication style", "Good foundational knowledge"],
    improvements: ["Need more concrete examples", "Reduce use of filler words"],
    summary: `You showed solid potential for a ${sessionData.role} role. With a bit more practice on your behavioral structuring, you'll do great.`,
    category_scores: {
      "Communication": Math.min(10, Math.round(avg + 1)),
      "Technical Knowledge": Math.min(10, Math.round(avg)),
      "Clarity & Structure": Math.min(10, Math.round(avg - 1)),
      "Confidence Indicators": Math.min(10, Math.round(avg)),
      "Relevance of Answers": Math.min(10, Math.round(avg + 1))
    }
  };
};
