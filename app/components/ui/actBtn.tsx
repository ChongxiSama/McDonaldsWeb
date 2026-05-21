import { ButtonHTMLAttributes, ReactNode } from "react";

type ActBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary";
  children: ReactNode;
};

export default function ActBtn({
  variant,
  children,
  className = "",
  ...props
}: ActBtnProps) {
  const variantClass =
    variant === "primary"
      ? "mai-btn-primary text-white"
      : "mai-btn-secondary text-[#FF502E]";

  return (
    <button
      type="button"
      className={`mai-btn ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
