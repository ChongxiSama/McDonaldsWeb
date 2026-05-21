export default function Loading() {
  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "var(--c-bg)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, height: "100dvh", backgroundColor: "var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-text-sub)", fontSize: 14 }}>
        加载中...
      </div>
    </div>
  );
}
