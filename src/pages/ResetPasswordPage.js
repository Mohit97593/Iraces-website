import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authAPI } from "../services/authAPI";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      setStatus("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatus("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await authAPI.resetPassword({
        token,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      if (res && (res.status === 200 || res.validate === 0 || res.success)) {
        setStatus("Password reset successful! You can now log in.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus(res?.message || res?.Message || "Failed to reset password.");
      }
    } catch (err) {
      setStatus("Error resetting password. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "48px auto" }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mb-2"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
        {status && (
          <div
            className="mt-2 text-center"
            style={{ color: status.includes("successful") ? "green" : "red" }}
          >
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
