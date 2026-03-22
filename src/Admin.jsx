import { useState, useEffect, useMemo, useCallback } from "react";

const SB = "https://clovwbjdmhkgcocvyzgm.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3Z3YmpkbWhrZ2NvY3Z5emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDg1NTIsImV4cCI6MjA4OTc4NDU1Mn0.7NgCTnaUxHWWyhcgB7eji0Pypqo5zDqJ8D9n3cB-qyU";
let TOKEN = null;

function hdr() { return { apikey: SK, Authorization: `Bearer ${TOKEN || SK}`, "Content-Type": "application/json", Prefer: "return=representation" }; }

// Supabase calls with fallback
async function sbGet(t, p = "") { try { const r = await fetch(`${SB}/rest/v1/${t}?${p}`, { headers: hdr() }); if (!r.ok) throw new Error(); return await r.json(); } catch { return null; } }
async function sbPost(t, d) { try { const r = await fetch(`${SB}/rest/v1/${t}`, { method: "POST", headers: hdr(), body: JSON.stringify(d) }); return await r.json(); } catch { return null; } }
async function sbPatch(t, id, d) { try { await fetch(`${SB}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: hdr(), body: JSON.stringify(d) }); return true; } catch { return false; } }
async function sbDel(t, id) { try { await fetch(`${SB}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers: hdr() }); return true; } catch { return false; } }
async function sbPatchK(t, k, v, d) { try { await fetch(`${SB}/rest/v1/${t}?${k}`, { method: "PATCH", headers: hdr(), body: JSON.stringify(d) }); } catch {} }

