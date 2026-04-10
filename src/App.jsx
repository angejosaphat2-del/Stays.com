import { useState, useEffect, useRef } from "react";
import { sbGet, sbPost } from "./supabase";

// Helper PATCH pour mise à jour
async function sbPatch(table, id, data) {
  try {
    const SB = "https://clovwbjdmhkgcocvyzgm.supabase.co";
    const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3Z3YmpkbWhrZ2NvY3Z5emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMDg1NTIsImV4cCI6MjA4OTc4NDU1Mn0.7NgCTnaUxHWWyhcgB7eji0Pypqo5zDqJ8D9n3cB-qyU";
    await fetch(`${SB}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: { apikey: SK, Authorization: `Bearer ${SK}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(data) });
  } catch (e) { console.error("Patch error:", e); }
}

const CITIES = [
  { name: "Toutes les villes", code: "all" },
  { name: "Abidjan", code: "Abidjan" }, { name: "San Pedro", code: "San Pedro" },
  { name: "Yamoussoukro", code: "Yamoussoukro" }, { name: "Bouaké", code: "Bouaké" },
  { name: "Grand-Bassam", code: "Grand-Bassam" }, { name: "Assinie", code: "Assinie" },
];
const TYPES = ["Tous", "Résidence", "Hôtel", "Villa"];

