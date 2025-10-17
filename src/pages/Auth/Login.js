import React, { useState, useEffect } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, sendOTP, loginWithOTP } = useAuth();

  const [loginType, setLoginType] = useState("email");
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
          // Wait a moment for AuthContext to update
          setTimeout(() => {
            const token = localStorage.getItem("token");

            if (token) {
              navigate("/"); // Redirect to home page
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
    if (!formData.identifier.trim()) {
      setErrors({
        identifier: `${getLoginTypeLabel()} is required to send OTP`,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

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
                    {loginType === "mobile" ? (
                      <div className="d-flex">
                        <select
                          name="phoneCode"
                          className="form-control auth-input me-2"
                          style={{ maxWidth: "120px" }}
                          value={formData.phoneCode}
                          onChange={handleChange}
                        >
                          {phoneCodes.map((country) => (
                            <option
                              key={country.country_code}
                              value={country.phone_code}
                            >
                              {country.phone_code} ({country.country_code})
                            </option>
                          ))}
                        </select>
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
                      </div>
                    ) : (
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
                    )}
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
                  {!showOTPField && (
                    <div className="form-group">
                      <div className="input-icon">
                        <i className="fas fa-lock"></i>
                      </div>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className={`form-control auth-input ${
                            errors.password ? "is-invalid" : ""
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
                            className={`fas ${
                              showPassword ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                      {errors.password && (
                        <div className="error-message">{errors.password}</div>
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
                        className={`form-control auth-input ${
                          errors.otp ? "is-invalid" : ""
                        }`}
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        maxLength="6"
                      />
                      {errors.otp && (
                        <div className="error-message">{errors.otp}</div>
                      )}
                      {otpSent && (
                        <div className="text-success small mt-1">
                          OTP sent successfully! Please check your{" "}
                          {loginType === "mobile" ? "SMS" : "email"}.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Login with OTP Option */}
                  {(loginType === "mobile" || loginType === "email") &&
                    !showOTPField && (
                      <div className="form-group text-center">
                        <button
                          type="button"
                          className="btn btn-link text-primary"
                          onClick={handleSendOTP}
                          disabled={isLoading || !formData.identifier.trim()}
                        >
                          Login with OTP instead
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
                        {showOTPField ? "Verifying OTP..." : "Logging in..."}
                      </>
                    ) : showOTPField ? (
                      "Verify OTP & Login"
                    ) : (
                      `Login with ${getLoginTypeLabel()}`
                    )}
                  </button>

                  {/* Resend OTP or Back to Password */}
                  {showOTPField && (
                    <div className="form-group text-center">
                      <button
                        type="button"
                        className="btn btn-link text-secondary me-3"
                        onClick={() => {
                          setShowOTPField(false);
                          setOtpSent(false);
                          setFormData((prev) => ({ ...prev, otp: "" }));
                        }}
                      >
                        Back to Password Login
                      </button>
                      <button
                        type="button"
                        className="btn btn-link text-primary"
                        onClick={handleSendOTP}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
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
