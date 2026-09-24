import React, { useState } from "react";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { signInUser, signUpUser } from "../services/supabaseClient";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); // "signin" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please provide both email and password.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        
        const data = await signUpUser(email.trim(), password, fullName.trim());

        // When a user already exists, Supabase returns user object with identities: []
        const isRepeatedSignup =
          data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

        if (isRepeatedSignup) {
          // Attempt seamless sign-in with the provided password
          try {
            const signInData = await signInUser(email.trim(), password);
            if (signInData?.user) {
              onAuthSuccess(signInData.user);
              onClose();
              return;
            }
          } catch {
            setMode("signin");
            throw new Error("An account with this email already exists. Please sign in with your password.");
          }
        }

        if (data?.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error("Please enter your email and password.");
        }
        const data = await signInUser(email.trim(), password);
        if (data?.user) {
          onAuthSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed. Please check your credentials.";
      if (msg.includes("Invalid login credentials")) {
        msg = "Incorrect email or password. Please verify and try again.";
      } else if (msg.includes("User already registered")) {
        setMode("signin");
        msg = "An account with this email already exists. Please sign in with your password.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notion-modal-backdrop" onClick={onClose}>
      <div
        className="notion-modal-container"
        style={{ maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notion-modal-header">
          <div className="notion-modal-title">
            <span>⏳</span>
            <span>{mode === "signin" ? "Sign In to Time Moves Slow" : "Create Your Vault Account"}</span>
          </div>
          <button onClick={onClose} className="notion-icon-btn">
            <X size={16} />
          </button>
        </div>

        <div className="notion-modal-body">
          {/* Segmented Mode Selector */}
          <div
            style={{
              display: "flex",
              background: "var(--notion-hover)",
              padding: "3px",
              borderRadius: "var(--notion-radius-sm)",
              marginBottom: "20px"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "3px",
                fontSize: "13px",
                fontWeight: mode === "signin" ? 600 : 400,
                background: mode === "signin" ? "var(--notion-card-bg)" : "transparent",
                boxShadow: mode === "signin" ? "var(--notion-shadow-sm)" : "none",
                color: "var(--notion-text)"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "3px",
                fontSize: "13px",
                fontWeight: mode === "signup" ? 600 : 400,
                background: mode === "signup" ? "var(--notion-card-bg)" : "transparent",
                boxShadow: mode === "signup" ? "var(--notion-shadow-sm)" : "none",
                color: "var(--notion-text)"
              }}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div
              className="notion-callout"
              style={{
                background: "var(--notion-callout-pink)",
                borderColor: "rgba(207, 34, 46, 0.3)",
                padding: "10px 12px",
                marginBottom: "16px"
              }}
            >
              <AlertCircle size={16} style={{ color: "#cf222e", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "12.5px", color: "var(--tag-red-text)" }}>{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mode === "signup" && (
              <div>
                <label className="notion-label">Full Name</label>
                <div style={{ position: "relative" }}>
                  <User
                    size={14}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--notion-text-muted)"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Alex Rivera)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="notion-input"
                    style={{ paddingLeft: "32px" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="notion-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--notion-text-muted)"
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="notion-input"
                  style={{ paddingLeft: "32px" }}
                />
              </div>
            </div>

            <div>
              <label className="notion-label">Password</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={14}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--notion-text-muted)"
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="notion-input"
                  style={{ paddingLeft: "32px" }}
                />
              </div>
              {mode === "signup" && (
                <span style={{ fontSize: "11px", color: "var(--notion-text-light)", marginTop: "4px", display: "block" }}>
                  Must be at least 6 characters
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="notion-btn-primary"
              style={{
                marginTop: "10px",
                padding: "10px",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              {loading && <Loader2 size={16} className="spin-animation" style={{ animation: "spin 1s linear infinite" }} />}
              <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
            </button>
          </form>

          <p
            style={{
              fontSize: "11.5px",
              color: "var(--notion-text-light)",
              textAlign: "center",
              marginTop: "16px",
              lineHeight: 1.5
            }}
          >
            By continuing, you agree that photos & videos in your capsules will remain securely encrypted and hidden until their unlock date.
          </p>
        </div>
      </div>
    </div>
  );
}
