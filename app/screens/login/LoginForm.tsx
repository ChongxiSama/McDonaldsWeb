"use client";

import ActBtn from "@/components/ui/actBtn";
import Turnstile from "@/components/ui/turnstile";
import SgwLogin from "@/components/login/sgwLogin";
import AcctLogin from "@/components/login/acctLogin";
import { AlertCircle } from "lucide-react";

type LoginTab = "sgwcmaid" | "account" | "register";

type LoginFormProps = {
  activeTab: LoginTab;
  onBack: () => void;
  onTabChange: (tab: LoginTab) => void;
  qrcode: string;
  username: string;
  password: string;
  regUsername: string;
  regPassword: string;
  regConfirm: string;
  showPassword: boolean;
  dragOver: boolean;
  submitText: string;
  canSubmit: boolean;
  turnstileResetSignal: number;
  error: string;
  previewUrl: string | null;
  scanSuccess: boolean;
  onQrcodeChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRegUsernameChange: (value: string) => void;
  onRegPasswordChange: (value: string) => void;
  onRegConfirmChange: (value: string) => void;
  onTogglePassword: () => void;
  onDragOverChange: (active: boolean) => void;
  onUploadFile: (file?: File) => Promise<void>;
  onTurnstileSuccess: (token: string) => void;
  onTurnstileExpire: () => void;
  onTurnstileError: () => void;
  onSubmit: () => void;
  onResetTurnstile: () => void;
};

export default function LoginForm({
  activeTab, onBack, onTabChange, qrcode, username, password,
  regUsername, regPassword, regConfirm, showPassword, dragOver,
  submitText, canSubmit, turnstileResetSignal, error, previewUrl, scanSuccess,
  onQrcodeChange, onUsernameChange, onPasswordChange,
  onRegUsernameChange, onRegPasswordChange, onRegConfirmChange,
  onTogglePassword, onDragOverChange, onUploadFile,
  onTurnstileSuccess, onTurnstileExpire, onTurnstileError, onSubmit, onResetTurnstile,
}: LoginFormProps) {
  return (
    <>
      <button type="button" className="mai-back" onClick={onBack}>← 返回前页</button>

      <div className="mai-tabs">
        <button type="button" className={`mai-tab ${activeTab === "sgwcmaid" ? "is-active" : ""}`} onClick={() => { onTabChange("sgwcmaid"); onResetTurnstile(); }}>SGWCMAID</button>
        <button type="button" className={`mai-tab ${activeTab === "account" ? "is-active" : ""}`} onClick={() => { onTabChange("account"); onResetTurnstile(); }}>账号密码</button>
        <button type="button" className={`mai-tab ${activeTab === "register" ? "is-active" : ""}`} onClick={() => { onTabChange("register"); onResetTurnstile(); }}>注册</button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--c-danger-light, rgba(239,68,68,0.08))", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 8, fontSize: 13, color: "var(--c-danger)" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {activeTab === "sgwcmaid" ? (
        <>
          <SgwLogin
            value={qrcode}
            dragOver={dragOver}
            onChange={onQrcodeChange}
            onDragOver={onDragOverChange}
            onDropFile={onUploadFile}
            onSelectFile={onUploadFile}
            previewUrl={previewUrl}
            scanSuccess={scanSuccess}
          />
        </>
      ) : activeTab === "account" ? (
        <>
          <AcctLogin
            username={username}
            password={password}
            showPassword={showPassword}
            onUsernameChange={onUsernameChange}
            onPasswordChange={onPasswordChange}
            onTogglePassword={onTogglePassword}
          />
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
          <input className="mai-input" style={{ height: 42 }} placeholder="用户名" value={regUsername} onChange={(e) => onRegUsernameChange(e.target.value)} />
          <input className="mai-input" style={{ height: 42 }} placeholder="密码" type="password" value={regPassword} onChange={(e) => onRegPasswordChange(e.target.value)} />
          <input className="mai-input" style={{ height: 42 }} placeholder="确认密码" type="password" value={regConfirm} onChange={(e) => onRegConfirmChange(e.target.value)} />
        </div>
      )}

      {activeTab === "register" && (
        <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADLNmi6RQBRHM0zq"} onSuccess={onTurnstileSuccess} onExpire={onTurnstileExpire} onError={onTurnstileError} resetSignal={turnstileResetSignal} className="my-4" />
      )}

      <ActBtn variant="primary" disabled={activeTab === "register" ? !canSubmit : activeTab === "sgwcmaid" ? !qrcode.trim() : !username.trim() || !password} onClick={onSubmit}>{submitText}</ActBtn>
    </>
  );
}