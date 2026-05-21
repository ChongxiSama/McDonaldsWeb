const ACCOUNTS_STORAGE_KEY = "mai2link_accounts";
const ACTIVE_USER_ID_KEY = "mai2link_active_user_id";
const ACTIVE_MACHINE_ID_KEY = "mai2link_active_machine_id";

export interface Account {
  id: string;
  token: string;
  isMachine: boolean;
  name: string;
  remark?: string;
}

export const getAccounts = (): Account[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getActiveUser = (): Account | null => {
  if (typeof window === "undefined") return null;
  const accounts = getAccounts();
  const id = localStorage.getItem(ACTIVE_USER_ID_KEY);
  return accounts.find(a => a.id === id && !a.isMachine) || null;
};

export const getActiveMachine = (): Account | null => {
  if (typeof window === "undefined") return null;
  const accounts = getAccounts();
  const id = localStorage.getItem(ACTIVE_MACHINE_ID_KEY);
  return accounts.find(a => a.id === id && a.isMachine) || null;
};

export const setActiveUser = (id: string | null) => {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_USER_ID_KEY, id);
  else localStorage.removeItem(ACTIVE_USER_ID_KEY);
};

export const setActiveMachine = (id: string | null) => {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_MACHINE_ID_KEY, id);
  else localStorage.removeItem(ACTIVE_MACHINE_ID_KEY);
};

export const addAccount = (token: string, isMachine: boolean, name: string, remark = "") => {
  const accounts = getAccounts();
  const newAccount: Account = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, token, isMachine, name, remark };
  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  return newAccount;
};

export const removeAccount = (id: string) => {
  const accounts = getAccounts().filter(a => a.id !== id);
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  if (localStorage.getItem(ACTIVE_USER_ID_KEY) === id) localStorage.removeItem(ACTIVE_USER_ID_KEY);
  if (localStorage.getItem(ACTIVE_MACHINE_ID_KEY) === id) localStorage.removeItem(ACTIVE_MACHINE_ID_KEY);
};

export const updateAccountRemark = (id: string, remark: string) => {
  const accounts = getAccounts().map((acc) => (acc.id === id ? { ...acc, remark } : acc));
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
};

export const syncAuthCookies = (account: Account) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const common = `; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
  document.cookie = `mai2link_token=${encodeURIComponent(account.token)}${common}`;
  document.cookie = `mai2link_is_machine=${account.isMachine ? "1" : "0"}${common}`;
  document.cookie = `mai2link_guest=0${common}`;
};
