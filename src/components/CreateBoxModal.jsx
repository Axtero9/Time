import React, { useState } from "react";
import {
  X,
  User,
  Users,
  Lock,
  Check
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";

export default function CreateBoxModal({ isOpen, onClose, onCreateBox, currentUser }) {
  const [step, setStep] = useState(1); // 1: Name & Emoji, 2: Duration, 3: Social Mode, 4: Upload Media
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [duration, setDuration] = useState("1_year");
  const [customDays, setCustomDays] = useState(30);
  const [mode, setMode] = useState("shared"); // "shared" or "solo"
  const [friendNameInput, setFriendNameInput] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);

  if (!isOpen) return null;

  const handleAddFriend = () => {
    if (!friendNameInput.trim()) return;
    const avatars = ["👩🏻", "🧑🏽", "👱🏼", "👧🏾", "🧔🏻", "🧑🏻‍🦰", "👩🏽‍🦱"];
    const colors = ["#d44c47", "#2ea043", "#2383e2", "#e0b852", "#976d57", "#aa8cd6"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setFriendsList([
      ...friendsList,
      {
        id: `f-${Date.now()}`,
        name: friendNameInput.trim(),
        avatar: randomAvatar,
        color: randomColor
      }
    ]);
    setFriendNameInput("");
  };

  const handleRemoveFriend = (id) => {
    setFriendsList(friendsList.filter((f) => f.id !== id));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isVideo = file.type.startsWith("video");
        const newItem = {
          id: `m-upload-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: isVideo ? "video" : "photo",
          url: event.target.result,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          date: new Date().toISOString().split("T")[0],
          uploadedBy: currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          tags: ["Upload"]
        };
        setMediaItems((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFinalSubmit = () => {
    const finalMembers = [
      {
        id: `owner-${Date.now()}`,
        userId: currentUser?.id || null,
        name: currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You",
        avatar: "👤",
        color: "#2383e2",
        isOwner: true,
        agreedToEarlyUnlock: false
      }
    ];

    if (mode === "shared") {
      friendsList.forEach((f) => {
        finalMembers.push({
          id: f.id,
          name: f.name,
          avatar: f.avatar,
          color: f.color,
          isOwner: false,
          agreedToEarlyUnlock: false
        });
      });
    }

    onCreateBox({
      name: name.trim() || "Untitled Box",
      emoji,
      duration,
      durationMinutes: duration === "custom" ? customDays * 24 * 60 : null,
      mode,
      members: finalMembers,
      media: mediaItems
    });

    // Reset state & close
    setStep(1);
    setName("");
    setEmoji("📦");
    setFriendsList([]);
    setMediaItems([]);
    onClose();
  };

  return (
    <div className="notion-modal-backdrop" onClick={onClose}>
      <div className="notion-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="notion-modal-header">
          <div className="notion-modal-title">
            <span style={{ fontSize: "20px" }}>{emoji}</span>
            <span>Create New Memory Capsule</span>
          </div>
          <button onClick={onClose} className="notion-icon-btn">
            <X size={16} />
          </button>
        </div>

        {/* Wizard Progress Nodes */}
        <div style={{ padding: "16px 20px 0 20px" }}>
          <div className="wizard-steps">
            <div className={`wizard-step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <div className="wizard-node-circle">{step > 1 ? <Check size={14} /> : "1"}</div>
              <span className="wizard-node-label">Name</span>
            </div>
            <div style={{ flex: 1, height: "2px", background: step > 1 ? "var(--notion-accent)" : "var(--notion-border)", margin: "0 8px", marginTop: "-14px" }} />

            <div className={`wizard-step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
              <div className="wizard-node-circle">{step > 2 ? <Check size={14} /> : "2"}</div>
              <span className="wizard-node-label">Duration</span>
            </div>
            <div style={{ flex: 1, height: "2px", background: step > 2 ? "var(--notion-accent)" : "var(--notion-border)", margin: "0 8px", marginTop: "-14px" }} />

            <div className={`wizard-step-node ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
              <div className="wizard-node-circle">{step > 3 ? <Check size={14} /> : "3"}</div>
              <span className="wizard-node-label">Social</span>
            </div>
            <div style={{ flex: 1, height: "2px", background: step > 3 ? "var(--notion-accent)" : "var(--notion-border)", margin: "0 8px", marginTop: "-14px" }} />

            <div className={`wizard-step-node ${step >= 4 ? "active" : ""}`}>
              <div className="wizard-node-circle">4</div>
              <span className="wizard-node-label">Media & Seal</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="notion-modal-body">
          {/* STEP 1: Name and Emoji */}
          {step === 1 && (
            <div>
              <div className="notion-form-group">
                <label className="notion-label">Capsule Name</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      fontSize: "26px",
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--notion-radius-sm)",
                      border: "1px solid var(--notion-border-strong)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--notion-hover)"
                    }}
                    title="Change emoji icon"
                  >
                    {emoji}
                  </button>

                  {showEmojiPicker && (
                    <EmojiPicker
                      selectedEmoji={emoji}
                      onSelect={(newEmoji) => setEmoji(newEmoji)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}

                  <input
                    type="text"
                    placeholder="e.g. Summer Roadtrip 2026, Senior Year, First Home..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="notion-input"
                    style={{ height: "44px", fontSize: "15px" }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="notion-callout" style={{ marginTop: "16px" }}>
                <span className="notion-callout-icon">💡</span>
                <div className="notion-callout-content">
                  <div className="notion-callout-title">How Time Moves Slow works</div>
                  <div style={{ fontSize: "12.5px", color: "var(--notion-text-muted)" }}>
                    You create a box, set how long it stays sealed, invite your closest friends (or keep it private), and upload photos and videos. Everything stays hidden until the duration ends!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Duration */}
          {step === 2 && (
            <div>
              <label className="notion-label">How long should this box stay locked?</label>
              <div className="notion-option-cards" style={{ marginBottom: "16px" }}>
                <div
                  className={`notion-option-card ${duration === "1_month" ? "selected" : ""}`}
                  onClick={() => setDuration("1_month")}
                >
                  <span style={{ fontSize: "18px" }}>🗓️</span>
                  <div className="notion-option-title">1 Month</div>
                  <div className="notion-option-desc">Short term trip or sprint</div>
                </div>

                <div
                  className={`notion-option-card ${duration === "3_months" ? "selected" : ""}`}
                  onClick={() => setDuration("3_months")}
                >
                  <span style={{ fontSize: "18px" }}>🌱</span>
                  <div className="notion-option-title">3 Months</div>
                  <div className="notion-option-desc">One quarter or semester</div>
                </div>

                <div
                  className={`notion-option-card ${duration === "6_months" ? "selected" : ""}`}
                  onClick={() => setDuration("6_months")}
                >
                  <span style={{ fontSize: "18px" }}>🍂</span>
                  <div className="notion-option-title">6 Months</div>
                  <div className="notion-option-desc">Half year season</div>
                </div>

                <div
                  className={`notion-option-card ${duration === "1_year" ? "selected" : ""}`}
                  onClick={() => setDuration("1_year")}
                >
                  <span style={{ fontSize: "18px" }}>⏳</span>
                  <div className="notion-option-title">1 Year</div>
                  <div className="notion-option-desc">Standard Full Year Capsule</div>
                </div>

                <div
                  className={`notion-option-card ${duration === "custom" ? "selected" : ""}`}
                  onClick={() => setDuration("custom")}
                >
                  <span style={{ fontSize: "18px" }}>⚙️</span>
                  <div className="notion-option-title">Custom</div>
                  <div className="notion-option-desc">Specify custom days</div>
                </div>
              </div>

              {duration === "custom" && (
                <div className="notion-form-group" style={{ marginTop: "12px" }}>
                  <label className="notion-label">Custom Duration in Days</label>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="notion-input"
                    style={{ width: "160px" }}
                  />
                </div>
              )}

              <div className="notion-callout" style={{ background: "var(--notion-callout-blue)" }}>
                <span className="notion-callout-icon">🔒</span>
                <div className="notion-callout-content">
                  <div className="notion-callout-title">Locked until completion</div>
                  <div style={{ fontSize: "12.5px" }}>
                    Once sealed, no photos or videos can be viewed until the time is up — unless all members unanimously vote to open it early!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Invite Friends or Stay Alone */}
          {step === 3 && (
            <div>
              <label className="notion-label">Choose Collaboration Mode</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div
                  className={`notion-option-card ${mode === "shared" ? "selected" : ""}`}
                  onClick={() => setMode("shared")}
                  style={{ padding: "16px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Users size={18} style={{ color: "var(--notion-accent)" }} />
                    <span className="notion-option-title">Invite Friends 👥</span>
                  </div>
                  <div className="notion-option-desc">
                    Collaborate together. All friends can upload memories and must unanimously agree for early reveals.
                  </div>
                </div>

                <div
                  className={`notion-option-card ${mode === "solo" ? "selected" : ""}`}
                  onClick={() => setMode("solo")}
                  style={{ padding: "16px" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <User size={18} style={{ color: "var(--tag-purple-text)" }} />
                    <span className="notion-option-title">Stay Alone 👤</span>
                  </div>
                  <div className="notion-option-desc">
                    A private solo time capsule just for your eyes. Only you can view and vote to unseal.
                  </div>
                </div>
              </div>

              {mode === "shared" && (
                <div style={{ marginTop: "14px" }}>
                  <label className="notion-label">Add Friends to this Box</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter friend name (e.g. Maya, Alex, Sophia)..."
                      value={friendNameInput}
                      onChange={(e) => setFriendNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                      className="notion-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddFriend}
                      className="notion-btn-primary"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Add Friend
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <div className="consensus-member-pill" style={{ background: "var(--notion-accent-bg)" }}>
                      <span>👤 {currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You"} (Owner)</span>
                    </div>
                    {friendsList.map((f) => (
                      <div key={f.id} className="consensus-member-pill">
                        <span>{f.avatar} {f.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(f.id)}
                          style={{ marginLeft: "6px", color: "var(--notion-text-muted)" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Media Upload & Sealing */}
          {step === 4 && (
            <div>
              <label className="notion-label">Upload Initial Photos & Videos</label>
              
              <div className="vault-upload-dropzone" onClick={() => document.getElementById("box-file-input").click()}>
                <input
                  id="box-file-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <div className="vault-upload-icon">📷 🎥</div>
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                  Click or drag photos and videos to seal
                </div>
                <div style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
                  JPEG, PNG, WebP, MP4, MOV (They will be encrypted and hidden immediately)
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
                  {mediaItems.length} {mediaItems.length === 1 ? "item" : "items"} ready to be sealed
                </span>
              </div>

              {mediaItems.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                  {mediaItems.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        position: "relative",
                        height: "70px",
                        borderRadius: "var(--notion-radius-sm)",
                        overflow: "hidden",
                        border: "1px solid var(--notion-border)"
                      }}
                    >
                      <img src={item.url} alt="upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== idx))}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="notion-callout" style={{ marginTop: "14px", background: "var(--notion-callout-purple)" }}>
                <span className="notion-callout-icon">✨</span>
                <div className="notion-callout-content">
                  <div className="notion-callout-title">Gemini AI Album Curator</div>
                  <div style={{ fontSize: "12.5px" }}>
                    When the box's duration completes, Google Gemini will automatically analyze all moments, group them into beautifully titled albums, and generate nostalgic stories.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="notion-modal-footer">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="notion-icon-btn"
              style={{ marginRight: "auto" }}
            >
              Back
            </button>
          )}

          <button type="button" onClick={onClose} className="notion-icon-btn">
            Cancel
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="notion-btn-primary"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="notion-btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Lock size={13} />
              <span>Seal Capsule & Create 🔒</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
