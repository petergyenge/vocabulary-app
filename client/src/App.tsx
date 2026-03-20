import { useState } from "react";
import { QuizCard } from "./components/QuizCard";
import { StatsPanel } from "./components/StatsPanel";

type View = "quiz" | "stats";

export default function App() {
  const [view, setView] = useState<View>("quiz");

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <nav
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {(["quiz", "stats"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "6px 18px",
              borderRadius: 8,
              border: "2px solid",
              borderColor: view === v ? "#3b82f6" : "transparent",
              background: "transparent",
              fontWeight: 600,
              color: view === v ? "#3b82f6" : "#64748b",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {v === "quiz" ? "Kvíz" : "Statisztika"}
          </button>
        ))}
      </nav>

      {view === "quiz" ? <QuizCard /> : <StatsPanel />}
    </div>
  );
}
