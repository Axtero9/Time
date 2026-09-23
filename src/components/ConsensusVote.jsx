import React from "react";
import { UserCheck, UserX } from "lucide-react";
import confetti from "canvas-confetti";

export default function ConsensusVote({ box, onToggleVote, currentUser }) {
  if (!box || !box.members || box.members.length === 0) return null;

  const totalMembers = box.members.length;
  const agreedMembers = box.members.filter((m) => m.agreedToEarlyUnlock);
  const agreedCount = agreedMembers.length;
  const isUnanimous = totalMembers > 0 && agreedCount === totalMembers;
  const progressPercent = Math.round((agreedCount / totalMembers) * 100);

  // Match current user by ID or email or default to first owner
  const currentMember =
    box.members.find((m) => m.userId === currentUser?.id || m.email === currentUser?.email) ||
    box.members.find((m) => m.isOwner) ||
    box.members[0];

  const userHasAgreed = currentMember?.agreedToEarlyUnlock || false;

  const handleUserVote = () => {
    if (currentMember) {
      onToggleVote(box.id, currentMember.id);
      if (!userHasAgreed && agreedCount + 1 === totalMembers) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  return (
    <div className={`consensus-card ${isUnanimous ? "all-agreed" : ""}`}>
      <div className="consensus-header">
        <div className="consensus-title-wrap">
          <span style={{ fontSize: "18px" }}>🗳️</span>
          <div>
            <div className="consensus-title">Early Reveal Consensus</div>
            <div style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
              Show all pictures and videos before the duration if all members agree
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            className={`notion-tag ${isUnanimous ? "green" : "blue"}`}
            style={{ fontWeight: 600 }}
          >
            {isUnanimous ? "🎉 100% Unanimous Agreement!" : `${agreedCount} of ${totalMembers} Agreed (${progressPercent}%)`}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="consensus-progress-track">
        <div
          className={`consensus-progress-fill ${isUnanimous ? "complete" : ""}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Members Agreement List */}
      <div className="consensus-members-grid">
        {box.members.map((member) => {
          const isMe = member.id === currentMember?.id;
          return (
            <div
              key={member.id}
              className="consensus-member-pill"
              style={{
                borderColor: member.agreedToEarlyUnlock ? "rgba(46, 160, 67, 0.4)" : "var(--notion-border)",
                background: member.agreedToEarlyUnlock ? "var(--tag-green)" : "var(--notion-hover)"
              }}
            >
              <div className="consensus-member-info">
                <span style={{ fontSize: "16px" }}>{member.avatar || "👤"}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "12.5px" }}>
                    {member.name} {isMe ? "(You)" : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: member.agreedToEarlyUnlock ? "var(--tag-green-text)" : "var(--notion-text-muted)"
                    }}
                  >
                    {member.agreedToEarlyUnlock ? "✅ Agreed to unlock" : "⏳ Has not agreed yet"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="consensus-vote-actions">
        <div>
          <button
            onClick={handleUserVote}
            className={`consensus-btn-vote ${userHasAgreed ? "agreed" : "not-agreed"}`}
          >
            {userHasAgreed ? (
              <>
                <UserX size={14} />
                <span>Withdraw My Vote 🔒</span>
              </>
            ) : (
              <>
                <UserCheck size={14} />
                <span>Vote to Unlock Early 🔓</span>
              </>
            )}
          </button>
        </div>

        <div style={{ fontSize: "12px", color: "var(--notion-text-muted)" }}>
          {isUnanimous
            ? "Unanimous consensus achieved! Capsule will unseal."
            : `${totalMembers - agreedCount} more agreement(s) required to reveal early.`}
        </div>
      </div>
    </div>
  );
}
