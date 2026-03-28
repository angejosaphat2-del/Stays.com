import { useState, useEffect, useMemo, useCallback } from "react";

const SB = "https://clovwbjdmhkgcocvyzgm.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3Z3YmpkbWhrZ2NvY3Z5emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDg1NTIsImV4cCI6MjA4OTc4NDU1Mn0.7NgCTnaUxHWWyhcgB7eji0Pypqo5zDqJ8D9n3cB-qyU";
let TOKEN = null;
function hdr(){return{apikey:SK,Authorization:`Bearer ${TOKEN||SK}`,"Content-Type":"application/json",Prefer:"return=representation"};}
async function sbGet(t,p=""){try{const r=await fetch(`${SB}/rest/v1/${t}?${p}`,{headers:hdr()});if(!r.ok)throw 0;return await r.json();}catch{return null;}}
async function sbPost(t,d){try{const r=await fetch(`${SB}/rest/v1/${t}`,{method:"POST",headers:hdr(),body:JSON.stringify(d)});return await r.json();}catch{return null;}}
async function sbPatch(t,id,d){try{await fetch(`${SB}/rest/v1/${t}?id=eq.${id}`,{method:"PATCH",headers:hdr(),body:JSON.stringify(d)});return true;}catch{return false;}}
async function sbDel(t,id){try{await fetch(`${SB}/rest/v1/${t}?id=eq.${id}`,{method:"DELETE",headers:hdr()});return true;}catch{return false;}}
async function sbPatchW(t,w,d){try{await fetch(`${SB}/rest/v1/${t}?${w}`,{method:"PATCH",headers:hdr(),body:JSON.stringify(d)});}catch{}}
async function doSignIn(e,p){try{const r=await fetch(`${SB}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:SK,"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});const d=await r.json();if(d.access_token){TOKEN=d.access_token;return{ok:true};}return{ok:false,err:d.error_description||d.msg||"Erreur"};}catch{return{ok:false,err:"Serveur inaccessible"};}}
async function doSignUp(e,p){try{const r=await fetch(`${SB}/auth/v1/signup`,{method:"POST",headers:{apikey:SK,"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});const d=await r.json();if(d.id||d.access_token){if(d.access_token)TOKEN=d.access_token;return{ok:true};}return{ok:false,err:d.error_description||d.msg||"Erreur"};}catch{return{ok:false,err:"Serveur inaccessible"};}}

async function generateAIText(property){try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Tu es un expert en marketing immobilier en Côte d'Ivoire. Génère un post attractif pour les réseaux sociaux pour cet hébergement. Inclus des emojis, des hashtags, et un appel à l'action.\n\nNom: ${property.name}\nType: ${property.type}\nVille: ${property.city}, ${property.quartier}\nPrix: ${property.price} FCFA/nuit\nDescription: ${property.description}\nÉquipements: ${(property.amenities||[]).join(", ")}\n\nGénère 2 versions:\n1. Version courte (WhatsApp) - max 3 lignes\n2. Version longue (Facebook/Instagram) - max 8 lignes\n\nRéponds en JSON: {"short":"...","long":"...","hashtags":"..."}\nPas de backticks markdown.`}]})});const d=await r.json();const text=d.content?.find(c=>c.type==="text")?.text||"";try{return JSON.parse(text.trim());}catch{return{short:text.slice(0,200),long:text,hashtags:"#StaysPlace #CoteDIvoire"};}}catch{return null;}}

