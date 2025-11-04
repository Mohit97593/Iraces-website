import React, { useState } from "react";
// Simple inline SVG eye icon
const EyeIcon = ({ visible, onClick }) => (
  <span
    onClick={onClick}
    style={{ cursor: "pointer", position: "absolute", right: 16, top: 12 }}
  >
    {visible ? (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.07 21.07 0 0 1 5.06-7.06" />
        <path d="M1 1l22 22" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </span>
);
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authAPI";

const SetNewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      // Call API to reset password
      await authAPI.resetPassword({
        token,
        new_password: password,
        confirm_new_password: confirmPassword,
      });
      setSuccess("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.message || "Failed to reset password.");
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        maxWidth: 500,
        margin: "40px auto",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
        padding: 24,
        position: "relative",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          background: "none",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
          color: "#888",
        }}
        aria-label="Close"
      >
        ×
      </button>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>
        Set New Password
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 44px 12px 12px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          <EyeIcon
            visible={showPassword}
            onClick={() => setShowPassword((v) => !v)}
          />
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 44px 12px 12px",
              fontSize: 16,
              borderRadius: 6,
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
          <EyeIcon
            visible={showConfirm}
            onClick={() => setShowConfirm((v) => !v)}
          />
        </div>
        <button
          type="submit"
          style={{
            background: "#d7261a",
            color: "#fff",
            fontWeight: 600,
            fontSize: 20,
            border: "none",
            borderRadius: 6,
            padding: "14px 0",
            marginTop: 10,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 32, fontSize: 16 }}>
        By continuing, you agree to YooTooCanRun's Terms of Services and Privacy
        Statement.
      </div>
      {error && (
        <p style={{ color: "red", textAlign: "center", marginTop: 16 }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "green", textAlign: "center", marginTop: 16 }}>
          {success}
        </p>
      )}
    </div>
  );
};

export default SetNewPassword;
