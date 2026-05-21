"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--c-bg)", color: "var(--c-text-main)", gap: 16, padding: 20 }}>
      <div style={{ fontSize: 48, lineHeight: 1, color: "var(--c-text-sub2)", fontFamily: "var(--font-western)" }}>!</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text-mut)", textAlign: "center" }}>出了点问题</div>
      <button onClick={reset} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#FF502E", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer" }}>重试</button>
    </div>
  );
}