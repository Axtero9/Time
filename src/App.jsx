import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import "./styles/notion.css";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import BoxPage from "./components/BoxPage";
import CreateBoxModal from "./components/CreateBoxModal";
import InviteModal from "./components/InviteModal";
import MediaLightbox from "./components/MediaLightbox";
import AuthModal from "./components/AuthModal";

import { supabase, signOutUser } from "./services/supabaseClient";
import {
  fetchBoxesFromBackend,
  createBoxInBackend,
  updateBoxInBackend,
  addMediaToBackend,
  toggleVoteInBackend,
  deleteBoxFromBackend
} from "./services/backend";
import { curateMemoriesWithGemini } from "./services/gemini";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [activeBoxId, setActiveBoxId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [theme, setTheme] = useState(() => localStorage.getItem("notion_theme") || "light");
  const [fontTheme, setFontTheme] = useState(() => localStorage.getItem("notion_font") || "sans");

  // Collapse sidebar by default on mobile devices
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  });
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState(null);

  // Load user session from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch boxes from Supabase backend
  useEffect(() => {
    let isMounted = true;
    fetchBoxesFromBackend(currentUser)
      .then((data) => {
        if (isMounted) {
          setBoxes(data);
          if (data.length > 0 && !activeBoxId) {
            setActiveBoxId(data[0].id);
          }
        }
      })
      .catch((e) => console.warn("Load boxes error:", e))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser, activeBoxId]);

  // Apply theme classes to body
  useEffect(() => {
    document.body.className = `notion-app notion-theme-${theme} notion-font-${fontTheme}`;
    localStorage.setItem("notion_theme", theme);
  }, [theme, fontTheme]);

  // Responsive resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarCollapsed]);

  const activeBox = boxes.find((b) => b.id === activeBoxId) || boxes[0] || null;

  // Theme toggle
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Font toggle
  const handleChangeFontTheme = (newFont) => {
    setFontTheme(newFont);
    localStorage.setItem("notion_font", newFont);
  };

  // Select box
  const handleSelectBox = (id) => {
    setActiveBoxId(id);
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  };

  // Create Box
  const handleCreateBox = async (data) => {
    const newBox = await createBoxInBackend(data, currentUser);
    setBoxes((prev) => [newBox, ...prev.filter((b) => b.id !== newBox.id)]);
    setActiveBoxId(newBox.id);
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 }
    });
  };

  // Update Box
  const handleUpdateBox = async (boxId, patch) => {
    const updated = await updateBoxInBackend(boxId, patch);
    if (updated) {
      setBoxes((prev) => prev.map((b) => (b.id === boxId ? { ...b, ...updated } : b)));
    }
  };

  // Upload Media
  const handleUploadMedia = async (boxId, newItems) => {
    const updated = await addMediaToBackend(boxId, newItems, currentUser);
    if (updated) {
      setBoxes((prev) => prev.map((b) => (b.id === boxId ? { ...b, ...updated } : b)));
    }
  };

  // Toggle Consensus Vote
  const handleToggleVote = async (boxId, memberId) => {
    const updated = await toggleVoteInBackend(boxId, memberId, currentUser);
    if (updated) {
      setBoxes((prev) => prev.map((b) => (b.id === boxId ? { ...b, ...updated } : b)));

      if (updated.status === "unlocked") {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });

        // Trigger Gemini AI curation if not yet curated
        if (!updated.curation && updated.media && updated.media.length > 0) {
          try {
            const curation = await curateMemoriesWithGemini(updated, updated.media);
            await updateBoxInBackend(boxId, { curation });
            setBoxes((prev) =>
              prev.map((b) => (b.id === boxId ? { ...b, curation } : b))
            );
          } catch (e) {
            console.warn("Auto curation error:", e);
          }
        }
      }
    }
  };

  // Delete Box
  const handleDeleteBox = async (boxId) => {
    const remaining = await deleteBoxFromBackend(boxId);
    setBoxes(remaining);
    setActiveBoxId(remaining[0]?.id || null);
  };

  // Sign out
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  // Add Member
  const handleAddMember = async (boxId, memberObj) => {
    const target = boxes.find((b) => b.id === boxId);
    if (!target) return;
    const updatedMembers = [...(target.members || []), memberObj];
    await updateBoxInBackend(boxId, { members: updatedMembers });
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, members: updatedMembers, mode: "shared" } : b))
    );
  };

  return (
    <div className="notion-app-layout">
      {/* Mobile Backdrop Overlay for Drawer */}
      {!isSidebarCollapsed && (
        <div
          className="notion-sidebar-backdrop"
          onClick={() => setIsSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Notion Sidebar */}
      <Sidebar
        boxes={boxes}
        activeBoxId={activeBoxId}
        onSelectBox={handleSelectBox}
        onOpenCreateModal={() => {
          setIsCreateModalOpen(true);
          if (window.innerWidth <= 768) {
            setIsSidebarCollapsed(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        currentUser={currentUser}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        fontTheme={fontTheme}
        onChangeFontTheme={handleChangeFontTheme}
      />

      {/* Main Content Area */}
      <main className="notion-main-content">
        <Topbar
          box={activeBox}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onDeleteBox={handleDeleteBox}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isFullWidth={isFullWidth}
          onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          currentUser={currentUser}
        />

        {isLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--notion-text-muted)",
              fontSize: "14px",
              gap: "8px"
            }}
          >
            <span>⏳</span>
            <span>Loading your memory capsules...</span>
          </div>
        ) : activeBox ? (
          <BoxPage
            box={activeBox}
            onUpdateBox={handleUpdateBox}
            onUploadMedia={handleUploadMedia}
            onToggleVote={handleToggleVote}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onSelectMedia={(item) => setSelectedLightboxMedia(item)}
            isFullWidth={isFullWidth}
            currentUser={currentUser}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--notion-text-muted)"
            }}
          >
            <span style={{ fontSize: "52px", marginBottom: "16px" }}>⏳</span>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--notion-text)", marginBottom: "8px" }}>
              Time Moves Slow
            </h2>
            <p style={{ fontSize: "14px", maxWidth: "480px", lineHeight: 1.6, marginBottom: "20px" }}>
              Create a capsule box, seal photos & videos inside, and let them stay encrypted and hidden until your chosen time is complete. When unlocked, Google Gemini curates all your moments into a nostalgic album.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="notion-btn-primary"
                style={{ padding: "8px 16px", fontSize: "14px" }}
              >
                + Create Your First Box 📦
              </button>
              {!currentUser && (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="notion-icon-btn"
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    background: "var(--notion-hover)",
                    border: "1px solid var(--notion-border-strong)"
                  }}
                >
                  Sign In / Create Account 🔑
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Box Wizard Modal */}
      <CreateBoxModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBox={handleCreateBox}
        currentUser={currentUser}
      />

      {/* Share / Invite Friends Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        box={activeBox}
        onAddMember={handleAddMember}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      {/* Fullscreen Media Lightbox */}
      {selectedLightboxMedia && (
        <MediaLightbox
          mediaItem={selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
        />
      )}
    </div>
  );
}
