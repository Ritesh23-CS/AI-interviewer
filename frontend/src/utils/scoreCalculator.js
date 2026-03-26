/**
 * Aggregates all evaluations to calculate final session metrics.
 * 
 * @param {Array<Object>} evaluations - Array of evaluation objects returned by answerEvaluator.
 * @returns {Object} A structured summary of the overall score.
 */
export function calculateSessionScore(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    return {
      overall: 0,
      byCategory: {
        communication: 0,
        technical_knowledge: 0,
        clarity_structure: 0,
        confidence_indicators: 0,
        relevance: 0
      },
      totalQuestions: 0,
      goodAnswers: 0,
      needsImprovementAnswers: 0,
      poorAnswers: 0
    };
  }

  const totals = {
    score: 0,
    communication: 0,
    technical_knowledge: 0,
    clarity_structure: 0,
    confidence_indicators: 0,
    relevance: 0
  };

  let goodAnswers = 0;
  let needsImprovementAnswers = 0;
  let poorAnswers = 0;

  const validEvaluations = evaluations.filter(e => e && typeof e.score === 'number');
  const count = validEvaluations.length || 1; // Prevent division by zero

  validEvaluations.forEach(ev => {
    totals.score += ev.score || 0;
    
    if (ev.scores) {
      totals.communication += ev.scores.communication || 0;
      totals.technical_knowledge += ev.scores.technical_knowledge || 0;
      totals.clarity_structure += ev.scores.clarity_structure || 0;
      totals.confidence_indicators += ev.scores.confidence_indicators || 0;
      totals.relevance += ev.scores.relevance || 0;
    }

    const verdict = (ev.verdict || '').toLowerCase();
    if (verdict.includes('good') || verdict.includes('excellent')) {
      goodAnswers += 1;
    } else if (verdict.includes('needs') || verdict.includes('improvement')) {
      needsImprovementAnswers += 1;
    } else {
      poorAnswers += 1;
    }
  });

  return {
    overall: Number((totals.score / count).toFixed(1)),
    byCategory: {
      communication: Number((totals.communication / count).toFixed(1)),
      technical_knowledge: Number((totals.technical_knowledge / count).toFixed(1)),
      clarity_structure: Number((totals.clarity_structure / count).toFixed(1)),
      confidence_indicators: Number((totals.confidence_indicators / count).toFixed(1)),
      relevance: Number((totals.relevance / count).toFixed(1)),
    },
    totalQuestions: evaluations.length,
    goodAnswers,
    needsImprovementAnswers,
    poorAnswers
  };
}
