const shimmer = {
  background: "linear-gradient(90deg, var(--c-border) 25%, var(--c-divider) 50%, var(--c-border) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
};

export default function Loading() {
  return (
    <div className="m2l-user-root">
      <div className="app-container" style={{ background: "var(--c-bg)" }}>
        <div style={{ padding: "24px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ width: 120, height: 32, borderRadius: 6, ...shimmer }} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", ...shimmer }} />
        </div>
        <div style={{ padding: "0 20px", flex: 1 }}>
          <div style={{ height: 180, borderRadius: 20, marginBottom: 16, ...shimmer }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ height: 90, borderRadius: 16, ...shimmer }} />
            <div style={{ height: 90, borderRadius: 16, ...shimmer }} />
          </div>
          <div style={{ height: 130, borderRadius: 16, marginBottom: 16, ...shimmer }} />
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ height: 80, borderRadius: 16, ...shimmer }} />
            <div style={{ height: 80, borderRadius: 16, ...shimmer }} />
          </div>
          <div style={{ height: 100, borderRadius: 16, marginBottom: 16, ...shimmer }} />
          <div style={{ height: 120, borderRadius: 16, ...shimmer }} />
        </div>
      </div>
    </div>
  );
}