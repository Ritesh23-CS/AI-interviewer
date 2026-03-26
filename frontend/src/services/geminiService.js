import OpenAI from 'openai';

// GitHub Models uses OpenAI-compatible API routed through Azure
const githubToken = import.meta.env.VITE_GITHUB_TOKEN || '';
const modelName   = import.meta.env.VITE_GITHUB_MODEL || 'gpt-4o-mini';

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: githubToken,
  dangerouslyAllowBrowser: true, // Required for client-side SDK usage
});

/**
 * Core function to call a GitHub-hosted AI model.
 *
 * @param {string}  prompt  - The user prompt to send.
 * @param {boolean} isJSON  - Whether to request a JSON-only response.
 * @param {number}  retries - Internal retry counter.
 * @returns {Promise<string|Object>} Parsed text or JSON from the model.
 */
export async function callGemini(prompt, isJSON = false, retries = 1) {
  try {
    if (!githubToken || githubToken === 'your_github_pat_here') {
      throw new Error('GitHub token not configured. Add VITE_GITHUB_TOKEN to your .env file.');
    }

    if (!navigator.onLine) {
      throw new Error('No internet connection. Check your network.');
    }

    // 1.5 s minimum delay for UX feel (run in parallel with API call)
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    const requestParams = {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    };

    // Ask for strict JSON output when needed
    if (isJSON) {
      requestParams.response_format = { type: 'json_object' };
    }

    const [response] = await Promise.all([
      client.chat.completions.create(requestParams),
      delayPromise,
    ]);

    const text = response.choices[0]?.message?.content?.trim() || '';

    if (isJSON) {
      try {
        return JSON.parse(text);
      } catch {
        // Strip any accidental markdown fences
        const cleaned = text.replace(/```json/i, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    }

    return text;

  } catch (error) {
    const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('Too Many');
    const isRateLimit = is429 || error?.message?.includes('rate limit');

    if (isRateLimit) {
      error.message = 'Too many requests. Please wait 30 seconds.';
      error.isRateLimit = true;
    }

    console.error('AI Service Error:', error.message);

    // Do NOT retry on rate limits — it makes it worse
    if (retries > 0 && !error.message.includes('token not configured') && !isRateLimit) {
      console.warn(`Retrying AI call... (${retries} retries left)`);
      return callGemini(prompt, isJSON, retries - 1);
    }

    // Use fallback mock data for JSON calls on failure
    if (isJSON) {
      console.warn('Returning fallback mock data due to AI API failure.');
      return getFallbackMockData(prompt);
    }

    throw error;
  }
}

/**
 * Fallback mock data returned when the AI API is unavailable.
 */
function getFallbackMockData(prompt) {
  // Detect which type of call failed based on prompt keywords
  if (prompt.includes('overall_score')) {
    return {
      overall_score: 70,
      category_scores: {
        communication: 7, technical_knowledge: 7,
        clarity_structure: 7, confidence_indicators: 7, relevance: 7,
      },
      top_strengths: [
        'Attempted all questions (Fallback)',
        'Maintained composure throughout (Fallback)',
        'Provided structured responses (Fallback)',
      ],
      areas_to_improve: [
        'Add more specific examples (Fallback)',
        'Use the STAR method more clearly (Fallback)',
        'Provide concrete metrics to back up claims (Fallback)',
      ],
      overall_summary: 'This is a fallback report generated because the AI service was unavailable. Re-run your interview with a valid API token for accurate feedback.',
      hiring_recommendation: 'Maybe',
      recommended_resources: [{ topic: 'STAR Interview Method', reason: 'Helps structure answers clearly' }],
    };
  }

  // Batch/single-answer evaluation fallback
  return {
    verdict: 'Needs Improvement',
    score: 5,
    scores: { communication: 5, technical_knowledge: 5, clarity_structure: 5, confidence_indicators: 5, relevance: 5 },
    strengths: ['Provided an answer (Fallback)'],
    weaknesses: ['AI evaluation was unavailable — this is mock feedback (Fallback)'],
    better_answer: 'Fallback: A strong answer uses the STAR format — Situation, Task, Action, Result.',
    keywords_missed: ['STAR', 'metrics', 'outcome'],
    star_method_used: false,
    filler_word_count: 0,
  };
}
