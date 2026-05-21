import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100dvh", background: "var(--c-bg)", color: "var(--c-text-main)", gap: 16 }}>
      <div style={{ fontFamily: "var(--font-western)", fontSize: 72, lineHeight: 1, color: "var(--c-text-sub2)" }}>404</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text-mut)" }}>页面不存在</div>
      <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: "#FF502E", textDecoration: "none" }}>返回首页</Link>
    </div>
  );
}