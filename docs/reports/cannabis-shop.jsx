import { useState, useCallback } from "react";

// ── Palette (softened) ──────────────────────────────────────────────────────
const C = {
  bg0:        "#1e1630",   // was #1a0e2e — slightly lifted
  bg1:        "#17122a",   // was #120d20
  bg2:        "#131a28",   // was #0d1520
  card:       "rgba(255,255,255,0.05)",
  cardBorder: "rgba(200,180,230,0.10)",
  cardHover:  "rgba(170,130,220,0.30)",
  header:     "rgba(26,18,44,0.93)",
  headerBord: "rgba(160,120,210,0.18)",
  purple:     "#8a62c2",   // was #7b4fc9 — softer
  purpleBtn:  "rgba(138,98,194,0.28)",
  purpleBord: "rgba(160,120,220,0.45)",
  purpleGrad: "linear-gradient(135deg,#8a62c2,#a880d8)",
  accent:     "#c8a455",   // was #c9a84c — slightly warmer/softer
  text:       "#ddd4ee",   // was #e8e0f0 — just a hair softer
  textDim:    "#8a7aaa",   // was #8a7aa0
  textFaint:  "#6a5e88",   // was #6a5888
  label:      "#7e6aaa",   // was #7b5fa0
  green:      "#5a9e7a",
  greenBord:  "#6ec6a0",
  filterBg:   "rgba(28,18,48,0.97)",
  sliderThumb:"#a880d8",
};

