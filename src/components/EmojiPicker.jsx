import React, { useState } from "react";
import { Smile, Trees, Plane, Coffee, Award, Heart } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    id: "popular",
    label: "Popular",
    icon: Smile,
    emojis: ["📦", "⏳", "✨", "🌊", "🎓", "🌸", "🚙", "📸", "💌", "🏔️", "☕", "🍕", "🎉", "🔥", "🌅", "🌙", "🌴", "🎨"]
  },
  {
    id: "nature",
    label: "Nature",
    icon: Trees,
    emojis: ["🌲", "🍂", "🌻", "🌿", "🌊", "🏔️", "🌋", "🌸", "🍁", "🍄", "🌺", "🌅", "🪐", "⭐", "🌈", "☀️", "❄️", "⚡"]
  },
  {
    id: "travel",
    label: "Travel",
    icon: Plane,
    emojis: ["🚙", "✈️", "🚀", "🚂", "🚲", "⛵", "⛺", "🏖️", "🗽", "🗼", "⛩️", "🏰", "🗺️", "🧳", "🧭", "🏙️", "🛣️", "🏜️"]
  },
  {
    id: "food",
    label: "Food",
    icon: Coffee,
    emojis: ["☕", "🍵", "🍕", "🍔", "🍣", "🍜", "🍦", "🍩", "🍷", "🥂", "🍓", "🥑", "🥐", "🍰", "🍻", "🌮", "🍿", "🍎"]
  },
  {
    id: "objects",
    label: "Objects",
    icon: Award,
    emojis: ["📦", "⏳", "📸", "🎥", "📖", "✉️", "💎", "🔑", "💡", "🎙️", "🎸", "🎧", "🕹️", "🕰️", "🔮", "🔭", "🕯️", "🏷️"]
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: Heart,
    emojis: ["❤️", "💖", "✨", "🕊️", "💫", "🔥", "🌟", "🍀", "🧿", "🤍", "🖤", "💯", "🎯", "⚓", "⚡", "🌙", "☀️", "♾️"]
  }
];

export default function EmojiPicker({ selectedEmoji, onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("popular");
  const [search, setSearch] = useState("");

  const currentCategory = EMOJI_CATEGORIES.find((c) => c.id === activeTab) || EMOJI_CATEGORIES[0];
  
  const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  const displayEmojis = search.trim()
    ? allEmojis.filter((e) => e.includes(search))
    : currentCategory.emojis;

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        left: "0",
        width: "320px",
        background: "var(--notion-card-bg)",
        border: "1px solid var(--notion-border-strong)",
        borderRadius: "var(--notion-radius-md)",
        boxShadow: "var(--notion-shadow-lg)",
        zIndex: 50,
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="text"
          placeholder="Filter emojis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="notion-input"
          style={{ padding: "4px 8px", fontSize: "12.5px" }}
          autoFocus
        />
        {onClose && (
          <button
            onClick={onClose}
            className="notion-icon-btn"
            style={{ padding: "4px 6px", fontSize: "11px" }}
          >
            ✕
          </button>
        )}
      </div>

      {!search && (
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--notion-border)", paddingBottom: "6px" }}>
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                title={cat.label}
                style={{
                  padding: "4px 6px",
                  borderRadius: "var(--notion-radius-sm)",
                  background: isActive ? "var(--notion-hover)" : "transparent",
                  color: isActive ? "var(--notion-text)" : "var(--notion-text-muted)"
                }}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "4px",
          maxHeight: "180px",
          overflowY: "auto",
          padding: "4px 0"
        }}
      >
        {displayEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            onClick={() => {
              onSelect(emoji);
              if (onClose) onClose();
            }}
            style={{
              fontSize: "22px",
              padding: "6px",
              borderRadius: "var(--notion-radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: selectedEmoji === emoji ? "var(--notion-accent-bg)" : "transparent",
              transition: "transform 0.1s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