async function doSignIn(email, pw) {
  try {
    const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: SK, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
    const d = await r.json(); if (d.access_token) { TOKEN = d.access_token; return { ok: true }; }
    return { ok: false, err: d.error_description || d.msg || "Email ou mot de passe incorrect" };
  } catch { return { ok: false, err: "Impossible de se connecter au serveur" }; }
}
async function doSignUp(email, pw) {
  try {
    const r = await fetch(`${SB}/auth/v1/signup`, { method: "POST", headers: { apikey: SK, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
    const d = await r.json(); if (d.id || d.access_token) { if (d.access_token) TOKEN = d.access_token; return { ok: true }; }
    return { ok: false, err: d.error_description || d.msg || "Erreur" };
  } catch { return { ok: false, err: "Impossible de se connecter au serveur" }; }
}

// Demo data fallback
const DEMO_PROPS = [
  { id: "p1", name: "Résidence Le Palmier d'Or", type: "Résidence", quartier: "Cocody", city: "Abidjan", price: 35000, rating: 4.7, reviews: 134, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Climatisation","Piscine"], description: "Résidence haut standing à Cocody", whatsapp: "+2250700000001", owner_id: "o1" },
  { id: "p2", name: "Hôtel Ivoire Premium", type: "Hôtel", quartier: "Plateau", city: "Abidjan", price: 65000, rating: 4.9, reviews: 287, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&h=200&fit=crop", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Climatisation","Piscine","Spa"], description: "Hôtel 5 étoiles au Plateau", whatsapp: "+2250700000002", owner_id: "o1" },
  { id: "p3", name: "Hôtel Atlantic Beach", type: "Hôtel", quartier: "Bardot", city: "San Pedro", price: 45000, rating: 4.9, reviews: 156, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Piscine","Plage privée"], description: "Hôtel de luxe bord de mer", whatsapp: "+2250700000005", owner_id: "o2" },
  { id: "p4", name: "Résidence Émeraude", type: "Résidence", quartier: "Séwéké", city: "San Pedro", price: 20000, rating: 4.3, reviews: 67, sponsored: false, status: "pending", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=300&h=200&fit=crop", images: [], amenities: ["Wi-Fi","Parking"], description: "Résidence sécurisée", whatsapp: "+2250700000006", owner_id: "o3" },
  { id: "p5", name: "Hôtel Président", type: "Hôtel", quartier: "Centre", city: "Yamoussoukro", price: 40000, rating: 4.6, reviews: 98, sponsored: false, status: "active", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop", images: [], amenities: ["Wi-Fi","Piscine","Restaurant"], description: "Hôtel de référence", whatsapp: "+2250700000009", owner_id: "o4" },
];
const DEMO_OWNERS = [
  { id: "o1", name: "Koné Ibrahim", email: "kone@email.com", phone: "+2250701111111", subscription: "premium" },
  { id: "o2", name: "Diallo Fatou", email: "diallo@email.com", phone: "+2250703333333", subscription: "enterprise" },
  { id: "o3", name: "Ouattara Salif", email: "ouattara@email.com", phone: "+2250704444444", subscription: "none" },
  { id: "o4", name: "Yao Kouadio", email: "yao@email.com", phone: "+2250705555555", subscription: "premium" },
];
const DEMO_BOOKINGS = [
  { id: "b1", property_id: "p1", guest_name: "Jean Dupont", guest_phone: "+2250700111111", check_in: "2026-03-25", check_out: "2026-03-28", nights: 3, total: 105000, status: "confirmed", payment_method: "Orange Money", created_at: "2026-03-20" },
  { id: "b2", property_id: "p2", guest_name: "Marie Konan", guest_phone: "+2250700222222", check_in: "2026-03-22", check_out: "2026-03-24", nights: 2, total: 130000, status: "pending", payment_method: "MTN Money", created_at: "2026-03-21" },
  { id: "b3", property_id: "p3", guest_name: "Paul Aka", guest_phone: "+2250700333333", check_in: "2026-04-01", check_out: "2026-04-05", nights: 4, total: 180000, status: "confirmed", payment_method: "Orange Money", created_at: "2026-03-19" },
];
const DEMO_PLANS = [
  { id: "basic", name: "Basic", price: 10000, max_properties: 1, features: ["1 établissement","3 photos max","Contact WhatsApp"], color: "#64748b" },
  { id: "premium", name: "Premium", price: 25000, max_properties: 3, features: ["3 établissements","10 photos","Badge Sponsorisé","Position prioritaire"], color: "#FF6B00" },
  { id: "enterprise", name: "Enterprise", price: 50000, max_properties: 999, features: ["Illimité","Photos illimitées","Page dédiée","Support 24/7"], color: "#7C3AED" },
];

const CITIES = ["Abidjan","San Pedro","Yamoussoukro","Bouaké","Grand-Bassam","Assinie"];
function fmt(p) { return (p||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F"; }
function fmtD(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); }
function inPer(d, p) { if (p === "all") return true; const diff = (Date.now() - new Date(d).getTime()) / 86400000; return p==="day"?diff<1:p==="week"?diff<7:p==="month"?diff<30:diff<365; }

// Styles
const iS = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const lS = { fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 };
const bP = { background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const bS = { background: "white", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };

// Components
function Stat({ label, value, sub, color = "#FF6B00" }) {
  return <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #f1f5f9", flex: "1 1 180px", minWidth: 160 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
  </div>;
}

function TimePick({ v, onChange }) {
  return <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
    {[{ v: "day", l: "Auj." }, { v: "week", l: "7j" }, { v: "month", l: "30j" }, { v: "all", l: "Tout" }].map(o =>
      <button key={o.v} onClick={() => onChange(o.v)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: v === o.v ? "white" : "transparent", color: v === o.v ? "#1a1a2e" : "#94a3b8" }}>{o.l}</button>
    )}
  </div>;
}

function Badge({ s }) {
  const m = { active: ["#f0fdf4","#166534","#bbf7d0","Actif"], pending: ["#fffbeb","#92400e","#fde68a","En attente"], inactive: ["#fef2f2","#991b1b","#fecaca","Inactif"], confirmed: ["#f0fdf4","#166534","#bbf7d0","Confirmé"], cancelled: ["#fef2f2","#991b1b","#fecaca","Annulé"] };
  const x = m[s] || m.pending;
  return <span style={{ background: x[0], color: x[1], border: `1px solid ${x[2]}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6 }}>{x[3]}</span>;
}

// ── LOGIN ──
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setL] = useState(false);
  const [mode, setMode] = useState("login");

  const submit = async () => {
    if (!email || !pass) { setErr("Remplissez tous les champs"); return; }
    setErr(""); setL(true);
    const res = mode === "login" ? await doSignIn(email, pass) : await doSignUp(email, pass);
    setL(false);
    if (res.ok) {
      if (mode === "signup") { setErr("Compte créé ! Connectez-vous."); setMode("login"); }
      else onLogin(email);
    } else setErr(res.err);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1a1a2e,#16213e)", fontFamily: "'DM Sans',sans-serif", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#FF6B00,#FF8534)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 26, margin: "0 auto 16px" }}>S</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Stays<span style={{ color: "#FF6B00" }}>.com</span></h1>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Espace administration</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lS}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={iS} placeholder="admin@stays.com" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lS}>Mot de passe</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={iS} placeholder="Min. 6 caractères" />
        </div>
        {err && <div style={{ background: err.includes("créé") ? "#f0fdf4" : "#fef2f2", color: err.includes("créé") ? "#166534" : "#991b1b", border: `1px solid ${err.includes("créé") ? "#bbf7d0" : "#fecaca"}`, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>{err}</div>}
        <button onClick={submit} disabled={loading} style={{ ...bP, width: "100%", justifyContent: "center", padding: "14px", fontSize: 16, opacity: loading ? 0.6 : 1 }}>
          {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer le compte"}
        </button>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }} style={{ background: "none", border: "none", color: "#FF6B00", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {mode === "login" ? "Créer un compte admin" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROPERTY FORM ──
function PropForm({ prop, owners, onSave, onClose }) {
  const [f, sF] = useState(prop || { name: "", type: "Résidence", quartier: "", city: "Abidjan", price: "", description: "", whatsapp: "", amenities: [], owner_id: "", status: "pending", sponsored: false, images: [], image: "" });
  const [nA, sNA] = useState("");
  const [nI, sNI] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => sF(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const d = { name: f.name, type: f.type, quartier: f.quartier, city: f.city, price: Number(f.price), description: f.description, whatsapp: f.whatsapp, amenities: f.amenities, owner_id: f.owner_id || null, status: f.status, sponsored: f.sponsored, images: f.images, image: f.image || f.images?.[0] || "" };
    if (prop?.id) await sbPatch("properties", prop.id, d);
    else await sbPost("properties", d);
    setSaving(false);
    onSave();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, maxWidth: 620, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{prop ? "Modifier" : "Nouvel hébergement"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ marginBottom: 12 }}><label style={lS}>Propriétaire</label>
          <select value={f.owner_id || ""} onChange={e => set("owner_id", e.target.value)} style={{ ...iS, cursor: "pointer" }}>
            <option value="">— Choisir —</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ gridColumn: "1/-1" }}><label style={lS}>Nom</label><input value={f.name} onChange={e => set("name", e.target.value)} style={iS} /></div>
          <div><label style={lS}>Type</label><select value={f.type} onChange={e => set("type", e.target.value)} style={{ ...iS, cursor: "pointer" }}>{"Résidence,Hôtel,Appartement,Villa".split(",").map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label style={lS}>Ville</label><select value={f.city} onChange={e => set("city", e.target.value)} style={{ ...iS, cursor: "pointer" }}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label style={lS}>Quartier</label><input value={f.quartier || ""} onChange={e => set("quartier", e.target.value)} style={iS} /></div>
          <div><label style={lS}>Prix/nuit</label><input type="number" value={f.price} onChange={e => set("price", e.target.value)} style={iS} /></div>
          <div><label style={lS}>WhatsApp</label><input value={f.whatsapp || ""} onChange={e => set("whatsapp", e.target.value)} style={iS} /></div>
          <div><label style={lS}>Statut</label><select value={f.status} onChange={e => set("status", e.target.value)} style={{ ...iS, cursor: "pointer" }}><option value="active">Actif</option><option value="pending">En attente</option><option value="inactive">Inactif</option></select></div>
        </div>

        <div style={{ marginBottom: 12 }}><label style={lS}>Description</label><textarea value={f.description || ""} onChange={e => set("description", e.target.value)} rows={3} style={{ ...iS, resize: "vertical" }} /></div>

        {/* Amenities */}
        <div style={{ marginBottom: 12 }}>
          <label style={lS}>Équipements</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {(f.amenities || []).map((a, i) => <span key={i} style={{ background: "#f0fdf4", color: "#166534", fontSize: 12, padding: "4px 10px", borderRadius: 8, fontWeight: 600, border: "1px solid #bbf7d0" }}>{a} <button onClick={() => set("amenities", f.amenities.filter((_, x) => x !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 0 }}>×</button></span>)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={nA} onChange={e => sNA(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && nA.trim()) { e.preventDefault(); set("amenities", [...(f.amenities || []), nA.trim()]); sNA(""); } }} style={{ ...iS, flex: 1 }} placeholder="Wi-Fi, Piscine..." />
            <button onClick={() => { if (nA.trim()) { set("amenities", [...(f.amenities || []), nA.trim()]); sNA(""); } }} style={bS}>+</button>
          </div>
        </div>

        {/* Images */}
        <div style={{ marginBottom: 16 }}>
          <label style={lS}>Photos (URL)</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {(f.images || []).map((img, i) => <div key={i} style={{ position: "relative", width: 80, height: 60, borderRadius: 8, overflow: "hidden", border: f.image === img ? "2px solid #FF6B00" : "1px solid #e2e8f0" }}>
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => { const imgs = f.images.filter((_, x) => x !== i); set("images", imgs); if (f.image === f.images[i]) set("image", imgs[0] || ""); }} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>)}
            <label style={{ width: 80, height: 60, borderRadius: 8, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafc", fontSize: 10, color: "#FF6B00", fontWeight: 700 }}>
              + PHOTO
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => { Array.from(e.target.files || []).forEach(file => { const r = new FileReader(); r.onload = ev => { sF(prev => ({ ...prev, images: [...(prev.images || []), ev.target.result], image: prev.image || ev.target.result })); }; r.readAsDataURL(file); }); e.target.value = ""; }} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={nI} onChange={e => sNI(e.target.value)} style={{ ...iS, flex: 1 }} placeholder="Ou coller une URL..." />
            <button onClick={() => { if (nI.trim()) { const imgs = [...(f.images || []), nI.trim()]; set("images", imgs); if (!f.image) set("image", nI.trim()); sNI(""); } }} style={bS}>+</button>
          </div>
        </div>

        {/* Boost */}
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 13, fontWeight: 700 }}>Sponsorisé / Boost</div><div style={{ fontSize: 12, color: "#94a3b8" }}>Badge doré + position prioritaire</div></div>
          <button onClick={() => set("sponsored", !f.sponsored)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: f.sponsored ? "linear-gradient(135deg,#F59E0B,#D97706)" : "#e2e8f0", color: f.sponsored ? "white" : "#64748b" }}>{f.sponsored ? "ON" : "OFF"}</button>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={bS}>Annuler</button>
          <button onClick={save} disabled={saving} style={{ ...bP, opacity: saving ? 0.5 : 1 }}>{saving ? "..." : prop ? "Enregistrer" : "Créer"}</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUE] = useState("");
  const [page, setPage] = useState("dashboard");
  const [properties, setProps] = useState(DEMO_PROPS);
  const [owners, setOwners] = useState(DEMO_OWNERS);
  const [bookings, setBookings] = useState(DEMO_BOOKINGS);
  const [plans, setPlans] = useState(DEMO_PLANS);
  const [settings, setSettings] = useState({ phone: "+225 07 00 00 00 00", email: "contact@stays.com", whatsapp: "+22507000000", address: "Abidjan, Côte d'Ivoire", tagline: "N°1 en Côte d'Ivoire" });
  const [online, setOnline] = useState(false);
  const [showForm, setSF] = useState(false);
  const [editProp, setEP] = useState(null);
  const [search, setSrch] = useState("");
  const [fCity, setFC] = useState("Toutes");
  const [fStatus, setFS] = useState("Tous");
  const [period, setPer] = useState("month");
  const [delConfirm, setDC] = useState(null);
  const [delType, setDT] = useState("");
  const [editingPlan, setEditPlan] = useState(null);
  const [savingS, setSS] = useState(false);

  const reload = useCallback(async () => {
    const p = await sbGet("properties", "order=sponsored.desc,rating.desc");
    if (p && Array.isArray(p)) {
      setProps(p); setOnline(true);
      const o = await sbGet("owners", "order=name.asc"); if (o) setOwners(o);
      const b = await sbGet("bookings", "order=created_at.desc"); if (b) setBookings(b);
      const pl = await sbGet("subscription_plans", "order=price.asc"); if (pl) setPlans(pl);
      const s = await sbGet("site_settings", ""); if (s) { const m = {}; s.forEach(x => { m[x.key] = x.value; }); setSettings(m); }
    }
  }, []);

  const handleLogin = (email) => { setAuthed(true); setUE(email); reload(); };
  const handleLogout = () => { TOKEN = null; setAuthed(false); };

  const ownersWC = useMemo(() => owners.map(o => ({ ...o, propertyCount: properties.filter(p => p.owner_id === o.id).length, props: properties.filter(p => p.owner_id === o.id) })), [owners, properties]);
  const perBook = bookings.filter(b => inPer(b.created_at, period));
  const confirmed = perBook.filter(b => b.status === "confirmed");
  const totalSub = useMemo(() => { let t = 0; owners.forEach(o => { const p = plans.find(x => x.id === o.subscription); t += (p?.price || 0); }); return t; }, [owners, plans]);
  const filteredP = properties.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fCity !== "Toutes" && p.city !== fCity) return false;
    if (fStatus !== "Tous" && p.status !== fStatus) return false;
    return true;
  });

  const handleDel = async () => {
    if (!delConfirm) return;
    if (delType === "prop") { await sbDel("properties", delConfirm.id); setProps(ps => ps.filter(x => x.id !== delConfirm.id)); }
    if (delType === "book") { await sbDel("bookings", delConfirm.id); setBookings(bs => bs.filter(x => x.id !== delConfirm.id)); }
    setDC(null);
    if (online) reload();
  };

  const saveSettings = async () => { setSS(true); for (const [k, v] of Object.entries(settings)) { await sbPatchK("site_settings", `key=eq.${k}`, v, { value: v }); } setSS(false); };

  if (!authed) return <Login onLogin={handleLogin} />;

  const nav = [
    { id: "dashboard", l: "Tableau de bord", i: "📊" },
    { id: "properties", l: "Hébergements", i: "🏨" },
    { id: "owners", l: "Propriétaires", i: "👥" },
    { id: "bookings", l: "Réservations", i: "📅" },
    { id: "subscriptions", l: "Monétisation", i: "💰" },
    { id: "settings", l: "Paramètres", i: "⚙️" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <aside style={{ width: 220, background: "#1a1a2e", color: "white", padding: "24px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "0 8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#FF6B00,#FF8534)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16 }}>S</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Stays<span style={{ color: "#FF6B00" }}>.com</span></div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Admin {online ? "• En ligne" : "• Démo"}</div>
          </div>
        </div>
        <nav style={{ flex: 1 }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", background: page === item.id ? "rgba(255,107,0,0.15)" : "transparent", color: page === item.id ? "#FF8534" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 3, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{item.i}</span> {item.l}
            </button>
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "0 12px", marginBottom: 8 }}>{userEmail}</div>
          <button onClick={reload} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", textAlign: "left" }}>🔄 Rafraîchir</button>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", textAlign: "left" }}>🚪 Déconnexion</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "24px 28px", overflow: "auto", maxHeight: "100vh" }}>

        {/* Dashboard */}
        {page === "dashboard" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div><h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Tableau de bord</h1><p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>{online ? "Connecté à Supabase" : "Mode démonstration"}</p></div>
            <TimePick v={period} onChange={setPer} />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
            <Stat label="Revenus abo" value={fmt(totalSub) + "/mois"} color="#0C6E3D" />
            <Stat label="Hébergements" value={properties.length} sub={`${properties.filter(p => p.status === "active").length} actifs`} />
            <Stat label="Propriétaires" value={owners.length} color="#7C3AED" />
            <Stat label="Réservations" value={confirmed.length} sub={fmt(confirmed.reduce((s, b) => s + b.total, 0))} color="#0284c7" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 14, padding: 18, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Dernières réservations</div>
              {perBook.slice(0, 5).map(b => <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{b.guest_name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtD(b.check_in)}</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(b.total)}</div><Badge s={b.status} /></div>
              </div>)}
              {perBook.length === 0 && <div style={{ color: "#94a3b8", textAlign: "center", padding: 20, fontSize: 13 }}>Aucune réservation</div>}
            </div>
            <div style={{ background: "white", borderRadius: 14, padding: 18, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Top propriétaires</div>
              {ownersWC.sort((a, b) => b.propertyCount - a.propertyCount).slice(0, 5).map(o => <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{o.name}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{o.propertyCount} bien{o.propertyCount > 1 ? "s" : ""}</div>
              </div>)}
            </div>
          </div>
        </div>}

        {/* Properties */}
        {page === "properties" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Hébergements ({properties.length})</h1>
            <button onClick={() => { setEP(null); setSF(true); }} style={bP}>+ Ajouter</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input value={search} onChange={e => setSrch(e.target.value)} placeholder="🔍 Rechercher..." style={{ ...iS, maxWidth: 280 }} />
            <select value={fCity} onChange={e => setFC(e.target.value)} style={{ ...iS, width: "auto" }}><option>Toutes</option>{CITIES.map(c => <option key={c}>{c}</option>)}</select>
            <select value={fStatus} onChange={e => setFS(e.target.value)} style={{ ...iS, width: "auto" }}><option value="Tous">Tous</option><option value="active">Actif</option><option value="pending">En attente</option></select>
          </div>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
              <thead><tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Hébergement</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Ville</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Prix</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Statut</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Boost</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Actions</th>
              </tr></thead>
              <tbody>{filteredP.map(p => <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.image && <img src={p.image} alt="" style={{ width: 44, height: 32, borderRadius: 6, objectFit: "cover" }} />}
                    <div><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{p.type}</div></div>
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>{p.city}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700 }}>{fmt(p.price)}</td>
                <td style={{ padding: "10px 14px" }}><Badge s={p.status} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <button onClick={async () => { await sbPatch("properties", p.id, { sponsored: !p.sponsored }); setProps(ps => ps.map(x => x.id === p.id ? { ...x, sponsored: !x.sponsored } : x)); }} style={{ padding: "4px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: p.sponsored ? "linear-gradient(135deg,#F59E0B,#D97706)" : "#f1f5f9", color: p.sponsored ? "white" : "#94a3b8" }}>{p.sponsored ? "ON" : "OFF"}</button>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEP(p); setSF(true); }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>✏️</button>
                    <button onClick={() => { setDC(p); setDT("prop"); }} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>}

        {/* Owners */}
        {page === "owners" && <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>Propriétaires ({owners.length})</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
            {ownersWC.map(o => <div key={o.id} style={{ background: "white", borderRadius: 14, padding: 18, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{o.email} • {o.phone}</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ textAlign: "center", flex: 1, background: "#f8fafc", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{o.propertyCount}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Bien{o.propertyCount > 1 ? "s" : ""}</div>
                </div>
                <div style={{ textAlign: "center", flex: 1, background: "#f8fafc", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: plans.find(p => p.id === o.subscription)?.color || "#94a3b8" }}>{plans.find(p => p.id === o.subscription)?.name || "Aucun"}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Plan</div>
                </div>
              </div>
              {o.props.map(p => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc", fontSize: 12 }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span><Badge s={p.status} />
              </div>)}
            </div>)}
          </div>
        </div>}

        {/* Bookings */}
        {page === "bookings" && <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Réservations</h1>
            <TimePick v={period} onChange={setPer} />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <Stat label="Confirmées" value={confirmed.length} color="#0C6E3D" />
            <Stat label="En attente" value={perBook.filter(b => b.status === "pending").length} color="#F59E0B" />
            <Stat label="Revenu" value={fmt(confirmed.reduce((s, b) => s + b.total, 0))} color="#0284c7" />
          </div>
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Client</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Dates</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Montant</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Statut</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#64748b" }}>Actions</th>
              </tr></thead>
              <tbody>{perBook.map(b => <tr key={b.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 14px" }}><div style={{ fontWeight: 600 }}>{b.guest_name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{b.guest_phone}</div></td>
                <td style={{ padding: "10px 14px" }}>{fmtD(b.check_in)} → {fmtD(b.check_out)}</td>
                <td style={{ padding: "10px 14px", fontWeight: 700 }}>{fmt(b.total)}</td>
                <td style={{ padding: "10px 14px" }}><Badge s={b.status} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {b.status === "pending" && <>
                      <button onClick={async () => { await sbPatch("bookings", b.id, { status: "confirmed" }); setBookings(bs => bs.map(x => x.id === b.id ? { ...x, status: "confirmed" } : x)); }} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>✅</button>
                      <button onClick={async () => { await sbPatch("bookings", b.id, { status: "cancelled" }); setBookings(bs => bs.map(x => x.id === b.id ? { ...x, status: "cancelled" } : x)); }} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>❌</button>
                    </>}
                    <button onClick={() => { setDC(b); setDT("book"); }} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 8px", cursor: "pointer" }}>🗑️</button>
                  </div>
                </td>
              </tr>)}</tbody>
            </table>
            {perBook.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Aucune réservation</div>}
          </div>
        </div>}

        {/* Subscriptions */}
        {page === "subscriptions" && <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>Monétisation</h1>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
            <Stat label="Revenu mensuel" value={fmt(totalSub)} color="#0C6E3D" />
            <Stat label="Annuel" value={fmt(totalSub * 12)} color="#0284c7" />
            <Stat label="Sponsorisés" value={properties.filter(p => p.sponsored).length} color="#F59E0B" />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
            {plans.map(plan => {
              const isEd = editingPlan === plan.id;
              const oc = owners.filter(o => o.subscription === plan.id).length;
              return <div key={plan.id} style={{ flex: "1 1 220px", background: "white", borderRadius: 14, padding: 22, border: isEd ? `2px solid ${plan.color}` : `1px solid ${plan.color}20`, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: plan.color }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: plan.color }}>{plan.name}</div>
                  <button onClick={async () => {
                    if (isEd) { await sbPatchK("subscription_plans", `id=eq.${plan.id}`, "", { price: plan.price, max_properties: plan.max_properties, features: plan.features }); setEditPlan(null); if (online) reload(); }
                    else setEditPlan(plan.id);
                  }} style={{ background: isEd ? plan.color : "#f8fafc", border: `1px solid ${isEd ? plan.color : "#e2e8f0"}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", color: isEd ? "white" : "#64748b" }}>{isEd ? "Sauver" : "Modifier"}</button>
                </div>
                {isEd ? <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 8 }}><label style={lS}>Prix/mois</label><input type="number" value={plan.price} onChange={e => setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, price: Number(e.target.value) } : p))} style={iS} /></div>
                  <div style={{ marginBottom: 8 }}><label style={lS}>Max biens</label><input type="number" value={plan.max_properties} onChange={e => setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, max_properties: Number(e.target.value) } : p))} style={iS} /></div>
                  <label style={lS}>Fonctionnalités</label>
                  {plan.features.map((feat, fi) => <div key={fi} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input value={feat} onChange={e => { const nf = [...plan.features]; nf[fi] = e.target.value; setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, features: nf } : p)); }} style={{ ...iS, flex: 1, fontSize: 12 }} />
                    <button onClick={() => setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, features: p.features.filter((_, i) => i !== fi) } : p))} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#dc2626" }}>×</button>
                  </div>)}
                  <button onClick={() => setPlans(ps => ps.map(p => p.id === plan.id ? { ...p, features: [...p.features, ""] } : p))} style={{ ...bS, width: "100%", justifyContent: "center", fontSize: 12, padding: "6px" }}>+ Ajouter</button>
                </div> : <div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{fmt(plan.price)}<span style={{ fontSize: 13, color: "#94a3b8" }}>/mois</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{oc} proprio{oc > 1 ? "s" : ""} • Max {plan.max_properties >= 999 ? "∞" : plan.max_properties} bien{plan.max_properties > 1 ? "s" : ""}</div>
                  {plan.features.map((f, i) => <div key={i} style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>✓ {f}</div>)}
                </div>}
              </div>;
            })}
          </div>
          <div style={{ padding: "14px 18px", background: "white", borderRadius: 14, border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>Total mensuel</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#0C6E3D" }}>{fmt(totalSub)}</span>
          </div>
        </div>}

        {/* Settings */}
        {page === "settings" && <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>Paramètres du site</h1>
          <div style={{ background: "white", borderRadius: 14, padding: 24, border: "1px solid #f1f5f9", maxWidth: 500 }}>
            {[{ k: "phone", l: "Téléphone" }, { k: "email", l: "Email" }, { k: "whatsapp", l: "WhatsApp" }, { k: "address", l: "Adresse" }, { k: "tagline", l: "Slogan" }].map(({ k, l }) => <div key={k} style={{ marginBottom: 14 }}>
              <label style={lS}>{l}</label>
              <input value={settings[k] || ""} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))} style={iS} />
            </div>)}
            <button onClick={saveSettings} disabled={savingS} style={{ ...bP, opacity: savingS ? 0.5 : 1 }}>{savingS ? "..." : "Sauvegarder"}</button>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Les changements apparaîtront sur le site public.</div>
          </div>
        </div>}
      </main>

      {/* Property Form */}
      {showForm && <PropForm prop={editProp} owners={owners} onSave={() => { setSF(false); setEP(null); if (online) reload(); }} onClose={() => { setSF(false); setEP(null); }} />}

      {/* Delete Confirm */}
      {delConfirm && <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDC(null)}>
        <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 14, padding: 28, maxWidth: 380, width: "90%", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🗑️</div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Supprimer ?</h3>
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>{delType === "prop" ? `« ${delConfirm.name} »` : `Réservation de ${delConfirm.guest_name}`}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => setDC(null)} style={bS}>Annuler</button>
            <button onClick={handleDel} style={{ ...bP, background: "#dc2626" }}>Supprimer</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