const PRODUCTS = [
  { id:1, name:"Island Breeze Edibles",  mood:"Relax",    category:"Edibles",    price:28, thc:"10mg",      rating:4.8, tag:"Bestseller", desc:"A premium blend for unwinding — tropical flavors, gentle onset.",           img:"https://images.unsplash.com/photo-1587049352847-81a56a612f3b?w=400&q=80" },
  { id:2, name:"Clarity Pre-Roll",        mood:"Focus",    category:"Flower",     price:18, thc:"22%",       rating:4.6, tag:"New",        desc:"Sativa-forward, bright terpene profile. Made for the creative mind.",        img:"https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=400&q=80" },
  { id:3, name:"Golden Hour Tincture",    mood:"Ceremony", category:"Tinctures",  price:54, thc:"1:1",       rating:4.9, tag:"Staff Pick", desc:"Balanced CBD:THC for ritual and reflection. Full-spectrum.",                 img:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80" },
  { id:4, name:"Social Sparkling THC",    mood:"Social",   category:"Beverages",  price:12, thc:"5mg",       rating:4.5, tag:"Limited",   desc:"Microdosed sparkling water. Perfect for every occasion.",                    img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
  { id:5, name:"Deep Forest Flower",      mood:"Relax",    category:"Flower",     price:35, thc:"19%",       rating:4.7, tag:null,        desc:"Earthy indica blend. Hand-trimmed, small-batch grown.",                      img:"https://images.unsplash.com/photo-1606041974734-0a8daf6c5c6e?w=400&q=80" },
  { id:6, name:"Focus Vape Cartridge",    mood:"Focus",    category:"Vapes",      price:45, thc:"85%",       rating:4.4, tag:"New",        desc:"Live resin distillate. Clean, sharp, and precise.",                         img:"https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=400&q=80" },
  { id:7, name:"Ceremony Resin Drops",    mood:"Ceremony", category:"Tinctures",  price:68, thc:"Full Spec", rating:5.0, tag:"Staff Pick", desc:"Sacred blend of rare terpenes. Reserve ceremony edition.",                  img:"https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&q=80" },
  { id:8, name:"Social Gummies",          mood:"Social",   category:"Edibles",    price:22, thc:"5mg",       rating:4.3, tag:null,        desc:"Fruit-forward, low-dose gummies for effortless social ease.",               img:"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80" },
];

const PRICE_MIN = 10;
const PRICE_MAX = 70;
const MOODS       = ["All","Relax","Focus","Social","Ceremony"];
const CATEGORIES  = ["All","Flower","Edibles","Tinctures","Vapes","Beverages"];
const SORT_OPTIONS= ["Featured","Price: Low–High","Price: High–Low","Top Rated","Name A–Z"];
const LAYOUTS     = ["grid2","grid3","list","magazine"];
const MOOD_META   = {
  Relax:    { icon:"◎", desc:"Unwind and find your calm" },
  Focus:    { icon:"◈", desc:"Clarity and creative flow" },
  Social:   { icon:"◇", desc:"Connection and celebration" },
  Ceremony: { icon:"✦", desc:"Ritual and reflection" },
};

// ── tiny helpers ────────────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <span style={{ color: C.accent, fontSize:"11px", letterSpacing:"1px" }}>
    {"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}
    <span style={{ color:C.textDim, marginLeft:4, fontSize:"10px" }}>{rating}</span>
  </span>
);

function TagBadge({ tag }) {
  if (!tag) return null;
  const map = {
    Bestseller: ["#c8a455","rgba(200,164,85,0.14)"],
    New:        ["#6abf98","rgba(106,191,152,0.14)"],
    "Staff Pick":["#c090b0","rgba(192,144,176,0.14)"],
    Limited:    ["#c07878","rgba(192,120,120,0.14)"],
  };
  const [col, bg] = map[tag] || ["#aaa","rgba(170,170,170,0.1)"];
  return (
    <span style={{ fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase",
      background:bg, border:`1px solid ${col}`, color:col,
      padding:"2px 7px", borderRadius:4 }}>{tag}</span>
  );
}

// ── Dual-handle price range slider ─────────────────────────────────────────
function PriceSlider({ min, max, low, high, onChange }) {
  const pct = v => ((v - min) / (max - min)) * 100;

  const handleLow = useCallback(e => {
    const val = Math.min(Number(e.target.value), high - 1);
    onChange(val, high);
  }, [high, onChange]);

  const handleHigh = useCallback(e => {
    const val = Math.max(Number(e.target.value), low + 1);
    onChange(low, val);
  }, [low, onChange]);

  const sliderBase = {
    WebkitAppearance:"none", appearance:"none",
    position:"absolute", width:"100%", height:"100%",
    background:"transparent", outline:"none", cursor:"pointer",
    margin:0, padding:0, pointerEvents:"none",
  };
  const thumbCSS = `
    input[type=range].ps-thumb::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none;
      width:18px; height:18px; border-radius:50%;
      background:${C.sliderThumb}; border:2px solid #fff;
      box-shadow:0 0 6px rgba(168,128,216,0.6);
      pointer-events:all; cursor:grab;
    }
    input[type=range].ps-thumb::-moz-range-thumb {
      width:18px; height:18px; border-radius:50%;
      background:${C.sliderThumb}; border:2px solid #fff;
      box-shadow:0 0 6px rgba(168,128,216,0.6);
      pointer-events:all; cursor:grab;
    }
  `;

  return (
    <div>
      <style>{thumbCSS}</style>
      {/* labels */}
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:"13px", color:C.accent, fontWeight:"bold" }}>${low}</span>
        <span style={{ fontSize:"11px", color:C.textFaint }}>Price range</span>
        <span style={{ fontSize:"13px", color:C.accent, fontWeight:"bold" }}>${high}</span>
      </div>
      {/* track container */}
      <div style={{ position:"relative", height:22, display:"flex", alignItems:"center" }}>
        {/* background rail */}
        <div style={{ position:"absolute", left:0, right:0, height:4, borderRadius:4,
          background:"rgba(255,255,255,0.10)" }} />
        {/* filled segment */}
        <div style={{ position:"absolute", height:4, borderRadius:4,
          background:`linear-gradient(90deg,${C.purple},${C.sliderThumb})`,
          left:`${pct(low)}%`, right:`${100-pct(high)}%` }} />
        {/* low handle */}
        <input type="range" className="ps-thumb" min={min} max={max} value={low}
          onChange={handleLow}
          style={{ ...sliderBase, zIndex: low > max - 10 ? 5 : 3 }} />
        {/* high handle */}
        <input type="range" className="ps-thumb" min={min} max={max} value={high}
          onChange={handleHigh}
          style={{ ...sliderBase, zIndex:4 }} />
      </div>
      {/* tick marks */}
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        {[10,25,40,55,70].map(v => (
          <span key={v} style={{ fontSize:"9px", color:C.textFaint }}>${v}</span>
        ))}
      </div>
    </div>
  );
}

