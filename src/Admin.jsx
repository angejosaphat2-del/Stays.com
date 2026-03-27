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

// AI text generator using Anthropic API
async function generateAIText(property) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        messages: [{ role: "user", content: `Tu es un expert en marketing immobilier en Côte d'Ivoire. Génère un post attractif pour les réseaux sociaux (Facebook/Instagram) pour cet hébergement. Inclus des emojis, des hashtags pertinents, et un appel à l'action. Le post doit donner envie de réserver.

Nom: ${property.name}
Type: ${property.type}
Ville: ${property.city}, ${property.quartier}
Prix: ${property.price} FCFA/nuit
Description: ${property.description}
Équipements: ${(property.amenities||[]).join(", ")}

Génère 2 versions:
1. Version courte (pour story/statut WhatsApp) - max 3 lignes
2. Version longue (pour post Facebook/Instagram) - max 8 lignes

Réponds en JSON: {"short":"...","long":"...","hashtags":"..."}
Ne mets pas de backticks markdown, juste le JSON.` }]
      })
    });
    const d = await r.json();
    const text = d.content?.find(c => c.type === "text")?.text || "";
    try { return JSON.parse(text.trim()); } catch { return { short: text.slice(0, 200), long: text, hashtags: "#StaysCom #CoteDIvoire" }; }
  } catch { return null; }
}

const CITIES=["Abidjan","San Pedro","Yamoussoukro","Bouaké","Grand-Bassam","Assinie"];
const PTYPES=["Résidence","Hôtel","Appartement","Villa"];
const DEMO_PROPS=[
  {id:"p1",name:"Résidence Le Palmier d'Or",type:"Résidence",quartier:"Cocody",city:"Abidjan",price:35000,rating:4.7,reviews:134,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop",images:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"],amenities:["Wi-Fi","Climatisation","Piscine"],description:"Résidence haut standing à Cocody",whatsapp:"+2250700000001",owner_id:"o1",total_views:340,total_clicks:89,boost_active:false},
  {id:"p2",name:"Hôtel Atlantic Beach",type:"Hôtel",quartier:"Bardot",city:"San Pedro",price:45000,rating:4.9,reviews:156,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop",images:[],amenities:["Wi-Fi","Piscine","Plage privée"],description:"Hôtel de luxe bord de mer",whatsapp:"+2250700000005",owner_id:"o2",total_views:520,total_clicks:145,boost_active:true,boost_end:"2026-04-05"},
  {id:"p3",name:"Villa Riviera Golf",type:"Villa",quartier:"Riviera Golf",city:"Abidjan",price:85000,rating:4.8,reviews:45,sponsored:true,status:"active",image:"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=300&h=200&fit=crop",images:[],amenities:["Piscine privée","Chef privé"],description:"Villa de luxe",whatsapp:"+2250700000004",owner_id:"o2",total_views:210,total_clicks:67,boost_active:false},
  {id:"p4",name:"Hôtel Président",type:"Hôtel",quartier:"Centre",city:"Yamoussoukro",price:40000,rating:4.6,reviews:98,sponsored:false,status:"active",image:"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&h=200&fit=crop",images:[],amenities:["Wi-Fi","Piscine"],description:"Hôtel de référence",whatsapp:"+2250700000009",owner_id:"o3",total_views:180,total_clicks:42,boost_active:false},
];
const DEMO_OWNERS=[{id:"o1",name:"Koné Ibrahim",email:"kone@email.com",phone:"+2250701111111",subscription:"premium"},{id:"o2",name:"Diallo Fatou",email:"diallo@email.com",phone:"+2250703333333",subscription:"enterprise"},{id:"o3",name:"Yao Kouadio",email:"yao@email.com",phone:"+2250705555555",subscription:"premium"}];
const DEMO_BOOKINGS=[{id:"b1",property_id:"p1",guest_name:"Jean Dupont",guest_phone:"+2250700111111",check_in:"2026-03-25",check_out:"2026-03-28",nights:3,total:105000,status:"confirmed",payment_method:"Orange Money",created_at:"2026-03-20"}];
const DEMO_PLANS=[{id:"basic",name:"Basic",price:10000,max_properties:1,features:["1 établissement","3 photos","WhatsApp"],color:"#64748b"},{id:"premium",name:"Premium",price:25000,max_properties:3,features:["3 établissements","Sponsorisé","Prioritaire"],color:"#FF6B00"},{id:"enterprise",name:"Enterprise",price:50000,max_properties:999,features:["Illimité","Page dédiée","Support 24/7"],color:"#7C3AED"}];

