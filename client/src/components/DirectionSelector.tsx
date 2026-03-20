import type { Direction } from "../api";

interface Props {
  value: Direction;
  onChange: (d: Direction) => void;
}

const OPTIONS: { value: Direction; label: string }[] = [
  { value: "en-hu", label: "EN → HU" },
  { value: "hu-en", label: "HU → EN" },
  { value: "both", label: "Mindkettő" },
];

export function DirectionSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "2px solid",
            borderColor: value === opt.value ? "#3b82f6" : "#d1d5db",
            background: value === opt.value ? "#3b82f6" : "#fff",
            color: value === opt.value ? "#fff" : "#374151",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
