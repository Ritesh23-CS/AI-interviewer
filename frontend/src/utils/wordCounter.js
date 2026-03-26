/**
 * Counts words in a string accurately.
 * 
 * @param {string} text - The answer text.
 * @returns {Object} { count, isValid }
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') {
    return { count: 0, isValid: false };
  }

  // Strip extra spaces and split by whitespace
  const words = text.trim().split(/\s+/).filter(Boolean);
  const count = words.length;

  return { 
    count, 
    isValid: count >= 30 
  };
}

/**
 * Returns a human-readable message based on word count.
 * 
 * @param {number} count - The word count.
 * @returns {string} The appropriate warning/success message.
 */
export function getWordCountMessage(count) {
  if (count < 10) return "Way too short. Elaborate more.";
  if (count >= 10 && count < 20) return "Too brief. Add examples.";
  if (count >= 20 && count < 30) return "Almost there. A bit more detail.";
  return "Good length. Ready to submit.";
}
