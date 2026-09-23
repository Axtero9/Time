import React, { useState } from "react";
import { X, Copy, Check, Users, Plus } from "lucide-react";

export default function InviteModal({ isOpen, onClose, box, onAddMember }) {
  const [copied, setCopied] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  if (!isOpen || !box) return null;

  const inviteUrl = `${window.location.origin}/#capsule=${box.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const avatars = ["👩🏻", "🧑🏽", "👱🏼", "👧🏾", "🧔🏻", "🧑🏻‍🦰", "👩🏽‍🦱"];
    const colors = ["#d44c47", "#2ea043", "#2383e2", "#e0b852", "#976d57", "#aa8cd6"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddMember(box.id, {
      id: `user-${Date.now()}`,
      name: newMemberName.trim(),
      avatar: randomAvatar,
      color: randomColor,
      isOwner: false,
      agreedToEarlyUnlock: false
    });

    setNewMemberName("");
  };

  return (
    <div className="notion-modal-backdrop" onClick={onClose}>
      <div className="notion-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="notion-modal-header">
          <div className="notion-modal-title">
            <Users size={16} />
            <span>Share & Invite Friends to Capsule</span>
          </div>
          <button onClick={onClose} className="notion-icon-btn">
            <X size={16} />
          </button>
        </div>

        <div className="notion-modal-body">
          {/* Share Link Input */}
          <label className="notion-label">Capsule Invite Link</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="notion-input"
              style={{ fontSize: "12.5px" }}
            />
            <button
              onClick={handleCopy}
              className="notion-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>

          {/* Add member directly */}
          <form onSubmit={handleAdd} style={{ marginBottom: "20px" }}>
            <label className="notion-label">Add Member Directly</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Friend's name or email..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="notion-input"
              />
              <button
                type="submit"
                className="notion-icon-btn"
                style={{
                  background: "var(--notion-hover)",
                  border: "1px solid var(--notion-border-strong)",
                  whiteSpace: "nowrap"
                }}
              >
                <Plus size={14} />
                <span>Invite</span>
              </button>
            </div>
          </form>

          {/* Current Members List */}
          <label className="notion-label">Capsule Members ({box.members.length})</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {box.members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--notion-radius-sm)",
                  background: "var(--notion-hover)",
                  border: "1px solid var(--notion-border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{member.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px" }}>
                      {member.name} {member.id === "user-me" ? "(You)" : ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--notion-text-muted)" }}>
                      {member.isOwner ? "Owner & Creator" : "Collaborator"}
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className={`notion-tag ${member.agreedToEarlyUnlock ? "green" : "gray"}`}
                    style={{ fontSize: "11px" }}
                  >
                    {member.agreedToEarlyUnlock ? "✅ Agreed to unlock" : "⏳ Has not agreed"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="notion-callout" style={{ marginTop: "20px" }}>
            <span className="notion-callout-icon">💡</span>
            <div className="notion-callout-content">
              <div className="notion-callout-title">Early Reveal Rules</div>
              <div style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
                Any member can upload photos and videos to this capsule. However, all members must unanimously agree before the vault can be unsealed before the set duration.
              </div>
            </div>
          </div>
        </div>

        <div className="notion-modal-footer">
          <button onClick={onClose} className="notion-btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
