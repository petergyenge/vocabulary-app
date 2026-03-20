import { useState, useEffect, useRef } from "react";
import type { Direction } from "../api";
import { useQuiz } from "../hooks/useQuiz";
import { DirectionSelector } from "./DirectionSelector";
import { FeedbackBanner } from "./FeedbackBanner";

const DIRECTION_KEY = "quiz_direction";

export function QuizCard() {
  const [direction, setDirection] = useState<Direction>(
    () => (localStorage.getItem(DIRECTION_KEY) as Direction) ?? "both"
  );
  const [answer, setAnswer] = useState("");
  const { status, currentWord, lastResult, error, loadNextWord, answerWord } =
    useQuiz(direction);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load first word on mount and when direction changes
  useEffect(() => {
    loadNextWord();
  }, [loadNextWord]);

  // Focus input when idle
  useEffect(() => {
    if (status === "idle") {
      inputRef.current?.focus();
    }
  }, [status]);

  function handleDirectionChange(d: Direction) {
    setDirection(d);
    localStorage.setItem(DIRECTION_KEY, d);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || status !== "idle") return;
    await answerWord(answer.trim());
    setAnswer("");
  }

  function handleNext() {
    setAnswer("");
    loadNextWord();
  }

  const dirLabel =
    currentWord?.direction === "en-hu" ? "Fordítsd magyarra" : "Fordítsd angolra";

  return (
    <div
      style={{
        maxWidth: 540,
        margin: "0 auto",
        padding: "40px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 32, color: "#1e293b" }}>
        Szótár Kvíz
      </h1>

      <DirectionSelector value={direction} onChange={handleDirectionChange} />

      {status === "answered" && lastResult && (
        <FeedbackBanner result={lastResult} onDone={handleNext} />
      )}

      {error && (
        <div style={{ color: "#dc2626", marginBottom: 16, textAlign: "center" }}>
          {error}
        </div>
      )}

      {currentWord && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{dirLabel}</p>
          <p style={{ fontSize: 36, fontWeight: 700, color: "#1e293b", marginBottom: 32 }}>
            {currentWord.prompt}
          </p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={status !== "idle"}
              placeholder="Írd be a fordítást..."
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: 18,
                borderRadius: 10,
                border: "2px solid #e2e8f0",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />
            <button
              type="submit"
              disabled={status !== "idle" || !answer.trim()}
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 10,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                opacity: status !== "idle" || !answer.trim() ? 0.5 : 1,
              }}
            >
              {status === "loading" ? "..." : "Ellenőrzés"}
            </button>
          </form>
        </div>
      )}

      {!currentWord && status === "loading" && (
        <p style={{ textAlign: "center", color: "#64748b" }}>Betöltés...</p>
      )}
    </div>
  );
}
