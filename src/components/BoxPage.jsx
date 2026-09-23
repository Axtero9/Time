import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Users,
  Lock,
  Unlock,
  Sparkles,
  Camera,
  Plus
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import ConsensusVote from "./ConsensusVote";
import LockedVault from "./LockedVault";
import CuratedAlbums from "./CuratedAlbums";
import { PRESET_COVERS } from "../mock/sampleData";

export default function BoxPage({
  box,
  onUpdateBox,
  onUploadMedia,
  onToggleVote,
  onOpenInviteModal,
  onSelectMedia,
  isFullWidth,
  currentUser
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [titleInput, setTitleInput] = useState(box.name);
  const [prevBoxId, setPrevBoxId] = useState(box.id);

  if (prevBoxId !== box.id) {
    setPrevBoxId(box.id);
    setTitleInput(box.name);
  }

  const handleTitleBlur = () => {
    if (titleInput.trim() !== box.name) {
      onUpdateBox(box.id, { name: titleInput.trim() || "Untitled Box" });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const handleChangeCover = (newCoverUrl) => {
    onUpdateBox(box.id, { cover: newCoverUrl });
    setShowCoverPicker(false);
  };

  const isLocked = box.status === "locked";

  return (
    <div className="notion-page-scrollable">
      {/* Cover Image Banner */}
      <div
        className="notion-page-cover"
        style={{ backgroundImage: `url(${box.cover})` }}
      >
        <div className="notion-cover-overlay" />
        <div className="notion-cover-actions">
          <button
            onClick={() => setShowCoverPicker(!showCoverPicker)}
            className="notion-cover-btn"
          >
            <Camera size={13} />
            <span>Change cover</span>
          </button>
        </div>

        {/* Cover Picker Popover */}
        {showCoverPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "46px",
              right: "16px",
              width: "360px",
              background: "var(--notion-card-bg)",
              border: "1px solid var(--notion-border-strong)",
              borderRadius: "var(--notion-radius-md)",
              boxShadow: "var(--notion-shadow-lg)",
              padding: "12px",
              zIndex: 30
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Curated Preset Covers</span>
              <button onClick={() => setShowCoverPicker(false)} style={{ fontSize: "12px" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {PRESET_COVERS.map((cover) => (
                <div
                  key={cover.id}
                  onClick={() => handleChangeCover(cover.url)}
                  style={{
                    height: "55px",
                    borderRadius: "4px",
                    backgroundImage: `url(${cover.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: "pointer",
                    border: box.cover === cover.url ? "2px solid var(--notion-accent)" : "1px solid var(--notion-border)"
                  }}
                  title={cover.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Notion Page Content */}
      <div className={`notion-page-container ${isFullWidth ? "full-width" : ""}`}>
        {/* Page Icon (Emoji) */}
        <div className="notion-page-icon-wrapper">
          <div
            className="notion-page-icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Click to change capsule emoji"
          >
            {box.emoji || "📦"}
          </div>

          {showEmojiPicker && (
            <EmojiPicker
              selectedEmoji={box.emoji}
              onSelect={(emoji) => {
                onUpdateBox(box.id, { emoji });
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Page Title */}
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled Box"
          className="notion-title-input"
        />

        {/* Notion Properties Table */}
        <div className="notion-properties-table">
          {/* Status Property */}
          <div className="notion-property-row">
            <div className="notion-property-name">
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              <span>Vault Status</span>
            </div>
            <div className="notion-property-value">
              <span className={`notion-tag ${isLocked ? "yellow" : "green"}`}>
                {isLocked ? "🔒 Sealed & Secret" : "🔓 Unlocked & Curated"}
              </span>
            </div>
          </div>

          {/* Duration Property */}
          <div className="notion-property-row">
            <div className="notion-property-name">
              <Clock size={14} />
              <span>Duration</span>
            </div>
            <div className="notion-property-value">
              <span className="notion-tag blue">{box.durationLabel || "1 Year"}</span>
            </div>
          </div>

          {/* Unlock Date Property */}
          <div className="notion-property-row">
            <div className="notion-property-name">
              <Calendar size={14} />
              <span>Unlock Date</span>
            </div>
            <div className="notion-property-value" style={{ fontSize: "13px" }}>
              {new Date(box.unlockDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
          </div>

          {/* Members Property */}
          <div className="notion-property-row">
            <div className="notion-property-name">
              <Users size={14} />
              <span>Members</span>
            </div>
            <div className="notion-property-value">
              <div className="notion-avatars-group">
                {box.members.map((member) => (
                  <div
                    key={member.id}
                    className="notion-avatar"
                    style={{ backgroundColor: member.color }}
                    title={`${member.name}: ${member.agreedToEarlyUnlock ? "Agreed" : "Waiting"}`}
                  >
                    <span>{member.avatar}</span>
                    <span
                      className={`notion-avatar-status ${
                        member.agreedToEarlyUnlock ? "agreed" : "pending"
                      }`}
                    />
                  </div>
                ))}

                <button
                  onClick={onOpenInviteModal}
                  className="notion-icon-btn"
                  style={{
                    padding: "2px 6px",
                    borderRadius: "12px",
                    background: "var(--notion-hover)",
                    fontSize: "11px",
                    border: "1px dashed var(--notion-border-strong)"
                  }}
                >
                  <Plus size={11} />
                  <span>Invite</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Curator Property */}
          <div className="notion-property-row">
            <div className="notion-property-name">
              <Sparkles size={14} />
              <span>AI Curator</span>
            </div>
            <div className="notion-property-value">
              <span className="notion-tag purple">
                Google Gemini 2.5 Flash
              </span>
            </div>
          </div>
        </div>

        {/* Notion Callout Block */}
        <div className="notion-callout">
          <span className="notion-callout-icon">💡</span>
          <div className="notion-callout-content">
            <div className="notion-callout-title">
              {isLocked ? "This capsule is sealed tight" : "This capsule has completed its cycle"}
            </div>
            <div style={{ fontSize: "13px", color: "var(--notion-text-muted)" }}>
              {isLocked
                ? "Photos & videos uploaded here are encrypted and hidden until the duration ends. Want to look inside early? Every member in this box must unanimously vote to unlock!"
                : "The duration is complete! Google Gemini has organized your photos and videos into curated chapters with titles, narratives, and memories."}
            </div>
          </div>
        </div>

        {/* Consensus Voting Section (Early Reveal Feature) */}
        {isLocked && (
          <ConsensusVote
            box={box}
            onToggleVote={onToggleVote}
            currentUser={currentUser}
          />
        )}

        {/* Content Section: Locked Vault OR Unlocked Curated Albums */}
        {isLocked ? (
          <LockedVault
            box={box}
            onUploadMedia={(items) => onUploadMedia(box.id, items)}
            currentUser={currentUser}
          />
        ) : (
          <CuratedAlbums
            box={box}
            onUpdateCuration={(id, curation) => onUpdateBox(id, { curation })}
            onSelectMedia={onSelectMedia}
          />
        )}
      </div>
    </div>
  );
}
