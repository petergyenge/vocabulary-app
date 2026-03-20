export type Direction = "en-hu" | "hu-en" | "both";

export interface QuizNextResponse {
  wordId: number;
  prompt: string;
  direction: "en-hu" | "hu-en";
  priority: number;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  newPriority: number;
  correctCount: number;
  wrongCount: number;
}

export interface StatsResponse {
  totalWords: number;
  mastered: number;
  learning: number;
  difficult: number;
  avgPriority: number;
}

export interface WordEntry {
  id: number;
  english: string;
  hungarian: string;
  priority: number;
  correctCount: number;
  wrongCount: number;
  lastSeenAt: string | null;
}

export interface WordsResponse {
  words: WordEntry[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchNextWord(direction: Direction): Promise<QuizNextResponse> {
  const res = await fetch(`/api/quiz/next?direction=${direction}`);
  if (!res.ok) throw new Error("Failed to fetch next word");
  return res.json();
}

export async function submitAnswer(
  wordId: number,
  answer: string,
  direction: "en-hu" | "hu-en"
): Promise<QuizAnswerResponse> {
  const res = await fetch("/api/quiz/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordId, answer, direction }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchWords(
  page: number,
  limit: number,
  sort: string,
  order: "asc" | "desc"
): Promise<WordsResponse> {
  const res = await fetch(`/api/stats/words?page=${page}&limit=${limit}&sort=${sort}&order=${order}`);
  if (!res.ok) throw new Error("Failed to fetch words");
  return res.json();
}
