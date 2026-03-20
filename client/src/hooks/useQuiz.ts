import { useState, useCallback } from "react";
import type { Direction, QuizNextResponse, QuizAnswerResponse } from "../api";
import { fetchNextWord, submitAnswer } from "../api";

type Status = "loading" | "idle" | "answered";

interface QuizState {
  status: Status;
  currentWord: QuizNextResponse | null;
  lastResult: QuizAnswerResponse | null;
  error: string | null;
}

export function useQuiz(direction: Direction) {
  const [state, setState] = useState<QuizState>({
    status: "loading",
    currentWord: null,
    lastResult: null,
    error: null,
  });

  const loadNextWord = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", lastResult: null, error: null }));
    try {
      const word = await fetchNextWord(direction);
      setState({ status: "idle", currentWord: word, lastResult: null, error: null });
    } catch {
      setState((s) => ({ ...s, status: "idle", error: "Failed to load word" }));
    }
  }, [direction]);

  const answerWord = useCallback(
    async (answer: string) => {
      if (!state.currentWord) return;
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const result = await submitAnswer(
          state.currentWord!.wordId,
          answer,
          state.currentWord!.direction
        );
        setState((s) => ({ ...s, status: "answered", lastResult: result }));
      } catch {
        setState((s) => ({ ...s, status: "idle", error: "Failed to submit answer" }));
      }
    },
    [state.currentWord]
  );

  return { ...state, loadNextWord, answerWord };
}
