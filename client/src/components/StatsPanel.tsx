import { useState, useEffect } from "react";
import { fetchStats, fetchWords } from "../api";
import type { StatsResponse, WordEntry } from "../api";

export function StatsPanel() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [words, setWords] = useState<WordEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("priority");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const limit = 50;

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    fetchWords(page, limit, sort, order)
      .then((r) => {
        setWords(r.words);
        setTotal(r.total);
      })
      .catch(console.error);
  }, [page, sort, order]);

  function handleSort(field: string) {
    if (sort === field) {
      setOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  function sortIcon(field: string) {
    if (sort !== field) return "";
    return order === "desc" ? " ↓" : " ↑";
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#1e293b", marginBottom: 32 }}>Statisztika</h1>

      {stats && (
        <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          {[
            { label: "Összes szó", value: stats.totalWords, color: "#3b82f6" },
            { label: "Elsajátított (1–3)", value: stats.mastered, color: "#10b981" },
            { label: "Tanulás alatt (4–14)", value: stats.learning, color: "#f59e0b" },
            { label: "Nehéz (15–20)", value: stats.difficult, color: "#ef4444" },
            { label: "Átlag prioritás", value: stats.avgPriority, color: "#8b5cf6" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                flex: "1 1 140px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
            {[
              { field: "english", label: "Angol" },
              { field: "hungarian", label: "Magyar" },
              { field: "priority", label: "Prioritás" },
              { field: "correctCount", label: "Helyes" },
              { field: "wrongCount", label: "Hibás" },
            ].map((col) => (
              <th
                key={col.field}
                onClick={() => handleSort(col.field)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  userSelect: "none",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                {col.label}{sortIcon(col.field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {words.map((w, i) => (
            <tr
              key={w.id}
              style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
            >
              <td style={{ padding: "8px 12px" }}>{w.english}</td>
              <td style={{ padding: "8px 12px" }}>{w.hungarian}</td>
              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      w.priority <= 3 ? "#d1fae5" : w.priority >= 15 ? "#fee2e2" : "#fef3c7",
                    color:
                      w.priority <= 3 ? "#065f46" : w.priority >= 15 ? "#991b1b" : "#92400e",
                  }}
                >
                  {w.priority}
                </span>
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center", color: "#10b981", fontWeight: 600 }}>
                {w.correctCount}
              </td>
              <td style={{ padding: "8px 12px", textAlign: "center", color: "#ef4444", fontWeight: 600 }}>
                {w.wrongCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          style={{ padding: "6px 14px", cursor: "pointer", borderRadius: 8, border: "1px solid #d1d5db" }}
        >
          &larr;
        </button>
        <span style={{ color: "#64748b", fontSize: 14 }}>
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{ padding: "6px 14px", cursor: "pointer", borderRadius: 8, border: "1px solid #d1d5db" }}
        >
          &rarr;
        </button>
      </div>
    </div>
  );
}