// ── layout toggle icons ─────────────────────────────────────────────────────
const LAYOUT_ICONS = {
  grid2: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="7" height="7"/><rect x="9" y="0" width="7" height="7"/><rect x="0" y="9" width="7" height="7"/><rect x="9" y="9" width="7" height="7"/></svg>,
  grid3: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="4" height="7"/><rect x="6" y="0" width="4" height="7"/><rect x="12" y="0" width="4" height="7"/><rect x="0" y="9" width="4" height="7"/><rect x="6" y="9" width="4" height="7"/><rect x="12" y="9" width="4" height="7"/></svg>,
  list:  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="1" width="16" height="3"/><rect x="0" y="6" width="16" height="3"/><rect x="0" y="11" width="16" height="3"/></svg>,
  magazine: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="9" height="10"/><rect x="11" y="0" width="5" height="4"/><rect x="11" y="6" width="5" height="4"/><rect x="0" y="12" width="16" height="4"/></svg>,
};

// ── main component ──────────────────────────────────────────────────────────
export default function CannabisShop() {
  const [mood,        setMood]        = useState("All");
  const [category,    setCategory]    = useState("All");
  const [sort,        setSort]        = useState("Featured");
  const [layout,      setLayout]      = useState("grid2");
  const [showFilters, setShowFilters] = useState(false);
  const [cart,        setCart]        = useState([]);
  const [added,       setAdded]       = useState(null);
  const [priceLow,    setPriceLow]    = useState(PRICE_MIN);
  const [priceHigh,   setPriceHigh]   = useState(PRICE_MAX);

  const handlePriceChange = useCallback((lo, hi) => {
    setPriceLow(lo);
    setPriceHigh(hi);
  }, []);

  const clearAll = () => {
    setMood("All"); setCategory("All"); setSort("Featured");
    setPriceLow(PRICE_MIN); setPriceHigh(PRICE_MAX);
  };

  const activeFilters = (mood !== "All" ? 1:0) + (category !== "All" ? 1:0)
    + (priceLow > PRICE_MIN || priceHigh < PRICE_MAX ? 1:0);

  const filtered = PRODUCTS
    .filter(p => mood === "All" || p.mood === mood)
    .filter(p => category === "All" || p.category === category)
    .filter(p => p.price >= priceLow && p.price <= priceHigh)
    .sort((a,b) => {
      if (sort === "Price: Low–High")  return a.price - b.price;
      if (sort === "Price: High–Low") return b.price - a.price;
      if (sort === "Top Rated")       return b.rating - a.rating;
      if (sort === "Name A–Z")        return a.name.localeCompare(b.name);
      return 0;
    });

  const addToCart = p => {
    setCart(c => [...c, p]);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div style={{ minHeight:"100vh",
      background:`linear-gradient(160deg,${C.bg0} 0%,${C.bg1} 50%,${C.bg2} 100%)`,
      fontFamily:"'Georgia','Times New Roman',serif", color:C.text }}>

      {/* ── Header ── */}
      <header style={{ position:"sticky", top:0, zIndex:100,
        background:C.header, backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${C.headerBord}`,
        padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:C.label, textTransform:"uppercase" }}>The Pawn Shop</div>
          <div style={{ fontSize:"18px", fontWeight:"bold", color:"#ede6ff", marginTop:2 }}>Cannabis</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => setShowFilters(f => !f)} style={{
            background: showFilters ? "rgba(138,98,194,0.28)" : "rgba(255,255,255,0.05)",
            border:`1px solid ${showFilters ? C.purpleBord : "rgba(255,255,255,0.10)"}`,
            color:C.text, padding:"7px 14px", borderRadius:8,
            cursor:"pointer", fontSize:"12px", letterSpacing:"1px", fontFamily:"inherit",
            display:"flex", alignItems:"center", gap:6,
          }}>
            ⚙ Filters
            {activeFilters > 0 && (
              <span style={{ background:C.purple, borderRadius:10, padding:"1px 6px",
                fontSize:"10px", color:"#fff", fontFamily:"sans-serif" }}>{activeFilters}</span>
            )}
          </button>
          <div style={{ background:"rgba(138,98,194,0.22)", border:`1px solid ${C.purpleBord}`,
            borderRadius:20, padding:"6px 14px", fontSize:"13px", cursor:"pointer", color:C.text }}>
            🛒 {cart.length}
          </div>
        </div>
      </header>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div style={{ background:C.filterBg,
          borderBottom:`1px solid rgba(160,120,210,0.18)`,
          padding:"22px 20px" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column", gap:22 }}>

            {/* Price slider */}
            <div>
              <div style={{ fontSize:"10px", letterSpacing:"2px", color:C.label, marginBottom:14 }}>PRICE RANGE</div>
              <PriceSlider min={PRICE_MIN} max={PRICE_MAX}
                low={priceLow} high={priceHigh} onChange={handlePriceChange} />
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:20 }}>
              {/* Category */}
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:C.label, marginBottom:8 }}>CATEGORY</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{
                      padding:"5px 12px", borderRadius:20,
                      background: category === c ? C.purple : "rgba(255,255,255,0.05)",
                      border:`1px solid ${category === c ? C.sliderThumb : "rgba(255,255,255,0.10)"}`,
                      color: category === c ? "#fff" : C.textDim,
                      cursor:"pointer", fontSize:"12px", fontFamily:"inherit", transition:"all 0.15s",
                    }}>{c}</button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:"10px", letterSpacing:"2px", color:C.label, marginBottom:8 }}>SORT BY</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {SORT_OPTIONS.map(s => (
                    <button key={s} onClick={() => setSort(s)} style={{
                      padding:"5px 12px", borderRadius:20,
                      background: sort === s ? C.purple : "rgba(255,255,255,0.05)",
                      border:`1px solid ${sort === s ? C.sliderThumb : "rgba(255,255,255,0.10)"}`,
                      color: sort === s ? "#fff" : C.textDim,
                      cursor:"pointer", fontSize:"12px", fontFamily:"inherit", transition:"all 0.15s",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear */}
            {activeFilters > 0 && (
              <button onClick={clearAll} style={{
                alignSelf:"flex-start", background:"none",
                border:`1px solid ${C.textFaint}`, color:C.textDim,
                padding:"6px 16px", borderRadius:8, cursor:"pointer",
                fontSize:"12px", fontFamily:"inherit",
              }}>✕ Clear all filters</button>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 20px 60px" }}>

        {/* ── Hero ── */}
        <div style={{ padding:"36px 0 20px" }}>
          <div style={{ fontSize:"clamp(28px,7vw,52px)", lineHeight:1.1, color:"#ede8ff", fontStyle:"italic" }}>
            Wellness,<br />curated.
          </div>
          <p style={{ color:C.textDim, fontSize:"14px", marginTop:12, lineHeight:1.6, maxWidth:400 }}>
            Premium cannabis for every intention — sourced with care, presented with discretion.
          </p>
          <button style={{ marginTop:20, background:C.purpleGrad,
            border:"none", color:"#fff", padding:"12px 28px",
            borderRadius:10, cursor:"pointer", fontSize:"14px",
            fontFamily:"inherit", letterSpacing:"0.5px",
            boxShadow:"0 4px 20px rgba(138,98,194,0.35)" }}>
            Explore collections
          </button>
        </div>

        {/* ── Mood Filter ── */}
        <div style={{ marginTop:28, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <div style={{ fontSize:"20px", color:C.text }}>Shop by mood</div>
            {mood !== "All" && (
              <button onClick={() => setMood("All")} style={{
                background:"none", border:"none", color:C.label,
                cursor:"pointer", fontSize:"12px", fontFamily:"inherit", textDecoration:"underline",
              }}>Clear filter</button>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
            {MOODS.filter(m => m !== "All").map(m => (
              <button key={m} onClick={() => setMood(mood === m ? "All" : m)} style={{
                background: mood === m
                  ? "linear-gradient(135deg,rgba(138,98,194,0.50),rgba(100,60,160,0.35))"
                  : "rgba(255,255,255,0.04)",
                border:`1px solid ${mood === m ? "rgba(168,128,216,0.65)" : "rgba(255,255,255,0.08)"}`,
                borderRadius:14, padding:"14px 16px", textAlign:"left",
                cursor:"pointer", color: mood === m ? "#ede8ff" : C.textDim,
                transition:"all 0.18s", fontFamily:"inherit",
              }}>
                <div style={{ fontSize:"20px", marginBottom:4 }}>{MOOD_META[m].icon}</div>
                <div style={{ fontSize:"16px", marginBottom:4 }}>{m}</div>
                <div style={{ fontSize:"11px", color: mood === m ? "#c8b8e8" : C.textFaint }}>{MOOD_META[m].desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Layout toggle + count ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom:16, paddingBottom:12,
          borderBottom:`1px solid rgba(255,255,255,0.07)` }}>
          <div style={{ fontSize:"12px", color:C.textFaint }}>
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            {mood !== "All" ? ` · ${mood}` : ""}
            {category !== "All" ? ` · ${category}` : ""}
            {(priceLow > PRICE_MIN || priceHigh < PRICE_MAX) ? ` · $${priceLow}–$${priceHigh}` : ""}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {LAYOUTS.map(l => (
              <button key={l} onClick={() => setLayout(l)} title={l} style={{
                width:32, height:32, borderRadius:8, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                background: layout === l ? "rgba(138,98,194,0.35)" : "rgba(255,255,255,0.05)",
                border:`1px solid ${layout === l ? "rgba(168,128,216,0.55)" : "rgba(255,255,255,0.08)"}`,
                color: layout === l ? "#d4c8f0" : C.textFaint,
              }}>{LAYOUT_ICONS[l]}</button>
            ))}
          </div>
        </div>

        {/* ── Product grids ── */}
        {layout === "grid2" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {filtered.map(p => <Card2 key={p.id} p={p} added={added} addToCart={addToCart} />)}
          </div>
        )}
        {layout === "grid3" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {filtered.map(p => <Card3 key={p.id} p={p} added={added} addToCart={addToCart} />)}
          </div>
        )}
        {layout === "list" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(p => <CardList key={p.id} p={p} added={added} addToCart={addToCart} />)}
          </div>
        )}
        {layout === "magazine" && (
          <MagazineLayout products={filtered} added={added} addToCart={addToCart} />
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.textFaint }}>
            <div style={{ fontSize:"32px", marginBottom:12 }}>◎</div>
            <div style={{ marginBottom:16 }}>No products match your filters.</div>
            <button onClick={clearAll} style={{
              background:"none", border:`1px solid ${C.textFaint}`,
              color:C.textDim, padding:"8px 20px", borderRadius:8,
              cursor:"pointer", fontFamily:"inherit",
            }}>Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card components ─────────────────────────────────────────────────────────
function Card2({ p, added, addToCart }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`,
      borderRadius:16, overflow:"hidden", transition:"transform 0.2s,border-color 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=C.cardHover; }}
      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor=C.cardBorder; }}>
      <div style={{ height:160, background:`url(${p.img}) center/cover`, position:"relative" }}>
        <div style={{ position:"absolute", top:8, left:8 }}><TagBadge tag={p.tag} /></div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%",
          background:"linear-gradient(to top,rgba(20,12,36,0.88),transparent)" }} />
        <div style={{ position:"absolute", bottom:8, right:8, fontSize:"11px", color:C.accent }}>{p.thc}</div>
      </div>
      <div style={{ padding:"12px 14px 14px" }}>
        <div style={{ fontSize:"9px", letterSpacing:"2px", color:C.label, textTransform:"uppercase", marginBottom:4 }}>
          {p.mood} · {p.category}
        </div>
        <div style={{ fontSize:"15px", color:"#ede8ff", lineHeight:1.2, marginBottom:6 }}>{p.name}</div>
        <Stars rating={p.rating} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:12 }}>
          <span style={{ fontSize:"18px", color:C.accent, fontWeight:"bold" }}>${p.price}</span>
          <AddBtn id={p.id} added={added} onClick={() => addToCart(p)} size="sm" />
        </div>
      </div>
    </div>
  );
}

