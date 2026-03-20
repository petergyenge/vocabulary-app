/** Returns the index of a randomly selected item using weighted probability. */
function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export interface WordWeight {
  id: number;
  priority: number;
}

/** Pick a random word ID weighted by priority (higher priority = more likely). */
export function pickWeightedWord(words: WordWeight[]): number {
  const weights = words.map((w) => w.priority);
  const idx = weightedRandomIndex(weights);
  return words[idx].id;
}
