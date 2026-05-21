import { useState } from "react";

const MOODS = [
  { label: "All",      icon: "circle" },
  { label: "Relax",    icon: "moon" },
  { label: "Focus",    icon: "bolt" },
  { label: "Social",   icon: "users" },
  { label: "Ceremony", icon: "flame" },
];

export default function MoodPillStrip({ onChange }) {
  const [active, setActive] = useState("All");

  const handleSelect = (label) => {
    setActive(label);
    if (onChange) onChange(label);
  };

  return (
    <div style={styles.row}>
      {MOODS.map(({ label, icon }) => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => handleSelect(label)}
            aria-pressed={isActive}
            style={{
              ...styles.pill,
              ...(isActive ? styles.pillActive : {}),
            }}
          >
            <i
              className={`ti ti-${icon}`}
              aria-hidden="true"
              style={styles.icon}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 13px",
    borderRadius: "999px",
    fontSize: "13px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  pillActive: {
    border: "1px solid rgba(0,0,0,0.4)",
    color: "#111",
    fontWeight: "500",
  },
  icon: {
    fontSize: "14px",
  },
};
