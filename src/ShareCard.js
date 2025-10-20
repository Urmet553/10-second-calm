import React from "react";

export default function ShareCard({ streak, lastDate, quote, theme = "dark" }) {
  const styles =
    theme === "dark"
      ? {
          bg: "linear-gradient(135deg,#1e293b 0%,#334155 40%,#3b82f6 100%)",
          sub: "#cbd5e1",
          hint: "#94a3b8",
          orb: "radial-gradient(circle at 30% 30%,#60a5fa,#818cf8 50%,#1e40af 100%)",
          glow: "0 0 40px rgba(59,130,246,0.45)",
        }
      : {
          bg: "linear-gradient(135deg,#ffffff 0%,#eef2ff 40%,#dbeafe 100%)",
          sub: "#374151",
          hint: "#6b7280",
          orb: "radial-gradient(circle at 30% 30%,#60a5fa,#93c5fd 55%,#2563eb 100%)",
          glow: "0 0 40px rgba(37,99,235,0.35)",
        };

  return (
    <div
      style={{
        width: 380,
        borderRadius: 22,
        padding: 24,
        background: styles.bg,
        color: theme === "dark" ? "white" : "#111827",
        fontFamily: "Inter, system-ui, sans-serif",
        textAlign: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
      id="share-card"
    >
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
        10 Second Calm
      </h2>
      <p style={{ color: styles.sub, marginBottom: 20, lineHeight: 1.35 }}>
        “{quote}”
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 28,
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: styles.hint }}>Zen Streak</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{streak} days</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: styles.hint }}>Last session</div>
          <div style={{ fontSize: 16 }}>{lastDate ?? "—"}</div>
        </div>
      </div>

      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          margin: "0 auto 16px",
          background: styles.orb,
          boxShadow: styles.glow,
        }}
      />

      <p style={{ color: styles.hint, fontSize: 14 }}>
        Stay calm. Stay consistent. ✨
      </p>
    </div>
  );
}
