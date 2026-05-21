const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://xn--9er778cb3e.xn--igrr70arr3c.vip/zundalink/api/v0";
const CTL_PWD_DEFAULT = process.env.CTL_PWD_DEFAULT || "Mai2Linkrkr彩蛋码";

import type {
  GetTokenResponse, TokenRegResponse, ValidateTokenResponse, TokenBindResponse, TokenLogoutResponse,
  AimeDBRegResponse, AimeDBRegTempResponse, AimeDBRegTokenResponse,
  ForwardGetResponse, ForwardAddResponse, ForwardDelResponse,
  PhotoGetResponse, PhotoDelFileResponse,
  UploadCacheGetResponse, UploadCacheUploadResponse, UploadCacheDelResponse, UploadCacheGetFileResponse,
  CacheBackupResponse, CacheBackupAquaResponse, CacheRestoreResponse,
  BlackRoomReqResponse, UsageGetResponse, PlaylogGetResponse,
  PlayerQueueGetResponse, M2LIdGetResponse, M2LIdBindUserIdResponse, M2LIdBindQRCodeResponse,
  HealthCheckGetResponse, M2lCtlIPCConfigGetResponse,
} from "./types";

async function postApi<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.msg || `HTTP ${res.status}`);
    }
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function getApi<T>(endpoint: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "GET",
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.msg || `HTTP ${res.status}`);
    }
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const p = JSON.parse(value);
      if (p && typeof p === "object" && !Array.isArray(p)) return p as Record<string, unknown>;
    } catch { console.warn("parse failed", value); }
  }
  return {};
}

function readMsg(res: Record<string, unknown> | { msg?: unknown; message?: unknown }, fallback = "操作成功"): string {
  const r = res as Record<string, unknown>;
  if (typeof r.msg === "string" && r.msg.trim()) return r.msg;
  if (typeof r.message === "string" && r.message.trim()) return r.message;
  return fallback;
}

function parseNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = Number(v); return Number.isFinite(n) ? n : 0; }
  return 0;
}

function parseStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
  return false;
}

function parsePct(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") { const n = Number(v.replace("%", "").trim()); return Number.isFinite(n) ? n : 0; }
  return 0;
}

/** Pick fields from obj with snake_case fallback, return typed result */
function pick<T extends Record<string, (v: unknown) => unknown>>(
  obj: Record<string, unknown> | undefined | null,
  fields: T,
  aliases?: Record<string, string[]>,
): { [K in keyof T]: ReturnType<T[K]> } {
  const out = {} as Record<string, unknown>;
  const o = obj ?? {};
  for (const [key, parser] of Object.entries(fields)) {
    const candidates = [o[key], ...(aliases?.[key] ?? []).map((a) => o[a])];
    out[key] = parser(candidates.find((v) => v !== undefined));
  }
  return out as ReturnType<() => { [K in keyof T]: ReturnType<T[K]> }>;
}

/** Parse forward rules from API response */
function parseForwardRules(src: unknown): Record<string, { enable: boolean; value: string }> {
  const fd = asRecord(src);
  const rules = asRecord(fd.rules);
  const out: Record<string, { enable: boolean; value: string }> = {};
  for (const [k, v] of Object.entries(rules)) {
    if (v && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      out[k] = { enable: parseBool(obj.enable), value: parseStr(obj.value) };
    }
  }
  return out;
}



export async function loginMai2Link(payload: {
  qrcode?: string;
  username?: string;
  password?: string;
  cf_token?: string;
}): Promise<{ token: string; isMachine: boolean; msg: string }> {
  const res = await postApi<GetTokenResponse>("/token/get", payload);
  const r = (res as unknown as Record<string, unknown>);
  const token = parseStr(res.token) || (typeof r.data === "object" && r.data ? parseStr((r.data as Record<string, unknown>).token) : "");
  if (!token) throw new Error("登录成功但未返回 token");
  const isMachine = parseBool(res.isMachine) || (typeof r.data === "object" && r.data ? parseBool((r.data as Record<string, unknown>).isMachine) : false);
  return { token, isMachine, msg: readMsg(res) };
}

