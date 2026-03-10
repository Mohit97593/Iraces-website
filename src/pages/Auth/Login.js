import React, { useState, useEffect, useRef } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import "./Auth.css";

export default function Login() {

  const navigate = useNavigate();
  const { login, sendOTP, loginWithOTP } = useAuth();

  // Helper to handle redirect after login
  const handleLoginRedirect = () => {
    const token = sessionStorage.getItem("token");
    if (token) {
      // 1. Check if we have an explicit redirect after login
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      
      // 2. Clear invitation-related redirects immediately to prevent loops
      if (redirectUrl && redirectUrl.includes("/invitation/")) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate("/");
        return;
      }

      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        // Security Check: Only redirect to internal paths
        const isSafePath = redirectUrl.startsWith("/") && !redirectUrl.startsWith("//");
        if (isSafePath) {
          console.log("🚀 Redirecting to saved path:", redirectUrl);
          navigate(redirectUrl);
        } else {
          console.warn("⚠️ Unsafe redirect blocked:", redirectUrl);
          navigate("/");
        }
      } else {
        // Fallback to home
        navigate("/");
      }
    } else {
      setErrors({
        general: "Login successful but authentication data missing. Please contact support.",
      });
    }
  };

  // Helper to handle login errors
  const handleLoginError = (result) => {
    let errorMessage = result.message || "Login failed. Please check your credentials and try again.";
    if (errorMessage.toLowerCase().includes("user not found") || errorMessage.toLowerCase().includes("invalid credentials")) {
      errorMessage = "Invalid email/mobile or password. Please check your credentials.";
    } else if (errorMessage.toLowerCase().includes("account not verified")) {
      errorMessage = "Your account is not verified. Please check your email/SMS for verification.";
    }
    setErrors({ general: errorMessage });
  };

  const [loginType, setLoginType] = useState("userId");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    otp: "",
    phoneCode: "+91",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneCodes, setPhoneCodes] = useState([
    { country_code: "IN", phone_code: "+91", country_name: "India" },
    { country_code: "US", phone_code: "+1", country_name: "United States" },
    { country_code: "UK", phone_code: "+44", country_name: "United Kingdom" },
  ]);

  const [otpTimer, setOtpTimer] = useState(30);
  const [hasGuestInfo, setHasGuestInfo] = useState(false);
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

  // Check for guest login info on mount
  useEffect(() => {
    const email = sessionStorage.getItem("guestEmail");
    const eventId = sessionStorage.getItem("guestAllowedEventId");
    if (email && eventId) {
      setHasGuestInfo(true);
      console.log("🎟️ Guest login info detected for email:", email);
    }

    // Pre-fill email from pending invitation
    const pendingInv = sessionStorage.getItem("pendingInvitation");
    if (pendingInv) {
      try {
        const { email: invEmail } = JSON.parse(pendingInv);
        if (invEmail) {
          setFormData(prev => ({ ...prev, identifier: invEmail }));
          setLoginType("email");
          console.log("📧 Invitation email pre-filled:", invEmail);
        }
      } catch (e) {
        console.error("Failed to parse pending invitation:", e);
      }
    }
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

      // If OTP field is shown and OTP is provided, handle login
      if (showOTPField && formData.otp) {
        if (loginType === "userId") {
          // Password login with OTP
          const loginData = {
            email: formData.identifier.toLowerCase().trim(),
            password: formData.password,
            otp: formData.otp,
            loginType: 1,
            phoneCode: "",
          };
          const result = await login(loginData);
          if (result.success) {
            handleLoginRedirect();
          } else {
            setErrors({
              general: result.message || "Login failed. Please check OTP and Password.",
            });
          }
        } else {
          // Mobile/Email OTP login (existing flow)
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
            handleLoginRedirect();
          } else {
            setErrors({
              general: result.message || "OTP login failed. Please try again.",
            });
          }
        }
      } else if (loginType === "userId" && !showOTPField) {
        // First step for User ID login: send OTP
        handleSendOTP();
      } else {
        // Regular password login (Mobile/Email password login if ever supported, or fallback)
        // Note: For userId, it now goes through handleSendOTP first
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
          loginType: 1, // 1=Password login
          phoneCode: loginType === "mobile" ? formData.phoneCode : "",
        };
        const result = await login(loginData);
        if (result.success) {
          handleLoginRedirect();
        } else {
          handleLoginError(result);
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

    setIsSendingOTP(true);

    try {
      const cleanMobile =
        loginType === "mobile" ? formData.identifier.replace(/^0+/, "") : "";
      const otpData = {
        email:
          loginType === "email" || loginType === "userId" ? formData.identifier.toLowerCase().trim() : "",
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
      setIsSendingOTP(false);
    }
  };



  const handleGuestLogin = async () => {
    const guestEmail = sessionStorage.getItem("guestEmail");
    if (!guestEmail) {
      setErrors({ general: "Guest login information not found. Please go back to the event page." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const loginData = {
        email: guestEmail.toLowerCase().trim(),
        mobile: "",
        password: "1234567a",
        loginType: 1, // 1=Password login
        phoneCode: "",
      };

      const result = await login(loginData);
      if (result.success) {
        console.log("🎟️ Guest Login successful");
        sessionStorage.setItem("isGuestLogin", "true");

        // Wait a bit for token to be saved by useAuth
        setTimeout(() => {
          const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
          if (redirectUrl) {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectUrl);
          } else {
            navigate("/");
          }
        }, 500);
      } else {
        setErrors({
          general: result.message || "Guest login failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Guest login error:", error);
      setErrors({
        general: error.message || "Guest login failed. Please try again.",
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

                {/* Organizer Invitation Notice */}
                {sessionStorage.getItem("authNote") && (
                  <div className="alert alert-info border-0 shadow-sm mb-4" style={{ borderRadius: "12px", background: "#f0f7ff" }}>
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="fas fa-info-circle fa-lg text-primary"></i>
                      </div>
                      <div style={{ fontSize: "14px", color: "#0056b3", lineHeight: "1.4" }}>
                        {sessionStorage.getItem("authNote")}
                      </div>
                    </div>
                  </div>
                )}
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
                          OTP sent successfully! Please check your {loginType === "email" || loginType === "userId" ? "email" : "SMS"}.
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
                            disabled={isSendingOTP || isLoading}
                          >
                            {isSendingOTP ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Sending...
                              </>
                            ) : (
                              "Resend OTP"
                            )}
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
                          className="btn"
                          style={{
                            background: "#da251c",
                            border: "none",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "600",
                            padding: "10px 24px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(218, 37, 28, 0.2)",
                            display: "inline-block",
                            minWidth: "150px",
                          }}
                          onClick={handleSendOTP}
                          disabled={isSendingOTP || isLoading || !formData.identifier.trim()}
                          onMouseEnter={(e) => {
                            if (!isSendingOTP && !isLoading && formData.identifier.trim()) {
                              e.target.style.background = "#b81f16";
                              e.target.style.boxShadow = "0 4px 12px rgba(218, 37, 28, 0.3)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#da251c";
                            e.target.style.boxShadow = "0 2px 8px rgba(218, 37, 28, 0.2)";
                          }}
                        >
                          {isSendingOTP ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Sending OTP...
                            </>
                          ) : (
                            "Send OTP"
                          )}
                        </button>
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
                        {showOTPField ? "Verifying..." : "Logging in..."}
                      </>
                    ) : showOTPField ? (
                      "Verify & Login"
                    ) : loginType === "userId" ? (
                      "Log In"
                    ) : (
                      "Login"
                    )}
                  </button>

                  {/* Guest Login Button */}
                  {hasGuestInfo && !showOTPField && (
                    <div className="guest-login-container" style={{ marginTop: "16px" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "16px 0",
                        color: "#999"
                      }}>
                        <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
                        <span style={{ padding: "0 10px", fontSize: "14px" }}>OR</span>
                        <div style={{ flex: 1, height: "1px", background: "#eee" }}></div>
                      </div>
                      <button
                        type="button"
                        className="btn w-100"
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                        style={{
                          backgroundColor: "#fff",
                          border: "2px solid #da251c",
                          color: "#da251c",
                          fontWeight: "bold",
                          borderRadius: "12px",
                          padding: "12px",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#da251c";
                          e.target.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#fff";
                          e.target.style.color = "#da251c";
                        }}
                      >
                        <i className="fas fa-user-secret me-2"></i>
                        Guest Login
                      </button>
                      <p style={{
                        fontSize: "12px",
                        color: "#666",
                        textAlign: "center",
                        marginTop: "8px"
                      }}>
                        Continue as guest for <b>{sessionStorage.getItem("guestAllowedEventName")}</b>
                      </p>
                    </div>
                  )}

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
                    <NavLink to="/forgot-password" className="auth-link">
                      Forgot Password?
                    </NavLink>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