function Card3({ p, added, addToCart }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ height:110, background:`url(${p.img}) center/cover`, position:"relative" }}>
        {p.tag && <div style={{ position:"absolute", top:6, left:6 }}><TagBadge tag={p.tag} /></div>}
      </div>
      <div style={{ padding:"10px 12px" }}>
        <div style={{ fontSize:"8px", letterSpacing:"1.5px", color:C.label, marginBottom:3 }}>{p.mood}</div>
        <div style={{ fontSize:"13px", color:"#ede8ff", lineHeight:1.2, marginBottom:8 }}>{p.name}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"15px", color:C.accent }}>${p.price}</span>
          <AddBtn id={p.id} added={added} onClick={() => addToCart(p)} size="xs" />
        </div>
      </div>
    </div>
  );
}

function CardList({ p, added, addToCart }) {
  return (
    <div style={{ display:"flex", gap:16, alignItems:"center",
      background:C.card, border:`1px solid ${C.cardBorder}`,
      borderRadius:14, overflow:"hidden", padding:"0 16px 0 0" }}>
      <div style={{ width:90, height:90, flexShrink:0, background:`url(${p.img}) center/cover` }} />
      <div style={{ flex:1, minWidth:0, padding:"4px 0" }}>
        <div style={{ display:"flex", gap:6, marginBottom:4, alignItems:"center" }}>
          <span style={{ fontSize:"8px", letterSpacing:"1.5px", color:C.label }}>{p.mood} · {p.category}</span>
          <TagBadge tag={p.tag} />
        </div>
        <div style={{ fontSize:"15px", color:"#ede8ff" }}>{p.name}</div>
        <div style={{ fontSize:"11px", color:C.textFaint, marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.desc}</div>
        <Stars rating={p.rating} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
        <span style={{ fontSize:"18px", color:C.accent }}>${p.price}</span>
        <AddBtn id={p.id} added={added} onClick={() => addToCart(p)} size="sm" />
      </div>
    </div>
  );
}

function MagazineLayout({ products, added, addToCart }) {
  if (!products.length) return null;
  const [hero, ...rest] = products;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ position:"relative", borderRadius:18, overflow:"hidden", height:270,
        background:`url(${hero.img}) center/cover` }}>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to top,rgba(14,8,26,0.94) 0%,rgba(14,8,26,0.28) 60%,transparent 100%)" }} />
        <div style={{ position:"absolute", top:14, left:14, display:"flex", gap:8 }}>
          <TagBadge tag={hero.tag} />
          <span style={{ fontSize:"9px", letterSpacing:"2px", color:"#b8a0d8",
            background:"rgba(0,0,0,0.38)", padding:"2px 8px", borderRadius:4 }}>{hero.mood}</span>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:20 }}>
          <div style={{ fontSize:"10px", letterSpacing:"2px", color:"#9e8ac0", marginBottom:6 }}>{hero.category} · {hero.thc}</div>
          <div style={{ fontSize:"24px", color:"#ede8ff", fontStyle:"italic", lineHeight:1.1 }}>{hero.name}</div>
          <div style={{ fontSize:"12px", color:C.textDim, marginTop:6, marginBottom:14 }}>{hero.desc}</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:"24px", color:C.accent }}>${hero.price}</span>
            <AddBtn id={hero.id} added={added} onClick={() => addToCart(hero)} size="lg" />
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {rest.map(p => <Card2 key={p.id} p={p} added={added} addToCart={addToCart} />)}
      </div>
    </div>
  );
}

// ── Shared add button ───────────────────────────────────────────────────────
function AddBtn({ id, added, onClick, size }) {
  const isAdded = added === id;
  const pad = size === "xs" ? "4px 10px" : size === "lg" ? "10px 26px" : "6px 14px";
  const fs  = size === "xs" ? "10px" : size === "lg" ? "13px" : "11px";
  return (
    <button onClick={onClick} style={{
      background: isAdded ? C.green : C.purpleBtn,
      border:`1px solid ${isAdded ? C.greenBord : C.purpleBord}`,
      color:"#fff", padding:pad, borderRadius:8,
      cursor:"pointer", fontSize:fs, fontFamily:"inherit", transition:"all 0.18s",
    }}>
      {size === "xs"
        ? (isAdded ? "✓" : "+")
        : (isAdded ? "Added ✓" : size === "lg" ? "Add to Cart" : "Add")}
    </button>
  );
}
