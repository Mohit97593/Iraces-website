import React, { useState } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink } from "react-router-dom";
import "./Auth.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    email: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.mobileNo.trim())
      newErrors.mobileNo = "Mobile number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to terms and conditions";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Signup data:", formData);
    // Handle signup logic here
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
          {/* Right Side - Signup Form */}
          <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
            <div className="auth-form-container">
              <div className="auth-card">
                <div className="auth-header">
                  <h1 className="auth-title">Let's get you enrolled !</h1>
                  <p className="auth-subtitle">
                    Your all-in-one event planning tool
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="row">
                    {/* First Column */}
                    <div className="col-md-6">
                      {/* First Name */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          className={`form-control auth-input ${
                            errors.firstName ? "is-invalid" : ""
                          }`}
                          placeholder="First Name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        {errors.firstName && (
                          <div className="error-message">
                            {errors.firstName}
                          </div>
                        )}
                      </div>
                      {/* Mobile Number */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-phone"></i>
                        </div>
                        <input
                          type="tel"
                          name="mobileNo"
                          className={`form-control auth-input ${
                            errors.mobileNo ? "is-invalid" : ""
                          }`}
                          placeholder="Mobile Number"
                          value={formData.mobileNo}
                          onChange={handleChange}
                          required
                        />
                        {errors.mobileNo && (
                          <div className="error-message">{errors.mobileNo}</div>
                        )}
                      </div>
                      {/* Date of Birth */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <input
                          type="date"
                          name="dob"
                          className={`form-control auth-input ${
                            errors.dob ? "is-invalid" : ""
                          }`}
                          value={formData.dob}
                          onChange={handleChange}
                          required
                        />
                        {errors.dob && (
                          <div className="error-message">{errors.dob}</div>
                        )}
                      </div>
                      {/* Password */}
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
                    </div>
                    {/* Second Column */}
                    <div className="col-md-6">
                      {/* Last Name */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          className={`form-control auth-input ${
                            errors.lastName ? "is-invalid" : ""
                          }`}
                          placeholder="Last Name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                        {errors.lastName && (
                          <div className="error-message">{errors.lastName}</div>
                        )}
                      </div>
                      {/* Email */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-envelope"></i>
                        </div>
                        <input
                          type="email"
                          name="email"
                          className={`form-control auth-input ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          placeholder="Email ID"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        {errors.email && (
                          <div className="error-message">{errors.email}</div>
                        )}
                      </div>
                      {/* Gender */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-venus-mars"></i>
                        </div>
                        <select
                          name="gender"
                          className={`form-control auth-input ${
                            errors.gender ? "is-invalid" : ""
                          }`}
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && (
                          <div className="error-message">{errors.gender}</div>
                        )}
                      </div>
                      {/* Confirm Password */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-lock"></i>
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          className={`form-control auth-input ${
                            errors.confirmPassword ? "is-invalid" : ""
                          }`}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        {errors.confirmPassword && (
                          <div className="error-message">
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Terms and Conditions - Full Width */}
                  <div className="form-group checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">
                        I agree to the{" "}
                        <a href="#" className="terms-link">
                          Terms and Conditions
                        </a>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <div className="error-message">{errors.agreeToTerms}</div>
                    )}
                  </div>
                  <button type="submit" className="btn auth-submit-btn">
                    Sign Up
                  </button>
                </form>
                <div className="auth-footer">
                  <p className="auth-link-text">
                    Already have an account?
                    <NavLink to="/login" className="auth-link">
                      Login
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
