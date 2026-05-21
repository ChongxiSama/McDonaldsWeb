const TOKEN_COOKIE_KEY = "mai2link_token";
const MACHINE_COOKIE_KEY = "mai2link_is_machine";
const GUEST_COOKIE_KEY = "mai2link_guest";

const cookieAttrs = () => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
};

const setCookie = (key: string, value: string, maxAge: number) => {
  document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=${maxAge}${cookieAttrs()}`;
};

const clearCookie = (key: string) => {
  document.cookie = `${key}=; Max-Age=0${cookieAttrs()}`;
};

export const setMai2LinkAuthCookies = (token: string, isMachine: boolean) => {
  setCookie(TOKEN_COOKIE_KEY, token, 2592000);
  setCookie(MACHINE_COOKIE_KEY, isMachine ? "1" : "0", 2592000);
  setCookie(GUEST_COOKIE_KEY, "0", 2592000);
};

export const clearMai2LinkAuthCookies = () => {
  clearCookie(TOKEN_COOKIE_KEY);
  clearCookie(MACHINE_COOKIE_KEY);
  clearCookie(GUEST_COOKIE_KEY);
};

const parseCookieValue = (pairs: string[], key: string) => {
  for (const pair of pairs) {
    const [cookieKey, ...rest] = pair.split("=");
    if (cookieKey === key) {
      try {
        return decodeURIComponent(rest.join("="));
      } catch {
        console.warn("cookie decode failed");
        return rest.join("=");
      }
    }
  }
  return "";
};

const getDebugCookieOverride = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.location.search.startsWith("?=")) {
    const raw = window.location.search.slice(2).split("&")[0] || "";
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  }
  const params = new URLSearchParams(window.location.search);
  const value = params.get("cookie");
  return value === null ? null : value.trim();
};

const getCookie = (key: string) => {
  if (typeof document === "undefined") {
    return "";
  }
  const debugCookie = getDebugCookieOverride();
  if (debugCookie !== null) {
    if (!debugCookie) {

      return "";
    }

    if (!debugCookie.includes("=")) {
      return key === TOKEN_COOKIE_KEY ? debugCookie : "";
    }
    return parseCookieValue(debugCookie.split(/;\s*/), key);
  }
  const pairs = document.cookie ? document.cookie.split("; ") : [];
  return parseCookieValue(pairs, key);
};

export const getMai2LinkTokenCookie = () => getCookie(TOKEN_COOKIE_KEY);
export const getMai2LinkGuestCookie = () => getCookie(GUEST_COOKIE_KEY) === "1";
export const getMai2LinkIsMachineCookie = () => getCookie(MACHINE_COOKIE_KEY) === "1";

export const setMai2LinkGuestCookie = () => {
  setCookie(GUEST_COOKIE_KEY, "1", 2592000);
  clearCookie(TOKEN_COOKIE_KEY);
  clearCookie(MACHINE_COOKIE_KEY);
};

export const getAuthCookie = () => {
  const token = getMai2LinkTokenCookie();
  const isMachine = getMai2LinkIsMachineCookie();
  if (!token) {
    return null;
  }
  return { token, isMachine };
};
