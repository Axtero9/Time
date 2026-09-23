import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            color: "#37352f",
            fontFamily: "ui-sans-serif, -apple-system, sans-serif",
            padding: "20px"
          }}
        >
          <div
            style={{
              maxWidth: "460px",
              textAlign: "center",
              padding: "32px",
              borderRadius: "8px",
              border: "1px solid rgba(55, 53, 47, 0.12)",
              boxShadow: "0 4px 14px rgba(15, 15, 15, 0.08)"
            }}
          >
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⏳</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              Time Moves Slow
            </h2>
            <p style={{ fontSize: "13.5px", color: "#787774", marginBottom: "16px", lineHeight: 1.5 }}>
              The application encountered an unexpected issue while loading.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  background: "#fdf1f0",
                  color: "#d44c47",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginBottom: "16px",
                  wordBreak: "break-word"
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#2383e2",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "8px 16px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Reload Capsule
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
