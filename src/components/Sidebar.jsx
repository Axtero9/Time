import React, { useState } from "react";
import {
  ChevronsLeft,
  Plus,
  Search,
  Lock,
  Sun,
  Moon,
  Type,
  Box,
  Sparkles,
  X,
  LogOut,
  LogIn
} from "lucide-react";

export default function Sidebar({
  boxes,
  activeBoxId,
  onSelectBox,
  onOpenCreateModal,
  onOpenAuthModal,
  onSignOut,
  currentUser,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
  fontTheme,
  onChangeFontTheme
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // "all", "locked", "unlocked"

  const filteredBoxes = boxes.filter((box) => {
    const matchesSearch = box.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === "locked") return matchesSearch && box.status === "locked";
    if (filterMode === "unlocked") return matchesSearch && box.status === "unlocked";
    return matchesSearch;
  });

  const lockedBoxes = filteredBoxes.filter((b) => b.status === "locked");
  const unlockedBoxes = filteredBoxes.filter((b) => b.status === "unlocked");

  const userName =
    currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Guest";

  return (
    <aside className={`notion-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Workspace Switcher Header */}
      <div className="notion-sidebar-header">
        <button
          className="notion-workspace-btn"
          onClick={!currentUser ? onOpenAuthModal : undefined}
          title={currentUser ? `Logged in as ${currentUser.email}` : "Click to sign in"}
        >
          <span className="notion-workspace-icon">⏳</span>
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              Time Moves Slow
            </span>
            <span style={{ fontSize: "11px", color: "var(--notion-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              {currentUser ? `👤 ${userName}` : "🔑 Sign in"}
            </span>
          </div>
        </button>

        {/* Close button on mobile / Collapse on desktop */}
        <button
          onClick={onToggleCollapse}
          className="notion-sidebar-action-btn mobile-close-btn"
          title="Close sidebar"
        >
          <X size={16} className="show-mobile-only" />
          <ChevronsLeft size={16} className="hide-mobile-only" />
        </button>
      </div>

      {/* Quick Search & Actions */}
      <div className="notion-sidebar-nav">
        <div style={{ position: "relative", marginBottom: "4px" }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--notion-text-muted)"
            }}
          />
          <input
            type="text"
            placeholder="Search memory boxes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="notion-input"
            style={{
              padding: "4px 8px 4px 26px",
              fontSize: "12.5px",
              height: "30px"
            }}
          />
        </div>

        <button
          className="notion-nav-item"
          onClick={() => {
            setFilterMode("all");
          }}
        >
          <Box size={14} />
          <span>All Capsules</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--notion-text-light)" }}>
            {boxes.length}
          </span>
        </button>

        <button
          className="notion-nav-item"
          onClick={() => {
            onOpenCreateModal();
          }}
          style={{ color: "var(--notion-accent)", fontWeight: 600 }}
        >
          <Plus size={14} />
          <span>Create New Box</span>
        </button>
      </div>

      {/* Filter Chips */}
      {boxes.length > 0 && (
        <div style={{ display: "flex", gap: "4px", padding: "4px 12px", borderBottom: "1px solid var(--notion-border)", paddingBottom: "8px" }}>
          <button
            onClick={() => setFilterMode("all")}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "3px",
              background: filterMode === "all" ? "var(--notion-active)" : "transparent",
              color: filterMode === "all" ? "var(--notion-text)" : "var(--notion-text-muted)"
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode("locked")}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "3px",
              background: filterMode === "locked" ? "var(--notion-active)" : "transparent",
              color: filterMode === "locked" ? "var(--notion-text)" : "var(--notion-text-muted)"
            }}
          >
            🔒 Sealed ({boxes.filter(b => b.status === "locked").length})
          </button>
          <button
            onClick={() => setFilterMode("unlocked")}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "3px",
              background: filterMode === "unlocked" ? "var(--notion-active)" : "transparent",
              color: filterMode === "unlocked" ? "var(--notion-text)" : "var(--notion-text-muted)"
            }}
          >
            🔓 Unlocked ({boxes.filter(b => b.status === "unlocked").length})
          </button>
        </div>
      )}

      {/* Locked Capsules Section */}
      <div className="notion-sidebar-section">
        <div className="notion-sidebar-section-header">
          <span>🔒 Sealed Vaults ({lockedBoxes.length})</span>
          <button
            onClick={onOpenCreateModal}
            className="notion-sidebar-action-btn"
            title="Create a new box"
          >
            <Plus size={12} />
          </button>
        </div>

        <div className="notion-sidebar-items-list">
          {lockedBoxes.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "11.5px", color: "var(--notion-text-light)", fontStyle: "italic" }}>
              No sealed boxes yet.
            </div>
          ) : (
            lockedBoxes.map((box) => {
              const isActive = box.id === activeBoxId;
              const agreedCount = box.members?.filter((m) => m.agreedToEarlyUnlock).length || 0;
              return (
                <button
                  key={box.id}
                  onClick={() => onSelectBox(box.id)}
                  className={`notion-page-item ${isActive ? "active" : ""}`}
                >
                  <div className="notion-page-item-left">
                    <span style={{ fontSize: "14px" }}>{box.emoji || "📦"}</span>
                    <span className="notion-page-item-title">{box.name}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {box.mode === "shared" && (
                      <span
                        title={`${agreedCount}/${box.members?.length || 1} agreed to unlock`}
                        style={{
                          fontSize: "10px",
                          padding: "1px 4px",
                          borderRadius: "3px",
                          background: agreedCount === (box.members?.length || 1) ? "var(--tag-green)" : "var(--notion-hover)",
                          color: agreedCount === (box.members?.length || 1) ? "var(--tag-green-text)" : "var(--notion-text-muted)"
                        }}
                      >
                        {agreedCount}/{box.members?.length || 1} 🗳️
                      </span>
                    )}
                    <Lock size={11} style={{ color: "var(--notion-text-light)" }} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Unlocked / Curated Section */}
      <div className="notion-sidebar-section" style={{ marginTop: "16px" }}>
        <div className="notion-sidebar-section-header">
          <span>✨ Unlocked & Curated ({unlockedBoxes.length})</span>
        </div>

        <div className="notion-sidebar-items-list">
          {unlockedBoxes.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: "11.5px", color: "var(--notion-text-light)", fontStyle: "italic" }}>
              No unlocked boxes yet.
            </div>
          ) : (
            unlockedBoxes.map((box) => {
              const isActive = box.id === activeBoxId;
              return (
                <button
                  key={box.id}
                  onClick={() => onSelectBox(box.id)}
                  className={`notion-page-item ${isActive ? "active" : ""}`}
                >
                  <div className="notion-page-item-left">
                    <span style={{ fontSize: "14px" }}>{box.emoji || "✨"}</span>
                    <span className="notion-page-item-title">{box.name}</span>
                  </div>
                  <Sparkles size={11} style={{ color: "var(--notion-accent)" }} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="notion-sidebar-footer">
        {/* User Account / Auth Status */}
        {currentUser ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              borderRadius: "var(--notion-radius-sm)",
              background: "var(--notion-hover)",
              fontSize: "12px",
              marginBottom: "4px"
            }}
          >
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <div style={{ fontWeight: 600 }}>{userName}</div>
              <div style={{ fontSize: "10.5px", color: "var(--notion-text-muted)" }}>{currentUser.email}</div>
            </div>
            <button
              onClick={onSignOut}
              className="notion-icon-btn"
              title="Sign Out"
              style={{ color: "var(--notion-text-muted)" }}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="notion-nav-item"
            style={{
              padding: "6px 8px",
              fontSize: "12.5px",
              background: "var(--notion-accent-bg)",
              color: "var(--notion-accent)",
              fontWeight: 600,
              marginBottom: "4px"
            }}
          >
            <LogIn size={13} />
            <span>Sign In / Create Account</span>
          </button>
        )}

        {/* Font Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px" }}>
          <span style={{ fontSize: "11.5px", color: "var(--notion-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Type size={12} /> Font:
          </span>
          <div style={{ display: "flex", gap: "2px" }}>
            {["sans", "serif", "mono"].map((f) => (
              <button
                key={f}
                onClick={() => onChangeFontTheme(f)}
                style={{
                  fontSize: "10.5px",
                  textTransform: "capitalize",
                  padding: "3px 6px",
                  borderRadius: "3px",
                  background: fontTheme === f ? "var(--notion-active)" : "transparent",
                  fontWeight: fontTheme === f ? 600 : 400
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="notion-nav-item"
          style={{ padding: "6px 8px", fontSize: "12.5px" }}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </aside>
  );
}
