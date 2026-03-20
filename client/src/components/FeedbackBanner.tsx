import { useEffect } from "react";
import type { QuizAnswerResponse } from "../api";

interface Props {
  result: QuizAnswerResponse;
  onDone: () => void;
}

export function FeedbackBanner({ result, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      style={{
        padding: "16px 24px",
        borderRadius: 12,
        marginBottom: 20,
        background: result.correct ? "#d1fae5" : "#fee2e2",
        color: result.correct ? "#065f46" : "#991b1b",
        fontWeight: 600,
        fontSize: 16,
        textAlign: "center",
      }}
    >
      {result.correct ? (
        <span>Helyes!</span>
      ) : (
        <span>
          Helytelen — a helyes válasz: <em>{result.correctAnswer}</em>
        </span>
      )}
    </div>
  );
}
