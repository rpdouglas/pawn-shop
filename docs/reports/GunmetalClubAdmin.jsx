import { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bgBase:         "#2A2D35",
  bgSurface:      "#32363F",
  bgElevated:     "#3D4149",
  bgHover:        "#454951",
  textPrimary:    "#F0EDE8",
  textSecondary:  "#BDB9B3",
  textMuted:      "#9B9FA8",
  textDisabled:   "#5C6270",
  goldPrimary:    "#C8A14A",
  goldDim:        "#8B6E32",
  goldSubtle:     "#3A3020",
  borderDefault:  "#454951",
  borderStrong:   "#6B7280",
  active:         "#4CAF7D",
  activeBg:       "#1E3D2F",
  reserved:       "#5B9BD5",
  reservedBg:     "#1A2E44",
  hold:           "#E57373",
  holdBg:         "#3D1A1A",
};

const FONT = {
  display: "'Georgia', serif",
  body:    "'Arial', sans-serif",
  mono:    "'Courier New', monospace",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ITEMS = [
  { id: 1, title: 'DeWalt D28715 14" Chop Saw',                    price: 200, status: "ACTIVE",   tag: "NEW",  vertical: "Pawn",     sku: "PWN-00421" },
  { id: 2, title: 'DeWalt D25263K 1-1/8" SDS Plus Rotary Hammer', price: 150, status: "ACTIVE",   tag: "NEW",  vertical: "Pawn",     sku: "PWN-00420" },
  { id: 3, title: 'DeWalt DWE575 7-1/4 in. Circular Saw',         price: 120, status: "ACTIVE",   tag: "USED", vertical: "Pawn",     sku: "PWN-00419" },
  { id: 4, title: 'Fender Player Stratocaster — Sunburst',         price: 650, status: "RESERVED", tag: "USED", vertical: "Pawn",     sku: "PWN-00418" },
  { id: 5, title: 'Apple iPad Pro 12.9" M2 256GB',                 price: 480, status: "ACTIVE",   tag: "NEW",  vertical: "Pawn",     sku: "PWN-00417" },
  { id: 6, title: 'Milwaukee M18 Fuel Drill/Driver Kit',           price: 185, status: "ACTIVE",   tag: "USED", vertical: "Pawn",     sku: "PWN-00416" },
  { id: 7, title: 'Sony WH-1000XM5 Headphones',                   price: 220, status: "ACTIVE",   tag: "NEW",  vertical: "Pawn",     sku: "PWN-00415" },
  { id: 8, title: 'Yamaha P-45 Digital Piano',                     price: 310, status: "ACTIVE",   tag: "USED", vertical: "Pawn",     sku: "PWN-00414" },
];

const STATS = [
  { label: "Active",       value: 53, color: T.goldPrimary },
  { label: "Sold",         value: 0,  color: T.textMuted   },
  { label: "Reserved",     value: 2,  color: T.reserved    },
  { label: "Police Hold",  value: 0,  color: T.textMuted   },
];

const VERTICALS = ["Pawn", "Cannabis", "Fireworks", "Tobacco"];

const NAV_ITEMS = [
  { id: "inventory",  label: "Inventory", icon: "🏷" },
  { id: "add",        label: "Add Item",  icon: "📷" },
  { id: "customers",  label: "Customers", icon: "👥" },
  { id: "dashboard",  label: "Dashboard", icon: "📊" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    ACTIVE:   { fg: T.active,   bg: T.activeBg   },
    RESERVED: { fg: T.reserved, bg: T.reservedBg },
    HOLD:     { fg: T.hold,     bg: T.holdBg     },
    DRAFT:    { fg: T.textMuted,bg: T.bgBase      },
    NEW:      { fg: T.goldPrimary, bg: T.goldSubtle },
    USED:     { fg: T.textMuted,   bg: T.bgElevated },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 9999,
      background: s.bg,
      color: s.fg,
      fontFamily: FONT.body,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.10em",
    }}>
      {status}
    </span>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onEdit }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.bgElevated : T.bgSurface,
        border: `1px solid ${hovered ? T.borderStrong : T.borderDefault}`,
        borderRadius: 8,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        transition: "all 0.15s ease",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.35)" : "none",
        cursor: "default",
      }}
    >
      {/* Thumbnail placeholder */}
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 6,
        background: T.bgHover,
        border: `1px solid ${T.borderDefault}`,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
      }}>
        🔧
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT.body,
          fontSize: 13,
          fontWeight: 600,
          color: T.textPrimary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 6,
        }}>
          {item.title}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT.display, fontSize: 14, color: T.goldPrimary, fontWeight: 700 }}>
            ${item.price}.00
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize: 10, color: T.textMuted }}>CAD</span>
          <Badge status={item.status} />
          <Badge status={item.tag} />
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: T.textDisabled, marginTop: 4 }}>
          {item.sku}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(item)}
          style={{
            padding: "4px 12px",
            border: `1px solid ${T.goldDim}`,
            borderRadius: 4,
            background: "transparent",
            color: T.goldPrimary,
            fontFamily: FONT.body,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.goldSubtle; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          EDIT
        </button>
        <button style={{
          padding: "4px 12px",
          border: `1px solid ${T.borderDefault}`,
          borderRadius: 4,
          background: "transparent",
          color: T.textMuted,
          fontFamily: FONT.body,
          fontSize: 10,
          letterSpacing: "0.06em",
          cursor: "pointer",
        }}>
          HOLD
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView() {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 400, color: T.textPrimary, margin: "0 0 4px" }}>
          Dashboard
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: 12, color: T.textMuted, margin: 0, letterSpacing: "0.02em" }}>
          Live inventory snapshot · The Pawn Shop · v26.06.13-7174baf
        </p>
      </div>

      {/* Vertical selector */}
      <p style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>
        Vertical
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {VERTICALS.map((v, i) => (
          <button key={v} style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: `1px solid ${i === 0 ? T.goldDim : T.borderDefault}`,
            background: i === 0 ? T.goldSubtle : "transparent",
            color: i === 0 ? T.goldPrimary : T.textMuted,
            fontFamily: FONT.body,
            fontSize: 11,
            fontWeight: i === 0 ? 700 : 400,
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}>
            {v}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <p style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>
        Inventory Status
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: T.bgSurface,
            border: `1px solid ${T.borderDefault}`,
            borderRadius: 8,
            padding: "16px 12px",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: FONT.display, fontSize: 36, color: s.color, lineHeight: 1, fontWeight: s.value > 0 ? 700 : 400 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textMuted, marginTop: 6 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <p style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 10px" }}>
        Quick Actions
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Manage Returns & Disputes →", accent: true },
          { label: "Run Police Hold Report →",    accent: false },
          { label: "Export Inventory CSV →",      accent: false },
        ].map(a => (
          <button key={a.label} style={{
            padding: "12px 16px",
            background: T.bgSurface,
            border: `1px solid ${a.accent ? T.goldDim : T.borderDefault}`,
            borderRadius: 6,
            color: a.accent ? T.goldPrimary : T.textSecondary,
            fontFamily: FONT.body,
            fontSize: 13,
            textAlign: "left",
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Add Item View ────────────────────────────────────────────────────────────
function AddItemView() {
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: T.bgElevated,
    border: `1px solid ${T.borderDefault}`,
    borderRadius: 6,
    color: T.textPrimary,
    fontFamily: FONT.body,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    marginBottom: 12,
  };

  const labelStyle = {
    fontFamily: FONT.body,
    fontSize: 11,
    color: T.textMuted,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 5,
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 400, color: T.textPrimary, margin: "0 0 4px" }}>
            New Item
          </h1>
          <p style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted, margin: 0, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Step 1 of 3 — Details
          </p>
        </div>
        <button style={{
          width: 30, height: 30,
          borderRadius: "50%",
          border: `1px solid ${T.borderDefault}`,
          background: "transparent",
          color: T.textMuted,
          fontSize: 16,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Photo upload area */}
      <div style={{
        border: `1px dashed ${T.goldDim}`,
        borderRadius: 8,
        padding: "28px 20px",
        textAlign: "center",
        marginBottom: 20,
        background: T.goldSubtle,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
        <p style={{ fontFamily: FONT.body, fontSize: 13, color: T.goldPrimary, margin: "0 0 4px", fontWeight: 600 }}>
          Take Photo
        </p>
        <p style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted, margin: 0 }}>
          or Choose from Library
        </p>
      </div>

      {/* AI toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: T.bgSurface,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 6,
        marginBottom: 20,
      }}>
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: T.goldPrimary,
          position: "relative", flexShrink: 0,
        }}>
          <div style={{
            position: "absolute", right: 3, top: 3,
            width: 14, height: 14, borderRadius: "50%", background: T.bgBase,
          }} />
        </div>
        <div>
          <div style={{ fontFamily: FONT.body, fontSize: 12, color: T.textPrimary, fontWeight: 600 }}>
            ✨ Auto-fill with AI
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 11, color: T.textMuted }}>
            AI fills title, description & pricing from photo
          </div>
        </div>
      </div>

      <label style={labelStyle}>Vertical</label>
      <select style={{ ...inputStyle, marginBottom: 16, appearance: "none" }}>
        {VERTICALS.map(v => <option key={v}>{v}</option>)}
      </select>

      <label style={labelStyle}>Item Title</label>
      <input placeholder="e.g. DeWalt D28715 14″ Chop Saw" style={inputStyle} />

      <label style={labelStyle}>Price (CAD)</label>
      <input placeholder="0.00" style={inputStyle} />

      <label style={labelStyle}>Condition</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["New", "Used", "Refurbished"].map((c, i) => (
          <button key={c} style={{
            flex: 1,
            padding: "8px",
            border: `1px solid ${i === 1 ? T.goldDim : T.borderDefault}`,
            borderRadius: 4,
            background: i === 1 ? T.goldSubtle : "transparent",
            color: i === 1 ? T.goldPrimary : T.textMuted,
            fontFamily: FONT.body,
            fontSize: 12,
            cursor: "pointer",
          }}>
            {c}
          </button>
        ))}
      </div>

      <button style={{
        width: "100%",
        padding: "13px",
        background: T.goldPrimary,
        border: "none",
        borderRadius: 6,
        color: T.bgBase,
        fontFamily: FONT.body,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: "pointer",
      }}>
        NEXT →
      </button>
    </div>
  );
}

// ─── Customers View ───────────────────────────────────────────────────────────
function CustomersView() {
  const customers = [
    { name: "J. Morrison",  visits: 12, last: "Jun 13", flag: false },
    { name: "T. Swanson",   visits: 4,  last: "Jun 10", flag: false },
    { name: "R. Beaumont",  visits: 7,  last: "Jun 8",  flag: true  },
    { name: "A. Lazare",    visits: 2,  last: "Jun 5",  flag: false },
    { name: "D. Thompson",  visits: 19, last: "Jun 1",  flag: false },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 400, color: T.textPrimary, margin: "0 0 4px" }}>
          Customers
        </h1>
        <p style={{ fontFamily: FONT.body, fontSize: 12, color: T.textMuted, margin: 0 }}>
          {customers.length} registered
        </p>
      </div>

      <input placeholder="Search customers…" style={{
        width: "100%",
        padding: "10px 12px",
        background: T.bgElevated,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 6,
        color: T.textPrimary,
        fontFamily: FONT.body,
        fontSize: 14,
        boxSizing: "border-box",
        outline: "none",
        marginBottom: 16,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {customers.map(c => (
          <div key={c.name} style={{
            background: T.bgSurface,
            border: `1px solid ${c.flag ? T.hold : T.borderDefault}`,
            borderRadius: 8,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: c.flag ? T.holdBg : T.bgElevated,
              border: `2px solid ${c.flag ? T.hold : T.borderDefault}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FONT.body, fontSize: 13, fontWeight: 700,
              color: c.flag ? T.hold : T.textSecondary,
              flexShrink: 0,
            }}>
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                {c.name} {c.flag && <span style={{ color: T.hold, fontSize: 11 }}>⚠ Flagged</span>}
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 10, color: T.textMuted, marginTop: 2 }}>
                {c.visits} visits · Last seen {c.last}
              </div>
            </div>
            <button style={{
              padding: "4px 10px",
              border: `1px solid ${T.borderDefault}`,
              borderRadius: 4,
              background: "transparent",
              color: T.textMuted,
              fontFamily: FONT.body,
              fontSize: 10,
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}>
              VIEW
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inventory View ───────────────────────────────────────────────────────────
function InventoryView({ onEdit }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filters = ["All", "Active", "Reserved", "Draft"];

  const filtered = ITEMS.filter(item => {
    const matchFilter = filter === "All" || item.status === filter.toUpperCase();
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.sku.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ padding: "20px" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 400, color: T.textPrimary, margin: "0 0 4px" }}>
            Inventory
          </h1>
          <p style={{ fontFamily: FONT.body, fontSize: 12, color: T.textMuted, margin: 0 }}>
            {filtered.length} of {ITEMS.length} items · Pawn
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        display: "flex",
        background: T.bgSurface,
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            flex: 1,
            padding: "10px 8px",
            textAlign: "center",
            borderRight: i < 3 ? `1px solid ${T.borderDefault}` : "none",
          }}>
            <div style={{ fontFamily: FONT.display, fontSize: 22, color: s.value > 0 ? s.color : T.textDisabled, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input
          placeholder="Search items or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            background: T.bgElevated,
            border: `1px solid ${T.borderDefault}`,
            borderRadius: 6,
            color: T.textPrimary,
            fontFamily: FONT.body,
            fontSize: 14,
            boxSizing: "border-box",
            outline: "none",
          }}
        />
        <span style={{ position: "absolute", left: 12, top: 11, color: T.textMuted, fontSize: 14, pointerEvents: "none" }}>🔍</span>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px",
              borderRadius: 4,
              border: `1px solid ${filter === f ? T.goldDim : T.borderDefault}`,
              background: filter === f ? T.goldSubtle : "transparent",
              color: filter === f ? T.goldPrimary : T.textMuted,
              fontFamily: FONT.body,
              fontSize: 11,
              fontWeight: filter === f ? 700 : 400,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ width: 3, height: 14, background: T.goldPrimary, borderRadius: 2 }} />
        <span style={{ fontFamily: FONT.body, fontSize: 11, color: T.goldPrimary, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Pawn · {filtered.length} items
        </span>
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: "32px 20px",
            textAlign: "center",
            background: T.bgSurface,
            border: `1px dashed ${T.borderDefault}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
            <p style={{ fontFamily: FONT.body, fontSize: 13, color: T.textMuted, margin: 0 }}>
              No items match "{search}"
            </p>
          </div>
        ) : (
          filtered.map(item => <ItemCard key={item.id} item={item} onEdit={onEdit} />)
        )}
      </div>
    </div>
  );
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
function EditDrawer({ item, onClose }) {
  if (!item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 40,
        }}
      />
      {/* Drawer */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: T.bgSurface,
        borderTop: `2px solid ${T.goldPrimary}`,
        borderRadius: "16px 16px 0 0",
        padding: "20px 20px 40px",
        zIndex: 50,
        maxHeight: "80vh",
        overflowY: "auto",
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: T.borderStrong,
          margin: "0 auto 20px",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: FONT.body, fontSize: 10, color: T.goldPrimary, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
              Editing
            </div>
            <h2 style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 400, color: T.textPrimary, margin: 0 }}>
              {item.title.length > 32 ? item.title.slice(0, 32) + "…" : item.title}
            </h2>
            <div style={{ fontFamily: FONT.mono, fontSize: 10, color: T.textDisabled, marginTop: 4 }}>{item.sku}</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `1px solid ${T.borderDefault}`,
            background: "transparent", color: T.textMuted,
            fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Fields */}
        {[
          { label: "Price (CAD)", value: `${item.price}.00` },
          { label: "SKU",         value: item.sku },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ fontFamily: FONT.body, fontSize: 10, color: T.textMuted, letterSpacing: "0.10em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
              {f.label}
            </label>
            <input defaultValue={f.value} style={{
              width: "100%",
              padding: "10px 12px",
              background: T.bgElevated,
              border: `1px solid ${T.borderDefault}`,
              borderRadius: 6,
              color: T.textPrimary,
              fontFamily: FONT.mono,
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
            }} />
          </div>
        ))}

        {/* Status select */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: FONT.body, fontSize: 10, color: T.textMuted, letterSpacing: "0.10em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Status
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["ACTIVE", "RESERVED", "DRAFT"].map(s => (
              <button key={s} style={{
                flex: 1, padding: "8px 4px",
                border: `1px solid ${item.status === s ? T.goldDim : T.borderDefault}`,
                borderRadius: 4,
                background: item.status === s ? T.goldSubtle : "transparent",
                color: item.status === s ? T.goldPrimary : T.textMuted,
                fontFamily: FONT.body, fontSize: 10,
                fontWeight: item.status === s ? 700 : 400,
                letterSpacing: "0.08em", cursor: "pointer",
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div style={{
          borderTop: `1px solid ${T.borderDefault}`,
          paddingTop: 16,
          display: "flex",
          gap: 8,
        }}>
          <button style={{
            flex: 1, padding: "11px",
            background: T.goldPrimary, border: "none", borderRadius: 6,
            color: T.bgBase, fontFamily: FONT.body, fontSize: 12,
            fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
          }}>
            SAVE CHANGES
          </button>
          <button style={{
            padding: "11px 16px",
            background: "transparent",
            border: `1px solid ${T.hold}`,
            borderRadius: 6,
            color: T.hold,
            fontFamily: FONT.body, fontSize: 12,
            letterSpacing: "0.06em", cursor: "pointer",
          }}>
            DELETE
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function GunmetalClubAdmin() {
  const [activeNav, setActiveNav] = useState("inventory");
  const [editItem, setEditItem]   = useState(null);

  const views = {
    inventory: <InventoryView onEdit={setEditItem} />,
    add:       <AddItemView />,
    customers: <CustomersView />,
    dashboard: <DashboardView />,
  };

  return (
    <div style={{
      background: T.bgBase,
      minHeight: "100vh",
      color: T.textPrimary,
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      fontFamily: FONT.body,
    }}>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: T.bgSurface,
        borderBottom: `1px solid ${T.borderDefault}`,
        padding: "11px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: T.goldPrimary, borderRadius: 2 }} />
          <span style={{ fontFamily: FONT.display, fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", color: T.textPrimary }}>
            The Pawn Shop
          </span>
          <span style={{ fontFamily: FONT.body, fontSize: 10, color: T.textMuted, letterSpacing: "0.10em" }}>
            · Akwesasne
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Live dot */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.active }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 9, color: T.textMuted, letterSpacing: "0.08em" }}>LIVE</span>
          </div>
          {/* Bell */}
          <button style={{
            width: 30, height: 30, borderRadius: "50%",
            border: `1px solid ${T.borderDefault}`,
            background: "transparent",
            color: T.textMuted, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            🔔
          </button>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: T.goldPrimary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: FONT.body, fontWeight: 700, fontSize: 11, color: T.bgBase,
          }}>
            RP
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ paddingBottom: 80, overflowY: "auto" }}>
        {views[activeNav]}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: T.bgSurface,
        borderTop: `1px solid ${T.borderDefault}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 16px",
        zIndex: 20,
      }}>
        {NAV_ITEMS.map(nav => (
          <button
            key={nav.id}
            onClick={() => setActiveNav(nav.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: activeNav === nav.id ? T.goldPrimary : T.textMuted,
              padding: "0 12px",
              transition: "color 0.12s",
            }}
          >
            <span style={{ fontSize: 20 }}>{nav.icon}</span>
            <span style={{
              fontFamily: FONT.body,
              fontSize: 10,
              letterSpacing: "0.08em",
              fontWeight: activeNav === nav.id ? 700 : 400,
            }}>
              {nav.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── FAB (inventory only) ── */}
      {activeNav === "inventory" && (
        <button
          onClick={() => setActiveNav("add")}
          style={{
            position: "fixed",
            bottom: 76,
            right: "calc(50% - 228px)",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: T.goldPrimary,
            border: "none",
            color: T.bgBase,
            fontSize: 24,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 4px 16px rgba(200,161,74,0.4)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 25,
          }}
        >
          +
        </button>
      )}

      {/* ── Edit drawer ── */}
      <EditDrawer item={editItem} onClose={() => setEditItem(null)} />
    </div>
  );
}
