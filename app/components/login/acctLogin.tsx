"use client";

import TxtFld from "../ui/txtFld";

type AcctLoginProps = {
  username: string;
  password: string;
  showPassword: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
};

export default function AcctLogin({
  username,
  password,
  showPassword,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
}: AcctLoginProps) {
  return (
    <div className="space-y-4">
      <TxtFld
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
        placeholder="用户名"
        className="h-[56px] w-full"
      />
      <div className="relative">
        <TxtFld
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="密码"
          className="h-[56px] w-full pr-12"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-mut)" }}
          aria-label="切换密码显示"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8s11 8 11 8s-4 8-11 8s-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
