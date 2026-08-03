const KEY = 'yijian_yisuo_save_v1';
export function saveGame(state) { localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() })); }
export function loadGame() { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }
export function hasSave() { return Boolean(localStorage.getItem(KEY)); }
export function deleteSave() { localStorage.removeItem(KEY); }
