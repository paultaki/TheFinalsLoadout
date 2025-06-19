import type { Loadout } from '../types';

/**
 * Limits a string to a maximum number of words
 */
function limitWords(str: string, max = 20): string {
  const words = str.split(/\s+/).filter(word => word.length > 0);
  if (words.length <= max) return str;
  
  // If it has a score at the end, preserve it
  const lastWord = words[words.length - 1];
  if (lastWord.match(/\d+\/10$/)) {
    // Take first 19 words + score
    return words.slice(0, max - 1).join(' ') + ' ' + lastWord;
  }
  
  return words.slice(0, max).join(' ') + '…';
}

/**
 * Fetches AI analysis for a loadout with proper error handling and timeout
 */
export async function getAIAnalysis(loadout: Loadout): Promise<string> {
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const payload = {
      class: loadout.classType,
      weapon: loadout.weapon?.name?.replace(/_/g, ' ') || '',
      specialization: loadout.specialization?.name?.replace(/_/g, ' ') || '',
      gadgets: [
        loadout.gadget1?.name,
        loadout.gadget2?.name,
        loadout.gadget3?.name
      ].filter(Boolean).map(g => (g || '').replace(/_/g, ' ')) // Remove underscores and filter undefined
    };


    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // The API might return various formats
    const { roast = '', text = '', score, rating } = data;
    
    // Get the base text and limit to 20 words
    const rawText = (roast || text || '').toString();
    const baseText = limitWords(rawText.trim(), 20);
    
    if (!baseText) {
      return 'AI analysis unavailable right now. Try again! 5/10';
    }
    
    // Handle score normalization
    let score10: number | undefined;
    
    // If we already have a 0-10 rating, use it
    if (typeof rating === 'number') {
      score10 = rating;
    }
    // If we have a 0-100 score, convert to 0-10
    else if (typeof score === 'number') {
      score10 = Math.round(score / 10);
    }
    
    // Extract score from text if present (e.g., "text 8/10")
    const scoreMatch = baseText.match(/\s*(\d+)\/10$/);
    if (scoreMatch) {
      score10 = parseInt(scoreMatch[1], 10);
      // Remove the score from baseText to avoid duplication
      const textWithoutScore = baseText.replace(/\s*\d+\/10$/, '');
      const limitedText = limitWords(textWithoutScore, 20);
      
      // Ensure score is within bounds
      const cleanScore = Math.min(Math.max(score10, 0), 10);
      return `${limitedText} ${cleanScore}/10`;
    }
    
    // Add score if we have one
    if (score10 !== undefined) {
      // Ensure score is within bounds
      const cleanScore = Math.min(Math.max(score10, 0), 10);
      return `${baseText} ${cleanScore}/10`;
    }
    
    // No score found, return text only
    return baseText;
    
  } catch (error) {
    console.error('AI analysis failed:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return 'AI taking too long to think... Try again! 5/10';
      }
      if (error.message.includes('API returned')) {
        return 'AI crystal ball is offline—try again in a bit.';
      }
    }
    
    // Generic fallback with some personality
    return 'AI crystal ball is offline—try again in a bit.';
  }
}