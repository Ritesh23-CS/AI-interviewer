const FILLER_WORDS_LIST = [
  "um", "uh", "like", "basically", "you know", 
  "kind of", "sort of", "literally", 
  "right", "okay so", "i mean", "actually"
];

/**
 * Scans text for common filler words.
 * 
 * @param {string} text - The input answer string.
 * @returns {Object} { count, words: [{word, occurrences}], percentage }
 */
export function detectFillerWords(text) {
  if (!text || typeof text !== 'string') {
    return { count: 0, words: [], percentage: 0 };
  }

  const lowerText = text.toLowerCase();
  // Strip out punctuation for an accurate word count metric
  const totalWords = lowerText.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).length;
  
  const wordsDetected = [];
  let totalFillers = 0;

  FILLER_WORDS_LIST.forEach(word => {
    // Escape regex chars
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match exact phrases/words 
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    const matches = lowerText.match(regex);
    
    if (matches && matches.length > 0) {
      totalFillers += matches.length;
      wordsDetected.push({
        word,
        occurrences: matches.length
      });
    }
  });

  const percentage = totalWords > 0 ? (totalFillers / totalWords) * 100 : 0;

  return {
    count: totalFillers,
    words: wordsDetected,
    percentage: Number(percentage.toFixed(1))
  };
}
