import React, { useState } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("email");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({
      identifier: "",
      password: "",
    });
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = `${getLoginTypeLabel()} is required`;
    }

    // Email validation
    if (loginType === "email" && formData.identifier) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid email address";
      }
    }

    // Mobile validation
    if (loginType === "mobile" && formData.identifier) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid 10-digit mobile number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const loginData = {
        [loginType === "email" ? "email" : "phone"]: formData.identifier,
        password: formData.password,
      };

      const response = await authService.login(loginData);

      // Login successful
      console.log("Login successful:", response);

      // Redirect to dashboard or home page
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLoginTypeLabel = () => {
    switch (loginType) {
      case "userId":
        return "User ID";
      case "mobile":
        return "Mobile Number";
      case "email":
        return "Email ID";
      default:
        return "Email ID";
    }
  };

  const getInputType = () => {
    switch (loginType) {
      case "mobile":
        return "tel";
      case "email":
        return "email";
      default:
        return "text";
    }
  };

  const getPlaceholder = () => {
    switch (loginType) {
      case "userId":
        return "Enter User ID";
      case "mobile":
        return "Enter Mobile Number";
      case "email":
        return "Enter Email ID";
      default:
        return "Enter Email ID";
    }
  };

  const getIcon = () => {
    switch (loginType) {
      case "userId":
        return "fas fa-user";
      case "mobile":
        return "fas fa-phone";
      case "email":
        return "fas fa-envelope";
      default:
        return "fas fa-envelope";
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
                  //   border: "2px solid #da251c",
                }}
              >
                <YouCanRunBanner />
              </div>
            </div>
          </div>
          {/* Right Side - Login Form */}
          <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
            <div className="auth-form-container">
              <div className="auth-card">
                <div className="auth-header">
                  <h1 className="auth-title">Log In</h1>
                  <p className="auth-subtitle">
                    Your all-in-one event registering tool
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                  {/* Login Type Selector */}
                  <div className="login-type-selector">
                    <div className="login-type-label">Choose Login Method</div>
                    <div className="login-type-buttons">
                      <button
                        type="button"
                        className={`login-type-btn ${
                          loginType === "userId" ? "active" : ""
                        }`}
                        onClick={() => handleLoginTypeChange("userId")}
                      >
                        <i className="fas fa-user"></i>
                        User ID
                      </button>
                      <button
                        type="button"
                        className={`login-type-btn ${
                          loginType === "mobile" ? "active" : ""
                        }`}
                        onClick={() => handleLoginTypeChange("mobile")}
                      >
                        <i className="fas fa-phone"></i>
                        Mobile
                      </button>
                      <button
                        type="button"
                        className={`login-type-btn ${
                          loginType === "email" ? "active" : ""
                        }`}
                        onClick={() => handleLoginTypeChange("email")}
                      >
                        <i className="fas fa-envelope"></i>
                        Email
                      </button>
                    </div>
                  </div>
                  {/* Dynamic Input Field */}
                  <div className="form-group">
                    <div className="input-icon">
                      <i className={getIcon()}></i>
                    </div>
                    <input
                      type={getInputType()}
                      name="identifier"
                      className={`form-control auth-input ${
                        errors.identifier ? "is-invalid" : ""
                      }`}
                      placeholder={getPlaceholder()}
                      value={formData.identifier}
                      onChange={handleChange}
                      required
                    />
                    {errors.identifier && (
                      <div className="error-message">{errors.identifier}</div>
                    )}
                  </div>
                  {/* General Error Message */}
                  {errors.general && (
                    <div className="alert alert-danger" role="alert">
                      {errors.general}
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="form-group">
                    <div className="input-icon">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      type="password"
                      name="password"
                      className={`form-control auth-input ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {errors.password && (
                      <div className="error-message">{errors.password}</div>
                    )}
                  </div>
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
                        Logging in...
                      </>
                    ) : (
                      `Login with ${getLoginTypeLabel()}`
                    )}
                  </button>
                </form>
                <div className="auth-footer">
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