function fmt(p){return(p||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")+" F";}
function fmtD(d){if(!d)return"—";return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"});}
function inPer(d,p){if(p==="all")return true;const diff=(Date.now()-new Date(d).getTime())/86400000;return p==="day"?diff<1:p==="week"?diff<7:p==="month"?diff<30:diff<365;}

const iS={width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #e2e8f0",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
const lS={fontSize:11,fontWeight:700,color:"#64748b",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5};
const bP={background:"linear-gradient(135deg,#FF6B00,#FF8534)",color:"white",border:"none",padding:"10px 20px",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6};
const bS={background:"white",color:"#475569",border:"1px solid #e2e8f0",padding:"10px 20px",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6};

function Stat({label,value,sub,color="#FF6B00"}){return<div style={{background:"white",borderRadius:14,padding:"18px 20px",border:"1px solid #f1f5f9",flex:"1 1 170px",minWidth:150}}><div style={{fontSize:11,fontWeight:600,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.8}}>{label}</div><div style={{fontSize:24,fontWeight:800,color,marginTop:4}}>{value}</div>{sub&&<div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{sub}</div>}</div>;}
function TimePick({v,onChange}){return<div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:10,padding:3}}>{[{v:"day",l:"Auj."},{v:"week",l:"7j"},{v:"month",l:"30j"},{v:"all",l:"Tout"}].map(o=><button key={o.v} onClick={()=>onChange(o.v)} style={{padding:"6px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",background:v===o.v?"white":"transparent",color:v===o.v?"#1a1a2e":"#94a3b8"}}>{o.l}</button>)}</div>;}
function Badge({s}){const m={active:["#f0fdf4","#166534","#bbf7d0","Actif"],pending:["#fffbeb","#92400e","#fde68a","En attente"],inactive:["#fef2f2","#991b1b","#fecaca","Inactif"],confirmed:["#f0fdf4","#166534","#bbf7d0","Confirmé"],cancelled:["#fef2f2","#991b1b","#fecaca","Annulé"]};const x=m[s]||m.pending;return<span style={{background:x[0],color:x[1],border:`1px solid ${x[2]}`,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:6}}>{x[3]}</span>;}

// Login
function Login({onLogin}){const[e,sE]=useState("");const[p,sP]=useState("");const[err,sErr]=useState("");const[l,sL]=useState(false);const[m,sM]=useState("login");
  const sub=async()=>{
    if(!e||!p){sErr("Remplissez tous les champs");return;}sErr("");sL(true);
    if(m==="signup"){
      // Check admin whitelist - max 2 admins
      const admins=await sbGet("admin_whitelist","");
      if(admins&&Array.isArray(admins)&&admins.length>=2){sL(false);sErr("Maximum 2 administrateurs autorisés. Contactez le super admin.");return;}
      const res=await doSignUp(e,p);sL(false);
      if(res.ok){
        await sbPost("admin_whitelist",{email:e,role:"admin"});
        sErr("Compte créé ! Confirmez votre email puis connectez-vous.");sM("login");
      }else sErr(res.err);
    }else{
      // Check if email is in whitelist
      const admins=await sbGet("admin_whitelist",`email=eq.${encodeURIComponent(e)}`);
      if(!admins||!Array.isArray(admins)||admins.length===0){sL(false);sErr("Cet email n'est pas autorisé comme administrateur.");return;}
      const res=await doSignIn(e,p);sL(false);
      if(res.ok)onLogin(e);else sErr(res.err);
    }
  };
  return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a1a2e,#16213e)",fontFamily:"'DM Sans',sans-serif",padding:20}}>
    <div style={{background:"white",borderRadius:20,padding:"40px 36px",maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{textAlign:"center",marginBottom:28}}><div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#FF6B00,#FF8534)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:900,fontSize:26,margin:"0 auto 16px"}}>S</div><h1 style={{fontSize:24,fontWeight:800,margin:"0 0 4px"}}>Stays<span style={{color:"#FF6B00"}}>.com</span></h1><p style={{color:"#94a3b8",fontSize:14,margin:0}}>Administration</p></div>
      <div style={{marginBottom:16}}><label style={lS}>Email</label><input type="email" value={e} onChange={x=>sE(x.target.value)} onKeyDown={x=>x.key==="Enter"&&sub()} style={iS} placeholder="admin@stays.com"/></div>
      <div style={{marginBottom:20}}><label style={lS}>Mot de passe</label><input type="password" value={p} onChange={x=>sP(x.target.value)} onKeyDown={x=>x.key==="Enter"&&sub()} style={iS} placeholder="Min. 6 caractères"/></div>
      {err&&<div style={{background:err.includes("créé")?"#f0fdf4":"#fef2f2",color:err.includes("créé")?"#166534":"#991b1b",border:`1px solid ${err.includes("créé")?"#bbf7d0":"#fecaca"}`,padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16,fontWeight:600}}>{err}</div>}
      <button onClick={sub} disabled={l} style={{...bP,width:"100%",justifyContent:"center",padding:"14px",fontSize:16,opacity:l?0.6:1}}>{l?"...":(m==="login"?"Se connecter":"Créer le compte")}</button>
      <div style={{textAlign:"center",marginTop:16}}><button onClick={()=>{sM(m==="login"?"signup":"login");sErr("");}} style={{background:"none",border:"none",color:"#FF6B00",fontSize:13,fontWeight:600,cursor:"pointer"}}>{m==="login"?"Créer un compte admin":"Déjà un compte ? Se connecter"}</button></div>
    </div>
  </div>;
}

// Owner Form
function OwnerForm({owner,plans,onSave,onClose}){const[f,sF]=useState(owner||{name:"",email:"",phone:"",whatsapp:"",subscription:"none"});const[saving,sS]=useState(false);const set=(k,v)=>sF(p=>({...p,[k]:v}));
  return<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
    <div style={{gridColumn:"1/-1"}}><label style={lS}>Nom *</label><input value={f.name} onChange={e=>set("name",e.target.value)} style={iS}/></div>
    <div><label style={lS}>Téléphone *</label><input value={f.phone||""} onChange={e=>set("phone",e.target.value)} style={iS}/></div>
    <div><label style={lS}>WhatsApp</label><input value={f.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)} style={iS}/></div>
    <div style={{gridColumn:"1/-1"}}><label style={lS}>Email</label><input value={f.email||""} onChange={e=>set("email",e.target.value)} style={iS}/></div>
  </div>
  <div style={{marginBottom:16}}><label style={lS}>Plan</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[{id:"none",name:"Aucun",color:"#94a3b8"},...(plans||[])].map(pl=><button key={pl.id} onClick={()=>set("subscription",pl.id)} style={{flex:"1 1 90px",padding:"10px",borderRadius:10,cursor:"pointer",textAlign:"center",border:f.subscription===pl.id?`2px solid ${pl.color}`:"1px solid #e2e8f0",background:f.subscription===pl.id?`${pl.color}10`:"white"}}><div style={{fontSize:13,fontWeight:700,color:pl.color}}>{pl.name}</div></button>)}</div></div>
  <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button onClick={onClose} style={bS}>Annuler</button><button onClick={async()=>{if(!f.name||!f.phone){alert("Nom et téléphone obligatoires");return;}sS(true);await onSave({name:f.name,email:f.email||"",phone:f.phone,whatsapp:f.whatsapp||f.phone,subscription:f.subscription});sS(false);}} disabled={saving} style={{...bP,opacity:saving?0.5:1}}>{saving?"...":owner?"Enregistrer":"Créer"}</button></div></div>;
}

// Property Form
function PropForm({prop,owners,onSave,onClose}){
  const[f,sF]=useState(prop||{name:"",type:"Résidence",quartier:"",city:"Abidjan",price:"",description:"",whatsapp:"",amenities:[],owner_id:"",status:"pending",sponsored:false,images:[],image:""});
  const[nA,sNA]=useState("");const[nI,sNI]=useState("");const[saving,sS]=useState(false);
  const set=(k,v)=>sF(p=>({...p,[k]:v}));
  const save=async()=>{sS(true);const d={name:f.name,type:f.type,quartier:f.quartier,city:f.city,price:Number(f.price),description:f.description,whatsapp:f.whatsapp,amenities:f.amenities,owner_id:f.owner_id||null,status:f.status,sponsored:f.sponsored,images:f.images,image:f.image||f.images?.[0]||""};if(prop?.id)await sbPatch("properties",prop.id,d);else await sbPost("properties",d);sS(false);onSave();};
  return<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:16,maxWidth:620,width:"100%",maxHeight:"90vh",overflow:"auto",padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}><h2 style={{margin:0,fontSize:20,fontWeight:800}}>{prop?"Modifier":"Nouvel hébergement"}</h2><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20}}>✕</button></div>
      <div style={{marginBottom:12}}><label style={lS}>Propriétaire</label><select value={f.owner_id||""} onChange={e=>set("owner_id",e.target.value)} style={{...iS,cursor:"pointer"}}><option value="">— Choisir —</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div style={{gridColumn:"1/-1"}}><label style={lS}>Nom</label><input value={f.name} onChange={e=>set("name",e.target.value)} style={iS}/></div>
        <div><label style={lS}>Type</label><select value={f.type} onChange={e=>set("type",e.target.value)} style={{...iS,cursor:"pointer"}}>{PTYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label style={lS}>Ville</label><select value={f.city} onChange={e=>set("city",e.target.value)} style={{...iS,cursor:"pointer"}}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={lS}>Quartier</label><input value={f.quartier||""} onChange={e=>set("quartier",e.target.value)} style={iS}/></div>
        <div><label style={lS}>Prix/nuit</label><input type="number" value={f.price} onChange={e=>set("price",e.target.value)} style={iS}/></div>
        <div><label style={lS}>WhatsApp</label><input value={f.whatsapp||""} onChange={e=>set("whatsapp",e.target.value)} style={iS}/></div>
        <div><label style={lS}>Statut</label><select value={f.status} onChange={e=>set("status",e.target.value)} style={{...iS,cursor:"pointer"}}><option value="active">Actif</option><option value="pending">En attente</option><option value="inactive">Inactif</option></select></div>
      </div>
      <div style={{marginBottom:12}}><label style={lS}>Description</label><textarea value={f.description||""} onChange={e=>set("description",e.target.value)} rows={3} style={{...iS,resize:"vertical"}}/></div>
      <div style={{marginBottom:12}}><label style={lS}>Équipements</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>{(f.amenities||[]).map((a,i)=><span key={i} style={{background:"#f0fdf4",color:"#166534",fontSize:12,padding:"4px 10px",borderRadius:8,fontWeight:600,border:"1px solid #bbf7d0"}}>{a} <button onClick={()=>set("amenities",f.amenities.filter((_,x)=>x!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#dc2626",padding:0}}>×</button></span>)}</div><div style={{display:"flex",gap:8}}><input value={nA} onChange={e=>sNA(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nA.trim()){e.preventDefault();set("amenities",[...(f.amenities||[]),nA.trim()]);sNA("");}}} style={{...iS,flex:1}} placeholder="Wi-Fi, Piscine..."/><button onClick={()=>{if(nA.trim()){set("amenities",[...(f.amenities||[]),nA.trim()]);sNA("");}}} style={bS}>+</button></div></div>
      <div style={{marginBottom:16}}><label style={lS}>Photos</label><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>{(f.images||[]).map((img,i)=><div key={i} style={{position:"relative",width:80,height:60,borderRadius:8,overflow:"hidden",border:f.image===img?"2px solid #FF6B00":"1px solid #e2e8f0"}}><img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/><button onClick={()=>{const imgs=f.images.filter((_,x)=>x!==i);set("images",imgs);if(f.image===f.images[i])set("image",imgs[0]||"");}} style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.7)",color:"white",border:"none",borderRadius:"50%",width:18,height:18,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>)}<label style={{width:80,height:60,borderRadius:8,border:"2px dashed #cbd5e1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"#f8fafc",fontSize:10,color:"#FF6B00",fontWeight:700}}>+ PHOTO<input type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files||[]).forEach(file=>{const r=new FileReader();r.onload=ev=>{sF(prev=>({...prev,images:[...(prev.images||[]),ev.target.result],image:prev.image||ev.target.result}));};r.readAsDataURL(file);});e.target.value="";}}/></label></div><div style={{display:"flex",gap:8}}><input value={nI} onChange={e=>sNI(e.target.value)} style={{...iS,flex:1}} placeholder="Ou coller une URL..."/><button onClick={()=>{if(nI.trim()){const imgs=[...(f.images||[]),nI.trim()];set("images",imgs);if(!f.image)set("image",nI.trim());sNI("");}}} style={bS}>+</button></div></div>
      <div style={{background:"#f8fafc",borderRadius:12,padding:14,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:700}}>Sponsorisé</div></div><button onClick={()=>set("sponsored",!f.sponsored)} style={{padding:"8px 16px",borderRadius:10,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:f.sponsored?"linear-gradient(135deg,#F59E0B,#D97706)":"#e2e8f0",color:f.sponsored?"white":"#64748b"}}>{f.sponsored?"ON":"OFF"}</button></div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><button onClick={onClose} style={bS}>Annuler</button><button onClick={save} disabled={saving} style={{...bP,opacity:saving?0.5:1}}>{saving?"...":prop?"Enregistrer":"Créer"}</button></div>
    </div>
  </div>;
}

// MAIN
export default function Admin(){
  const[authed,setAuth]=useState(false);const[userEmail,setUE]=useState("");
  const[page,setPage]=useState("dashboard");
  const[properties,setProps]=useState(DEMO_PROPS);const[owners,setOwners]=useState(DEMO_OWNERS);
  const[bookings,setBookings]=useState(DEMO_BOOKINGS);const[plans,setPlans]=useState(DEMO_PLANS);
  const[boosts,setBoosts]=useState([]);
  const[settings,setSettings]=useState({phone:"+225 07 00 00 00 00",email:"contact@stays.com",whatsapp:"+22507000000",address:"Abidjan, Côte d'Ivoire",tagline:"N°1 en CI"});
  const[online,setOnline]=useState(false);
  const[showForm,setSF]=useState(false);const[editProp,setEP]=useState(null);
  const[showOF,setSOF]=useState(false);const[editOwner,setEO]=useState(null);
  const[search,setSrch]=useState("");const[fCity,setFC]=useState("Toutes");const[fStatus,setFS]=useState("Tous");
  const[period,setPer]=useState("month");const[delConfirm,setDC]=useState(null);const[delType,setDT]=useState("");
  const[editingPlan,setEditPlan]=useState(null);const[savingS,setSS]=useState(false);
  // Boost form
  const[boostProp,setBoostProp]=useState(null);const[boostWeeks,setBoostWeeks]=useState(1);
  // AI generator
  const[aiProp,setAiProp]=useState(null);const[aiResult,setAiResult]=useState(null);const[aiLoading,setAiLoading]=useState(false);

  const reload=useCallback(async()=>{
    const p=await sbGet("properties","order=sponsored.desc,rating.desc");
    if(p&&Array.isArray(p)){setProps(p);setOnline(true);
      const o=await sbGet("owners","order=name.asc");if(o)setOwners(o);
      const b=await sbGet("bookings","order=created_at.desc");if(b)setBookings(b);
      const pl=await sbGet("subscription_plans","order=price.asc");if(pl)setPlans(pl);
      const bo=await sbGet("boosts","order=created_at.desc");if(bo)setBoosts(bo);
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
  const topByClicks=[...properties].sort((a,b)=>(b.total_clicks||0)-(a.total_clicks||0));

  const handleDel=async()=>{if(!delConfirm)return;if(delType==="prop"){await sbDel("properties",delConfirm.id);setProps(ps=>ps.filter(x=>x.id!==delConfirm.id));}if(delType==="book"){await sbDel("bookings",delConfirm.id);setBookings(bs=>bs.filter(x=>x.id!==delConfirm.id));}if(delType==="owner"){await sbDel("owners",delConfirm.id);setOwners(os=>os.filter(x=>x.id!==delConfirm.id));}setDC(null);if(online)reload();};
  const activateBoost=async(prop)=>{
    const startDate=new Date().toISOString().split("T")[0];
    const endDate=new Date(Date.now()+boostWeeks*7*86400000).toISOString().split("T")[0];
    const price=10000*boostWeeks;
    await sbPost("boosts",{property_id:prop.id,owner_id:prop.owner_id,start_date:startDate,end_date:endDate,weeks:boostWeeks,price_paid:price,status:"active",payment_method:"Orange Money"});
    await sbPatch("properties",prop.id,{sponsored:true,boost_active:true,boost_end:endDate});
    setBoostProp(null);setBoostWeeks(1);if(online)reload();else setProps(ps=>ps.map(x=>x.id===prop.id?{...x,sponsored:true,boost_active:true,boost_end:endDate}:x));
  };

  const genAI=async(prop)=>{setAiProp(prop);setAiLoading(true);setAiResult(null);const r=await generateAIText(prop);setAiResult(r);setAiLoading(false);};

  if(!authed)return<Login onLogin={handleLogin}/>;

  const nav=[{id:"dashboard",l:"Tableau de bord",i:"📊"},{id:"properties",l:"Hébergements",i:"🏨"},{id:"owners",l:"Propriétaires",i:"👥"},{id:"boosts",l:"Boosts",i:"🚀"},{id:"tops",l:"Tops & Stats",i:"🏆"},{id:"reports",l:"Rapports",i:"📈"},{id:"bookings",l:"Réservations",i:"📅"},{id:"ai",l:"Générateur IA",i:"🤖"},{id:"subscriptions",l:"Monétisation",i:"💰"},{id:"settings",l:"Paramètres",i:"⚙️"}];

  return<div style={{fontFamily:"'DM Sans','Segoe UI',sans-serif",display:"flex",minHeight:"100vh",background:"#f8fafc"}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <aside style={{width:220,background:"#1a1a2e",color:"white",padding:"24px 14px",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:28,padding:"0 8px"}}><div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#FF6B00,#FF8534)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16}}>S</div><div><div style={{fontSize:15,fontWeight:800}}>Stays<span style={{color:"#FF6B00"}}>.com</span></div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Admin {online?"• En ligne":"• Démo"}</div></div></div>
      <nav style={{flex:1}}>{nav.map(item=><button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",borderRadius:10,border:"none",background:page===item.id?"rgba(255,107,0,0.15)":"transparent",color:page===item.id?"#FF8534":"rgba(255,255,255,0.5)",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:2,textAlign:"left"}}><span style={{fontSize:15}}>{item.i}</span>{item.l}</button>)}</nav>
      <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:12}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",padding:"0 12px",marginBottom:8}}>{userEmail}</div>
        <button onClick={reload} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",textAlign:"left"}}>🔄 Rafraîchir</button>
        <button onClick={()=>{TOKEN=null;setAuth(false);}} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",borderRadius:8,border:"none",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:12,cursor:"pointer",textAlign:"left"}}>🚪 Déconnexion</button>
      </div>
    </aside>

    <main style={{flex:1,padding:"24px 28px",overflow:"auto",maxHeight:"100vh"}}>

      {/* Dashboard */}
      {page==="dashboard"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><div><h1 style={{fontSize:22,fontWeight:800,margin:0}}>Tableau de bord</h1></div><TimePick v={period} onChange={setPer}/></div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>
          <Stat label="Revenus abo" value={fmt(totalSub)+"/mois"} color="#0C6E3D"/>
          <Stat label="Revenus boosts" value={fmt(boostRevenue)} color="#F59E0B"/>
          <Stat label="Hébergements" value={properties.length} sub={`${properties.filter(p=>p.status==="active").length} actifs`}/>
          <Stat label="Réservations" value={confirmed.length} sub={fmt(confirmed.reduce((s,b)=>s+b.total,0))} color="#0284c7"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:"white",borderRadius:14,padding:18,border:"1px solid #f1f5f9"}}><div style={{fontSize:14,fontWeight:700,marginBottom:14}}>🏆 Top 5 — plus vus</div>{topByViews.slice(0,5).map((p,i)=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f8fafc"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:800,color:i===0?"#F59E0B":"#94a3b8",width:20}}>{i+1}.</span><span style={{fontSize:13,fontWeight:600}}>{p.name}</span></div><span style={{fontSize:13,fontWeight:700,color:"#0284c7"}}>{p.total_views||0} vues</span></div>)}</div>
          <div style={{background:"white",borderRadius:14,padding:18,border:"1px solid #f1f5f9"}}><div style={{fontSize:14,fontWeight:700,marginBottom:14}}>📅 Dernières réservations</div>{perBook.slice(0,5).map(b=><div key={b.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f8fafc"}}><div><div style={{fontSize:13,fontWeight:600}}>{b.guest_name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{fmtD(b.check_in)}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700}}>{fmt(b.total)}</div><Badge s={b.status}/></div></div>)}</div>
        </div>
      </div>}

      {/* Properties */}
      {page==="properties"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800,margin:0}}>Hébergements ({properties.length})</h1><button onClick={()=>{setEP(null);setSF(true);}} style={bP}>+ Ajouter</button></div>
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}><input value={search} onChange={e=>setSrch(e.target.value)} placeholder="🔍 Rechercher..." style={{...iS,maxWidth:280}}/><select value={fCity} onChange={e=>setFC(e.target.value)} style={{...iS,width:"auto"}}><option>Toutes</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select><select value={fStatus} onChange={e=>setFS(e.target.value)} style={{...iS,width:"auto"}}><option value="Tous">Tous</option><option value="active">Actif</option><option value="pending">En attente</option></select></div>
        <div style={{background:"white",borderRadius:14,border:"1px solid #f1f5f9",overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:700}}><thead><tr style={{background:"#f8fafc",textAlign:"left"}}><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Hébergement</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Ville</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Prix</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Statut</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Boost</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Vues</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Actions</th></tr></thead>
        <tbody>{filteredP.map(p=><tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}}>
          <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:10}}>{p.image&&<img src={p.image} alt="" style={{width:44,height:32,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{p.type}</div></div></div></td>
          <td style={{padding:"10px 14px"}}>{p.city}</td><td style={{padding:"10px 14px",fontWeight:700}}>{fmt(p.price)}</td>
          <td style={{padding:"10px 14px"}}><Badge s={p.status}/></td>
          <td style={{padding:"10px 14px"}}>{p.boost_active?<span style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:12}}>🚀 BOOSTÉ</span>:<button onClick={()=>setBoostProp(p)} style={{padding:"4px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:11,fontWeight:600,cursor:"pointer",background:"white",color:"#475569"}}>Booster</button>}</td>
          <td style={{padding:"10px 14px",fontSize:12,color:"#64748b"}}>{p.total_views||0} vues</td>
          <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:4}}>
            <button onClick={()=>{setEP(p);setSF(true);}} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>✏️</button>
            <button onClick={()=>genAI(p)} style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:6,padding:"5px 8px",cursor:"pointer"}} title="Générer texte IA">🤖</button>
            <button onClick={()=>{setDC(p);setDT("prop");}} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>🗑️</button>
          </div></td>
        </tr>)}</tbody></table></div>
      </div>}

      {/* Owners */}
      {page==="owners"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h1 style={{fontSize:22,fontWeight:800,margin:0}}>Propriétaires ({owners.length})</h1><button onClick={()=>{setEO(null);setSOF(true);}} style={bP}>+ Ajouter</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>{ownersWC.map(o=><div key={o.id} style={{background:"white",borderRadius:14,padding:18,border:"1px solid #f1f5f9"}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:15,fontWeight:700}}>{o.name}</div><div style={{fontSize:12,color:"#64748b"}}>{o.email} • {o.phone}</div></div><div style={{display:"flex",gap:4}}><button onClick={()=>{setEO(o);setSOF(true);}} style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>✏️</button><button onClick={()=>{setDC(o);setDT("owner");}} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>🗑️</button></div></div><div style={{display:"flex",gap:12,margin:"12px 0"}}><div style={{textAlign:"center",flex:1,background:"#f8fafc",borderRadius:10,padding:10}}><div style={{fontSize:22,fontWeight:800}}>{o.propertyCount}</div><div style={{fontSize:11,color:"#94a3b8"}}>Bien{o.propertyCount>1?"s":""}</div></div><div style={{textAlign:"center",flex:1,background:"#f8fafc",borderRadius:10,padding:10}}><div style={{fontSize:14,fontWeight:700,color:plans.find(p=>p.id===o.subscription)?.color||"#94a3b8"}}>{plans.find(p=>p.id===o.subscription)?.name||"Aucun"}</div><div style={{fontSize:11,color:"#94a3b8"}}>Plan</div></div></div>{o.props.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f8fafc",fontSize:12}}><span style={{fontWeight:600}}>{p.name}</span><Badge s={p.status}/></div>)}</div>)}</div>
        {showOF&&<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setSOF(false)}><div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:16,maxWidth:480,width:"100%",padding:28}}><h2 style={{margin:"0 0 20px",fontSize:20,fontWeight:800}}>{editOwner?"Modifier":"Nouveau propriétaire"}</h2><OwnerForm owner={editOwner} plans={plans} onSave={async(d)=>{if(editOwner?.id)await sbPatch("owners",editOwner.id,d);else await sbPost("owners",d);setSOF(false);setEO(null);if(online)reload();else{if(editOwner?.id)setOwners(os=>os.map(o=>o.id===editOwner.id?{...o,...d}:o));else setOwners(os=>[...os,{id:"new_"+Date.now(),...d}]);}}} onClose={()=>{setSOF(false);setEO(null);}}/></div></div>}
      </div>}

      {/* BOOSTS */}
      {page==="boosts"&&<div>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 20px"}}>🚀 Système de Boost</h1>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>
          <Stat label="Boosts actifs" value={boosts.filter(b=>b.status==="active").length} color="#F59E0B"/>
          <Stat label="Revenus boosts" value={fmt(boostRevenue)} color="#0C6E3D"/>
          <Stat label="Prix / semaine" value="10 000 F" color="#FF6B00"/>
        </div>
        <div style={{background:"#fffbeb",borderRadius:14,padding:20,border:"1px solid #fde68a",marginBottom:24}}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>💡 Comment ça marche</div>
          <div style={{fontSize:13,color:"#92400e",lineHeight:1.7}}>Un propriétaire paie <strong>10 000 F/semaine</strong> pour booster son annonce. L'annonce apparaît en haut du site avec le badge "SPONSORISÉ" et dans le carrousel publicitaire. Réduction : 3 semaines à 25 000 F au lieu de 30 000 F.</div>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 14px"}}>Hébergements boostables</h2>
        <div style={{background:"white",borderRadius:14,border:"1px solid #f1f5f9",overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:"#f8fafc",textAlign:"left"}}><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Hébergement</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Proprio</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Statut boost</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Expire</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Action</th></tr></thead>
          <tbody>{properties.filter(p=>p.status==="active").map(p=>{const ow=owners.find(o=>o.id===p.owner_id);return<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}}><td style={{padding:"10px 14px",fontWeight:600}}>{p.name}</td><td style={{padding:"10px 14px",color:"#475569"}}>{ow?.name||"—"}</td><td style={{padding:"10px 14px"}}>{p.boost_active?<span style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:12}}>🚀 ACTIF</span>:<span style={{color:"#94a3b8",fontSize:12}}>Inactif</span>}</td><td style={{padding:"10px 14px",fontSize:12}}>{p.boost_end?fmtD(p.boost_end):"—"}</td><td style={{padding:"10px 14px"}}>{p.boost_active?<button onClick={async()=>{await sbPatch("properties",p.id,{boost_active:false,boost_end:null,sponsored:false});if(online)reload();else setProps(ps=>ps.map(x=>x.id===p.id?{...x,boost_active:false,boost_end:null,sponsored:false}:x));}} style={{...bS,padding:"6px 14px",fontSize:12,color:"#dc2626"}}>Désactiver</button>:<button onClick={()=>setBoostProp(p)} style={{...bP,padding:"6px 14px",fontSize:12}}>Activer le boost</button>}</td></tr>;})}</tbody></table>
        </div>
      </div>}

      {/* TOPS & STATS */}
      {page==="tops"&&<div>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 20px"}}>🏆 Tops & Statistiques</h1>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
          <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:14}}>🥇 Top annonce de la semaine</div>
            {topByViews[0]&&<div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",borderRadius:12,padding:16,border:"1px solid #FDE68A"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>{topByViews[0].image&&<img src={topByViews[0].image} alt="" style={{width:60,height:44,borderRadius:8,objectFit:"cover"}}/>}<div><div style={{fontSize:16,fontWeight:800}}>{topByViews[0].name}</div><div style={{fontSize:12,color:"#92400e"}}>{topByViews[0].city} • {topByViews[0].total_views||0} vues • {topByViews[0].total_clicks||0} clics</div></div></div>
            </div>}
          </div>
          <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:14}}>📊 Statistiques globales</div>
            <div style={{display:"flex",gap:12}}><Stat label="Total vues" value={properties.reduce((s,p)=>s+(p.total_views||0),0)} color="#0284c7"/><Stat label="Total clics" value={properties.reduce((s,p)=>s+(p.total_clicks||0),0)} color="#7C3AED"/></div>
          </div>
        </div>
        <h2 style={{fontSize:16,fontWeight:700,margin:"0 0 14px"}}>🏅 Top 5 biens de la semaine</h2>
        <div style={{background:"white",borderRadius:14,border:"1px solid #f1f5f9",overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:"#f8fafc",textAlign:"left"}}><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Rang</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Hébergement</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Ville</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Vues</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Clics</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Score</th></tr></thead>
          <tbody>{topByViews.slice(0,5).map((p,i)=>{const score=(p.total_views||0)+(p.total_clicks||0)*3;return<tr key={p.id} style={{borderTop:"1px solid #f1f5f9",background:i===0?"#FFFBEB":"transparent"}}><td style={{padding:"10px 14px"}}><span style={{fontSize:16,fontWeight:800,color:["#F59E0B","#94a3b8","#CD7F32","#64748b","#64748b"][i]}}>{["🥇","🥈","🥉","4.","5."][i]}</span></td><td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}>{p.image&&<img src={p.image} alt="" style={{width:36,height:26,borderRadius:4,objectFit:"cover"}}/>}<span style={{fontWeight:600}}>{p.name}</span></div></td><td style={{padding:"10px 14px"}}>{p.city}</td><td style={{padding:"10px 14px",fontWeight:700,color:"#0284c7"}}>{p.total_views||0}</td><td style={{padding:"10px 14px",fontWeight:700,color:"#7C3AED"}}>{p.total_clicks||0}</td><td style={{padding:"10px 14px",fontWeight:800,color:"#F59E0B"}}>{score}</td></tr>;})}</tbody></table>
        </div>
      </div>}

      {/* Bookings */}
      {page==="bookings"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}><h1 style={{fontSize:22,fontWeight:800,margin:0}}>Réservations</h1><TimePick v={period} onChange={setPer}/></div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:20}}><Stat label="Confirmées" value={confirmed.length} color="#0C6E3D"/><Stat label="En attente" value={perBook.filter(b=>b.status==="pending").length} color="#F59E0B"/><Stat label="Revenu" value={fmt(confirmed.reduce((s,b)=>s+b.total,0))} color="#0284c7"/></div>
        <div style={{background:"white",borderRadius:14,border:"1px solid #f1f5f9",overflow:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}><thead><tr style={{background:"#f8fafc",textAlign:"left"}}><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Client</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Dates</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Montant</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Statut</th><th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Actions</th></tr></thead><tbody>{perBook.map(b=><tr key={b.id} style={{borderTop:"1px solid #f1f5f9"}}><td style={{padding:"10px 14px"}}><div style={{fontWeight:600}}>{b.guest_name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{b.guest_phone}</div></td><td style={{padding:"10px 14px"}}>{fmtD(b.check_in)} → {fmtD(b.check_out)}</td><td style={{padding:"10px 14px",fontWeight:700}}>{fmt(b.total)}</td><td style={{padding:"10px 14px"}}><Badge s={b.status}/></td><td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:4}}>{b.status==="pending"&&<><button onClick={async()=>{await sbPatch("bookings",b.id,{status:"confirmed"});setBookings(bs=>bs.map(x=>x.id===b.id?{...x,status:"confirmed"}:x));}} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>✅</button><button onClick={async()=>{await sbPatch("bookings",b.id,{status:"cancelled"});setBookings(bs=>bs.map(x=>x.id===b.id?{...x,status:"cancelled"}:x));}} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>❌</button></>}<button onClick={()=>{setDC(b);setDT("book");}} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 8px",cursor:"pointer"}}>🗑️</button></div></td></tr>)}</tbody></table></div>
      </div>}

      {/* AI Generator */}
      {page==="ai"&&<div>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 8px"}}>🤖 Générateur de texte IA</h1>
        <p style={{color:"#94a3b8",fontSize:14,margin:"0 0 20px"}}>Générez des posts attractifs pour vos réseaux sociaux en un clic</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Choisissez un hébergement</div>
            {properties.filter(p=>p.status==="active").map(p=><div key={p.id} onClick={()=>genAI(p)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:10,marginBottom:6,cursor:"pointer",border:"1px solid #f1f5f9",background:aiProp?.id===p.id?"#FFF7ED":"white"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>{p.image&&<img src={p.image} alt="" style={{width:40,height:30,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{p.city}</div></div></div>
              <span style={{fontSize:20}}>🤖</span>
            </div>)}
          </div>
          <div style={{background:"white",borderRadius:14,padding:20,border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>Texte généré</div>
            {aiLoading&&<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}><div style={{fontSize:32,marginBottom:8}}>🤖</div>Génération en cours...</div>}
            {!aiLoading&&!aiResult&&<div style={{textAlign:"center",padding:40,color:"#94a3b8",fontSize:13}}>Cliquez sur un hébergement pour générer le texte</div>}
            {aiResult&&<div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}>📱 VERSION COURTE (Story / WhatsApp)</div>
                <div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.short}</div>
                <button onClick={()=>navigator.clipboard?.writeText(aiResult.short)} style={{...bS,marginTop:6,padding:"6px 14px",fontSize:12}}>📋 Copier</button>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}>📝 VERSION LONGUE (Facebook / Instagram)</div>
                <div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.long}</div>
                <button onClick={()=>navigator.clipboard?.writeText(aiResult.long)} style={{...bS,marginTop:6,padding:"6px 14px",fontSize:12}}>📋 Copier</button>
              </div>
              {aiResult.hashtags&&<div>
                <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}># HASHTAGS</div>
                <div style={{background:"#f0f9ff",borderRadius:10,padding:14,fontSize:13,color:"#0284c7"}}>{aiResult.hashtags}</div>
                <button onClick={()=>navigator.clipboard?.writeText(aiResult.hashtags)} style={{...bS,marginTop:6,padding:"6px 14px",fontSize:12}}>📋 Copier</button>
              </div>}
            </div>}
          </div>
        </div>
      </div>}

      {/* Subscriptions */}
      {page==="subscriptions"&&<div>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 20px"}}>💰 Monétisation</h1>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}><Stat label="Abo mensuel" value={fmt(totalSub)} color="#0C6E3D"/><Stat label="Revenus boosts" value={fmt(boostRevenue)} color="#F59E0B"/><Stat label="Total" value={fmt(totalSub+boostRevenue)} color="#7C3AED"/></div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:28}}>{plans.map(plan=>{const isEd=editingPlan===plan.id;const oc=owners.filter(o=>o.subscription===plan.id).length;return<div key={plan.id} style={{flex:"1 1 220px",background:"white",borderRadius:14,padding:22,border:isEd?`2px solid ${plan.color}`:`1px solid ${plan.color}20`,position:"relative"}}><div style={{position:"absolute",top:0,left:0,right:0,height:4,background:plan.color}}/><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontSize:18,fontWeight:800,color:plan.color}}>{plan.name}</div><button onClick={async()=>{if(isEd){await sbPatchW("subscription_plans",`id=eq.${plan.id}`,{price:plan.price,max_properties:plan.max_properties,features:plan.features});setEditPlan(null);if(online)reload();}else setEditPlan(plan.id);}} style={{background:isEd?plan.color:"#f8fafc",border:`1px solid ${isEd?plan.color:"#e2e8f0"}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",color:isEd?"white":"#64748b"}}>{isEd?"Sauver":"Modifier"}</button></div>
          {isEd?<div style={{marginTop:12}}><div style={{marginBottom:8}}><label style={lS}>Prix/mois</label><input type="number" value={plan.price} onChange={e=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,price:Number(e.target.value)}:p))} style={iS}/></div><div style={{marginBottom:8}}><label style={lS}>Max biens</label><input type="number" value={plan.max_properties} onChange={e=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,max_properties:Number(e.target.value)}:p))} style={iS}/></div><label style={lS}>Fonctionnalités</label>{plan.features.map((feat,fi)=><div key={fi} style={{display:"flex",gap:6,marginBottom:6}}><input value={feat} onChange={e=>{const nf=[...plan.features];nf[fi]=e.target.value;setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:nf}:p));}} style={{...iS,flex:1,fontSize:12}}/><button onClick={()=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:p.features.filter((_,i)=>i!==fi)}:p))} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"4px 8px",cursor:"pointer",color:"#dc2626"}}>×</button></div>)}<button onClick={()=>setPlans(ps=>ps.map(p=>p.id===plan.id?{...p,features:[...p.features,""]}:p))} style={{...bS,width:"100%",justifyContent:"center",fontSize:12,padding:"6px"}}>+ Ajouter</button></div>
          :<div><div style={{fontSize:26,fontWeight:800,marginTop:8}}>{fmt(plan.price)}<span style={{fontSize:13,color:"#94a3b8"}}>/mois</span></div><div style={{fontSize:12,color:"#94a3b8"}}>{oc} proprio{oc>1?"s":""}</div><div style={{borderTop:"1px solid #f1f5f9",marginTop:10,paddingTop:10}}>{plan.features.map((f,i)=><div key={i} style={{fontSize:12,color:"#475569",marginBottom:4}}>✓ {f}</div>)}</div></div>}
        </div>;})}</div>
      </div>}

      {/* Settings */}
      {/* Reports */}
      {page==="reports"&&<div>
        <h1 style={{fontSize:22,fontWeight:800,margin:"0 0 8px"}}>📈 Rapports par hébergement</h1>
        <p style={{color:"#94a3b8",fontSize:14,margin:"0 0 20px"}}>Statistiques détaillées de visibilité et performance</p>
        <div style={{background:"white",borderRadius:14,border:"1px solid #f1f5f9",overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:800}}>
            <thead><tr style={{background:"#f8fafc",textAlign:"left"}}>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Hébergement</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Ville</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Vues</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Clics</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Réservations</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Revenus</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Taux conv.</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Boost</th>
              <th style={{padding:"10px 14px",fontWeight:600,color:"#64748b"}}>Note</th>
            </tr></thead>
            <tbody>{properties.map(p=>{
              const propBookings=bookings.filter(b=>b.property_id===p.id&&b.status==="confirmed");
              const revenue=propBookings.reduce((s,b)=>s+b.total,0);
              const views=p.total_views||0;
              const clicks=p.total_clicks||0;
              const convRate=views>0?((propBookings.length/views)*100).toFixed(1):0;
              return<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}}>
                <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}>{p.image&&<img src={p.image} alt="" style={{width:40,height:30,borderRadius:6,objectFit:"cover"}}/>}<div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:"#94a3b8"}}>{p.type} • {p.quartier}</div></div></div></td>
                <td style={{padding:"10px 14px"}}>{p.city}</td>
                <td style={{padding:"10px 14px"}}><span style={{fontWeight:700,color:"#0284c7"}}>{views}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontWeight:700,color:"#7C3AED"}}>{clicks}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontWeight:700,color:"#0C6E3D"}}>{propBookings.length}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontWeight:800,color:"#0C6E3D"}}>{fmt(revenue)}</span></td>
                <td style={{padding:"10px 14px"}}><span style={{fontWeight:700,color:convRate>5?"#0C6E3D":convRate>2?"#F59E0B":"#dc2626"}}>{convRate}%</span></td>
                <td style={{padding:"10px 14px"}}>{p.boost_active?<span style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"white",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:10}}>🚀</span>:<span style={{color:"#94a3b8",fontSize:11}}>—</span>}</td>
                <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:3}}><span style={{color:"#F59E0B"}}>★</span><span style={{fontWeight:600}}>{p.rating}</span><span style={{fontSize:11,color:"#94a3b8"}}>({p.reviews})</span></div></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
        <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          <Stat label="Total vues" value={properties.reduce((s,p)=>s+(p.total_views||0),0)} color="#0284c7"/>
          <Stat label="Total réservations" value={bookings.filter(b=>b.status==="confirmed").length} color="#0C6E3D"/>
          <Stat label="Revenu total" value={fmt(bookings.filter(b=>b.status==="confirmed").reduce((s,b)=>s+b.total,0))} color="#7C3AED"/>
        </div>
      </div>}

      {page==="settings"&&<div><h1 style={{fontSize:22,fontWeight:800,margin:"0 0 20px"}}>⚙️ Paramètres</h1><div style={{background:"white",borderRadius:14,padding:24,border:"1px solid #f1f5f9",maxWidth:500}}>{[{k:"phone",l:"Téléphone"},{k:"email",l:"Email"},{k:"whatsapp",l:"WhatsApp"},{k:"address",l:"Adresse"},{k:"tagline",l:"Slogan"}].map(({k,l})=><div key={k} style={{marginBottom:14}}><label style={lS}>{l}</label><input value={settings[k]||""} onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))} style={iS}/></div>)}<button onClick={async()=>{setSS(true);for(const[k,v] of Object.entries(settings)){await sbPatchW("site_settings",`key=eq.${k}`,{value:v});}setSS(false);}} disabled={savingS} style={{...bP,opacity:savingS?0.5:1}}>{savingS?"...":"Sauvegarder"}</button></div></div>}
    </main>

    {showForm&&<PropForm prop={editProp} owners={owners} onSave={()=>{setSF(false);setEP(null);if(online)reload();}} onClose={()=>{setSF(false);setEP(null);}}/>}

    {/* Boost Modal */}
    {boostProp&&<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setBoostProp(null)}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:16,padding:28,maxWidth:400,width:"90%"}}>
        <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:800}}>🚀 Booster « {boostProp.name} »</h3>
        <p style={{color:"#64748b",fontSize:13,margin:"0 0 16px"}}>L'annonce sera mise en avant sur le site et les réseaux sociaux.</p>
        <label style={lS}>Durée du boost</label>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[{w:1,p:10000,l:"1 semaine"},{w:2,p:20000,l:"2 semaines"},{w:3,p:25000,l:"3 semaines (promo)"}].map(({w,p,l})=><button key={w} onClick={()=>setBoostWeeks(w)} style={{flex:1,padding:"12px 8px",borderRadius:10,cursor:"pointer",textAlign:"center",border:boostWeeks===w?"2px solid #F59E0B":"1px solid #e2e8f0",background:boostWeeks===w?"#FFFBEB":"white"}}><div style={{fontSize:13,fontWeight:700,color:boostWeeks===w?"#D97706":"#475569"}}>{l}</div><div style={{fontSize:16,fontWeight:800,marginTop:4}}>{fmt(p)}</div></button>)}
        </div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setBoostProp(null)} style={bS}>Annuler</button><button onClick={()=>activateBoost(boostProp)} style={{...bP,flex:1,justifyContent:"center"}}>🚀 Activer le boost</button></div>
      </div>
    </div>}

    {/* AI Modal */}
    {aiProp&&page!=="ai"&&<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{setAiProp(null);setAiResult(null);}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:16,padding:28,maxWidth:500,width:"90%",maxHeight:"80vh",overflow:"auto"}}>
        <h3 style={{margin:"0 0 16px",fontSize:18,fontWeight:800}}>🤖 Texte IA — {aiProp.name}</h3>
        {aiLoading&&<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>Génération en cours...</div>}
        {aiResult&&<div>
          <div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}>📱 Story / WhatsApp</div><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.short}</div><button onClick={()=>navigator.clipboard?.writeText(aiResult.short)} style={{...bS,marginTop:6,padding:"6px 14px",fontSize:12}}>📋 Copier</button></div>
          <div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}>📝 Facebook / Instagram</div><div style={{background:"#f8fafc",borderRadius:10,padding:14,fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiResult.long}</div><button onClick={()=>navigator.clipboard?.writeText(aiResult.long)} style={{...bS,marginTop:6,padding:"6px 14px",fontSize:12}}>📋 Copier</button></div>
          {aiResult.hashtags&&<div style={{background:"#f0f9ff",borderRadius:10,padding:14,fontSize:13,color:"#0284c7"}}>{aiResult.hashtags}</div>}
        </div>}
        <button onClick={()=>{setAiProp(null);setAiResult(null);}} style={{...bS,width:"100%",justifyContent:"center",marginTop:16}}>Fermer</button>
      </div>
    </div>}

    {/* Delete Confirm */}
    {delConfirm&&<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setDC(null)}><div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:14,padding:28,maxWidth:380,width:"90%",textAlign:"center"}}><div style={{fontSize:36,marginBottom:16}}>🗑️</div><h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:700}}>Supprimer ?</h3><p style={{color:"#64748b",fontSize:13,margin:"0 0 20px"}}>{delType==="prop"?`« ${delConfirm.name} »`:delType==="owner"?`${delConfirm.name} et ses hébergements`:`Réservation de ${delConfirm.guest_name}`}</p><div style={{display:"flex",gap:10,justifyContent:"center"}}><button onClick={()=>setDC(null)} style={bS}>Annuler</button><button onClick={handleDel} style={{...bP,background:"#dc2626"}}>Supprimer</button></div></div></div>}
  </div>;
}
