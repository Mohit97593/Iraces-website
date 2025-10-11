import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "4rem", margin: "0", color: "#333" }}>404</h1>
      <h2 style={{ fontSize: "2rem", margin: "1rem 0", color: "#666" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1.2rem", margin: "1rem 0", color: "#888" }}>
        Sorry, the page you are looking for doesn't exist.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <Link
          to="/hero"
          style={{
            background: "#97f397",
            color: "black",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            margin: "0 10px",
            display: "inline-block",
          }}
        >
          Go to Home
        </Link>

        <Link
          to="/other"
          style={{
            background: "#333",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
            margin: "0 10px",
            display: "inline-block",
          }}
        >
          Other Pages
        </Link>
      </div>
    </div>
  );
}
