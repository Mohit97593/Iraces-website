import React, { useState } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/authAPI";
import "./Auth.css";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("");
        setIsSuccess(false);

        if (!email.trim()) {
            setStatus("Please enter your email address.");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);

        try {
            const baseUrl = window.location.origin + "/reset-password";
            const payload = {
                email: email.trim(),
                base_url: baseUrl,
            };

            if (authAPI.sendResetPasswordLink) {
                const res = await authAPI.sendResetPasswordLink(payload);
                console.log("Forgot password API response:", res);

                if ((res && res.status === 200) || (res && !res.error)) {
                    setStatus("Password reset link sent! Please check your email.");
                    setIsSuccess(true);
                    setEmail("");
                } else {
                    setStatus(res.message || "Failed to send reset link. Please try again.");
                    setIsSuccess(false);
                }
            } else {
                setStatus("Password reset service is currently unavailable.");
                setIsSuccess(false);
            }
        } catch (err) {
            setStatus("Error sending reset link. Please try again later.");
            setIsSuccess(false);
            console.error("Forgot password error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="pink-shape pink-shape-top"></div>
                <div className="pink-shape pink-shape-bottom"></div>
            </div>
            <div className="container-fluid h-100">
                <div className="row h-100 align-items-center">
                    {/* Left Side - Banner with background */}
                    <div
                        className="col-lg-6 d-none d-lg-flex p-0"
                        style={{
                            position: "relative",
                            background: "#fff",
                            minHeight: "100vh",
                            boxShadow: "0 0 32px rgba(218,37,28,0.08)",
                        }}
                    >
                        <div
                            className="auth-background"
                            style={{ position: "absolute", inset: 0, zIndex: 0 }}
                        >
                            <div className="pink-shape pink-shape-top"></div>
                            <div className="pink-shape pink-shape-bottom"></div>
                        </div>
                        <div
                            style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "48px 24px",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            <div
                                style={{
                                    width: "484px",
                                    maxWidth: "95%",
                                    minHeight: "550px",
                                    background: "#fff",
                                    borderRadius: "24px",
                                    boxShadow: "0 4px 24px rgba(218,37,28,0.10)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "32px 24px",
                                }}
                            >
                                <YouCanRunBanner />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Forgot Password Form */}
                    <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
                        <div className="auth-form-container">
                            <div className="auth-card">
                                <div className="auth-header">
                                    <h1 className="auth-title">Forgot Password</h1>
                                    <p className="auth-subtitle">
                                        Enter your email address and we'll send you a link to reset your password
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    {/* Email Input Field */}
                                    <div className="form-group">
                                        <div className="input-icon">
                                            <i className="fas fa-envelope"></i>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control auth-input"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Status Message */}
                                    {status && (
                                        <div
                                            className="mb-3 text-center"
                                            style={{
                                                color: isSuccess ? "#28a745" : "#dc3545",
                                                fontSize: "14px",
                                                fontWeight: "500",
                                                padding: "12px",
                                                borderRadius: "8px",
                                                background: isSuccess ? "#d4edda" : "#f8d7da",
                                                border: `1px solid ${isSuccess ? "#c3e6cb" : "#f5c6cb"}`,
                                            }}
                                        >
                                            {status}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn auth-submit-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Sending Reset Link...
                                            </>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </button>
                                </form>

                                {/* Footer Links */}
                                <div className="auth-footer">
                                    <p className="auth-link-text">
                                        Remember your password?
                                        <NavLink to="/login" className="auth-link">
                                            Back to Login
                                        </NavLink>
                                    </p>
                                    <p className="auth-link-text">
                                        Don't have an account?
                                        <NavLink to="/signup" className="auth-link">
                                            Sign Up
                                        </NavLink>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
