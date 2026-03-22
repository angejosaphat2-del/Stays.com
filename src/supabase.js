export const SB_URL = "https://clovwbjdmhkgcocvyzgm.supabase.co";
export const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3Z3YmpkbWhrZ2NvY3Z5emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDg1NTIsImV4cCI6MjA4OTc4NDU1Mn0.7NgCTnaUxHWWyhcgB7eji0Pypqo5zDqJ8D9n3cB-qyU";

let TOKEN = null;
export function getToken() { return TOKEN; }
export function setToken(t) { TOKEN = t; }

function hdr() {
  return { apikey: SB_KEY, Authorization: `Bearer ${TOKEN || SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
}

export async function sbGet(t, p = "") {
  try { const r = await fetch(`${SB_URL}/rest/v1/${t}?${p}`, { headers: hdr() }); if (!r.ok) throw new Error(); return await r.json(); } catch { return null; }
}
export async function sbPost(t, d) {
  try { const r = await fetch(`${SB_URL}/rest/v1/${t}`, { method: "POST", headers: hdr(), body: JSON.stringify(d) }); return await r.json(); } catch { return null; }
}
export async function sbPatch(t, id, d) {
  try { await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: hdr(), body: JSON.stringify(d) }); return true; } catch { return false; }
}
export async function sbDel(t, id) {
  try { await fetch(`${SB_URL}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: hdr() }); return true; } catch { return false; }
}
export async function sbPatchWhere(t, where, d) {
  try { await fetch(`${SB_URL}/rest/v1/${t}?${where}`, { method: "PATCH", headers: hdr(), body: JSON.stringify(d) }); } catch {}
}

export async function signIn(email, pw) {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: SB_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
    const d = await r.json();
    if (d.access_token) { TOKEN = d.access_token; return { ok: true }; }
    return { ok: false, err: d.error_description || d.msg || "Email ou mot de passe incorrect" };
  } catch { return { ok: false, err: "Impossible de se connecter au serveur" }; }
}

export async function signUp(email, pw) {
  try {
    const r = await fetch(`${SB_URL}/auth/v1/signup`, { method: "POST", headers: { apikey: SB_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
    const d = await r.json();
    if (d.id || d.access_token) { if (d.access_token) TOKEN = d.access_token; return { ok: true }; }
    return { ok: false, err: d.error_description || d.msg || "Erreur" };
  } catch { return { ok: false, err: "Impossible de se connecter au serveur" }; }
}

export function signOut() { TOKEN = null; }
