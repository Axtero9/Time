import React, { useState } from "react";
import {
  Sparkles,
  LayoutGrid,
  Clock,
  FolderOpen,
  Quote,
  Loader2,
  Calendar
} from "lucide-react";
import confetti from "canvas-confetti";
import { curateMemoriesWithGemini } from "../services/gemini";

export default function CuratedAlbums({ box, onUpdateCuration, onSelectMedia }) {
  const [activeTab, setActiveTab] = useState("albums"); // "albums", "timeline", "all"
  const [isCurating, setIsCurating] = useState(false);
  const [curationError, setCurationError] = useState(null);

  const mediaList = box.media || [];
  const curation = box.curation;

  const handleCurateClick = async () => {
    setIsCurating(true);
    setCurationError(null);
    try {
      const result = await curateMemoriesWithGemini(box, mediaList);
      onUpdateCuration(box.id, result);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch (err) {
      console.error("Curation error:", err);
      setCurationError("Could not curate albums with Gemini right now. Check connection or try again.");
    } finally {
      setIsCurating(false);
    }
  };

  // Helper to find media item by ID
  const getMediaItem = (id) => mediaList.find((m) => m.id === id);

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Unlocked Hero Banner */}
      <div className="unlocked-hero-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "32px" }}>✨</span>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--notion-text)" }}>
              Capsule Unlocked! All Moments Revealed
            </div>
            <div style={{ fontSize: "13px", color: "var(--notion-text-muted)", marginTop: "2px" }}>
              {mediaList.length} memories have completed their time in the vault and are back in the light.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handleCurateClick}
            disabled={isCurating}
            className="notion-btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              fontSize: "13px"
            }}
          >
            {isCurating ? (
              <>
                <Loader2 size={14} className="spin-animation" style={{ animation: "spin 1s linear infinite" }} />
                <span>Curating with Gemini 2.5 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{curation ? "Re-Curate with Gemini AI 🤖" : "Curate Moments with Gemini AI 🤖"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {curationError && (
        <div className="notion-callout" style={{ background: "var(--notion-callout-pink)", color: "var(--tag-red-text)" }}>
          <span className="notion-callout-icon">⚠️</span>
          <div className="notion-callout-content">{curationError}</div>
        </div>
      )}

      {/* Gemini AI Overarching Retrospective Story */}
      {curation?.retrospectiveStory && (
        <div className="ai-retrospective-card">
          <div className="ai-retrospective-title">
            <span>✨</span>
            <span>Retrospective by Google Gemini</span>
            <span className="notion-tag purple" style={{ fontSize: "11px", marginLeft: "auto" }}>
              AI Memory Curator
            </span>
          </div>
          <p className="ai-retrospective-text">"{curation.retrospectiveStory}"</p>
        </div>
      )}

      {/* Notion Database View Tabs */}
      <div className="notion-view-tabs">
        <button
          className={`notion-view-tab ${activeTab === "albums" ? "active" : ""}`}
          onClick={() => setActiveTab("albums")}
        >
          <LayoutGrid size={14} />
          <span>Curated Albums ({curation?.albums?.length || 0})</span>
        </button>

        <button
          className={`notion-view-tab ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          <Clock size={14} />
          <span>Timeline View ⏱️</span>
        </button>

        <button
          className={`notion-view-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <FolderOpen size={14} />
          <span>All Unsealed Files ({mediaList.length})</span>
        </button>
      </div>

      {/* TAB 1: CURATED ALBUMS GALLERY */}
      {activeTab === "albums" && (
        <div>
          {!curation || !curation.albums || curation.albums.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                border: "1px dashed var(--notion-border)",
                borderRadius: "var(--notion-radius-md)",
                color: "var(--notion-text-muted)"
              }}
            >
              <Sparkles size={28} style={{ color: "var(--notion-accent)", margin: "0 auto 12px auto" }} />
              <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
                Ready to organize these memories?
              </div>
              <p style={{ fontSize: "13px", maxWidth: "440px", margin: "0 auto 16px auto" }}>
                Click below to let Google Gemini 2.5 Flash analyze your photos & videos, detect themes, create appropriate album names, and craft nostalgic stories.
              </p>
              <button
                onClick={handleCurateClick}
                disabled={isCurating}
                className="notion-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Sparkles size={14} />
                <span>Curate Albums with Gemini 2.5 Flash</span>
              </button>
            </div>
          ) : (
            <div className="curated-albums-grid">
              {curation.albums.map((album) => {
                const coverItem = getMediaItem(album.coverPhotoId) || getMediaItem(album.mediaIds?.[0]) || mediaList[0];
                const albumMedia = (album.mediaIds || []).map(getMediaItem).filter(Boolean);

                return (
                  <div key={album.id} className="curated-album-card">
                    {/* Album Cover Photo */}
                    <div style={{ position: "relative" }}>
                      <img
                        src={coverItem?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"}
                        alt={album.title}
                        className="album-cover-img"
                        onClick={() => coverItem && onSelectMedia(coverItem)}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(4px)",
                          color: "#ffffff",
                          fontSize: "11px",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontWeight: 500
                        }}
                      >
                        {albumMedia.length} memories
                      </span>
                    </div>

                    {/* Album Card Body */}
                    <div className="album-card-body">
                      <div className="album-card-title">
                        <span>{album.emoji || "📁"}</span>
                        <span>{album.title}</span>
                      </div>

                      {album.theme && (
                        <div style={{ marginBottom: "8px" }}>
                          <span className="notion-tag blue" style={{ fontSize: "10.5px" }}>
                            {album.theme}
                          </span>
                        </div>
                      )}

                      <p className="album-card-narrative">{album.narrative}</p>

                      {album.highlightQuote && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "6px",
                            fontSize: "11.5px",
                            fontStyle: "italic",
                            color: "var(--notion-text-muted)",
                            margin: "8px 0",
                            borderLeft: "2px solid var(--notion-accent)",
                            paddingLeft: "8px"
                          }}
                        >
                          <Quote size={11} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span>{album.highlightQuote}</span>
                        </div>
                      )}

                      {/* Mini photo roll preview inside album */}
                      <div style={{ display: "flex", gap: "6px", marginTop: "10px", overflowX: "auto", paddingBottom: "4px" }}>
                        {albumMedia.map((m) => (
                          <img
                            key={m.id}
                            src={m.url}
                            alt={m.caption}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectMedia(m);
                            }}
                            title={m.caption}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "4px",
                              objectFit: "cover",
                              cursor: "pointer",
                              border: "1px solid var(--notion-border)",
                              flexShrink: 0
                            }}
                          />
                        ))}
                      </div>

                      <div className="album-card-footer">
                        <span>Curated by Gemini AI</span>
                        <span style={{ color: "var(--notion-accent)", fontWeight: 500, display: "flex", alignItems: "center", gap: "2px" }}>
                          View Moments →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIMELINE VIEW */}
      {activeTab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          {mediaList.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                padding: "12px",
                borderRadius: "var(--notion-radius-sm)",
                border: "1px solid var(--notion-border)",
                background: "var(--notion-card-bg)"
              }}
            >
              <img
                src={item.url}
                alt={item.caption}
                onClick={() => onSelectMedia(item)}
                style={{
                  width: "90px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "var(--notion-radius-sm)",
                  cursor: "pointer"
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="notion-tag gray" style={{ fontSize: "11px" }}>
                    <Calendar size={10} style={{ marginRight: "3px" }} />
                    {item.date || "2024"}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "var(--notion-text-muted)" }}>
                    Uploaded by {item.uploadedBy || "You"}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: "13.5px", marginBottom: "4px" }}>
                  {item.caption || "Untitled Memory"}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {(item.tags || []).map((t, ti) => (
                    <span key={ti} className="notion-tag blue" style={{ fontSize: "10px" }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ALL UNSEALED MEDIA GRID */}
      {activeTab === "all" && (
        <div className="unlocked-media-grid">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="unlocked-media-card"
              onClick={() => onSelectMedia(item)}
            >
              <img src={item.url} alt={item.caption} className="unlocked-media-thumb" />
              <div className="unlocked-media-info">
                <div className="unlocked-media-caption" title={item.caption}>
                  {item.caption || "Untitled"}
                </div>
                <div className="unlocked-media-meta">
                  <span>{item.date || "2025"}</span>
                  <span>{item.uploadedBy || "Member"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