function fmt(p) { return (p || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA"; }

const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const StarIcon = ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const HeartIcon = ({ filled }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const WhatsAppIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const GlobeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const FilterIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const MenuIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const DEMO = [
  { id: "d1", name: "Résidence Le Palmier d'Or", type: "Résidence", quartier: "Cocody", city: "Abidjan", price: 35000, rating: 4.7, reviews: 134, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Climatisation","Piscine","Restaurant"], description: "Résidence haut standing à Cocody avec vue sur la lagune.", whatsapp: "+2250787450832" },
  { id: "d2", name: "Hôtel Ivoire Premium", type: "Hôtel", quartier: "Plateau", city: "Abidjan", price: 65000, rating: 4.9, reviews: 287, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Climatisation","Piscine","Spa"], description: "Hôtel 5 étoiles au cœur du Plateau.", whatsapp: "+2250787450832" },
  { id: "d3", name: "Hôtel Atlantic Beach", type: "Hôtel", quartier: "Bardot", city: "San Pedro", price: 45000, rating: 4.9, reviews: 156, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Piscine","Plage privée","Spa"], description: "Hôtel de luxe en bord de mer.", whatsapp: "+2250787450832" },
  { id: "d4", name: "Hôtel Président", type: "Hôtel", quartier: "Centre", city: "Yamoussoukro", price: 40000, rating: 4.6, reviews: 98, sponsored: false, status: "active", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Piscine","Restaurant"], description: "Hôtel de référence de la capitale.", whatsapp: "+2250787450832" },
  { id: "d5", name: "Villa Riviera Golf", type: "Villa", quartier: "Riviera Golf", city: "Abidjan", price: 85000, rating: 4.8, reviews: 45, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Piscine privée","Chef privé","Jardin"], description: "Villa de luxe avec piscine privée.", whatsapp: "+2250787450832" },
  { id: "d6", name: "Hôtel La Plage", type: "Hôtel", quartier: "Bord de mer", city: "Grand-Bassam", price: 38000, rating: 4.7, reviews: 143, sponsored: true, status: "active", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop", images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop"], amenities: ["Wi-Fi","Plage privée","Restaurant","Piscine"], description: "Face à l'océan, ville historique UNESCO.", whatsapp: "+2250787450832" },
];

const DEMO_SLIDES = [
  { id: "s1", type: "brand", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=900&fit=crop", title: "Votre séjour idéal,", title_highlight: "partout en Côte d'Ivoire", subtitle: "Résidences, hôtels et villas. Trouvez et contactez directement via WhatsApp.", badge: "N°1 DE L'HÉBERGEMENT EN CÔTE D'IVOIRE" },
  { id: "s2", type: "ad", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&h=900&fit=crop", property_name: "Hôtel Atlantic Beach", property_city: "San Pedro", property_price: "45 000 FCFA/nuit", tagline: "Luxe en bord de mer — Spa, piscine & plage privée", badge: "SPONSORISÉ" },
  { id: "s3", type: "ad", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&h=900&fit=crop", property_name: "Villa Riviera Golf", property_city: "Abidjan", property_price: "85 000 FCFA/nuit", tagline: "Villa de luxe — Piscine privée & chef sur demande", badge: "EXCLUSIF" },
];

function Card({ p, onSelect, onFav, isFav }) {
  const [h, sH] = useState(false);
  return <div onClick={() => onSelect(p)} style={{ cursor: "pointer", borderRadius: 16, overflow: "hidden", background: "white", boxShadow: h ? "0 12px 32px rgba(0,0,0,0.12)" : "0 1px 8px rgba(0,0,0,0.08)", transform: h ? "translateY(-4px)" : "none", transition: "all 0.3s" }} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}>
    <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
      <img src={p.image} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
        {p.sponsored && <span style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>SPONSORISÉ</span>}
        <span style={{ background: "rgba(0,0,0,0.6)", color: "white", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>{p.type}</span>
      </div>
      <button onClick={e => { e.stopPropagation(); onFav(p.id); }} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><HeartIcon filled={isFav} /></button>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent,rgba(0,0,0,0.5))" }} />
      <div style={{ position: "absolute", bottom: 12, left: 14, color: "white" }}><div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(p.price)}</div><div style={{ fontSize: 11, opacity: 0.9 }}>par nuit</div></div>
    </div>
    <div style={{ padding: "14px 16px 16px" }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{p.name}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, color: "#64748b", fontSize: 13 }}><MapPinIcon /> {p.quartier}, {p.city}</div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(p.rating)} />)}</div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{p.rating}</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>({p.reviews})</span>
        </div>
      </div>
    </div>
  </div>;
}

const AMENITY_ICONS = {"Wi-Fi":"📶","Climatisation":"❄️","Piscine":"🏊","Restaurant":"🍽️","Spa":"💆","Plage privée":"🏖️","Piscine privée":"🏊","Chef privé":"👨‍🍳","Jardin":"🌿","Parking":"🅿️","Salle de sport":"💪","Bar":"🍸","Buanderie":"🧺","Room service":"🛎️","Coffre-fort":"🔒","TV":"📺","Balcon":"🌅","Terrasse":"☀️","Vue mer":"🌊","Vue lagune":"🌊","Kitchenette":"🍳","Petit-déjeuner":"🥐","Transfert aéroport":"✈️","Conciergerie":"🔑"};
const BedIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;

function Detail({ p, onClose, rooms: allRooms, onRatingUpdate }) {
  const [ii, sII] = useState(0);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const imgs = p.images?.length ? p.images : [p.image];
  const propRooms = allRooms.filter(r => r.property_id === p.id);
  const waMsg = encodeURIComponent(`Bonjour, je suis intéressé par ${p.name} sur StaysPlace. Pouvez-vous me donner plus d'informations ?`);
  const waLink = `https://wa.me/${(p.whatsapp || "").replace(/[^0-9+]/g, "")}?text=${waMsg}`;
  const cheapestRoom = propRooms.length > 0 ? Math.min(...propRooms.map(r => r.price)) : null;

  // Charger les avis
  useEffect(() => {
    async function loadReviews() {
      setLoadingReviews(true);
      const rv = await sbGet("reviews", `property_id=eq.${p.id}&status=eq.approved&order=created_at.desc`);
      if (rv && Array.isArray(rv)) setReviews(rv);
      setLoadingReviews(false);
    }
    loadReviews();
  }, [p.id]);

  // Soumettre un avis
  const submitReview = async () => {
    if (!reviewForm.name.trim()) { setReviewError("Entrez votre nom"); return; }
    if (reviewForm.rating === 0) { setReviewError("Sélectionnez une note"); return; }
    setReviewError("");
    setSubmittingReview(true);
    const data = {
      property_id: p.id,
      guest_name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim() || null,
      status: "approved",
      created_at: new Date().toISOString()
    };
    const res = await sbPost("reviews", data);
    if (res) {
      setReviews(prev => [Array.isArray(res) ? res[0] : res, ...prev]);
      setReviewSent(true);
      // Recalculer la note moyenne
      const allRatings = [...reviews.map(r => r.rating), reviewForm.rating];
      const newAvg = Math.round((allRatings.reduce((s, r) => s + r, 0) / allRatings.length) * 10) / 10;
      const newCount = allRatings.length;
      await sbPost("rpc/update_property_rating", { p_id: p.id, p_rating: newAvg, p_reviews: newCount }).catch(() => {
        // Fallback: patch direct
        sbPatch("properties", p.id, { rating: newAvg, reviews: newCount }).catch(() => {});
      });
      if (onRatingUpdate) onRatingUpdate(p.id, newAvg, newCount);
    } else {
      setReviewError("Erreur lors de l'envoi. Réessayez.");
    }
    setSubmittingReview(false);
  };

  return <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, maxWidth: 580, width: "100%", maxHeight: "90vh", overflow: "auto" }}>

      {/* ── GALERIE PHOTO ── */}
      <div style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
        <img src={imgs[ii]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(0,0,0,0.4))" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 20 }}>✕</button>

        {/* Badges en haut */}
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
          {p.sponsored && <span style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>⭐ SPONSORISÉ</span>}
          <span style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "white", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{p.type}</span>
        </div>

        {/* Compteur photos */}
        {imgs.length > 1 && <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "white", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>📷 {ii + 1}/{imgs.length}</div>}

        {/* Flèches navigation */}
        {imgs.length > 1 && <>
          <button onClick={() => sII(i => i === 0 ? imgs.length - 1 : i - 1)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>‹</button>
          <button onClick={() => sII(i => (i + 1) % imgs.length)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>›</button>
        </>}
      </div>

      {/* Miniatures */}
      {imgs.length > 1 && <div style={{ display: "flex", gap: 4, padding: "8px 16px", overflowX: "auto" }}>
        {imgs.map((img, i) => <div key={i} onClick={() => sII(i)} style={{ flexShrink: 0, width: 56, height: 40, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: ii === i ? "2px solid #FF6B00" : "2px solid transparent", opacity: ii === i ? 1 : 0.6, transition: "all 0.2s" }}>
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        </div>)}
      </div>}

      <div style={{ padding: "16px 24px 24px" }}>

        {/* ── EN-TÊTE ── */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
          <div style={{ flex: "1 1 250px" }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{p.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, color: "#64748b", fontSize: 14 }}><MapPinIcon /> {p.quartier}, {p.city}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{cheapestRoom ? "à partir de" : "par nuit"}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0C6E3D" }}>{fmt(cheapestRoom || p.price)}</div>
          </div>
        </div>

        {/* Note */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 16 }}>
          <div style={{ background: "#0C6E3D", color: "white", fontWeight: 800, fontSize: 14, padding: "4px 10px", borderRadius: 8 }}>{p.rating}</div>
          <div style={{ display: "flex", gap: 1 }}>{[1,2,3,4,5].map(s => <StarIcon key={s} filled={s <= Math.round(p.rating)} />)}</div>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{p.reviews} avis</span>
        </div>

        {/* ── RÉSUMÉ / POINTS FORTS ── */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#1a1a2e" }}>✨ Résumé</div>
          <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{p.description}</p>

          {/* Infos clés en grille */}
          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #e2e8f0" }}>
              <MapPinIcon /> {p.city}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #e2e8f0" }}>
              🏷️ {p.type}
            </div>
            {propRooms.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #e2e8f0" }}>
              🛏️ {propRooms.length} chambre{propRooms.length > 1 ? "s" : ""}
            </div>}
          </div>
        </div>

        {/* ── ÉQUIPEMENTS ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, color: "#1a1a2e" }}>Équipements de l'établissement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {(p.amenities || []).map((a, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: 16 }}>{AMENITY_ICONS[a] || "✓"}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>{a}</span>
            </div>)}
          </div>
        </div>

        {/* ── CHAMBRES DISPONIBLES ── */}
        {propRooms.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, color: "#1a1a2e" }}>🛏️ Chambres disponibles ({propRooms.length})</div>
          {propRooms.map(r => {
            const isExpanded = expandedRoom === r.id;
            const roomImgs = r.images?.length ? r.images : [];
            return <div key={r.id} style={{ borderRadius: 14, marginBottom: 10, border: "1px solid #e2e8f0", overflow: "hidden", background: "white", transition: "box-shadow 0.2s", boxShadow: isExpanded ? "0 4px 16px rgba(0,0,0,0.08)" : "none" }}>

              {/* En-tête chambre — toujours visible */}
              <div onClick={() => setExpandedRoom(isExpanded ? null : r.id)} style={{ display: "flex", gap: 12, padding: 14, cursor: "pointer", alignItems: "center" }}>
                {/* Photo miniature chambre */}
                {roomImgs.length > 0 && <div style={{ width: 72, height: 54, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                  <img src={roomImgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                </div>}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, fontSize: 12, color: "#64748b" }}>
                    {r.capacity && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><UserIcon /> {r.capacity} pers.</span>}
                    {r.bed_type && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BedIcon /> {r.bed_type}</span>}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0C6E3D" }}>{fmt(r.price)}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>/ nuit</div>
                </div>

                <div style={{ fontSize: 14, color: "#94a3b8", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>▼</div>
              </div>

              {/* Détails chambre — expandable */}
              {isExpanded && <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f1f5f9" }}>

                {/* Photos chambre */}
                {roomImgs.length > 0 && <div style={{ display: "flex", gap: 6, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
                  {roomImgs.map((img, i) => <div key={i} style={{ width: 120, height: 80, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  </div>)}
                </div>}

                {/* Description chambre */}
                {r.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{r.description}</p>}

                {/* Équipements chambre */}
                {(r.amenities || []).length > 0 && <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Équipements de la chambre</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(r.amenities || []).map((a, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0fdf4", color: "#166534", fontSize: 11, padding: "4px 10px", borderRadius: 6, fontWeight: 600, border: "1px solid #dcfce7" }}>
                      <CheckIcon /> {a}
                    </span>)}
                  </div>
                </div>}

                {/* Bouton WhatsApp pour cette chambre */}
                <a href={`https://wa.me/${(p.whatsapp || "").replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par la chambre "${r.name}" à ${p.name} sur StaysPlace. Est-elle disponible ?`)}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "white", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 12 }}>
                  <WhatsAppIcon /> Réserver cette chambre
                </a>
              </div>}
            </div>;
          })}
        </div>}

        {/* ── AVIS DES VISITEURS ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, color: "#1a1a2e" }}>💬 Avis des visiteurs ({reviews.length})</div>

          {/* Formulaire d'avis */}
          {!reviewSent ? <div style={{ background: "#f8fafc", borderRadius: 14, padding: 16, border: "1px solid #f1f5f9", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Laisser un avis</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input placeholder="Votre nom" value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Votre note</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transform: reviewForm.rating >= s ? "scale(1.2)" : "scale(1)", transition: "transform 0.15s" }}>
                  <StarIcon filled={reviewForm.rating >= s} />
                </button>)}
                {reviewForm.rating > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginLeft: 4 }}>{reviewForm.rating}/5</span>}
              </div>
            </div>
            <textarea placeholder="Votre commentaire (optionnel)" value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
            {reviewError && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{reviewError}</div>}
            <button onClick={submitReview} disabled={submittingReview} style={{ marginTop: 8, width: "100%", background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: submittingReview ? "wait" : "pointer", opacity: submittingReview ? 0.6 : 1 }}>
              {submittingReview ? "Envoi..." : "Publier mon avis"}
            </button>
          </div>
          : <div style={{ background: "#f0fdf4", borderRadius: 14, padding: 16, border: "1px solid #bbf7d0", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>Merci pour votre avis !</div>
          </div>}

          {/* Liste des avis */}
          {loadingReviews && <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Chargement des avis...</div>}
          {!loadingReviews && reviews.length === 0 && <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>Aucun avis pour le moment. Soyez le premier !</div>}
          {reviews.slice(0, showAllReviews ? reviews.length : 3).map(rv => <div key={rv.id} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B00,#FF8534)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 13 }}>{(rv.guest_name || "A")[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{rv.guest_name || "Anonyme"}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{rv.created_at ? new Date(rv.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 1 }}>{[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= rv.rating} />)}</div>
            </div>
            {rv.comment && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "8px 0 0 40px" }}>{rv.comment}</p>}
          </div>)}
          {reviews.length > 3 && !showAllReviews && <button onClick={() => setShowAllReviews(true)} style={{ width: "100%", background: "none", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#64748b", marginTop: 8 }}>Voir les {reviews.length - 3} autres avis</button>}
        </div>

        {/* Bannière info contact */}
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e", marginBottom: 14 }}>
          💬 Pour vérifier la disponibilité et obtenir les détails, contactez directement l'établissement via WhatsApp.
        </div>

        {/* Bouton WhatsApp principal */}
        <a href={waLink} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#25D366", color: "white", padding: "16px 20px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
          <WhatsAppIcon /> Contacter via WhatsApp
        </a>
      </div>
    </div>
  </div>;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [properties, setProperties] = useState(DEMO);
  const [slides, setSlides] = useState(DEMO_SLIDES);
  const [settings, setSettings] = useState({ phone: "+225 07 87 45 08 32", email: "contact@staysplace.com", whatsapp: "2250787450832", address: "Abidjan, Côte d'Ivoire", tagline: "La plateforme N°1 de réservation d'hébergements en Côte d'Ivoire." });
  const [selProp, setSelProp] = useState(null);
  const [search, setSearch] = useState("");
  const [selType, setSelType] = useState("Tous");
  const [selCity, setSelCity] = useState("all");
  const [selQuartier, setSelQuartier] = useState("all");
  const [quartiers, setQuartiers] = useState([]);
  const [priceMax, setPriceMax] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);
  const [selAmenities, setSelAmenities] = useState([]);
  const [selRoomType, setSelRoomType] = useState("Tous");
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [favs, setFavs] = useState([]);
  const [heroLoaded, setHL] = useState(false);
  const [scrolled, setSc] = useState(false);
  const [curSlide, setCS] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    async function load() {
      const p = await sbGet("properties", "status=eq.active&order=sponsored.desc,rating.desc");
      if (p && Array.isArray(p) && p.length > 0) setProperties(p);
      const sl = await sbGet("hero_slides", "active=eq.true&order=sort_order.asc");
      if (sl && Array.isArray(sl) && sl.length > 0) setSlides(sl);
      const s = await sbGet("site_settings", "");
      if (s && Array.isArray(s)) { const m = {}; s.forEach(x => { m[x.key] = x.value; }); if (Object.keys(m).length > 0) setSettings(m); }
      const q = await sbGet("quartiers", "order=name.asc");
      if (q && Array.isArray(q)) setQuartiers(q);
      const rt = await sbGet("room_types", "order=sort_order.asc");
      if (rt && Array.isArray(rt)) setRoomTypes(rt);
      const rm = await sbGet("rooms", "available=eq.true&order=price.asc");
      if (rm && Array.isArray(rm)) setRooms(rm);
    }
    load();
  }, []);

  useEffect(() => { setTimeout(() => setHL(true), 100); }, []);
  useEffect(() => { const h = () => setSc(window.scrollY > 60); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  // Carousel toutes les 10 secondes
  useEffect(() => { if (page !== "home" || slides.length === 0) return; const t = setInterval(() => setCS(s => (s + 1) % slides.length), 10000); return () => clearInterval(t); }, [page, slides.length]);

  const toggleFav = (id) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const cityQuartiers = selCity !== "all" ? quartiers.filter(q => q.city === selCity) : [];
  const allAmenities = [...new Set(properties.flatMap(p => p.amenities || []))].sort();
  const toggleAmenity = (a) => setSelAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const trackView = async (p) => {
    setSelProp(p);
    const today = new Date().toISOString().split("T")[0];
    await sbPost("property_stats", { property_id: p.id, date: today, views: 1 }).catch(() => {});
  };
  const filtered = properties.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.quartier || "").toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase()) && !(p.amenities || []).some(a => a.toLowerCase().includes(search.toLowerCase()))) return false;
    if (selType !== "Tous" && p.type !== selType) return false;
    if (selCity !== "all" && p.city !== selCity) return false;
    if (selQuartier !== "all" && p.quartier !== selQuartier) return false;
    if (selRoomType !== "Tous" && p.room_type !== selRoomType) return false;
    if (selAmenities.length > 0 && !selAmenities.every(a => (p.amenities || []).includes(a))) return false;
    if (p.price > priceMax) return false;
    return true;
  });
  const goList = () => { setPage("listings"); setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth" }), 100); };
  const curS = slides[curSlide] || {};
  const navBg = page === "home" && !scrolled ? "transparent" : "rgba(255,255,255,0.97)";
  const navC = page === "home" && !scrolled ? "white" : "#1a1a2e";
  const navLinks = [{ l: "Accueil", p: "home" }, { l: "Hébergements", p: "listings" }, { l: "Tarifs", p: "pricing" }, { l: "FAQ", p: "faq" }, { l: "Contact", p: "contact" }];

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); setMenuOpen(false); };

  return <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#1a1a2e" }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;500;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />

    {/* Nav */}
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 900, background: navBg, backdropFilter: "blur(20px)", borderBottom: navBg === "transparent" ? "none" : "1px solid rgba(0,0,0,0.06)", transition: "all 0.4s", padding: "0 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div onClick={() => navigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#FF6B00,#FF8534)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 18, fontFamily: "'Playfair Display',serif" }}>S</div>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display',serif", color: navC }}>Stays<span style={{ color: "#FF6B00" }}>Place</span></span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, "@media(max-width:640px)": { display: "none" } }}>
          {navLinks.map(({ l, p }) =>
            <button key={p} onClick={() => navigate(p)} style={{ background: page === p && navBg !== "transparent" ? "#f8fafc" : "none", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", color: navBg === "transparent" ? "rgba(255,255,255,0.9)" : page === p ? "#FF6B00" : "#64748b", padding: "8px 14px", borderRadius: 8 }}>{l}</button>
          )}
        </div>

        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: navC, padding: 4, "@media(max-width:768px)": { display: "flex" } }}
          className="mobile-menu-btn">
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && <div style={{ background: "white", borderTop: "1px solid #f1f5f9", padding: "12px 0" }}>
        {navLinks.map(({ l, p }) =>
          <button key={p} onClick={() => navigate(p)} style={{ display: "block", width: "100%", textAlign: "left", background: page === p ? "#fff7ed" : "none", border: "none", fontSize: 15, fontWeight: page === p ? 700 : 500, cursor: "pointer", color: page === p ? "#FF6B00" : "#1a1a2e", padding: "12px 24px" }}>{l}</button>
        )}
        <div style={{ margin: "8px 16px 4px" }}>
          <a href={`https://wa.me/${settings.whatsapp}?text=Bonjour StaysPlace`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "white", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}><WhatsAppIcon /> WhatsApp</a>
        </div>
      </div>}
    </nav>

    {/* CSS pour hamburger */}
    <style>{`
      @media (max-width: 768px) {
        .mobile-menu-btn { display: flex !important; align-items: center; }
        .desktop-nav { display: none !important; }
      }
      @media (min-width: 769px) {
        .mobile-menu-btn { display: none !important; }
      }
    `}</style>

    {/* Hero Carousel */}
    {page === "home" && <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {slides.map((sl, i) => <div key={sl.id} style={{ position: "absolute", inset: 0, backgroundImage: `url(${sl.image})`, backgroundSize: "cover", backgroundPosition: "center", opacity: curSlide === i ? 1 : 0, transform: curSlide === i ? "scale(1)" : "scale(1.08)", transition: "opacity 1s,transform 1.2s", zIndex: curSlide === i ? 1 : 0 }} />)}
      <div style={{ position: "absolute", inset: 0, background: curS.type === "ad" ? "linear-gradient(180deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0.65) 100%)" : "linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(0,0,0,0.6) 100%)", zIndex: 2 }} />

      {curS.type === "brand" && <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "0 24px", maxWidth: 750, opacity: heroLoaded ? 1 : 0, transition: "all 0.8s ease 0.3s" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: 30, padding: "6px 18px", fontSize: 13, color: "white", fontWeight: 700, marginBottom: 20, border: "1px solid rgba(255,255,255,0.2)", letterSpacing: 1 }}><GlobeIcon /> {curS.badge}</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,7vw,58px)", fontWeight: 900, color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>{curS.title}<br /><span style={{ color: "#FFB347" }}>{curS.title_highlight}</span></h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: "0 auto 32px" }}>{curS.subtitle}</p>
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.97)", borderRadius: 16, padding: 6, gap: 6, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: 500, boxSizing: "border-box" }}>
          <select value={selCity} onChange={e => setSelCity(e.target.value)} style={{ border: "none", outline: "none", padding: "14px 16px", fontSize: 14, borderRadius: 12, background: "#f8fafc", color: "#1a1a2e", fontFamily: "inherit", fontWeight: 600, cursor: "pointer", flex: "1 1 130px" }}>{CITIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
          <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", padding: "14px 18px", fontSize: 15, borderRadius: 12, background: "transparent", flex: "1 1 150px", color: "#1a1a2e", fontFamily: "inherit" }} />
          <button onClick={goList} style={{ background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flex: "1 1 auto" }}><SearchIcon /> Rechercher</button>
        </div>
      </div>}

      {curS.type === "ad" && <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, zIndex: 5, display: "flex", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(16px)", borderRadius: 18, padding: "16px 24px", display: "flex", alignItems: "center", gap: 20, maxWidth: 680, width: "100%", border: "1px solid rgba(255,255,255,0.1)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 250px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>{curS.badge}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{curS.property_city}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "white", fontFamily: "'Playfair Display',serif" }}>{curS.property_name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{curS.tagline}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#FFB347" }}>{curS.property_price}</div>
            <button onClick={() => { const prop = properties.find(x => x.name === curS.property_name); if (prop) setSelProp(prop); }} style={{ background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "12px 22px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Voir →</button>
          </div>
        </div>
      </div>}

      {slides.length > 1 && <div style={{ position: "absolute", bottom: curS.type === "ad" ? 16 : 30, left: "50%", transform: "translateX(-50%)", zIndex: 6, display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setCS(s => s === 0 ? slides.length - 1 : s - 1)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 16 }}>←</button>
        <div style={{ display: "flex", gap: 8 }}>{slides.map((_, i) => <button key={i} onClick={() => setCS(i)} style={{ width: curSlide === i ? 28 : 10, height: 10, borderRadius: 5, border: "none", cursor: "pointer", background: curSlide === i ? "white" : "rgba(255,255,255,0.4)", transition: "all 0.3s" }} />)}</div>
        <button onClick={() => setCS(s => (s + 1) % slides.length)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: 16 }}>→</button>
      </div>}
    </div>}

    {/* Listings */}
    {(page === "home" || page === "listings") && <div ref={listRef} style={{ maxWidth: 1200, margin: "0 auto", padding: page === "home" ? "48px 20px 80px" : "84px 20px 80px" }}>
      <div style={{ marginBottom: 28 }}><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, margin: "0 0 6px" }}>{selCity !== "all" ? `Hébergements à ${selCity}` : "Hébergements populaires"}</h2><p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "white", borderRadius: 12, padding: 4, border: "1px solid #e2e8f0", flex: "1 1 240px", maxWidth: 360 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 10px", color: "#94a3b8" }}><SearchIcon /></div>
          <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: "none", outline: "none", padding: "10px 4px", fontSize: 14, flex: 1, background: "transparent", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>{CITIES.map(c => <button key={c.code} onClick={() => { setSelCity(c.code); setSelQuartier("all"); }} style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", border: selCity === c.code ? "none" : "1px solid #e2e8f0", background: selCity === c.code ? "#1a1a2e" : "white", color: selCity === c.code ? "white" : "#475569" }}>{c.name}</button>)}</div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid #e2e8f0", background: showFilters ? "#1a1a2e" : "white", color: showFilters ? "white" : "#475569" }}><FilterIcon /> Filtres</button>
      </div>
      {showFilters && <div style={{ background: "white", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid #e2e8f0", display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 250px" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Type d'hébergement</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{TYPES.map(t => <button key={t} onClick={() => setSelType(t)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selType === t ? "none" : "1px solid #e2e8f0", background: selType === t ? "linear-gradient(135deg,#FF6B00,#FF8534)" : "white", color: selType === t ? "white" : "#475569" }}>{t}</button>)}</div></div>
        {roomTypes.length > 0 && <div style={{ flex: "1 1 250px" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Type de logement</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button onClick={() => setSelRoomType("Tous")} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selRoomType === "Tous" ? "none" : "1px solid #e2e8f0", background: selRoomType === "Tous" ? "#1a1a2e" : "white", color: selRoomType === "Tous" ? "white" : "#475569" }}>Tous</button>{roomTypes.map(rt => <button key={rt.id} onClick={() => setSelRoomType(rt.name)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selRoomType === rt.name ? "none" : "1px solid #e2e8f0", background: selRoomType === rt.name ? "linear-gradient(135deg,#FF6B00,#FF8534)" : "white", color: selRoomType === rt.name ? "white" : "#475569" }}>{rt.name}</button>)}</div></div>}
        {cityQuartiers.length > 0 && <div style={{ flex: "1 1 250px" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Quartier / Commune</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button onClick={() => setSelQuartier("all")} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selQuartier === "all" ? "none" : "1px solid #e2e8f0", background: selQuartier === "all" ? "#1a1a2e" : "white", color: selQuartier === "all" ? "white" : "#475569" }}>Tous</button>{cityQuartiers.map(q => <button key={q.id} onClick={() => setSelQuartier(q.name)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selQuartier === q.name ? "none" : "1px solid #e2e8f0", background: selQuartier === q.name ? "linear-gradient(135deg,#FF6B00,#FF8534)" : "white", color: selQuartier === q.name ? "white" : "#475569" }}>{q.name}</button>)}</div></div>}
        {allAmenities.length > 0 && <div style={{ flex: "1 1 100%" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Équipements</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{allAmenities.map(a => <button key={a} onClick={() => toggleAmenity(a)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: selAmenities.includes(a) ? "none" : "1px solid #e2e8f0", background: selAmenities.includes(a) ? "#059669" : "white", color: selAmenities.includes(a) ? "white" : "#475569" }}>{a}</button>)}</div></div>}
        <div style={{ flex: "1 1 250px" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>Budget max: {fmt(priceMax)}</div><input type="range" min={5000} max={100000} step={5000} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: "100%", accentColor: "#FF6B00" }} /></div>
        {(selAmenities.length > 0 || selRoomType !== "Tous" || selQuartier !== "all" || selType !== "Tous") && <div style={{ flex: "1 1 100%" }}><button onClick={() => { setSelAmenities([]); setSelRoomType("Tous"); setSelQuartier("all"); setSelType("Tous"); setPriceMax(100000); }} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" }}>Réinitialiser les filtres</button></div>}
      </div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
        {filtered.map(p => <Card key={p.id} p={p} onSelect={trackView} onFav={toggleFav} isFav={favs.includes(p.id)} />)}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}><div style={{ fontSize: 48 }}>🏠</div><div style={{ fontSize: 18, fontWeight: 600, color: "#475569", marginTop: 8 }}>Aucun résultat</div></div>}

      <div style={{ marginTop: 60, borderRadius: 20, background: "linear-gradient(135deg,#1a1a2e,#16213e)", padding: "48px 32px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 12px" }}>Vous êtes propriétaire ?</h3>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, maxWidth: 500, margin: "0 auto 24px" }}>Inscrivez votre résidence ou hôtel sur StaysPlace</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("register")} style={{ background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Inscrire mon établissement</button>
          <button onClick={() => navigate("pricing")} style={{ background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Voir les tarifs</button>
        </div>
      </div>
    </div>}

    {/* FAQ */}
    {page === "faq" && <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, margin: "0 0 32px" }}>Questions fréquentes</h1>
      {[
        { q: "Comment contacter un hébergement ?", a: "Cliquez sur l'hébergement qui vous intéresse puis sur le bouton WhatsApp. Vous serez mis en contact direct avec l'établissement pour vérifier la disponibilité et obtenir tous les détails." },
        { q: "Comment se passe le paiement ?", a: "Le paiement se fait directement avec l'établissement via Mobile Money (Orange Money, MTN, Wave) ou selon leurs modalités. StaysPlace ne prend aucune commission." },
        { q: "Comment inscrire mon bien ?", a: "Remplissez le formulaire 'Inscrire mon établissement'. Notre équipe vous contacte sous 24h." },
        { q: "Combien coûte l'inscription ?", a: "3 formules : Basic (5 000 F/mois — 1 bien, 3 photos, WhatsApp), Premium (10 000 F/mois — 3 biens, badge sponsorisé, position prioritaire, carrousel, stats), Enterprise (15 000 F/mois — illimité, gestion des chambres, rapport mensuel, support 24/7)." },
        { q: "Quelles villes sont disponibles ?", a: "Abidjan, San Pedro, Yamoussoukro, Bouaké, Grand-Bassam et Assinie." },
        { q: "Qu'est-ce que le badge Sponsorisé ?", a: "Réservé aux abonnés Premium et Enterprise. Votre établissement apparaît en tête des résultats avec un badge doré et dans le carrousel de la page d'accueil." }
      ].map((x, i) => <details key={i} style={{ background: "white", borderRadius: 12, marginBottom: 10, border: "1px solid #f1f5f9" }}><summary style={{ padding: "16px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{x.q}</summary><div style={{ padding: "0 20px 16px", fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{x.a}</div></details>)}
    </div>}

    {/* Pricing */}
    {page === "pricing" && <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 20px 60px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, margin: "0 0 40px" }}>Nos tarifs propriétaires</h1>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { n: "Basic", p: "5 000", c: "#64748b", pop: false, f: ["1 établissement listé","3 photos par établissement","Fiche de contact WhatsApp visible","Visible dans les résultats de recherche","Badge type affiché (Résidence / Hôtel / Villa)"] },
          { n: "Premium", p: "10 000", c: "#FF6B00", pop: true, f: ["3 établissements listés","10 photos par établissement","Badge SPONSORISÉ sur la carte","Position prioritaire dans les résultats","Apparition dans le carrousel hero","Statistiques de vues (tableau de bord admin)"] },
          { n: "Enterprise", p: "15 000", c: "#7C3AED", pop: false, f: ["Établissements illimités","Photos illimitées par établissement","Gestion des chambres & tarifs","Rapport mensuel de réservations","Support prioritaire 24/7","Accès complet au tableau de bord admin"] }
        ].map((pl, i) => <div key={i} style={{ flex: "1 1 260px", maxWidth: 300, background: "white", borderRadius: 16, padding: "28px 24px", border: pl.pop ? `2px solid ${pl.c}` : "1px solid #f1f5f9", position: "relative" }}>
          {pl.pop && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: pl.c, color: "white", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: "0 0 8px 8px" }}>POPULAIRE</div>}
          <div style={{ fontSize: 18, fontWeight: 800, color: pl.c, marginTop: pl.pop ? 12 : 0 }}>{pl.n}</div>
          <div style={{ fontSize: 36, fontWeight: 800, margin: "8px 0" }}>{pl.p}<span style={{ fontSize: 14, color: "#94a3b8" }}> F/mois</span></div>
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 16, paddingTop: 16, textAlign: "left" }}>{pl.f.map((f, fi) => <div key={fi} style={{ fontSize: 13, color: "#475569", marginBottom: 8, display: "flex", gap: 6, alignItems: "flex-start" }}><span style={{ color: pl.c, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</div>)}</div>
          <button onClick={() => navigate("register")} style={{ width: "100%", marginTop: 16, background: pl.pop ? pl.c : "white", color: pl.pop ? "white" : "#475569", border: pl.pop ? "none" : "1px solid #e2e8f0", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Choisir {pl.n}</button>
        </div>)}
      </div>
    </div>}

    {/* Register */}
    {page === "register" && <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, margin: "0 0 32px" }}>Inscrire mon établissement</h1>
      <div style={{ background: "white", borderRadius: 16, padding: 28, border: "1px solid #f1f5f9" }}>
        {[{ l: "Votre nom", t: "text" }, { l: "Téléphone WhatsApp", t: "tel" }, { l: "Email", t: "email" }, { l: "Nom de l'établissement", t: "text" }, { l: "Ville", t: "text" }, { l: "Prix moyen/nuit (FCFA)", t: "number" }].map((f, i) => <div key={i} style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.l}</label><input type={f.t} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} /></div>)}
        <button onClick={() => alert("Merci ! Notre équipe vous contactera sous 24h.")} style={{ width: "100%", background: "linear-gradient(135deg,#FF6B00,#FF8534)", color: "white", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Envoyer ma demande</button>
      </div>
    </div>}

    {/* Contact */}
    {page === "contact" && <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 20px 60px" }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, margin: "0 0 32px" }}>Contactez-nous</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {[{ i: "📞", t: "Téléphone", v: settings.phone }, { i: "📧", t: "Email", v: settings.email }, { i: "📍", t: "Adresse", v: settings.address }].map((c, i) => <div key={i} style={{ background: "white", borderRadius: 14, padding: "16px 20px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14 }}><span style={{ fontSize: 24 }}>{c.i}</span><div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.t}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{c.v}</div></div></div>)}
        <a href={`https://wa.me/${settings.whatsapp}?text=Bonjour, j'ai une question sur StaysPlace`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "white", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none" }}><WhatsAppIcon /> Écrire sur WhatsApp</a>
      </div>
    </div>}

    {/* Footer */}
    <footer style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.6)", padding: "40px 24px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 40, marginBottom: 32 }}>
          <div style={{ flex: "1 1 250px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#FF6B00,#FF8534)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 16 }}>S</div><span style={{ fontSize: 20, fontWeight: 800, color: "white", fontFamily: "'Playfair Display',serif" }}>Stays<span style={{ color: "#FF6B00" }}>Place</span></span></div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>{settings.tagline}</p>
          </div>
          <div style={{ flex: "1 1 130px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 12, textTransform: "uppercase" }}>Pages</div>
            {[{ l: "Hébergements", p: "listings" }, { l: "Inscrire mon bien", p: "register" }, { l: "Tarifs", p: "pricing" }, { l: "FAQ", p: "faq" }, { l: "Contact", p: "contact" }].map(({ l, p }) => <div key={l} onClick={() => navigate(p)} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 12, textTransform: "uppercase" }}>Contact</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📞 {settings.phone}</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>📧 {settings.email}</div>
            <div style={{ fontSize: 13 }}>📍 {settings.address}</div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20 }}><div style={{ fontSize: 12 }}>© 2026 StaysPlace — Tous droits réservés.</div></div>
      </div>
    </footer>

    {selProp && <Detail p={selProp} onClose={() => setSelProp(null)} rooms={rooms} onRatingUpdate={(id, rating, reviews) => setProperties(ps => ps.map(x => x.id === id ? { ...x, rating, reviews } : x))} />}
  </div>;
}
