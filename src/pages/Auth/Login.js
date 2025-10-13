import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [loginType, setLoginType] = useState("email");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

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
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Login data:", { loginType, ...formData });
    // Handle login logic here
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="pink-shape pink-shape-top"></div>
        <div className="pink-shape pink-shape-bottom"></div>
      </div>

      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center">
          {/* Left Side - Illustration */}
          <div className="col-lg-6 d-none d-lg-flex justify-content-center align-items-center">
            <div className="illustration-container">
              <div className="desk-illustration">
                <div className="desk-base"></div>
                <div className="desk-legs"></div>
                <div className="monitor">
                  <div className="monitor-screen"></div>
                  <div className="monitor-stand"></div>
                </div>
                <div className="keyboard"></div>
                <div className="mouse"></div>
                <div className="coffee-cup">
                  <div className="coffee-steam steam-1"></div>
                  <div className="coffee-steam steam-2"></div>
                  <div className="coffee-steam steam-3"></div>
                </div>
                <div className="plant-pot">
                  <div className="plant-leaf leaf-1"></div>
                  <div className="plant-leaf leaf-2"></div>
                  <div className="plant-leaf leaf-3"></div>
                </div>
                <div className="floating-elements">
                  <div className="floating-element element-1"></div>
                  <div className="floating-element element-2"></div>
                  <div className="floating-element element-3"></div>
                  <div className="floating-element element-4"></div>
                  <div className="floating-element element-5"></div>
                </div>
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

                  <button type="submit" className="btn auth-submit-btn">
                    Login with {getLoginTypeLabel()}
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