export async function registerMai2Link(payload: { username: string; password: string; cf_token: string }): Promise<{ success: boolean; msg: string; token: string }> {
  const res = await postApi<TokenRegResponse>("/token/reg", payload);
  return { success: parseBool(res.success), msg: readMsg(res), token: parseStr(res.token) };
}

export async function validateTokenMai2Link(payload: { token: string }): Promise<{ valid: boolean; token?: string; expires_at?: string; expired?: boolean }> {
  const res = await postApi<ValidateTokenResponse>("/token/validate", payload);
  return { valid: parseBool(res.valid), token: parseStr(res.token), expires_at: parseStr(res.expires_at), expired: parseBool(res.expired) };
}

export async function bindPasswordMai2Link(payload: { token: string; username: string; old_password?: string; new_password: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<TokenBindResponse>("/token/bind", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}

export async function logoutMai2Link(payload: { token: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<TokenLogoutResponse>("/token/logout", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}



export async function aimeDBReg(payload: { token: string }): Promise<{ success: boolean; msg: string; accessCode: string }> {
  const res = await postApi<AimeDBRegResponse>("/aimedb/reg", payload);
  return { success: parseBool(res.success), msg: readMsg(res), accessCode: parseStr(res.accessCode) };
}

export async function aimeDBRegTemp(payload: { token: string }): Promise<{ success: boolean; msg: string; accessCode: string }> {
  const res = await postApi<AimeDBRegTempResponse>("/aimedb/reg-temp", payload);
  return { success: parseBool(res.success), msg: readMsg(res), accessCode: parseStr(res.accessCode) };
}

export async function aimeDBRegToken(payload: { SGWCMAID: string; clientId: string; token: string; cf_token: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<AimeDBRegTokenResponse>("/aimedb/reg-token", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}



export async function getForwardRulesMai2Link(payload: { token: string; clientId?: string; clientPwd?: string }): Promise<Record<string, { enable: boolean; value: string }>> {
  const res = await postApi<ForwardGetResponse>("/forward/get", payload);
  return parseForwardRules(
    res.forwardData ?? asRecord((res as unknown as Record<string, unknown>).data).forwardData,
  );
}

export async function upsertForwardRuleMai2Link(payload: { token: string; rule: string; enable: boolean; value: string; clientId?: string; clientPwd?: string }): Promise<string> {
  const res = await postApi<ForwardAddResponse>("/forward/add", payload);
  return readMsg(res);
}

export async function deleteForwardRuleMai2Link(payload: { token: string; rule: string; clientId?: string; clientPwd?: string }): Promise<{ msg: string; forwardData: Record<string, { enable: boolean; value: string }> }> {
  const res = await postApi<ForwardDelResponse>("/forward/del", payload);
  return {
    msg: readMsg(res),
    forwardData: parseForwardRules(
      res.forwardData ?? asRecord((res as unknown as Record<string, unknown>).data).forwardData,
    ),
  };
}



export async function photoGet(payload: { token: string }): Promise<{ success: boolean; msg: string; fileList: string[] }> {
  const res = await postApi<PhotoGetResponse>("/photo/get", payload);
  return { success: parseBool(res.success), msg: readMsg(res), fileList: Array.isArray(res.fileList) ? res.fileList as string[] : [] };
}

export async function photoGetFile(payload: { token: string; fileName: string }): Promise<Blob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_BASE}/photo/get-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.msg || `HTTP ${res.status}`);
    }
    return res.blob();
  } finally {
    clearTimeout(timeout);
  }
}

export async function photoDel(payload: { token: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<Record<string, unknown>>("/photo/del", payload as Record<string, unknown>);
  return { success: parseBool(res.success), msg: readMsg(res) };
}

export async function photoDelFile(payload: { token: string; fileName: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<PhotoDelFileResponse>("/photo/del-file", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}



export async function cacheBackup(payload: { token: string }): Promise<{ success: boolean; msg: string; data: unknown }> {
  const res = await postApi<CacheBackupResponse>("/cache/backup", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: res.data };
}

export async function cacheBackupAqua(payload: { token: string }): Promise<{ success: boolean; msg: string; data: unknown }> {
  const res = await postApi<CacheBackupAquaResponse>("/cache/backup-aqua-data", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: res.data };
}

export async function cacheRestore(payload: { token: string; data: Record<string, unknown> }): Promise<{ success: boolean; msg: string; count: number }> {
  const res = await postApi<CacheRestoreResponse>("/cache/restore", payload);
  return { success: parseBool(res.success), msg: readMsg(res), count: parseNum(res.count) };
}



export async function uploadCacheGet(payload: { token: string }): Promise<{ success: boolean; msg: string; data: string[] }> {
  const res = await postApi<UploadCacheGetResponse>("/upload-cache/get", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: Array.isArray(res.data) ? res.data as string[] : [] };
}

export async function uploadCacheUpload(payload: { token: string; indexName: string; SGWCMAID: string }): Promise<{ success: boolean; msg: string; data: string; music: string }> {
  const res = await postApi<UploadCacheUploadResponse>("/upload-cache/upload", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: parseStr(res.data), music: parseStr(res.music) };
}

export async function uploadCacheDel(payload: { token: string; indexName: string }): Promise<{ success: boolean; msg: string; data: string[] }> {
  const res = await postApi<UploadCacheDelResponse>("/upload-cache/del", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: Array.isArray(res.data) ? res.data as string[] : [] };
}

export async function uploadCacheGetFile(payload: { token: string; indexName: string }): Promise<{ success: boolean; msg: string; data: unknown }> {
  const res = await postApi<UploadCacheGetFileResponse>("/upload-cache/get-file", payload);
  return { success: parseBool(res.success), msg: readMsg(res), data: res.data };
}



export async function m2lCtlAdd(payload: { token: string; pwd?: string; data: string }): Promise<{ success: boolean; msg: string; operationId: string }> {
  const operationId = `op_${Math.floor(Date.now() / 1000)}_${Math.floor(Math.random() * 10000)}`;
  let dataObj: Record<string, unknown>;
  try { dataObj = JSON.parse(payload.data); } catch { dataObj = { operation: payload.data, param: "" }; }
  dataObj.operationID = operationId;
  const res = await postApi<Record<string, unknown>>("/m2lctl/add", {
    token: payload.token,
    pwd: payload.pwd || CTL_PWD_DEFAULT,
    data: JSON.stringify(dataObj),
  });
  return { success: parseBool(res.success), msg: readMsg(res), operationId };
}

export async function m2lCtlRetGet(payload: { token: string }): Promise<Record<string, unknown>> {
  const res = await postApi<Record<string, unknown>>("/m2lctl/ret/get", payload as Record<string, unknown>);
  return asRecord(res.returnData);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function pollM2lctlRet(payload: { token: string; operationId: string; maxAttempts?: number }): Promise<Record<string, unknown>> {
  const max = payload.maxAttempts || 15;
  for (let i = 0; i < max; i++) {
    const result = await m2lCtlRetGet({ token: payload.token });
    if (result.operationID === payload.operationId) return result;
    await delay(i < 5 ? 800 : 2000);
  }
  throw new Error("指令超时，机台可能离线");
}

export async function m2lCtlIPCConfigGet(payload: { token: string }): Promise<{ success: boolean; msg: string; configs: Record<string, string> }> {
  const res = await postApi<M2lCtlIPCConfigGetResponse>("/m2lctl/ipc/config/get", payload);
  const configs = res.configs && typeof res.configs === "object" ? res.configs as Record<string, string> : {};
  return { success: parseBool(res.success), msg: readMsg(res), configs };
}



export type M2lctlHealth = {
  online: boolean;
  timestamp: string;
  keyChip: string;
  localIp: string;
  gatewayIp: string;
  publicIp: string;
  networkStatus: string;
  cpuUsage: number;
  memUsage: number;
  ramUsage: string;
  uptime: string;
  uploadMbps: number;
  downloadMbps: number;
  branch: string;
  orderTotal: number;
  orderDone: number;
  orderPending: number;
  currentOrder: string;
  currentItem: string;
  currentStatus: string;
  downloadProgress: number;
  httpChecks: Array<{ name: string; success: boolean; pingMs: number; errorMsg: string }>;
  tcpChecks: Array<{ name: string; success: boolean; pingMs: number; errorMsg: string }>;
  orderDetails: Array<{ name: string; status: string; progress: number; rfState: number; rfStateDesc: string }>;
  disks: Array<{
    driveLetter: string;
    totalGb: number;
    freeGb: number;
    readSpeed: number;
    writeSpeed: number;
  }>;
};

export async function getM2lctlHealthMai2Link(payload: { token: string }): Promise<M2lctlHealth> {
  const res = await postApi<HealthCheckGetResponse>("/m2lctl/health/get", payload);
  const data = asRecord(res.data);
  const nested = asRecord(data.data);
  const machineHealth = asRecord(nested.machine_health || nested.machineHealth);
  const sideload = asRecord(nested.sideload);
  const orderHealth = asRecord(nested.order_health || nested.orderHealth);
  const networkSpeed = asRecord(nested.network_speed || nested.networkSpeed);
  const storage = asRecord(nested.storage);
  const httpChecksRaw = Array.isArray(nested.http_checks) ? nested.http_checks : Array.isArray(nested.httpChecks) ? nested.httpChecks : [];
  const tcpChecksRaw = Array.isArray(nested.tcp_checks) ? nested.tcp_checks : Array.isArray(nested.tcpChecks) ? nested.tcpChecks : [];
  const orderDetailsRaw = Array.isArray(orderHealth.order_details) ? orderHealth.order_details : Array.isArray(orderHealth.orderDetails) ? orderHealth.orderDetails : [];
  const disksRaw = Array.isArray(storage.disks) ? storage.disks : [];
  return {
    online: parseBool(data.online),
    timestamp: parseStr(data.timestamp || data.reported_at || nested.reported_at || nested.reportedAt),
    keyChip: parseStr(data.keyChip || data.key_chip || nested.key_chip || nested.keyChip),
    localIp: parseStr(machineHealth.local_ip || machineHealth.localIp),
    gatewayIp: parseStr(machineHealth.gateway_ip || machineHealth.gatewayIp),
    publicIp: parseStr(machineHealth.public_ip || machineHealth.publicIp),
    networkStatus: parseStr(machineHealth.network_status || machineHealth.networkStatus),
    cpuUsage: parsePct(machineHealth.cpu_usage || machineHealth.cpu),
    memUsage: parsePct(machineHealth.memory_usage || machineHealth.mem_usage || machineHealth.memoryUsage),
    ramUsage: parseStr(machineHealth.ram_usage || machineHealth.ramUsage),
    uptime: parseStr(machineHealth.system_uptime || machineHealth.uptime),
    uploadMbps: parseNum(networkSpeed.upload_speed || networkSpeed.uploadSpeed),
    downloadMbps: parseNum(networkSpeed.download_speed || networkSpeed.downloadSpeed),
    branch: parseStr(sideload.branch),
    orderTotal: parseNum(orderHealth.total_orders || orderHealth.total),
    orderDone: parseNum(orderHealth.completed_orders || orderHealth.completed),
    orderPending: parseNum(orderHealth.pending_orders || orderHealth.pending),
    currentOrder: parseStr(orderHealth.current_order || orderHealth.current),
    currentItem: parseStr(orderHealth.current_item),
    currentStatus: parseStr(orderHealth.current_status),
    downloadProgress: parseNum(orderHealth.download_progress || orderHealth.downloadProgress),
    httpChecks: httpChecksRaw.map((item: unknown) => {
      const check = item as Record<string, unknown>;
      return { name: parseStr(check.name), success: parseBool(check.success), pingMs: parseNum(check.ping_ms || check.pingMs), errorMsg: parseStr(check.error_msg || check.errorMsg) };
    }),
    tcpChecks: tcpChecksRaw.map((item: unknown) => {
      const check = item as Record<string, unknown>;
      return { name: parseStr(check.name), success: parseBool(check.success), pingMs: parseNum(check.ping_ms || check.pingMs), errorMsg: parseStr(check.error_msg || check.errorMsg) };
    }),
    orderDetails: orderDetailsRaw.map((item: unknown) => {
      const detail = item as Record<string, unknown>;
      return { name: parseStr(detail.name), status: parseStr(detail.status), progress: parseNum(detail.progress), rfState: parseNum(detail.rf_state || detail.rfState), rfStateDesc: parseStr(detail.rf_state_desc || detail.rfStateDesc) };
    }),
    disks: disksRaw.map((item: unknown) => {
      const disk = item as Record<string, unknown>;
      return { driveLetter: parseStr(disk.drive_letter || disk.driveLetter), totalGb: parseNum(disk.total_gb || disk.totalGb), freeGb: parseNum(disk.free_gb || disk.freeGb), readSpeed: parseNum(disk.read_speed || disk.readSpeed), writeSpeed: parseNum(disk.write_speed || disk.writeSpeed) };
    }),
  };
}



export async function playerQueueGet(payload: { token: string; clientId: string }): Promise<{ success: boolean; msg: string; playerQueueData: Record<string, unknown> }> {
  const res = await postApi<PlayerQueueGetResponse>("/player/queue/get", payload);
  const r = (res as unknown as Record<string, unknown>);
  return { success: parseBool(res.success), msg: readMsg(res), playerQueueData: asRecord(res.playerQueueData || r.data) };
}

export async function playlogGet(payload: { token: string; start: number; end: number }): Promise<{ success: boolean; msg: string; total: number; playlogList: unknown[] }> {
  const res = await postApi<PlaylogGetResponse>("/playlog/get", payload);
  return { success: parseBool(res.success), msg: readMsg(res), total: parseNum(res.total), playlogList: Array.isArray(res.playlogList) ? res.playlogList : [] };
}

export async function usageGet(payload: { token: string }): Promise<{ success: boolean; msg: string; usageData: Record<string, unknown> }> {
  const res = await postApi<UsageGetResponse>("/usage/get", payload);
  const r = (res as unknown as Record<string, unknown>);
  return { success: parseBool(res.success), msg: readMsg(res), usageData: asRecord(res.usageData || r.data) };
}

export async function regionGet(payload: { token: string }): Promise<{ success: boolean; msg: string; data: { regionName: string; count: number }[] }> {
  const res = await getApi<Record<string, unknown>>(`/region/get?token=${encodeURIComponent(payload.token)}`);
  const data = Array.isArray(res.data) ? (res.data as { regionName: string; count: number }[]) : [];
  return { success: parseBool(res.success), msg: readMsg(res), data };
}



export async function m2lIdGet(payload: { token: string }): Promise<{ success: boolean; msg: string; m2lId?: string; userId?: string }> {
  const res = await postApi<M2LIdGetResponse>("/m2l-id/get", payload);
  return { success: parseBool(res.success), msg: readMsg(res), m2lId: parseStr(res.m2lId), userId: parseStr(res.userId) };
}

export async function m2lIdBindUserID(payload: { token: string; userId: number; cf_token: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<M2LIdBindUserIdResponse>("/m2l-id/bind/userid", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}

export async function m2lIdBindQRCode(payload: { token: string; qrcode: string }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<M2LIdBindQRCodeResponse>("/m2l-id/bind/qrcode", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}



export async function blackRoomReq(payload: { token: string; authTime: number }): Promise<{ success: boolean; msg: string }> {
  const res = await postApi<BlackRoomReqResponse>("/blackroom/req", payload);
  return { success: parseBool(res.success), msg: readMsg(res) };
}



function toImageDataUrl(value: unknown): string | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return toImageDataUrl(obj.msg) || toImageDataUrl(obj.image) || toImageDataUrl(obj.base64) || toImageDataUrl(obj.screenshot) || toImageDataUrl(obj.data);
  }
  if (typeof value !== "string" || !value.trim()) return null;
  let b64 = value.trim();
  if (b64.startsWith("{") && b64.endsWith("}")) {
    try { return toImageDataUrl(JSON.parse(b64) as Record<string, unknown>); } catch { return null; }
  }
  if (b64.startsWith("data:")) {
    const idx = b64.indexOf(";base64,");
    if (idx !== -1) b64 = b64.substring(idx + 8);
  }
  b64 = b64.replace(/\s+/g, "");
  if (!b64.length) return null;
  let mime = "image/png";
  if (b64.startsWith("UklGR")) mime = "image/webp";
  else if (b64.startsWith("iVBOR")) mime = "image/png";
  else if (b64.startsWith("/9j/")) mime = "image/jpeg";
  return `data:${mime};base64,${b64}`;
}

export async function getM2lctlScreenshot(payload: { token: string; pwd?: string }): Promise<string | null> {
  try {
    const result = await m2lCtlAdd({ token: payload.token, pwd: payload.pwd, data: JSON.stringify({ operation: "get-screenshot", param: "" }) });
    const ret = await pollM2lctlRet({ token: payload.token, operationId: result.operationId });
    return toImageDataUrl(ret.msg || ret.data);
  } catch {
    console.warn("getScreenshot failed, using fallback");
    const latest = await m2lCtlRetGet({ token: payload.token });
    return toImageDataUrl(latest.msg || latest.data);
  }
}



/** @deprecated use getM2lctlScreenshot */
export const getM2lctlScreenshotMai2Link = getM2lctlScreenshot;

export async function execM2lctlOp(token: string, operation: string, param: string = "", pwd?: string): Promise<{ success: boolean; msg: string }> {
  const result = await m2lCtlAdd({ token, pwd, data: JSON.stringify({ operation, param }) });
  const ret = await pollM2lctlRet({ token, operationId: result.operationId });
  return { success: parseBool(ret.success), msg: parseStr(ret.msg) || result.msg };
}

export async function getHostsMai2Link(payload: { token: string; pwd?: string }): Promise<string> {
  const result = await m2lCtlAdd({ token: payload.token, pwd: payload.pwd, data: JSON.stringify({ operation: "get-hosts", param: "" }) });
  const ret = await pollM2lctlRet({ token: payload.token, operationId: result.operationId });
  return typeof ret.msg === "string" ? ret.msg : "";
}

export async function setHostsMai2Link(payload: { token: string; hosts: string; pwd?: string }): Promise<{ success: boolean; msg: string }> {
  return execM2lctlOp(payload.token, "set-hosts", payload.hosts, payload.pwd);
}

export async function addM2lctlCmdMai2Link(payload: { token: string; pwd?: string; data: Record<string, unknown> }): Promise<{ msg: string; operationId: string }> {
  const result = await m2lCtlAdd({ token: payload.token, pwd: payload.pwd, data: JSON.stringify(payload.data) });
  return { msg: result.msg, operationId: result.operationId };
}

export async function getUsageMai2Link(payload: { token: string }): Promise<{ success: boolean; msg: string; usageData: Record<string, unknown> }> {
  return usageGet(payload);
}

export async function getPlayerQueueMai2Link(payload: { token: string; clientId: string }): Promise<Record<string, unknown>> {
  const res = await playerQueueGet(payload);
  return res.playerQueueData;
}

export async function getPlayerRecordsMai2Link(payload: { token: string; clientId: string; page?: number }): Promise<Record<string, unknown>> {
  const res = await postApi<Record<string, unknown>>("/player/records/get", payload as Record<string, unknown>);
  return asRecord(res.data || {});
}

export async function getClientIdMai2Link(payload: { token: string }): Promise<string | null> {
  try {
    const res = await getForwardRulesMai2Link(payload);
    const logonMachine = res.LogonMachineList as { value?: string } | undefined;
    return logonMachine?.value || null;
  } catch {
    console.warn("getClientId failed");
    return null;
  }
}

export async function pickShot(token: string): Promise<string | null> {
  const res = await m2lCtlRetGet({ token });
  return toImageDataUrl(res.msg);
}



export type {
  ForwardRulesUser,
  HTTPCheckResult,
  TCPCheckResult,
  MachineHealthInfo,
  SideloadInfo,
  OrderItemStatus,
  OrderHealthInfo,
  DiskInfo,
  StorageInfo,
  NetworkSpeedInfo,
  InstallPathStats,
  HealthCheckData,
  UserPlaylog,
} from "./types";

export type LoginResult = { token: string; isMachine: boolean; msg: string };
export type TokenValidateResult = { valid: boolean; token?: string; expires_at?: string; expired?: boolean };
export type ForwardRuleConfig = { enable: boolean; value: string };
