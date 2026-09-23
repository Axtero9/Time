import React, { useState, useEffect } from "react";
import { Lock, Image, Video } from "lucide-react";

function calculateTimeLeft(targetDateStr) {
  const diff = new Date(targetDateStr) - new Date();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false
  };
}

export default function LockedVault({ box, onUploadMedia, currentUser }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(box.unlockDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(box.unlockDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [box.unlockDate]);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newItems = [];
    let processed = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const isVideo = file.type.startsWith("video");
        newItems.push({
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: isVideo ? "video" : "photo",
          url: event.target.result,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          date: new Date().toISOString().split("T")[0],
          uploadedBy: currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "You",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          tags: ["Vault Upload"]
        });
        processed++;
        if (processed === files.length) {
          onUploadMedia(newItems);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const mediaList = box.media || [];

  return (
    <div className="locked-vault-section">
      {/* Vault Countdown Banner */}
      <div className="locked-vault-banner">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "24px" }}>🔒</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>Sealed Time Vault</span>
        </div>

        <p style={{ fontSize: "13.5px", color: "var(--notion-text-muted)", maxWidth: "540px", margin: "0 auto" }}>
          All photos and videos in this capsule are encrypted and locked. They will remain completely hidden until the countdown ends, or until all {box.members?.length || 1} members agree to unlock early.
        </p>

        {/* Live Countdown Clock */}
        <div className="locked-vault-countdown">
          <div className="countdown-box">
            <span className="countdown-number">{timeLeft.days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--notion-text-light)" }}>:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--notion-text-light)" }}>:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="countdown-label">Mins</span>
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--notion-text-light)" }}>:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="countdown-label">Secs</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
            📅 Unlocks on {new Date(box.unlockDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="vault-upload-dropzone" onClick={() => document.getElementById("vault-more-files").click()}>
        <input
          id="vault-more-files"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
        <div className="vault-upload-icon">📷 🎥 🔒</div>
        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
          Drop photos & videos to seal into this vault
        </div>
        <div style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
          Uploads immediately encrypt and lock away into the vault
        </div>
      </div>

      {/* Header for Hidden Cards */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Locked Memories Inside Vault</span>
          <span className="notion-tag gray" style={{ fontSize: "11px" }}>
            {mediaList.length} items hidden
          </span>
        </div>

        <span style={{ fontSize: "11.5px", color: "var(--notion-text-light)" }}>
          🔐 Contents obscured until reveal
        </span>
      </div>

      {/* Mystery Cards Grid */}
      {mediaList.length === 0 ? (
        <div
          style={{
            padding: "36px",
            textAlign: "center",
            border: "1px dashed var(--notion-border)",
            borderRadius: "var(--notion-radius-md)",
            color: "var(--notion-text-muted)"
          }}
        >
          <p style={{ fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>This vault is currently empty</p>
          <p style={{ fontSize: "12px" }}>Drop your photos or videos above to seal them inside the capsule.</p>
        </div>
      ) : (
        <div className="mystery-cards-grid">
          {mediaList.map((item, index) => (
            <div key={item.id || index} className="mystery-card">
              {/* Blurred background image silhouette */}
              <div
                className="mystery-card-bg-blur"
                style={{ backgroundImage: `url(${item.url})` }}
              />

              {/* Top metadata */}
              <div className="mystery-card-top">
                <span
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "10.5px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {item.type === "video" ? <Video size={10} /> : <Image size={10} />}
                  <span>{item.type === "video" ? "Video" : "Photo"} #{index + 1}</span>
                </span>

                <span
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    color: "#ffffff",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "10.5px"
                  }}
                >
                  {item.size || "Memory"}
                </span>
              </div>

              {/* Center Lock Badge */}
              <div className="mystery-card-center">
                <div className="mystery-card-lock-badge">
                  <Lock size={18} />
                </div>
                <span
                  style={{
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "12px",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)"
                  }}
                >
                  Sealed Memory
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "10.5px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                  }}
                >
                  Hidden until unlocked
                </span>
              </div>

              {/* Bottom Contributor info */}
              <div className="mystery-card-bottom">
                <span>By {item.uploadedBy || "Member"}</span>
                <span>{item.date || "Today"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
