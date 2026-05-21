"use client";

import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";
import { loginMai2Link, registerMai2Link } from "@/lib/mai2link-api";
import { getAuthCookie, getMai2LinkGuestCookie, setMai2LinkAuthCookies } from "@/lib/auth-cookie";
import { addAccount, setActiveUser, setActiveMachine } from "@/lib/auth-storage";
import LoginForm from "./LoginForm";
import LoginLanding from "./LoginLanding";
import { revalidateUserData } from "@/actions/revalidate";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

type Mode = "landing" | "form";
type LoginTab = "sgwcmaid" | "account" | "register";

const readImageToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

const parseDataUrlToImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片解析失败"));
    img.src = dataUrl;
  });

const decodeQrcodeText = async (file: File) => {
  if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
  const dataUrl = await readImageToDataUrl(file);
  const image = await parseDataUrlToImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法读取图片内容");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = jsQR(imageData.data, imageData.width, imageData.height);
  if (!decoded?.data) throw new Error("未能识别出二维码内容");
  return decoded.data.trim();
};

export default function LoginScr() {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("landing");
  const [activeTab, setActiveTab] = useState<LoginTab>("sgwcmaid");
  const [qrcode, setQrcode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [cfToken, setCfToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  const submitText = useMemo(() => (isSubmitting ? "验证中..." : activeTab === "register" ? "注 册" : "登 录"), [isSubmitting, activeTab]);
  const canSubmit = activeTab === "register" ? Boolean(cfToken) && !isSubmitting : !isSubmitting;

  const resetTurnstile = () => { setCfToken(""); setTurnstileResetSignal((p) => p + 1); };

  useEffect(() => {
    if (getAuthCookie() || getMai2LinkGuestCookie()) router.replace("/home");
  }, [router]);

  const doLogin = async (payload: { qrcode?: string; username?: string; password?: string; cf_token: string }) => {
    setIsSubmitting(true); setError("");
    try {
      const result = await loginMai2Link(payload);
      setMai2LinkAuthCookies(result.token, result.isMachine);
      const acc = addAccount(result.token, result.isMachine, result.isMachine ? "机台账号" : "用户账号");
      if (result.isMachine) setActiveMachine(acc.id); else setActiveUser(acc.id);
      revalidateUserData();
      router.push("/home");
    } catch (err) {
      resetTurnstile();
      setError(err instanceof Error ? err.message : "登录失败");
    } finally { setIsSubmitting(false); }
  };

  const onUploadFile = async (file?: File) => {
    if (!file) return;
    try {
      const decoded = await decodeQrcodeText(file);
      setQrcode(decoded);
      setScanSuccess(true);
      setPreviewUrl(URL.createObjectURL(file));
      if (cfToken) doLogin({ qrcode: decoded, cf_token: cfToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : "识别失败");
    }
  };

  const submitSGWCMAID = async () => {
    const normalized = qrcode.trim();
    if (!normalized) { setError("请输入二维码内容或机台私钥"); return; }
    await doLogin({ qrcode: normalized, cf_token: cfToken });
  };

  const submitAccount = async () => {
    if (!username.trim() || !password) { setError("请输入用户名和密码"); return; }
    await doLogin({ username: username.trim(), password, cf_token: cfToken });
  };

  const submitRegister = async () => {
    if (!cfToken) { setError("请先完成人机验证"); return; }
    if (!regUsername.trim() || !regPassword) { setError("请输入用户名和密码"); return; }
    if (regPassword !== regConfirm) { setError("两次密码不一致"); return; }
    setIsSubmitting(true); setError("");
    try {
      const res = await registerMai2Link({ username: regUsername.trim(), password: regPassword, cf_token: cfToken });
      setMai2LinkAuthCookies(res.token, false);
      const regAcc = addAccount(res.token, false, regUsername.trim());
      setActiveUser(regAcc.id);
      revalidateUserData();
      router.push("/home");
    } catch (err) {
      resetTurnstile();
      setError(err instanceof Error ? err.message : "注册失败");
    } finally { setIsSubmitting(false); }
  };

  const handleSubmit = activeTab === "register" ? submitRegister : activeTab === "account" ? submitAccount : submitSGWCMAID;

  return (
    <div className="mai-page">
      {isSubmitting && (
        <div style={{ position: "fixed", inset: 0, background: "var(--c-overlay)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", borderRadius: 20, padding: "30px 40px", textAlign: "center", animation: "scale-in 0.25s ease-out" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--c-border)", borderTopColor: "var(--c-orange)", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text-main)" }}>{activeTab === "register" ? "注册中..." : "登录中..."}</div>
          </div>
        </div>
      )}
      <div className="mai-shell">
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
            style={{ background: "none", border: "none", color: "var(--c-text-mut)", cursor: "pointer", padding: 4, display: "flex" }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="mai-header">
          <NextImage src="/mai2link-logo.svg" alt="Mai2Link Logo" width={879} height={678} priority className="mai-logo" />
          {mode === "landing" ? (
            <div className="mai-brand-copy">
              <h1 className="mai-title-cn">欢迎加入</h1>
              <div className="mai-title-en">WELCOME TO MAI<span className="text-[#FF502E]">2</span>LINK</div>
            </div>
          ) : null}
        </div>

        <div className="min-h-10 flex-1" />

        <div className="mai-footer">
          {mode === "landing" ? (
            <LoginLanding
              onSgwLogin={() => { setActiveTab("sgwcmaid"); setMode("form"); resetTurnstile(); }}
              onAccountLogin={() => { setActiveTab("account"); setMode("form"); resetTurnstile(); }}

              onRegister={() => { setActiveTab("register"); setMode("form"); resetTurnstile(); }}
            />
          ) : (
            <LoginForm
              activeTab={activeTab}
              onBack={() => { setMode("landing"); resetTurnstile(); setError(""); }}
              onTabChange={setActiveTab}
              qrcode={qrcode}
              username={username}
              password={password}
              regUsername={regUsername}
              regPassword={regPassword}
              regConfirm={regConfirm}
              showPassword={showPassword}
              dragOver={dragOver}
              submitText={submitText}
              canSubmit={canSubmit}
              turnstileResetSignal={turnstileResetSignal}
              error={error}
              previewUrl={previewUrl}
              scanSuccess={scanSuccess}
              onQrcodeChange={(v) => { setQrcode(v); setScanSuccess(false); setPreviewUrl(null); }}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onRegUsernameChange={setRegUsername}
              onRegPasswordChange={setRegPassword}
              onRegConfirmChange={setRegConfirm}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onDragOverChange={setDragOver}
              onUploadFile={onUploadFile}
              onTurnstileSuccess={setCfToken}
              onTurnstileExpire={() => setCfToken("")}
              onTurnstileError={() => setCfToken("")}
              onSubmit={handleSubmit}
              onResetTurnstile={resetTurnstile}
            />
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}