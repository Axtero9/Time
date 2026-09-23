import React, { useState } from "react";
import {
  Menu,
  Share2,
  Star,
  MoreHorizontal,
  Lock,
  Unlock,
  Trash2,
  Maximize2,
  Minimize2,
  LogIn
} from "lucide-react";

export default function Topbar({
  box,
  onOpenInviteModal,
  onOpenAuthModal,
  onDeleteBox,
  isSidebarCollapsed,
  onToggleSidebar,
  isFullWidth,
  onToggleFullWidth,
  currentUser
}) {
  const [isStarred, setIsStarred] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const agreedCount = box?.members?.filter((m) => m.agreedToEarlyUnlock).length || 0;
  const isLocked = box?.status === "locked";

  return (
    <header className="notion-topbar">
      <div className="notion-topbar-left">
        {/* Hamburger menu button */}
        <button
          onClick={onToggleSidebar}
          className={`notion-icon-btn ${!isSidebarCollapsed ? "show-mobile-only" : ""}`}
          title={isSidebarCollapsed ? "Open sidebar" : "Toggle sidebar"}
          style={{ marginRight: "4px" }}
        >
          <Menu size={16} />
        </button>

        {box ? (
          <>
            <nav className="notion-breadcrumbs">
              <div className="notion-breadcrumb-crumb hide-mobile-sm">
                <span>📦 Capsules</span>
              </div>
              <span className="notion-breadcrumb-divider hide-mobile-sm">/</span>
              <div className="notion-breadcrumb-crumb current">
                <span>{box.emoji || "📦"}</span>
                <span
                  style={{
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {box.name}
                </span>
              </div>
            </nav>

            {isLocked ? (
              <span
                className="notion-tag yellow hide-mobile-xs"
                style={{ marginLeft: "6px", fontSize: "11px" }}
                title="Sealed until duration ends or all members agree"
              >
                <Lock size={10} style={{ marginRight: "2px" }} />
                Sealed
              </span>
            ) : (
              <span
                className="notion-tag green hide-mobile-xs"
                style={{ marginLeft: "6px", fontSize: "11px" }}
                title="Duration completed or unanimously unlocked!"
              >
                <Unlock size={10} style={{ marginRight: "2px" }} />
                Unlocked
              </span>
            )}
          </>
        ) : (
          <span style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--notion-text-muted)" }}>
            Time Moves Slow
          </span>
        )}
      </div>

      <div className="notion-topbar-right">
        {/* Consensus chip */}
        {box && box.mode === "shared" && isLocked && (
          <button
            onClick={onOpenInviteModal}
            className="notion-icon-btn"
            style={{
              background: "var(--notion-hover)",
              fontSize: "11.5px",
              padding: "3px 6px"
            }}
            title="View member consensus to unlock early"
          >
            <span>🗳️ {agreedCount}/{box.members?.length || 1}</span>
            <span className="hide-mobile-sm" style={{ marginLeft: "3px" }}>Agreed</span>
          </button>
        )}

        {/* Share / Invite Button */}
        {box && (
          <button
            onClick={onOpenInviteModal}
            className="notion-icon-btn"
            title="Invite friends or share capsule link"
          >
            <Share2 size={14} />
            <span className="hide-mobile-sm">Share</span>
          </button>
        )}

        {/* Favorite star */}
        {box && (
          <button
            onClick={() => setIsStarred(!isStarred)}
            className="notion-icon-btn hide-mobile-xs"
            title="Favorite this box"
            style={{ color: isStarred ? "#f2c94c" : "inherit" }}
          >
            <Star size={15} fill={isStarred ? "#f2c94c" : "none"} />
          </button>
        )}

        {/* Auth status or login button */}
        {!currentUser && (
          <button
            onClick={onOpenAuthModal}
            className="notion-btn-primary"
            style={{ fontSize: "12px", padding: "3px 8px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}

        {/* More options menu */}
        {box && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="notion-icon-btn"
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMoreMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "32px",
                  right: "0",
                  width: "180px",
                  background: "var(--notion-card-bg)",
                  border: "1px solid var(--notion-border-strong)",
                  borderRadius: "var(--notion-radius-md)",
                  boxShadow: "var(--notion-shadow-md)",
                  padding: "6px",
                  zIndex: 40,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="notion-nav-item"
                  style={{ fontSize: "12.5px" }}
                  onClick={() => {
                    onToggleFullWidth();
                    setShowMoreMenu(false);
                  }}
                >
                  {isFullWidth ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span>{isFullWidth ? "Standard Width" : "Full Width"}</span>
                </button>

                <button
                  className="notion-nav-item"
                  style={{ fontSize: "12.5px", color: "var(--tag-red-text)" }}
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${box.name}"?`)) {
                      onDeleteBox(box.id);
                    }
                    setShowMoreMenu(false);
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Box</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