const CITIES=["Abidjan","San Pedro","Yamoussoukro","Bouaké","Grand-Bassam","Assinie"];
const PTYPES=["Résidence","Hôtel","Appartement","Villa"];
const DEMO_PROPS=[{id:"p1",name:"Résidence Le Palmier d'Or",type:"Résidence",quartier:"Cocody",city:"Abidjan",price:35000,rating:4.7,reviews:134,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",images:[],amenities:["Wi-Fi","Climatisation","Piscine"],description:"Résidence haut standing à Cocody",whatsapp:"+2250700000001",owner_id:"o1",total_views:340,total_clicks:89},{id:"p2",name:"Hôtel Atlantic Beach",type:"Hôtel",quartier:"Bardot",city:"San Pedro",price:45000,rating:4.9,reviews:156,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop",images:[],amenities:["Wi-Fi","Piscine","Plage privée"],description:"Hôtel de luxe bord de mer",whatsapp:"+2250700000005",owner_id:"o2",total_views:520,total_clicks:145,boost_active:true,boost_end:"2026-04-05"},{id:"p3",name:"Villa Riviera Golf",type:"Villa",quartier:"Riviera Golf",city:"Abidjan",price:85000,rating:4.8,reviews:45,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop",images:[],amenities:["Piscine privée","Chef privé"],description:"Villa de luxe",whatsapp:"+2250700000004",owner_id:"o2",total_views:210,total_clicks:67}];
const DEMO_OWNERS=[{id:"o1",name:"Koné Ibrahim",email:"kone@email.com",phone:"+2250701111111",subscription:"premium"},{id:"o2",name:"Diallo Fatou",email:"diallo@email.com",phone:"+2250703333333",subscription:"enterprise"}];
const DEMO_BOOKINGS=[{id:"b1",property_id:"p1",guest_name:"Jean Dupont",guest_phone:"+2250700111111",check_in:"2026-03-25",check_out:"2026-03-28",nights:3,total:105000,status:"confirmed",payment_method:"Orange Money",created_at:"2026-03-20"}];
const DEMO_PLANS=[{id:"basic",name:"Basic",price:10000,max_properties:1,features:["1 établissement","3 photos","WhatsApp"],color:"#64748b"},{id:"premium",name:"Premium",price:25000,max_properties:3,features:["3 établissements","Sponsorisé","Prioritaire"],color:"#FF6B00"},{id:"enterprise",name:"Enterprise",price:50000,max_properties:999,features:["Illimité","Page dédiée","Support 24/7"],color:"#7C3AED"}];
const DEMO_BTYPES=[{id:"bt1",name:"Standard",description:"Badge sponsorisé + haut du site",weeks:1,price:10000,color:"#F59E0B",features:["Badge SPONSORISÉ","Position prioritaire"],active:true},{id:"bt2",name:"Premium",description:"Carrousel pub + sponsorisé",weeks:2,price:20000,color:"#FF6B00",features:["Badge SPONSORISÉ","Carrousel pub","Position prioritaire"],active:true},{id:"bt3",name:"Ultra",description:"Tout inclus + réseaux sociaux",weeks:3,price:25000,color:"#7C3AED",features:["Badge SPONSORISÉ","Carrousel pub","Réseaux sociaux","Top priorité"],active:true},{id:"bt4",name:"Mensuel",description:"Visibilité maximale 1 mois",weeks:4,price:40000,color:"#0C6E3D",features:["Tout inclus","Pub réseaux sociaux","Newsletter","Rapport stats"],active:true}];

function fmt(p){return(p||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")+" F";}
function fmtD(d){if(!d)return"—";return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});}
function inPer(d,p){if(p==="all")return true;const diff=(Date.now()-new Date(d).getTime())/86400000;return p==="day"?diff<1:p==="week"?diff<7:p==="month"?diff<30:diff<365;}

// ── STYLES ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0}
:root{--bg:#f0f2f5;--card:#fff;--side:#0f172a;--accent:#FF6B00;--accent2:#FF8534;--text:#1e293b;--muted:#64748b;--light:#94a3b8;--border:#e2e8f0;--green:#059669;--red:#dc2626;--purple:#7c3aed;--blue:#0284c7;--amber:#d97706;--radius:14px;--font:'Plus Jakarta Sans',system-ui,sans-serif}
body{font-family:var(--font);background:var(--bg);color:var(--text)}
.side{width:250px;background:var(--side);color:#fff;padding:20px 12px;display:flex;flex-direction:column;height:100vh;position:sticky;top:0;flex-shrink:0;transition:transform .3s}
.side-logo{display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:24px}
.side-logo-icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff}
.side-brand{font-size:17px;font-weight:800;letter-spacing:-.3px}
.side-brand span{color:var(--accent)}
.side-sub{font-size:10px;color:rgba(255,255,255,.35);margin-top:1px}
.side-nav{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
.side-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;border-radius:10px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;cursor:pointer;text-align:left;transition:all .15s;font-family:var(--font)}
.side-btn:hover{color:rgba(255,255,255,.7);background:rgba(255,255,255,.04)}
.side-btn.active{color:var(--accent2);background:rgba(255,107,0,.12)}
.side-btn .icon{font-size:17px;width:22px;text-align:center}
.side-footer{border-top:1px solid rgba(255,255,255,.08);padding-top:14px;margin-top:8px}
.side-email{font-size:11px;color:rgba(255,255,255,.25);padding:0 14px 8px;word-break:break-all}
.main{flex:1;padding:28px 32px;overflow-y:auto;max-height:100vh;min-width:0}
.card{background:var(--card);border-radius:var(--radius);border:1px solid var(--border);padding:20px;transition:box-shadow .2s}
.card:hover{box-shadow:0 4px 20px rgba(0,0,0,.04)}
.page-title{font-size:24px;font-weight:800;letter-spacing:-.5px}
.page-sub{color:var(--muted);font-size:13px;margin-top:2px}
.stat-grid{display:flex;gap:14px;flex-wrap:wrap}
.stat{background:var(--card);border-radius:var(--radius);padding:18px 20px;border:1px solid var(--border);flex:1 1 170px;min-width:150}
.stat-label{font-size:10px;font-weight:700;color:var(--light);text-transform:uppercase;letter-spacing:.8px}
.stat-value{font-size:26px;font-weight:800;margin-top:4px;letter-spacing:-.5px}
.stat-sub{font-size:11px;color:var(--light);margin-top:2px}
.badge{font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px;display:inline-block}
.badge-green{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}
.badge-yellow{background:#fffbeb;color:#92400e;border:1px solid #fde68a}
.badge-red{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:var(--font);transition:opacity .15s}
.btn-primary:hover{opacity:.9}
.btn-secondary{background:var(--card);color:var(--text);border:1px solid var(--border);padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:var(--font);transition:all .15s}
.btn-secondary:hover{border-color:#cbd5e1;background:#f8fafc}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:8px}
.btn-icon{background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:6px 8px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;justify-content:center}
.btn-icon:hover{background:#f1f5f9;border-color:#cbd5e1}
.btn-icon-danger{background:#fef2f2;border:1px solid #fecaca}
.btn-icon-danger:hover{background:#fee2e2}
.input{width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--border);font-size:14px;outline:none;font-family:var(--font);transition:border-color .15s;background:var(--card)}
.input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,107,0,.08)}
.label{font-size:11px;font-weight:700;color:var(--muted);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{padding:10px 14px;font-weight:600;color:var(--muted);text-align:left;background:#f8fafc;border-bottom:1px solid var(--border)}
.table td{padding:10px 14px;border-bottom:1px solid #f8fafc}
.table tr:hover td{background:#fafbfc}
.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:var(--card);border-radius:16px;max-width:600px;width:100%;max-height:90vh;overflow:auto;padding:28px;box-shadow:0 24px 48px rgba(0,0,0,.15)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.flex-between{display:flex;justify-content:space-between;align-items:center}
.flex-gap{display:flex;gap:8px;align-items:center}
.burger{display:none;position:fixed;top:14px;left:14px;z-index:1001;background:var(--side);border:none;border-radius:10px;padding:10px 12px;cursor:pointer;color:#fff;font-size:22px}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998}
@media(max-width:768px){.side{position:fixed;z-index:999;transform:translateX(-100%)}.side.open{transform:translateX(0)}.overlay.open{display:block}.burger{display:flex}.main{padding:16px 14px!important;padding-top:60px!important}.grid-2,.grid-3{grid-template-columns:1fr}.stat-grid{flex-direction:column}}
.boost-card{padding:16px;border-radius:12px;cursor:pointer;border:1px solid var(--border);background:var(--card);transition:all .2s;display:flex;justify-content:space-between;align-items:center;gap:12px}
.boost-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
.boost-card.selected{border-width:2px}
.tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}
`;

function Badge({s}){const m={active:"badge-green",pending:"badge-yellow",inactive:"badge-red",confirmed:"badge-green",cancelled:"badge-red"};const l={active:"Actif",pending:"En attente",inactive:"Inactif",confirmed:"Confirmé",cancelled:"Annulé"};return<span className={`badge ${m[s]||"badge-yellow"}`}>{l[s]||s}</span>;}
function Stat({label,value,sub,color="var(--accent)"}){return<div className="stat"><div className="stat-label">{label}</div><div className="stat-value" style={{color}}>{value}</div>{sub&&<div className="stat-sub">{sub}</div>}</div>;}

// ── LOGIN ──
function Login({onLogin}){const[e,sE]=useState("");const[p,sP]=useState("");const[err,sErr]=useState("");const[l,sL]=useState(false);const[m,sM]=useState("login");
  const sub=async()=>{if(!e||!p){sErr("Remplissez tous les champs");return;}sErr("");sL(true);
    if(m==="signup"){const admins=await sbGet("admin_whitelist","");if(admins&&Array.isArray(admins)&&admins.length>=2){sL(false);sErr("Maximum 2 administrateurs.");return;}const res=await doSignUp(e,p);sL(false);if(res.ok){await sbPost("admin_whitelist",{email:e,role:"admin"});sErr("Compte créé ! Confirmez email puis connectez-vous.");sM("login");}else sErr(res.err);}
    else{const admins=await sbGet("admin_whitelist",`email=eq.${encodeURIComponent(e)}`);if(!admins||!Array.isArray(admins)||admins.length===0){sL(false);sErr("Email non autorisé.");return;}const res=await doSignIn(e,p);sL(false);if(res.ok)onLogin(e);else sErr(res.err);}};
  return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",padding:20}}>
    <style>{CSS}</style>
    <div style={{background:"#fff",borderRadius:24,padding:"44px 40px",maxWidth:400,width:"100%",boxShadow:"0 32px 64px rgba(0,0,0,.3)"}}>
      <div style={{textAlign:"center",marginBottom:32}}><div className="side-logo-icon" style={{margin:"0 auto 16px",width:60,height:60,fontSize:28}}>S</div><h1 style={{fontSize:28,fontWeight:800,letterSpacing:"-.5px"}}>Stays<span style={{color:"var(--accent)"}}>Place</span></h1><p style={{color:"var(--light)",fontSize:14}}>Espace administration</p></div>
      <div style={{marginBottom:16}}><label className="label">Email</label><input className="input" type="email" value={e} onChange={x=>sE(x.target.value)} onKeyDown={x=>x.key==="Enter"&&sub()} placeholder="admin@staysplace.com"/></div>
      <div style={{marginBottom:20}}><label className="label">Mot de passe</label><input className="input" type="password" value={p} onChange={x=>sP(x.target.value)} onKeyDown={x=>x.key==="Enter"&&sub()} placeholder="Min. 6 caractères"/></div>
      {err&&<div style={{background:err.includes("créé")?"#f0fdf4":"#fef2f2",color:err.includes("créé")?"#166534":"#991b1b",border:`1px solid ${err.includes("créé")?"#bbf7d0":"#fecaca"}`,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>{err}</div>}
      <button className="btn-primary" onClick={sub} disabled={l} style={{width:"100%",justifyContent:"center",padding:14,fontSize:16,opacity:l?.6:1}}>{l?"...":(m==="login"?"Se connecter":"Créer le compte")}</button>
      <div style={{textAlign:"center",marginTop:16}}><button onClick={()=>{sM(m==="login"?"signup":"login");sErr("");}} style={{background:"none",border:"none",color:"var(--accent)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"var(--font)"}}>{m==="login"?"Créer un compte admin":"Déjà un compte ? Se connecter"}</button></div>
    </div>
  </div>;
}

// ── OWNER FORM ──
function OwnerForm({owner,plans,onSave,onClose}){const[f,sF]=useState(owner||{name:"",email:"",phone:"",whatsapp:"",subscription:"none"});const set=(k,v)=>sF(p=>({...p,[k]:v}));const[saving,sS]=useState(false);
  return<div><div className="grid-2" style={{marginBottom:12}}><div style={{gridColumn:"1/-1"}}><label className="label">Nom *</label><input className="input" value={f.name} onChange={e=>set("name",e.target.value)}/></div><div><label className="label">Téléphone *</label><input className="input" value={f.phone||""} onChange={e=>set("phone",e.target.value)}/></div><div><label className="label">WhatsApp</label><input className="input" value={f.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)}/></div><div style={{gridColumn:"1/-1"}}><label className="label">Email</label><input className="input" value={f.email||""} onChange={e=>set("email",e.target.value)}/></div></div>
  <div style={{marginBottom:16}}><label className="label">Plan</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[{id:"none",name:"Aucun",color:"#94a3b8"},...(plans||[])].map(pl=><button key={pl.id} onClick={()=>set("subscription",pl.id)} style={{flex:"1 1 80px",padding:10,borderRadius:10,cursor:"pointer",textAlign:"center",border:f.subscription===pl.id?`2px solid ${pl.color}`:"1px solid var(--border)",background:f.subscription===pl.id?`${pl.color}08`:"#fff",fontFamily:"var(--font)"}}><div style={{fontSize:13,fontWeight:700,color:pl.color}}>{pl.name}</div></button>)}</div></div>
  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button className="btn-secondary" onClick={onClose}>Annuler</button><button className="btn-primary" onClick={async()=>{if(!f.name||!f.phone)return alert("Nom et téléphone obligatoires");sS(true);await onSave({name:f.name,email:f.email||"",phone:f.phone,whatsapp:f.whatsapp||f.phone,subscription:f.subscription});sS(false);}} disabled={saving}>{saving?"...":owner?"Enregistrer":"Créer"}</button></div></div>;
}

// ── PROPERTY FORM ──
function PropForm({prop,owners,onSave,onClose}){
  const[f,sF]=useState(prop||{name:"",type:"Résidence",quartier:"",city:"Abidjan",price:"",description:"",whatsapp:"",amenities:[],owner_id:"",status:"pending",sponsored:false,images:[],image:""});
  const[nA,sNA]=useState("");const[nI,sNI]=useState("");const[saving,sS]=useState(false);const set=(k,v)=>sF(p=>({...p,[k]:v}));
  const save=async()=>{sS(true);const d={name:f.name,type:f.type,quartier:f.quartier,city:f.city,price:Number(f.price),description:f.description,whatsapp:f.whatsapp,amenities:f.amenities,owner_id:f.owner_id||null,status:f.status,sponsored:f.sponsored,images:f.images,image:f.image||f.images?.[0]||""};if(prop?.id)await sbPatch("properties",prop.id,d);else await sbPost("properties",d);sS(false);onSave();};
  return<div className="modal-overlay" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="flex-between" style={{marginBottom:20}}><h2 style={{fontSize:20,fontWeight:800}}>{prop?"Modifier":"Nouvel hébergement"}</h2><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"var(--light)"}}>✕</button></div>
    <div style={{marginBottom:12}}><label className="label">Propriétaire</label><select className="input" value={f.owner_id||""} onChange={e=>set("owner_id",e.target.value)} style={{cursor:"pointer"}}><option value="">— Choisir —</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
    <div className="grid-2" style={{marginBottom:12}}>
      <div style={{gridColumn:"1/-1"}}><label className="label">Nom</label><input className="input" value={f.name} onChange={e=>set("name",e.target.value)}/></div>
      <div><label className="label">Type</label><select className="input" value={f.type} onChange={e=>set("type",e.target.value)}>{PTYPES.map(t=><option key={t}>{t}</option>)}</select></div>
      <div><label className="label">Ville</label><select className="input" value={f.city} onChange={e=>set("city",e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
      <div><label className="label">Quartier</label><input className="input" value={f.quartier||""} onChange={e=>set("quartier",e.target.value)}/></div>
      <div><label className="label">Prix/nuit</label><input className="input" type="number" value={f.price} onChange={e=>set("price",e.target.value)}/></div>
      <div><label className="label">WhatsApp</label><input className="input" value={f.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)}/></div>
      <div><label className="label">Statut</label><select className="input" value={f.status} onChange={e=>set("status",e.target.value)}><option value="active">Actif</option><option value="pending">En attente</option><option value="inactive">Inactif</option></select></div>
    </div>
    <div style={{marginBottom:12}}><label className="label">Description</label><textarea className="input" value={f.description||""} onChange={e=>set("description",e.target.value)} rows={3} style={{resize:"vertical"}}/></div>
    <div style={{marginBottom:12}}><label className="label">Équipements</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>{(f.amenities||[]).map((a,i)=><span key={i} className="tag" style={{background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0"}}>{a}<button onClick={()=>set("amenities",f.amenities.filter((_,x)=>x!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",padding:0,marginLeft:4}}>×</button></span>)}</div><div className="flex-gap"><input className="input" value={nA} onChange={e=>sNA(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nA.trim()){e.preventDefault();set("amenities",[...(f.amenities||[]),nA.trim()]);sNA("");}}} placeholder="Wi-Fi, Piscine..." style={{flex:1}}/><button className="btn-secondary btn-sm" onClick={()=>{if(nA.trim()){set("amenities",[...(f.amenities||[]),nA.trim()]);sNA("");}}}>+</button></div></div>
    <div style={{marginBottom:16}}><label className="label">Photos</label><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>{(f.images||[]).map((img,i)=><div key={i} style={{position:"relative",width:80,height:60,borderRadius:8,overflow:"hidden",border:f.image===img?"2px solid var(--accent)":"1px solid var(--border)"}}><img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><button onClick={()=>{const imgs=f.images.filter((_,x)=>x!==i);set("images",imgs);if(f.image===f.images[i])set("image",imgs[0]||"");}} style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,.7)",color:"#fff",border:"none",borderRadius:"50%",width:18,height:18,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>)}<label style={{width:80,height:60,borderRadius:8,border:"2px dashed #cbd5e1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#f8fafc",fontSize:10,color:"var(--accent)",fontWeight:700}}>+ PHOTO<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files||[]).forEach(file=>{const r=new FileReader();r.onload=ev=>{sF(prev=>({...prev,images:[...(prev.images||[]),ev.target.result],image:prev.image||ev.target.result}));};r.readAsDataURL(file);});e.target.value="";}}/></label></div><div className="flex-gap"><input className="input" value={nI} onChange={e=>sNI(e.target.value)} placeholder="URL de l'image..." style={{flex:1}}/><button className="btn-secondary btn-sm" onClick={()=>{if(nI.trim()){const imgs=[...(f.images||[]),nI.trim()];set("images",imgs);if(!f.image)set("image",nI.trim());sNI("");}}}>+</button></div></div>
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}><button className="btn-secondary" onClick={onClose}>Annuler</button><button className="btn-primary" onClick={save} disabled={saving}>{saving?"...":prop?"Enregistrer":"Créer"}</button></div>
  </div></div>;
}

// ── MAIN ──
export default function Admin(){
  const[authed,setAuth]=useState(false);const[userEmail,setUE]=useState("");
  const[page,setPage]=useState("dashboard");const[sideOpen,setSO]=useState(false);
  const[properties,setProps]=useState(DEMO_PROPS);const[owners,setOwners]=useState(DEMO_OWNERS);
  const[bookings,setBookings]=useState(DEMO_BOOKINGS);const[plans,setPlans]=useState(DEMO_PLANS);
  const[boosts,setBoosts]=useState([]);const[boostTypes,setBT]=useState(DEMO_BTYPES);
  const[settings,setSettings]=useState({phone:"+225 07 00 00 00 00",email:"contact@staysplace.com",whatsapp:"+22507000000",address:"Abidjan, Côte d'Ivoire",tagline:"N°1 en CI"});
  const[online,setOnline]=useState(false);
  const[showForm,setSF]=useState(false);const[editProp,setEP]=useState(null);
  const[showOF,setSOF]=useState(false);const[editOwner,setEO]=useState(null);
  const[search,setSrch]=useState("");const[fCity,setFC]=useState("Toutes");const[fStatus,setFS]=useState("Tous");
  const[period,setPer]=useState("month");const[delConfirm,setDC]=useState(null);const[delType,setDT]=useState("");
  const[editingPlan,setEditPlan]=useState(null);const[savingS,setSS]=useState(false);
  const[boostProp,setBoostProp]=useState(null);const[selBoostType,setSelBT]=useState(null);
  const[editBT,setEditBT]=useState(null);const[btForm,setBTForm]=useState(null);
  const[aiProp,setAiProp]=useState(null);const[aiResult,setAiResult]=useState(null);const[aiLoading,setAiLoading]=useState(false);

  const reload=useCallback(async()=>{
    const p=await sbGet("properties","order=sponsored.desc,rating.desc");
    if(p&&Array.isArray(p)){setProps(p);setOnline(true);
      const o=await sbGet("owners","order=name.asc");if(o)setOwners(o);
      const b=await sbGet("bookings","order=created_at.desc");if(b)setBookings(b);
      const pl=await sbGet("subscription_plans","order=price.asc");if(pl)setPlans(pl);
      const bo=await sbGet("boosts","order=created_at.desc");if(bo)setBoosts(bo);
      const bt=await sbGet("boost_types","active=eq.true&order=sort_order.asc");if(bt&&bt.length>0)setBT(bt);
      const s=await sbGet("site_settings","");if(s){const m={};s.forEach(x=>{m[x.key]=x.value;});setSettings(m);}
    }
  },[]);

  const handleLogin=(email)=>{setAuth(true);setUE(email);reload();};
  const ownersWC=useMemo(()=>owners.map(o=>({...o,propertyCount:properties.filter(p=>p.owner_id===o.id).length,props:properties.filter(p=>p.owner_id===o.id)})),[owners,properties]);
  const perBook=bookings.filter(b=>inPer(b.created_at,period));
  const confirmed=perBook.filter(b=>b.status==="confirmed");
  const totalSub=useMemo(()=>{let t=0;owners.forEach(o=>{const p=plans.find(x=>x.id===o.subscription);t+=(p?.price||0);});return t;},[owners,plans]);
  const boostRevenue=boosts.filter(b=>b.status==="active").reduce((s,b)=>s+(b.price_paid||0),0);
  const filteredP=properties.filter(p=>{if(search&&!p.name.toLowerCase().includes(search.toLowerCase()))return false;if(fCity!=="Toutes"&&p.city!==fCity)return false;if(fStatus!=="Tous"&&p.status!==fStatus)return false;return true;});
  const topByViews=[...properties].sort((a,b)=>(b.total_views||0)-(a.total_views||0));

  const handleDel=async()=>{if(!delConfirm)return;if(delType==="prop"){await sbDel("properties",delConfirm.id);setProps(ps=>ps.filter(x=>x.id!==delConfirm.id));}if(delType==="book"){await sbDel("bookings",delConfirm.id);setBookings(bs=>bs.filter(x=>x.id!==delConfirm.id));}if(delType==="owner"){await sbDel("owners",delConfirm.id);setOwners(os=>os.filter(x=>x.id!==delConfirm.id));}setDC(null);if(online)reload();};
  const activateBoost=async(prop)=>{if(!selBoostType)return;const bt=boostTypes.find(x=>x.id===selBoostType);if(!bt)return;const startDate=new Date().toISOString().split("T")[0];const endDate=new Date(Date.now()+bt.weeks*7*86400000).toISOString().split("T")[0];await sbPost("boosts",{property_id:prop.id,owner_id:prop.owner_id,start_date:startDate,end_date:endDate,weeks:bt.weeks,price_paid:bt.price,status:"active",payment_method:"Orange Money"});await sbPatch("properties",prop.id,{sponsored:true,boost_active:true,boost_end:endDate});setBoostProp(null);setSelBT(null);if(online)reload();else setProps(ps=>ps.map(x=>x.id===prop.id?{...x,sponsored:true,boost_active:true,boost_end:endDate}:x));};
  const saveBTForm=async()=>{if(!btForm)return;const d={name:btForm.name,description:btForm.description,weeks:Number(btForm.weeks),price:Number(btForm.price),color:btForm.color,features:btForm.features,active:true,sort_order:btForm.sort_order||0};if(editBT){await sbPatch("boost_types",editBT,d);}else{await sbPost("boost_types",d);}setEditBT(null);setBTForm(null);if(online)reload();};
  const genAI=async(prop)=>{setAiProp(prop);setAiLoading(true);setAiResult(null);const r=await generateAIText(prop);setAiResult(r);setAiLoading(false);};

  if(!authed)return<Login onLogin={handleLogin}/>;

  const nav=[{id:"dashboard",l:"Tableau de bord",i:"📊"},{id:"properties",l:"Hébergements",i:"🏨"},{id:"owners",l:"Propriétaires",i:"👥"},{id:"boosts",l:"Boosts",i:"🚀"},{id:"tops",l:"Tops & Stats",i:"🏆"},{id:"reports",l:"Rapports",i:"📈"},{id:"siteReport",l:"Évolution",i:"📉"},{id:"bookings",l:"Réservations",i:"📅"},{id:"ai",l:"IA Texte",i:"🤖"},{id:"subscriptions",l:"Monétisation",i:"💰"},{id:"settings",l:"Paramètres",i:"⚙️"}];

  return<div style={{display:"flex",minHeight:"100vh"}}><style>{CSS}</style>
    <div className={`overlay${sideOpen?" open":""}`} onClick={()=>setSO(false)}/>
    <button className="burger" onClick={()=>setSO(!sideOpen)}>{sideOpen?"✕":"☰"}</button>

    <aside className={`side${sideOpen?" open":""}`}>
      <div className="side-logo"><div className="side-logo-icon">S</div><div><div className="side-brand">Stays<span>Place</span></div><div className="side-sub">Admin {online?"• En ligne":"• Démo"}</div></div></div>
      <nav className="side-nav">{nav.map(n=><button key={n.id} className={`side-btn${page===n.id?" active":""}`} onClick={()=>{setPage(n.id);setSO(false);}}><span className="icon">{n.i}</span>{n.l}</button>)}</nav>
      <div className="side-footer"><div className="side-email">{userEmail}</div><button className="side-btn" onClick={reload}><span className="icon">🔄</span>Rafraîchir</button><button className="side-btn" onClick={()=>{TOKEN=null;setAuth(false);}}><span className="icon">🚪</span>Déconnexion</button></div>
    </aside>

    <main className="main">
      {/* Dashboard */}
      {page==="dashboard"&&<div><div className="flex-between" style={{marginBottom:20,flexWrap:"wrap",gap:12}}><div><h1 className="page-title">Tableau de bord</h1><p className="page-sub">Vue d'ensemble en temps réel</p></div><div className="flex-gap">{["day","week","month","all"].map(v=><button key={v} className={`btn-secondary btn-sm`} onClick={()=>setPer(v)} style={{background:period===v?"var(--side)":"",color:period===v?"#fff":"",borderColor:period===v?"var(--side)":""}}>{({day:"Auj.",week:"7j",month:"30j",all:"Tout"})[v]}</button>)}</div></div>
        <div className="stat-grid" style={{marginBottom:28}}><Stat label="Revenus abo" value={fmt(totalSub)+"/mois"} color="var(--green)"/><Stat label="Revenus boosts" value={fmt(boostRevenue)} color="var(--amber)"/><Stat label="Hébergements" value={properties.length} sub={`${properties.filter(p=>p.status==="active").length} actifs`}/><Stat label="Réservations" value={confirmed.length} sub={fmt(confirmed.reduce((s,b)=>s+b.total,0))} color="var(--blue)"/></div>
        <div className="grid-2">
          <div className="card"><h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>🏆 Top 5 — plus vus</h3>{topByViews.slice(0,5).map((p,i)=><div key={p.id} className="flex-between" style={{padding:"8px 0",borderBottom:"1px solid #f8fafc"}}><div className="flex-gap"><span style={{fontWeight:800,color:i===0?"var(--amber)":"var(--light)",width:20}}>{i+1}.</span><span style={{fontWeight:600,fontSize:13}}>{p.name}</span></div><span style={{fontWeight:700,color:"var(--blue)",fontSize:13}}>{p.total_views||0}</span></div>)}</div>
          <div className="card"><h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>📅 Dernières réservations</h3>{perBook.slice(0,5).map(b=><div key={b.id} className="flex-between" style={{padding:"8px 0",borderBottom:"1px solid #f8fafc"}}><div><div style={{fontWeight:600,fontSize:13}}>{b.guest_name}</div><div style={{fontSize:11,color:"var(--light)"}}>{fmtD(b.check_in)}</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700,fontSize:13}}>{fmt(b.total)}</div><Badge s={b.status}/></div></div>)}{perBook.length===0&&<div style={{textAlign:"center",padding:20,color:"var(--light)",fontSize:13}}>Aucune réservation</div>}</div>
        </div>
      </div>}

      {/* Properties */}
      {page==="properties"&&<div><div className="flex-between" style={{marginBottom:20}}><div><h1 className="page-title">Hébergements</h1><p className="page-sub">{properties.length} établissements</p></div><button className="btn-primary" onClick={()=>{setEP(null);setSF(true);}}>+ Ajouter</button></div>
        <div className="flex-gap" style={{marginBottom:16,flexWrap:"wrap"}}><input className="input" value={search} onChange={e=>setSrch(e.target.value)} placeholder="🔍 Rechercher..." style={{maxWidth:280}}/><select className="input" value={fCity} onChange={e=>setFC(e.target.value)} style={{width:"auto"}}><option>Toutes</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select><select className="input" value={fStatus} onChange={e=>setFS(e.target.value)} style={{width:"auto"}}><option value="Tous">Tous</option><option value="active">Actif</option><option value="pending">En attente</option></select></div>
        <div className="card" style={{padding:0,overflow:"auto"}}><table className="table" style={{minWidth:700}}><thead><tr><th>Hébergement</th><th>Ville</th><th>Prix</th><th>Statut</th><th>Boost</th><th>Vues</th><th>Actions</th></tr></thead>
        <tbody>{filteredP.map(p=><tr key={p.id}><td><div className="flex-gap">{p.image&&<img src={p.image} alt="" style={{width:44,height:32,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"var(--light)"}}>{p.type} • {p.quartier}</div></div></div></td><td>{p.city}</td><td style={{fontWeight:700}}>{fmt(p.price)}</td><td><Badge s={p.status}/></td><td>{p.boost_active?<span className="tag" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff"}}>🚀 BOOSTÉ</span>:<button className="btn-secondary btn-sm" onClick={()=>{setBoostProp(p);setSelBT(boostTypes[0]?.id||null);}}>Booster</button>}</td><td style={{color:"var(--muted)"}}>{p.total_views||0}</td><td><div className="flex-gap"><button className="btn-icon" onClick={()=>{setEP(p);setSF(true);}}>✏️</button><button className="btn-icon" onClick={()=>genAI(p)} title="IA">🤖</button><button className="btn-icon btn-icon-danger" onClick={()=>{setDC(p);setDT("prop");}}>🗑️</button></div></td></tr>)}</tbody></table></div>
      </div>}

      {/* Owners */}
      {page==="owners"&&<div><div className="flex-between" style={{marginBottom:20}}><h1 className="page-title">Propriétaires ({owners.length})</h1><button className="btn-primary" onClick={()=>{setEO(null);setSOF(true);}}>+ Ajouter</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>{ownersWC.map(o=><div key={o.id} className="card"><div className="flex-between"><div><div style={{fontSize:15,fontWeight:700}}>{o.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>{o.email} • {o.phone}</div></div><div className="flex-gap"><button className="btn-icon" onClick={()=>{setEO(o);setSOF(true);}}>✏️</button><button className="btn-icon btn-icon-danger" onClick={()=>{setDC(o);setDT("owner");}}>🗑️</button></div></div><div style={{display:"flex",gap:12,margin:"12px 0"}}><div style={{textAlign:"center",flex:1,background:"#f8fafc",borderRadius:10,padding:10}}><div style={{fontSize:22,fontWeight:800}}>{o.propertyCount}</div><div style={{fontSize:11,color:"var(--light)"}}>Bien{o.propertyCount>1?"s":""}</div></div><div style={{textAlign:"center",flex:1,background:"#f8fafc",borderRadius:10,padding:10}}><div style={{fontSize:14,fontWeight:700,color:plans.find(p=>p.id===o.subscription)?.color||"var(--light)"}}>{plans.find(p=>p.id===o.subscription)?.name||"Aucun"}</div><div style={{fontSize:11,color:"var(--light)"}}>Plan</div></div></div>{o.props.map(p=><div key={p.id} className="flex-between" style={{padding:"5px 0",borderBottom:"1px solid #f8fafc",fontSize:12}}><span style={{fontWeight:600}}>{p.name}</span><Badge s={p.status}/></div>)}</div>)}</div>
        {showOF&&<div className="modal-overlay" onClick={()=>setSOF(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2 style={{fontSize:20,fontWeight:800,marginBottom:20}}>{editOwner?"Modifier":"Nouveau propriétaire"}</h2><OwnerForm owner={editOwner} plans={plans} onSave={async(d)=>{if(editOwner?.id)await sbPatch("owners",editOwner.id,d);else await sbPost("owners",d);setSOF(false);setEO(null);if(online)reload();else{if(editOwner?.id)setOwners(os=>os.map(o=>o.id===editOwner.id?{...o,...d}:o));else setOwners(os=>[...os,{id:"n"+Date.now(),...d}]);}}} onClose={()=>{setSOF(false);setEO(null);}}/></div></div>}
      </div>}

      {/* Boosts */}
      {page==="boosts"&&<div><h1 className="page-title" style={{marginBottom:8}}>🚀 Système de Boost</h1><p className="page-sub" style={{marginBottom:20}}>Gérez les types de boost et activez-les sur vos hébergements</p>
        <div className="stat-grid" style={{marginBottom:24}}><Stat label="Boosts actifs" value={boosts.filter(b=>b.status==="active").length} color="var(--amber)"/><Stat label="Revenus boosts" value={fmt(boostRevenue)} color="var(--green)"/><Stat label="Types de boost" value={boostTypes.length} color="var(--purple)"/></div>
        {/* Boost types management */}
        <div className="flex-between" style={{marginBottom:14}}><h2 style={{fontSize:16,fontWeight:700}}>Types de boost (personnalisables)</h2><button className="btn-primary btn-sm" onClick={()=>{setEditBT(null);setBTForm({name:"",description:"",weeks:1,price:10000,color:"#F59E0B",features:[],sort_order:boostTypes.length+1});}}>+ Nouveau type</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14,marginBottom:28}}>
          {boostTypes.map(bt=><div key={bt.id} className="card" style={{borderTop:`4px solid ${bt.color}`,position:"relative"}}>
            <div className="flex-between"><div style={{fontSize:16,fontWeight:800,color:bt.color}}>{bt.name}</div><div className="flex-gap"><button className="btn-icon" onClick={()=>{setEditBT(bt.id);setBTForm({...bt});}}>✏️</button><button className="btn-icon btn-icon-danger" onClick={async()=>{await sbDel("boost_types",bt.id);if(online)reload();else setBT(bts=>bts.filter(x=>x.id!==bt.id));}}>🗑️</button></div></div>
            <div style={{fontSize:12,color:"var(--muted)",margin:"6px 0 10px"}}>{bt.description}</div>
            <div style={{fontSize:24,fontWeight:800}}>{fmt(bt.price)}<span style={{fontSize:12,color:"var(--light)"}}> / {bt.weeks} sem.</span></div>
            <div style={{marginTop:10}}>{(bt.features||[]).map((f,i)=><div key={i} style={{fontSize:12,color:"var(--text)",marginBottom:3}}>✓ {f}</div>)}</div>
          </div>)}
        </div>
        {/* Boost type form */}
        {btForm&&<div className="modal-overlay" onClick={()=>setBTForm(null)}><div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:20}}>{editBT?"Modifier le boost":"Nouveau type de boost"}</h2>
          <div className="grid-2" style={{marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><label className="label">Nom</label><input className="input" value={btForm.name} onChange={e=>setBTForm(f=>({...f,name:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label className="label">Description</label><input className="input" value={btForm.description} onChange={e=>setBTForm(f=>({...f,description:e.target.value}))}/></div>
            <div><label className="label">Durée (semaines)</label><input className="input" type="number" value={btForm.weeks} onChange={e=>setBTForm(f=>({...f,weeks:e.target.value}))}/></div>
            <div><label className="label">Prix (FCFA)</label><input className="input" type="number" value={btForm.price} onChange={e=>setBTForm(f=>({...f,price:e.target.value}))}/></div>
            <div><label className="label">Couleur</label><input className="input" type="color" value={btForm.color} onChange={e=>setBTForm(f=>({...f,color:e.target.value}))} style={{height:42,padding:4}}/></div>
            <div><label className="label">Ordre d'affichage</label><input className="input" type="number" value={btForm.sort_order||0} onChange={e=>setBTForm(f=>({...f,sort_order:Number(e.target.value)}))}/></div>
          </div>
          <div style={{marginBottom:16}}><label className="label">Fonctionnalités incluses</label>{(btForm.features||[]).map((f,i)=><div key={i} className="flex-gap" style={{marginBottom:6}}><input className="input" value={f} onChange={e=>{const nf=[...btForm.features];nf[i]=e.target.value;setBTForm(fm=>({...fm,features:nf}));}} style={{flex:1}}/><button className="btn-icon btn-icon-danger" onClick={()=>setBTForm(fm=>({...fm,features:fm.features.filter((_,x)=>x!==i)}))}>×</button></div>)}<button className="btn-secondary btn-sm" onClick={()=>setBTForm(fm=>({...fm,features:[...(fm.features||[]),""]}))}>+ Ajouter</button></div>
          <div className="flex-gap" style={{justifyContent:"flex-end"}}><button className="btn-secondary" onClick={()=>{setBTForm(null);setEditBT(null);}}>Annuler</button><button className="btn-primary" onClick={saveBTForm}>{editBT?"Enregistrer":"Créer"}</button></div>
        </div></div>}

        {/* Hebergements boostables */}
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>Hébergements</h2>
        <div className="card" style={{padding:0,overflow:"auto"}}><table className="table"><thead><tr><th>Hébergement</th><th>Statut boost</th><th>Expire</th><th>Action</th></tr></thead><tbody>{properties.filter(p=>p.status==="active").map(p=><tr key={p.id}><td style={{fontWeight:600}}>{p.name}</td><td>{p.boost_active?<span className="tag" style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#fff"}}>🚀 ACTIF</span>:<span style={{color:"var(--light)",fontSize:12}}>Inactif</span>}</td><td style={{fontSize:12}}>{p.boost_end?fmtD(p.boost_end):"—"}</td><td>{p.boost_active?<button className="btn-secondary btn-sm" style={{color:"var(--red)"}} onClick={async()=>{await sbPatch("properties",p.id,{boost_active:false,boost_end:null,sponsored:false});if(online)reload();else setProps(ps=>ps.map(x=>x.id===p.id?{...x,boost_active:false,boost_end:null,sponsored:false}:x));}}>Désactiver</button>:<button className="btn-primary btn-sm" onClick={()=>{setBoostProp(p);setSelBT(boostTypes[0]?.id||null);}}>Activer</button>}</td></tr>)}</tbody></table></div>
      </div>}

      {/* Tops */}
      {page==="tops"&&<div><h1 className="page-title" style={{marginBottom:20}}>🏆 Tops & Statistiques</h1>
        <div className="grid-2" style={{marginBottom:24}}>
          <div className="card"><h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>🥇 Top annonce de la semaine</h3>{topByViews[0]&&<div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",borderRadius:12,padding:16,border:"1px solid #FDE68A"}}><div className="flex-gap">{topByViews[0].image&&<img src={topByViews[0].image} alt="" style={{width:60,height:44,borderRadius:8,objectFit:"cover"}}/>}<div><div style={{fontSize:16,fontWeight:800}}>{topByViews[0].name}</div><div style={{fontSize:12,color:"#92400e"}}>{topByViews[0].city} • {topByViews[0].total_views||0} vues</div></div></div></div>}</div>
          <div className="card"><h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>📊 Stats globales</h3><div className="flex-gap" style={{gap:12}}><Stat label="Vues" value={properties.reduce((s,p)=>s+(p.total_views||0),0)} color="var(--blue)"/><Stat label="Clics" value={properties.reduce((s,p)=>s+(p.total_clicks||0),0)} color="var(--purple)"/></div></div>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>🏅 Top 5 biens</h2>
        <div className="card" style={{padding:0,overflow:"auto"}}><table className="table"><thead><tr><th>Rang</th><th>Hébergement</th><th>Ville</th><th>Vues</th><th>Clics</th><th>Score</th></tr></thead><tbody>{topByViews.slice(0,5).map((p,i)=>{const score=(p.total_views||0)+(p.total_clicks||0)*3;return<tr key={p.id} style={{background:i===0?"#FFFBEB":""}}><td><span style={{fontSize:16,fontWeight:800,color:["var(--amber)","var(--light)","#CD7F32","var(--muted)","var(--muted)"][i]}}>{["🥇","🥈","🥉","4.","5."][i]}</span></td><td className="flex-gap">{p.image&&<img src={p.image} alt="" style={{width:36,height:26,borderRadius:4,objectFit:"cover"}}/>}<span style={{fontWeight:600}}>{p.name}</span></td><td>{p.city}</td><td style={{fontWeight:700,color:"var(--blue)"}}>{p.total_views||0}</td><td style={{fontWeight:700,color:"var(--purple)"}}>{p.total_clicks||0}</td><td style={{fontWeight:800,color:"var(--amber)"}}>{score}</td></tr>;})}</tbody></table></div>
      </div>}

      {/* Reports */}
      {page==="reports"&&<div><h1 className="page-title" style={{marginBottom:8}}>📈 Rapports par hébergement</h1><p className="page-sub" style={{marginBottom:20}}>Visibilité et performance détaillées</p>
        <div className="card" style={{padding:0,overflow:"auto",marginBottom:20}}><table className="table" style={{minWidth:800}}><thead><tr><th>Hébergement</th><th>Ville</th><th>Vues</th><th>Clics</th><th>Réserv.</th><th>Revenus</th><th>Conv.</th><th>Boost</th><th>Note</th></tr></thead><tbody>{properties.map(p=>{const pb=bookings.filter(b=>b.property_id===p.id&&b.status==="confirmed");const rev=pb.reduce((s,b)=>s+b.total,0);const v=p.total_views||0;const cv=v>0?((pb.length/v)*100).toFixed(1):0;return<tr key={p.id}><td><div className="flex-gap">{p.image&&<img src={p.image} alt="" style={{width:36,height:26,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"var(--light)"}}>{p.type}</div></div></div></td><td>{p.city}</td><td style={{fontWeight:700,color:"var(--blue)"}}>{v}</td><td style={{fontWeight:700,color:"var(--purple)"}}>{p.total_clicks||0}</td><td style={{fontWeight:700,color:"var(--green)"}}>{pb.length}</td><td style={{fontWeight:800,color:"var(--green)"}}>{fmt(rev)}</td><td style={{fontWeight:700,color:cv>5?"var(--green)":cv>2?"var(--amber)":"var(--red)"}}>{cv}%</td><td>{p.boost_active?<span className="tag" style={{background:"var(--amber)",color:"#fff"}}>🚀</span>:"—"}</td><td><span style={{color:"var(--amber)"}}>★</span> {p.rating}</td></tr>;})}</tbody></table></div>
        <div className="grid-3"><Stat label="Total vues" value={properties.reduce((s,p)=>s+(p.total_views||0),0)} color="var(--blue)"/><Stat label="Réservations" value={bookings.filter(b=>b.status==="confirmed").length} color="var(--green)"/><Stat label="Revenu total" value={fmt(bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+b.total,0))} color="var(--purple)"/></div>
      </div>}

      {/* Site Report */}
      {page==="siteReport"&&<div><h1 className="page-title" style={{marginBottom:8}}>📉 Évolution du site</h1><p className="page-sub" style={{marginBottom:20}}>Croissance globale de Stays Place</p>
        <div className="stat-grid" style={{marginBottom:24}}><Stat label="Hébergements" value={properties.length} sub={`${properties.filter(p=>p.status==="active").length} actifs`}/><Stat label="Propriétaires" value={owners.length} sub={`${owners.filter(o=>o.subscription&&o.subscription!=="none").length} abonnés`} color="var(--purple)"/><Stat label="Villes" value={[...new Set(properties.map(p=>p.city))].length} color="var(--blue)"/><Stat label="Réservations" value={bookings.length} sub={`${bookings.filter(b=>b.status==="confirmed").length} confirmées`} color="var(--green)"/></div>
        <div className="grid-2" style={{marginBottom:24}}>
          <div className="card"><h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>💰 Revenus</h3>{[{l:"Abonnements/mois",v:fmt(totalSub),c:"var(--green)"},{l:"Boosts actifs",v:fmt(boostRevenue),c:"var(--amber)"},{l:"Réservations confirmées",v:fmt(bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+b.total,0)),c:"var(--blue)"}].map((r,i)=><div key={i} className="flex-between" style={{padding:"10px 0",borderBottom:"1px solid #f8fafc"}}><span style={{color:"var(--muted)"}}>{r.l}</span><span style={{fontWeight:800,color:r.c}}>{r.v}</span></div>)}<div className="flex-between" style={{padding:"12px",background:"#f8fafc",borderRadius:10,marginTop:10}}><span style={{fontWeight:700}}>Total/mois</span><span style={{fontWeight:800,color:"var(--purple)",fontSize:18}}>{fmt(totalSub+boostRevenue)}</span></div></div>
          <div className="card"><h3 style={{fontSize:16,fontWeight:700,marginBottom:14}}>📊 Métriques</h3>{[{l:"Total vues",v:properties.reduce((s,p)=>s+(p.total_views||0),0),c:"var(--blue)"},{l:"Total clics",v:properties.reduce((s,p)=>s+(p.total_clicks||0),0),c:"var(--purple)"},{l:"Biens sponsorisés",v:properties.filter(p=>p.sponsored).length,c:"var(--amber)"},{l:"Taux conversion",v:(properties.reduce((s,p)=>s+(p.total_views||0),0)>0?((bookings.filter(b=>b.status==="confirmed").length/properties.reduce((s,p)=>s+(p.total_views||0),0))*100).toFixed(2):"0")+"%",c:"var(--green)"}].map((r,i)=><div key={i} className="flex-between" style={{padding:"10px 0",borderBottom:"1px solid #f8fafc"}}><span style={{color:"var(--muted)"}}>{r.l}</span><span style={{fontWeight:800,color:r.c}}>{r.v}</span></div>)}</div>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>🏙️ Par ville</h2>
        <div className="card" style={{padding:0,overflow:"auto",marginBottom:24}}><table className="table"><thead><tr><th>Ville</th><th>Hébergements</th><th>Propriétaires</th><th>Vues</th><th>Réservations</th></tr></thead><tbody>{[...new Set(properties.map(p=>p.city))].map(city=>{const cp=properties.filter(p=>p.city===city);return<tr key={city}><td style={{fontWeight:700}}>{city}</td><td>{cp.length}</td><td>{[...new Set(cp.map(p=>p.owner_id).filter(Boolean))].length}</td><td style={{fontWeight:700,color:"var(--blue)"}}>{cp.reduce((s,p)=>s+(p.total_views||0),0)}</td><td style={{fontWeight:700,color:"var(--green)"}}>{bookings.filter(b=>cp.some(p=>p.id===b.property_id)&&b.status==="confirmed").length}</td></tr>;})}</tbody></table></div>
        <h2 style={{fontSize:16,fontWeight:700,marginBottom:14}}>📋 Abonnements</h2>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{plans.map(pl=>{const c=owners.filter(o=>o.subscription===pl.id).length;return<div key={pl.id} className="card" style={{flex:"1 1 180px",borderTop:`4px solid ${pl.color}`}}><div style={{fontSize:15,fontWeight:800,color:pl.color}}>{pl.name}</div><div style={{fontSize:28,fontWeight:800,marginTop:8}}>{c}</div><div style={{fontSize:12,color:"var(--light)"}}>proprio{c>1?"s":""} • {fmt(pl.price*c)}/mois</div></div>;})}</div>
      </div>}

      {/* Bookings */}
      {page==="bookings"&&<div><div className="flex-between" style={{marginBottom:20,flexWrap:"wrap",gap:12}}><h1 className="page-title">Réservations</h1><div className="flex-gap">{["day","week","month","all"].map(v=><button key={v} className={`btn-secondary btn-sm`} onClick={()=>setPer(v)} style={{background:period===v?"var(--side)":"",color:period===v?"#fff":"",borderColor:period===v?"var(--side)":""}}>{({day:"Auj.",week:"7j",month:"30j",all:"Tout"})[v]}</button>)}</div></div>
        <div className="stat-grid" style={{marginBottom:20}}><Stat label="Confirmées" value={confirmed.length} color="var(--green)"/><Stat label="En attente" value={perBook.filter(b=>b.status==="pending").length} color="var(--amber)"/><Stat label="Revenu" value={fmt(confirmed.reduce((s,b)=>s+b.total,0))} color="var(--blue)"/></div>
        <div className="card" style={{padding:0,overflow:"auto"}}><table className="table"><thead><tr><th>Client</th><th>Dates</th><th>Montant</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{perBook.map(b=><tr key={b.id}><td><div style={{fontWeight:600}}>{b.guest_name}</div><div style={{fontSize:11,color:"var(--light)"}}>{b.guest_phone}</div></td><td>{fmtD(b.check_in)} → {fmtD(b.check_out)}</td><td style={{fontWeight:700}}>{fmt(b.total)}</td><td><Badge s={b.status}/></td><td><div className="flex-gap">{b.status==="pending"&&<><button className="btn-icon" onClick={async()=>{await sbPatch("bookings",b.id,{status:"confirmed"});setBookings(bs=>bs.map(x=>x.id===b.id?{...x,status:"confirmed"}:x));}}>✅</button><button className="btn-icon" onClick={async()=>{await sbPatch("bookings",b.id,{status:"cancelled"});setBookings(bs=>bs.map(x=>x.id===b.id?{...x,status:"cancelled"}:x));}}>❌</button></>}<button className="btn-icon btn-icon-danger" onClick={()=>{setDC(b);setDT("book");}}>🗑️</button></div></td></tr>)}</tbody></table>{perBook.length===0&&<div style={{textAlign:"center",padding:40,color:"var(--light)"}}>Aucune réservation</div>}</div>
      </div>}

      {/* AI */}
      {page==="ai"&&<div><h1 className="page-title" style={{marginBottom:8}}>🤖 Générateur IA</h1><p className="page-sub" style={{marginBottom:20}}>Posts attractifs pour réseaux sociaux</p>
        <div className="grid-2"><div className="card"><h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Choisir un hébergement</h3>{properties.filter(p=>p.status==="active").map(p=><div key={p.id} onClick={()=>genAI(p)} className="boost-card" style={{marginBottom:6,border:aiProp?.id===p.id?"2px solid var(--accent)":"",cursor:"pointer"}}><div className="flex-gap">{p.image&&<img src={p.image} alt="" style={{width:40,height:30,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"var(--light)"}}>{p.city}</div></div></div><span style={{fontSize:20}}>🤖</span></div>)}</div>
        <div className="card"><h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Texte généré</h3>
          {aiLoading&&<div style={{textAlign:"center",padding:40,color:"var(--light)"}}><div style={{fontSize:32,marginBottom:8}}>🤖</div>Génération...</div>}
          {!aiLoading&&!aiResult&&<div style={{textAlign:"center",padding:40,color:"var(--light)",fontSize:13}}>Cliquez sur un hébergement</div>}
          {aiResult&&<div>
            <div style={{marginBottom:16}}><label className="label">📱 WhatsApp / Story</label><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.short}</div><button className="btn-secondary btn-sm" style={{marginTop:6}} onClick={()=>navigator.clipboard?.writeText(aiResult.short)}>📋 Copier</button></div>
            <div style={{marginBottom:16}}><label className="label">📝 Facebook / Instagram</label><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.long}</div><button className="btn-secondary btn-sm" style={{marginTop:6}} onClick={()=>navigator.clipboard?.writeText(aiResult.long)}>📋 Copier</button></div>
            {aiResult.hashtags&&<div><label className="label"># Hashtags</label><div style={{background:"#f0f9ff",borderRadius:10,padding:14,fontSize:13,color:"var(--blue)"}}>{aiResult.hashtags}</div><button className="btn-secondary btn-sm" style={{marginTop:6}} onClick={()=>navigator.clipboard?.writeText(aiResult.hashtags)}>📋 Copier</button></div>}
          </div>}
        </div></div>
      </div>}

      {/* Subscriptions */}
      {page==="subscriptions"&&<div><h1 className="page-title" style={{marginBottom:20}}>💰 Monétisation</h1>
        <div className="stat-grid" style={{marginBottom:28}}><Stat label="Abo mensuel" value={fmt(totalSub)} color="var(--green)"/><Stat label="Boosts" value={fmt(boostRevenue)} color="var(--amber)"/><Stat label="Total" value={fmt(totalSub+boostRevenue)} color="var(--purple)"/></div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>{plans.map(plan=>{const isEd=editingPlan===plan.id;const oc=owners.filter(o=>o.subscription===plan.id).length;return<div key={plan.id} className="card" style={{flex:"1 1 220px",borderTop:`4px solid ${plan.color}`,borderColor:isEd?plan.color:""}}><div className="flex-between"><div style={{fontSize:18,fontWeight:800,color:plan.color}}>{plan.name}</div><button className={isEd?"btn-primary btn-sm":"btn-secondary btn-sm"} onClick={async()=>{if(isEd){await sbPatchW("subscription_plans",`id=eq.${plan.id}`,{price:plan.price,max_properties:plan.max_properties,features:plan.features});setEditPlan(null);if(online)reload();}else setEditPlan(plan.id);}}>{isEd?"Sauver":"Modifier"}</button></div>
          {isEd?<div style={{marginTop:12}}><div style={{marginBottom:8}}><label className="label">Prix/mois</label><input className="input" type="number" value={plan.price} onChange={e=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,price:Number(e.target.value)}:p))}/></div><div style={{marginBottom:8}}><label className="label">Max biens</label><input className="input" type="number" value={plan.max_properties} onChange={e=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,max_properties:Number(e.target.value)}:p))}/></div><label className="label">Fonctionnalités</label>{plan.features.map((feat,fi)=><div key={fi} className="flex-gap" style={{marginBottom:6}}><input className="input" value={feat} onChange={e=>{const nf=[...plan.features];nf[fi]=e.target.value;setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:nf}:p));}} style={{flex:1,fontSize:12}}/><button className="btn-icon btn-icon-danger" onClick={()=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:p.features.filter((_,i)=>i!==fi)}:p))}>×</button></div>)}<button className="btn-secondary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:[...p.features,""]}:p))}>+ Ajouter</button></div>
          :<div><div style={{fontSize:26,fontWeight:800,marginTop:8}}>{fmt(plan.price)}<span style={{fontSize:13,color:"var(--light)"}}>/mois</span></div><div style={{fontSize:12,color:"var(--light)"}}>{oc} proprio{oc>1?"s":""}</div><div style={{borderTop:"1px solid var(--border)",marginTop:10,paddingTop:10}}>{plan.features.map((f,i)=><div key={i} style={{fontSize:12,marginBottom:4}}>✓ {f}</div>)}</div></div>}
        </div>;})}</div>
      </div>}

      {/* Settings */}
      {page==="settings"&&<div><h1 className="page-title" style={{marginBottom:20}}>⚙️ Paramètres</h1><div className="card" style={{maxWidth:500}}>{[{k:"phone",l:"Téléphone"},{k:"email",l:"Email"},{k:"whatsapp",l:"WhatsApp"},{k:"address",l:"Adresse"},{k:"tagline",l:"Slogan"}].map(({k,l})=><div key={k} style={{marginBottom:14}}><label className="label">{l}</label><input className="input" value={settings[k]||""} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))}/></div>)}<button className="btn-primary" onClick={async()=>{setSS(true);for(const[k,v] of Object.entries(settings)){await sbPatchW("site_settings",`key=eq.${k}`,{value:v});}setSS(false);}} disabled={savingS}>{savingS?"...":"Sauvegarder"}</button></div></div>}
    </main>

    {showForm&&<PropForm prop={editProp} owners={owners} onSave={()=>{setSF(false);setEP(null);if(online)reload();}} onClose={()=>{setSF(false);setEP(null);}}/>}

    {/* Boost Modal */}
    {boostProp&&<div className="modal-overlay" onClick={()=>setBoostProp(null)}><div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
      <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>🚀 Booster « {boostProp.name} »</h2>
      <p style={{color:"var(--muted)",fontSize:13,marginBottom:16}}>Choisissez le type de boost</p>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>{boostTypes.map(bt=><div key={bt.id} className={`boost-card${selBoostType===bt.id?" selected":""}`} onClick={()=>setSelBT(bt.id)} style={{borderColor:selBoostType===bt.id?bt.color:"",background:selBoostType===bt.id?`${bt.color}08`:""}}>
        <div><div style={{fontSize:14,fontWeight:700,color:selBoostType===bt.id?bt.color:"var(--text)"}}>{bt.name}</div><div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{bt.description} • {bt.weeks} sem.</div><div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>{(bt.features||[]).map((f,i)=><span key={i} style={{fontSize:10,background:"#f8fafc",padding:"2px 8px",borderRadius:6,color:"var(--muted)"}}>{f}</span>)}</div></div>
        <div style={{fontSize:18,fontWeight:800,color:bt.color,whiteSpace:"nowrap"}}>{fmt(bt.price)}</div>
      </div>)}</div>
      <div className="flex-gap" style={{justifyContent:"flex-end"}}><button className="btn-secondary" onClick={()=>setBoostProp(null)}>Annuler</button><button className="btn-primary" onClick={()=>activateBoost(boostProp)} disabled={!selBoostType}>🚀 Activer</button></div>
    </div></div>}

    {/* AI Modal */}
    {aiProp&&page!=="ai"&&<div className="modal-overlay" onClick={()=>{setAiProp(null);setAiResult(null);}}><div className="modal" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontSize:18,fontWeight:800,marginBottom:16}}>🤖 {aiProp.name}</h3>
      {aiLoading&&<div style={{textAlign:"center",padding:40,color:"var(--light)"}}>Génération...</div>}
      {aiResult&&<div>
        <div style={{marginBottom:16}}><label className="label">📱 WhatsApp</label><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.short}</div><button className="btn-secondary btn-sm" style={{marginTop:6}} onClick={()=>navigator.clipboard?.writeText(aiResult.short)}>📋 Copier</button></div>
        <div style={{marginBottom:16}}><label className="label">📝 Facebook</label><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.long}</div><button className="btn-secondary btn-sm" style={{marginTop:6}} onClick={()=>navigator.clipboard?.writeText(aiResult.long)}>📋 Copier</button></div>
        {aiResult.hashtags&&<div style={{background:"#f0f9ff",borderRadius:10,padding:14,fontSize:13,color:"var(--blue)"}}>{aiResult.hashtags}</div>}
      </div>}
      <button className="btn-secondary" style={{width:"100%",justifyContent:"center",marginTop:16}} onClick={()=>{setAiProp(null);setAiResult(null);}}>Fermer</button>
    </div></div>}

    {/* Delete */}
    {delConfirm&&<div className="modal-overlay" onClick={()=>setDC(null)}><div className="modal" style={{maxWidth:380,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:36,marginBottom:16}}>🗑️</div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Supprimer ?</h3>
      <p style={{color:"var(--muted)",fontSize:13,marginBottom:20}}>{delType==="prop"?`« ${delConfirm.name} »`:delType==="owner"?`${delConfirm.name} et ses biens`:`Réservation de ${delConfirm.guest_name}`}</p>
      <div className="flex-gap" style={{justifyContent:"center"}}><button className="btn-secondary" onClick={()=>setDC(null)}>Annuler</button><button className="btn-primary" style={{background:"var(--red)"}} onClick={handleDel}>Supprimer</button></div>
    </div></div>}
  </div>;
}
