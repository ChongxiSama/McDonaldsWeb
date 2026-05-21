import { ReactNode } from "react";

type CtlBtnProps = {
  icon: ReactNode;
  name: string;
  desc: string;
  onClick: () => void;
  tone?: "normal" | "warn";
};

export default function CtlBtn({ icon, name, desc, onClick, tone = "normal" }: CtlBtnProps) {
  return (
    <button
      type="button"
      className={`ctl-btn ${tone === "warn" ? "is-warn" : ""}`}
      onClick={onClick}
    >
      <div className="ctl-icon">{icon}</div>
      <div>
        <div className="ctl-name">{name}</div>
        <div className="ctl-desc">{desc}</div>
      </div>
    </button>
  );
}
