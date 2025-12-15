import React, { useState, useEffect, useRef } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import "./Auth.css";

export default function Login() {
  // Show reset password modal if token is present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setResetToken(token);
      setShowReset(true);
    }
  }, []);
  const navigate = useNavigate();
  const { login, sendOTP, loginWithOTP } = useAuth();

  const [loginType, setLoginType] = useState("userId");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    otp: "",
    phoneCode: "+91",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneCodes, setPhoneCodes] = useState([
    { country_code: "IN", phone_code: "+91", country_name: "India" },
    { country_code: "US", phone_code: "+1", country_name: "United States" },
    { country_code: "UK", phone_code: "+44", country_name: "United Kingdom" },
  ]);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const otpIntervalRef = useRef(null);

  // Fetch phone codes on component mount
  useEffect(() => {
    const fetchPhoneCodes = async () => {
      try {
        console.log("Starting to fetch phone codes for login...");
        const response = await authAPI.getPhoneCodes();
        console.log("Login phone codes response:", response);

        let codes = [];
        if (
          response?.data?.PhoneCode &&
          Array.isArray(response.data.PhoneCode)
        ) {
          codes = response.data.PhoneCode;
        } else if (response?.PhoneCode && Array.isArray(response.PhoneCode)) {
          codes = response.PhoneCode;
        } else if (response?.data && Array.isArray(response.data)) {
          codes = response.data;
        } else if (Array.isArray(response)) {
          codes = response;
        }

        if (codes.length > 0) {
          const formattedCodes = codes.map((code) => ({
            country_code:
              code.country_code || code.CountryCode || code.code || code.Code,
            phone_code:
              code.phone_code || code.PhoneCode || code.phoneCode || code.code,
            country_name:
              code.country_name ||
              code.CountryName ||
              code.name ||
              code.Name ||
              code.country_code,
          }));
          setPhoneCodes(formattedCodes);
          console.log(
            "Login phone codes loaded successfully:",
            formattedCodes.length,
            "codes"
          );
        } else {
          console.log("No phone codes found, using defaults");
        }
      } catch (error) {
        console.error("Failed to fetch phone codes for login:", error);
        // Use default codes if API fails - they're already set in state
      }
    };

    fetchPhoneCodes();
  }, []);

  useEffect(() => {
    if (showOTPField) {
      setOtpTimer(30);
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
      otpIntervalRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(otpIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setOtpTimer(30);
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    }
    return () => {
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
    };
  }, [showOTPField]);

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({
      identifier: "",
      password: "",
      otp: "",
      phoneCode: "+91",
    });
    setErrors({});
    setShowOTPField(false);
    setOtpSent(false);
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
      const cleanMobile = formData.identifier.replace(/^0+/, "");

      if (formData.phoneCode === "+91") {
        // Indian mobile validation
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(cleanMobile)) {
          newErrors.identifier =
            "Please enter a valid 10-digit mobile number starting with 6-9";
        }
      } else {
        // International mobile validation
        const mobileRegex = /^\d{7,15}$/;
        if (!mobileRegex.test(cleanMobile)) {
          newErrors.identifier =
            "Please enter a valid mobile number (7-15 digits)";
        }
      }
    }

    // Password validation (only if OTP field is not shown)
    if (!showOTPField && !formData.password) {
      newErrors.password = "Password is required";
    }

    // OTP validation (only if OTP field is shown)
    if (showOTPField && !formData.otp) {
      newErrors.otp = "OTP is required";
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
      // Check if user is trying to login with mobile/email without generating OTP first
      if ((loginType === "mobile" || loginType === "email") && !otpSent) {
        const errorMsg = "Please generate OTP first by clicking 'Send OTP' button";
        setErrors({
          general: errorMsg,
        });
        setIsLoading(false);
        return;
      }

      // If OTP field is shown and OTP is provided, login with OTP
      if (showOTPField && formData.otp) {
        const cleanMobile =
          loginType === "mobile" ? formData.identifier.replace(/^0+/, "") : "";
        const otpData = {
          email:
            loginType === "email"
              ? formData.identifier.toLowerCase().trim()
              : "",
          mobile: cleanMobile,
          otp: formData.otp,
          loginType: loginType === "mobile" ? 2 : 3, // 2=Mobile+OTP, 3=Email+OTP
          phoneCode: loginType === "mobile" ? formData.phoneCode : "",
        };
        const result = await loginWithOTP(otpData);
        if (result.success) {
          console.log("OTP Login successful:", result.data);
          navigate("/"); // Redirect to home page
        } else {
          setErrors({
            general: result.message || "OTP login failed. Please try again.",
          });
        }
      } else {
        // Regular password login
        const cleanMobile =
          loginType === "mobile" ? formData.identifier.replace(/^0+/, "") : "";
        const loginData = {
          email:
            loginType === "email"
              ? formData.identifier.toLowerCase().trim()
              : loginType === "userId"
                ? formData.identifier
                : "",
          mobile: cleanMobile,
          password: formData.password,
          loginType: 1, // 1=Password login (both email and mobile)
          phoneCode: loginType === "mobile" ? formData.phoneCode : "",
        };
        const result = await login(loginData);
        if (result.success) {
          setTimeout(() => {
            const token = localStorage.getItem("token");
            if (token) {
              navigate("/");
            } else {
              setErrors({
                general:
                  "Login successful but authentication data missing. Please contact support.",
              });
            }
          }, 500);
        } else {
          // More specific error messages
          let errorMessage =
            result.message ||
            "Login failed. Please check your credentials and try again.";

          // Handle common error cases
          if (
            errorMessage.toLowerCase().includes("user not found") ||
            errorMessage.toLowerCase().includes("invalid credentials")
          ) {
            errorMessage =
              "Invalid email/mobile or password. Please check your credentials.";
          } else if (
            errorMessage.toLowerCase().includes("account not verified")
          ) {
            errorMessage =
              "Your account is not verified. Please check your email/SMS for verification.";
          }

          setErrors({
            general: errorMessage,
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send OTP
  const handleSendOTP = async () => {
    // Clear previous errors
    setErrors({});

    // Validate identifier is not empty
    if (!formData.identifier.trim()) {
      setErrors({
        identifier: `${getLoginTypeLabel()} is required to send OTP`,
      });
      return;
    }

    // Email validation
    if (loginType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.identifier)) {
        setErrors({
          identifier: "Please enter a valid email address",
        });
        return;
      }
    }

    // Mobile validation
    if (loginType === "mobile") {
      const cleanMobile = formData.identifier.replace(/^0+/, "");

      if (formData.phoneCode === "+91") {
        // Indian mobile validation
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(cleanMobile)) {
          setErrors({
            identifier: "Please enter a valid 10-digit mobile number starting with 6-9",
          });
          return;
        }
      } else {
        // International mobile validation
        const mobileRegex = /^\d{7,15}$/;
        if (!mobileRegex.test(cleanMobile)) {
          setErrors({
            identifier: "Please enter a valid mobile number (7-15 digits)",
          });
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const cleanMobile =
        loginType === "mobile" ? formData.identifier.replace(/^0+/, "") : "";
      const otpData = {
        email:
          loginType === "email" ? formData.identifier.toLowerCase().trim() : "",
        mobile: cleanMobile,
        loginType: loginType === "mobile" ? 2 : 3, // 2=Mobile, 3=Email
        phoneCode: loginType === "mobile" ? formData.phoneCode : "",
      };

      const result = await sendOTP(otpData);

      if (result.success) {
        setShowOTPField(true);
        setOtpSent(true);
        setOtpTimer(30); // Reset timer after resend
        if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
        otpIntervalRef.current = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(otpIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        console.log("OTP sent successfully");
      } else {
        setErrors({
          general: result.message || "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setErrors({
        general: error.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request password reset link
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus("");
    if (!forgotEmail.trim()) {
      setForgotStatus("Please enter your email address.");
      return;
    }
    try {
      const baseUrl = window.location.origin + "/reset-password";
      const payload = {
        email: forgotEmail.trim(),
        base_url: baseUrl,
      };
      if (authAPI.sendResetPasswordLink) {
        const res = await authAPI.sendResetPasswordLink(payload);
        console.log("Forgot password API response:", res);
        // Treat any response (no error thrown) as success if status 200 or no error
        if ((res && res.status === 200) || (res && !res.error)) {
          setForgotStatus("Password reset link sent! Please check your email.");
        } else {
          setForgotStatus(res.message || "Failed to send reset link.");
        }
      } else {
        alert("sendResetPasswordLink API not implemented in authAPI.js");
      }
    } catch (err) {
      setForgotStatus("Error sending reset link. Try again later.");
      console.error("Forgot password error:", err);
    }
  };

  // Step 2: Reset password using token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus("");
    if (!resetToken.trim()) {
      setResetStatus("Reset token is required.");
      return;
    }
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      setResetStatus("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetStatus("Passwords do not match.");
      return;
    }
    try {
      const res = await authAPI.resetPassword({
        token: resetToken.trim(),
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      if (res.success || res.status === 200) {
        setResetStatus("Password reset successful! You can now log in.");
      } else {
        setResetStatus(res.message || "Failed to reset password.");
      }
    } catch (err) {
      setResetStatus("Error resetting password. Try again later.");
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
        return "Enter User Email";
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
                        className={`login-type-btn${loginType === "userId" ? " active" : ""
                          }`}
                        onClick={() => handleLoginTypeChange("userId")}
                        style={{
                          border:
                            loginType === "userId"
                              ? "2px solid #da251c"
                              : "1px solid #ddd",
                          color: loginType === "userId" ? "#da251c" : "#333",
                          background:
                            loginType === "userId" ? "#fff5f3" : "#fff",
                          fontWeight:
                            loginType === "userId" ? "bold" : "normal",
                          boxShadow:
                            loginType === "userId"
                              ? "0 2px 8px rgba(218,37,28,0.08)"
                              : "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.border = "2px solid #da251c")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.border =
                          loginType === "userId"
                            ? "2px solid #da251c"
                            : "1px solid #ddd")
                        }
                      >
                        <i className="fas fa-user"></i>
                        User ID
                      </button>
                      <button
                        type="button"
                        className={`login-type-btn${loginType === "mobile" ? " active" : ""
                          }`}
                        onClick={() => handleLoginTypeChange("mobile")}
                        style={{
                          border:
                            loginType === "mobile"
                              ? "2px solid #da251c"
                              : "1px solid #ddd",
                          color: loginType === "mobile" ? "#da251c" : "#333",
                          background:
                            loginType === "mobile" ? "#fff5f3" : "#fff",
                          fontWeight:
                            loginType === "mobile" ? "bold" : "normal",
                          boxShadow:
                            loginType === "mobile"
                              ? "0 2px 8px rgba(218,37,28,0.08)"
                              : "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.border = "2px solid #da251c")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.border =
                          loginType === "mobile"
                            ? "2px solid #da251c"
                            : "1px solid #ddd")
                        }
                      >
                        <i className="fas fa-phone"></i>
                        Mobile
                      </button>
                      <button
                        type="button"
                        className={`login-type-btn${loginType === "email" ? " active" : ""
                          }`}
                        onClick={() => handleLoginTypeChange("email")}
                        style={{
                          border:
                            loginType === "email"
                              ? "2px solid #da251c"
                              : "1px solid #ddd",
                          color: loginType === "email" ? "#da251c" : "#333",
                          background:
                            loginType === "email" ? "#fff5f3" : "#fff",
                          fontWeight: loginType === "email" ? "bold" : "normal",
                          boxShadow:
                            loginType === "email"
                              ? "0 2px 8px rgba(218,37,28,0.08)"
                              : "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.border = "2px solid #da251c")
                        }
                        onMouseLeave={(e) =>
                        (e.currentTarget.style.border =
                          loginType === "email"
                            ? "2px solid #da251c"
                            : "1px solid #ddd")
                        }
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
                      className={`form-control auth-input ${errors.identifier ? "is-invalid" : ""
                        }`}
                      placeholder={getPlaceholder()}
                      value={formData.identifier}
                      onChange={handleChange}
                      required
                      disabled={showOTPField && loginType === "mobile"}
                    />
                    {errors.identifier && (
                      <div className="error-message">{errors.identifier}</div>
                    )}
                    {/* Show general error for mobile/email login when OTP not sent */}
                    {errors.general && (loginType === "mobile" || loginType === "email") && !showOTPField && (
                      <div className="error-message" style={{ marginTop: "4px" }}>
                        {errors.general}
                      </div>
                    )}
                  </div>
                  {/* General Error Message: removed for password errors, only show below input */}

                  {/* Password Field: Only for userId login */}
                  {!showOTPField && loginType === "userId" && (
                    <div className="form-group">
                      <div className="input-icon">
                        <i className="fas fa-lock"></i>
                      </div>
                      <div
                        className="position-relative"
                        style={{ width: "100%" }}
                      >
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={`form-control auth-input ${errors.password ? "is-invalid" : ""
                            }`}
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          style={{ paddingRight: "40px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm position-absolute"
                          style={{
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: "transparent",
                            color: "#6c757d",
                            padding: "0",
                            width: "24px",
                            height: "24px",
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i
                            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"
                              }`}
                          ></i>
                        </button>
                      </div>
                      {/* Show password error below input */}
                      {errors.password && (
                        <div
                          className="error-message"
                          style={{ marginTop: "4px" }}
                        >
                          {errors.password}
                        </div>
                      )}
                      {/* Show general error below password if it's a password error */}
                      {errors.general && !showOTPField && (
                        <div
                          className="error-message"
                          style={{ marginTop: "4px" }}
                        >
                          {errors.general}
                        </div>
                      )}
                    </div>
                  )}

                  {/* OTP Field */}
                  {showOTPField && (
                    <div className="form-group">
                      <div className="input-icon">
                        <i className="fas fa-key"></i>
                      </div>
                      <input
                        type="text"
                        name="otp"
                        className={`form-control auth-input ${errors.otp ? "is-invalid" : ""
                          }`}
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        maxLength="6"
                      />
                      {/* Show OTP error below input */}
                      {errors.otp && (
                        <div
                          className="error-message"
                          style={{ marginTop: "4px" }}
                        >
                          {errors.otp}
                        </div>
                      )}
                      {/* Show general error below OTP if it's an OTP error */}
                      {errors.general && showOTPField && (
                        <div
                          className="error-message"
                          style={{ marginTop: "4px" }}
                        >
                          {errors.general}
                        </div>
                      )}
                      {otpSent && (
                        <div className="text-success small mt-1">
                          OTP sent successfully! Please check your {loginType === "email" ? "email" : "SMS"}.
                        </div>
                      )}
                      {/* Countdown and resend OTP UI */}
                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                        {otpTimer > 0 ? (
                          <span style={{ fontWeight: 500 }}>
                            Didn't get the OTP ?{" "}
                            <i className="fas fa-clock"></i>{" "}
                            <span style={{ fontWeight: "bold" }}>{`00:${otpTimer
                              .toString()
                              .padStart(2, "0")}`}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-link text-primary"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Login with OTP Option for mobile and email */}
                  {(loginType === "mobile" || loginType === "email") &&
                    !showOTPField && (
                      <div className="form-group text-center">
                        <button
                          type="button"
                          className="btn btn-link text-primary"
                          onClick={handleSendOTP}
                          disabled={isLoading || !formData.identifier.trim()}
                        >
                          Send OTP
                        </button>
                      </div>
                    )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn auth-submit-btn"
                    disabled={isLoading}
                    onClick={(e) => {
                      // Check OTP validation before form submission
                      if ((loginType === "mobile" || loginType === "email") && !otpSent) {
                        e.preventDefault();
                        const errorMsg = "Please generate OTP first by clicking 'Send OTP' button";
                        setErrors({ general: errorMsg });
                        return false;
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        {showOTPField ? "Verifying OTP..." : "Logging in..."}
                      </>
                    ) : showOTPField ? (
                      "Verify OTP & Login"
                    ) : (
                      `Login with ${getLoginTypeLabel()}`
                    )}
                  </button>

                  {/* Resend OTP or Back to Password */}
                </form>
                <div className="auth-footer">
                  <p className="auth-link-text">
                    Don't have an account?
                    <NavLink to="/signup" className="auth-link">
                      Sign Up
                    </NavLink>
                  </p>
                  <p className="auth-link-text">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      style={{ fontSize: "1rem" }}
                      onClick={() => setShowForgot(true)}
                    >
                      Forgot Password?
                    </button>
                  </p>
                </div>
                {/* Forgot Password Modal */}
                {showForgot && (
                  <div className="forgot-password-modal">
                    <form
                      onSubmit={handleForgotPassword}
                      style={{
                        maxWidth: 400,
                        margin: "24px auto",
                        background: "#fff",
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: "0 2px 8px #eee",
                      }}
                    >
                      <h4>Forgot Password</h4>
                      <input
                        type="email"
                        className="form-control mb-2"
                        placeholder="Enter your email address"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn btn-primary w-100">
                        Send Reset Link
                      </button>
                      <button
                        type="button"
                        className="btn btn-link w-100 mt-2"
                        onClick={() => setShowForgot(false)}
                      >
                        Cancel
                      </button>
                      {forgotStatus && (
                        <div
                          className="mt-2 text-center"
                          style={{
                            color: forgotStatus.includes("sent")
                              ? "green"
                              : "red",
                          }}
                        >
                          {forgotStatus}
                        </div>
                      )}
                    </form>
                  </div>
                )}
                {/* Reset Password Modal */}
                {showReset && (
                  <div className="reset-password-modal">
                    <form
                      onSubmit={handleResetPassword}
                      style={{
                        maxWidth: 400,
                        margin: "24px auto",
                        background: "#fff",
                        padding: 24,
                        borderRadius: 12,
                        boxShadow: "0 2px 8px #eee",
                      }}
                    >
                      <h4>Reset Password</h4>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Enter reset token from email"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                      />
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
                      <button type="submit" className="btn btn-primary w-100">
                        Reset Password
                      </button>
                      <button
                        type="button"
                        className="btn btn-link w-100 mt-2"
                        onClick={() => setShowReset(false)}
                      >
                        Cancel
                      </button>
                      {resetStatus && (
                        <div
                          className="mt-2 text-center"
                          style={{
                            color: resetStatus.includes("successful")
                              ? "green"
                              : "red",
                          }}
                        >
                          {resetStatus}
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
