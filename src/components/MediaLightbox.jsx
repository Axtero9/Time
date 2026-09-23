import React from "react";
import { X, Calendar, User } from "lucide-react";

export default function MediaLightbox({ mediaItem, onClose }) {
  if (!mediaItem) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          background: "rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 210,
          border: "none",
          cursor: "pointer"
        }}
      >
        <X size={20} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {mediaItem.type === "video" ? (
          <video
            src={mediaItem.url}
            controls
            autoPlay
            className="lightbox-media"
          />
        ) : (
          <img
            src={mediaItem.url}
            alt={mediaItem.caption}
            className="lightbox-media"
          />
        )}

        <div className="lightbox-caption-bar">
          <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
            {mediaItem.caption || "Untitled Moment"}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "12.5px",
              color: "rgba(255, 255, 255, 0.75)"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={13} />
              {mediaItem.date || "2025"}
            </span>

            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <User size={13} />
              Uploaded by {mediaItem.uploadedBy || "You"}
            </span>

            {mediaItem.size && <span>{mediaItem.size}</span>}
          </div>

          {mediaItem.tags && mediaItem.tags.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "10px" }}>
              {mediaItem.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    padding: "2px 8px",
                    borderRadius: "3px",
                    fontSize: "11px"
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
