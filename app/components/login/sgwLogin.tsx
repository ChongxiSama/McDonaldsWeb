"use client";

import { ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import TxtFld from "../ui/txtFld";

type SgwLoginProps = {
  value: string;
  dragOver: boolean;
  onChange: (value: string) => void;
  onDragOver: (active: boolean) => void;
  onDropFile: (file?: File) => Promise<void>;
  onSelectFile: (file?: File) => Promise<void>;
  previewUrl?: string | null;
  scanSuccess?: boolean;
};

export default function SgwLogin({ value, dragOver, onChange, onDragOver, onDropFile, onSelectFile, previewUrl, scanSuccess }: SgwLoginProps) {
  const onDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    onDragOver(false);
    await onDropFile(event.dataTransfer.files?.[0]);
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await onSelectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Image src={previewUrl} alt="" width={48} height={48} style={{ borderRadius: 8, objectFit: "cover", border: "1px solid var(--c-border)" }} />
          {scanSuccess && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-success)" }}>识别成功</span>}
        </div>
      )}
      <div className="flex items-stretch gap-3">
        <TxtFld value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入二维码内容或机台私钥" className="h-[56px] flex-1" />
        <label
          htmlFor="sgwcmaid-file"
          className="flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-xl border transition" style={{ border: dragOver ? "1px solid var(--c-orange)" : "1px solid var(--c-border)", background: dragOver ? "rgba(255,80,46,0.05)" : "var(--c-surface)" }}
          onDragOver={(event) => { event.preventDefault(); onDragOver(true); }}
          onDragLeave={() => onDragOver(false)}
          onDrop={onDrop}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: dragOver ? "var(--c-orange)" : "var(--c-text-mut)" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </label>
        <input id="sgwcmaid-file" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>
      <p className="text-xs" style={{ color: "var(--c-text-mut)" }}>可点击右侧按钮上传二维码图片自动识别</p>
    </div>
  );
}