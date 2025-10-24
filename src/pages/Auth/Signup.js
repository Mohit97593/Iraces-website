import React, { useState, useEffect } from "react";
import YouCanRunBanner from "./YouCanRunBanner";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import "./Auth.css";
export default function Signup() {
  const navigate = useNavigate();
  const { signup, validateOTP, resendOTP } = useAuth();

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
    phoneCode: "+91",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpData, setOtpData] = useState({
    userId: null,
    emailOtp: "",
    mobileOtp: "",
  });
  const [phoneCodes, setPhoneCodes] = useState([]);

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

  // Fetch phone codes on component mount
  useEffect(() => {
    const fetchPhoneCodes = async () => {
      try {
        const response = await authAPI.getPhoneCodes();
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
        console.log("Raw API codes:", codes);
        if (codes.length > 0) {
          const formattedCodes = codes
            .map((code) => ({
              id: code.id,
              phone_code: code.phonecode,
              emoji: code.emoji,
            }))
            .filter((code) => code.phone_code);
          setPhoneCodes(formattedCodes);
          console.log("Assigned phoneCodes:", formattedCodes);
        } else {
          setPhoneCodes([]);
          console.log("Assigned phoneCodes: []");
        }
      } catch (error) {
        setPhoneCodes([]);
        console.log("Assigned phoneCodes: [] (error)");
      }
    };
    fetchPhoneCodes();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.mobileNo.trim()) {
      newErrors.mobileNo = "Mobile number is required";
    } else {
      // Remove any leading zeros and validate
      const cleanMobile = formData.mobileNo.replace(/^0+/, "");

      // Different validation based on country code
      if (formData.phoneCode === "+91") {
        // Indian mobile validation
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(cleanMobile)) {
          newErrors.mobileNo =
            "Please enter a valid 10-digit mobile number starting with 6-9";
        }
      } else {
        // International mobile validation (basic)
        const mobileRegex = /^\d{7,15}$/;
        if (!mobileRegex.test(cleanMobile)) {
          newErrors.mobileNo =
            "Please enter a valid mobile number (7-15 digits)";
        }
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (
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
      // Clean mobile number before sending
      const cleanMobile = formData.mobileNo.replace(/^0+/, "");

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase().trim(),
        mobile: cleanMobile,
        dob: formData.dob,
        gender:
          formData.gender === "male" ? 1 : formData.gender === "female" ? 2 : 3,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneCode: formData.phoneCode,
      };

      console.log("Sending signup data:", userData);

      const result = await signup(userData);

      if (result.success) {
        // Check for UserId in different response structures
        let userId = null;
        const responseData = result.data;

        // Support userData.id from nested response structure
        if (responseData?.data?.userData?.id) {
          userId = responseData.data.userData.id;
        } else if (responseData?.userData?.id) {
          userId = responseData.userData.id;
        } else if (responseData?.data?.UserId) {
          userId = responseData.data.UserId;
        } else if (responseData?.UserId) {
          userId = responseData.UserId;
        } else if (responseData?.data?.user_id) {
          userId = responseData.data.user_id;
        } else if (responseData?.user_id) {
          userId = responseData.user_id;
        } else if (responseData?.data?.UserID) {
          userId = responseData.data.UserID;
        } else if (responseData?.UserID) {
          userId = responseData.UserID;
        }

        // Always require OTP verification after signup
        if (userId) {
          setOtpData({
            userId: userId,
            emailOtp: "",
            mobileOtp: "",
          });
          setShowOTPModal(true);
        } else {
          setErrors({
            general: "Signup failed. User ID not found. Please try again.",
          });
        }
      } else {
        setErrors({
          general: result.message || "Signup failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        general: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (!otpData.emailOtp && !otpData.mobileOtp) {
      setErrors({
        general: "Please enter at least one OTP (Email or Mobile)",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await validateOTP({
        userId: otpData.userId,
        emailOtp: otpData.emailOtp,
        mobileOtp: otpData.mobileOtp,
      });

      if (result.success) {
        console.log("OTP verification successful");
        navigate("/login");
      } else {
        setErrors({
          general:
            result.message || "OTP verification failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setErrors({
        general: error.message || "OTP verification failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!otpData.userId) return;

    setIsLoading(true);
    try {
      const result = await resendOTP(otpData.userId);
      if (result.success) {
        console.log("OTP resent successfully");
        // Show success message
      } else {
        setErrors({
          general: result.message || "Failed to resend OTP",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrors({
        general: error.message || "Failed to resend OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* OTP Modal Popup */}
      {showOTPModal && (
        <div
          className="otp-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="otp-modal-content"
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px 24px",
              minWidth: "340px",
              boxShadow: "0 4px 24px rgba(218,37,28,0.10)",
              position: "relative",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: "18px" }}>
              Verify Your Account
            </h2>
            <p style={{ textAlign: "center", marginBottom: "18px" }}>
              Please enter the OTP sent to your email and mobile
            </p>
            <form onSubmit={handleOTPVerification}>
              <div className="form-group">
                <input
                  type="text"
                  name="emailOtp"
                  className="form-control auth-input"
                  placeholder="Email OTP"
                  value={otpData.emailOtp}
                  onChange={(e) =>
                    setOtpData({ ...otpData, emailOtp: e.target.value })
                  }
                  maxLength="6"
                  style={{ fontSize: "15px", marginBottom: "12px" }}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="mobileOtp"
                  className="form-control auth-input"
                  placeholder="Mobile OTP"
                  value={otpData.mobileOtp}
                  onChange={(e) =>
                    setOtpData({ ...otpData, mobileOtp: e.target.value })
                  }
                  maxLength="6"
                  style={{ fontSize: "15px", marginBottom: "12px" }}
                />
              </div>
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}
              <button
                type="submit"
                className="btn auth-submit-btn"
                disabled={isLoading}
                style={{ width: "100%", marginBottom: "10px" }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Verifying...
                  </>
                ) : (
                  "Verify & Complete Signup"
                )}
              </button>
              <div className="form-group text-center">
                <button
                  type="button"
                  className="btn btn-link text-primary"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
              <div className="form-group text-center">
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0"
                  onClick={() => setShowOTPModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

          {/* Right Side - Form */}
          <div className="col-lg-6 col-md-8 col-sm-10 mx-auto">
            <div className="auth-form-container">
              <div className="auth-card">
                {!showOTPStep ? (
                  // Signup Form
                  <>
                    <div className="auth-header">
                      <h1 className="auth-title">Let's get you enrolled !</h1>
                      <p className="auth-subtitle">
                        Your all-in-one event planning tool
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="auth-form">
                      {/* Responsive field order for mobile and desktop - only one set per view */}
                      <div className="row">
                        {/* Mobile: stack fields in correct order */}
                        {window.innerWidth < 992 ? (
                          <div className="col-12">
                            <div className="form-group">
                              <input type="text" name="firstName" className={`form-control auth-input ${errors.firstName ? "is-invalid" : ""}`} placeholder="First Name" value={formData.firstName} onChange={handleChange} required style={{ fontSize: "14px" }} />
                              {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                            </div>
                            <div className="form-group">
                              <input type="text" name="lastName" className={`form-control auth-input ${errors.lastName ? "is-invalid" : ""}`} placeholder="Last Name" value={formData.lastName} onChange={handleChange} required style={{ fontSize: "14px" }} />
                              {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                            </div>
                            <div className="form-group">
                              <div className="d-flex">
                                <select name="phoneCode" className="form-control auth-input me-2" style={{ maxWidth: "82px" }} value={formData.phoneCode} onChange={handleChange}>
                                  {phoneCodes.length === 0 ? (<option value="">No country codes found</option>) : (phoneCodes.map((country) => (<option key={country.id} value={country.phone_code}>{country.phone_code} {country.emoji}</option>)))}
                                </select>
                                <input type="tel" name="mobileNo" className={`form-control auth-input ${errors.mobileNo ? "is-invalid" : ""}`} placeholder="Mobile Number" value={formData.mobileNo} onChange={handleChange} required style={{ fontSize: "14px" }} />
                              </div>
                              {errors.mobileNo && <div className="error-message">{errors.mobileNo}</div>}
                            </div>
                            <div className="form-group">
                              <input type="email" name="email" className={`form-control auth-input ${errors.email ? "is-invalid" : ""}`} placeholder="Email ID" value={formData.email} onChange={handleChange} required style={{ fontSize: "14px" }} />
                              {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                              <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "12px", top: "7px", fontSize: "11px", color: "#888", pointerEvents: "none" }}>Date of Birth</span>
                                <input type="date" name="dob" id="dob" className={`form-control auth-input ${errors.dob ? "is-invalid" : ""}`} value={formData.dob} onChange={handleChange} required style={{ fontSize: "14px", paddingTop: "20px" }} />
                              </div>
                              {errors.dob && <div className="error-message">{errors.dob}</div>}
                            </div>
                            <div className="form-group">
                              <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "12px", top: "7px", fontSize: "11px", color: "#888", pointerEvents: "none" }}>Gender</span>
                                <select name="gender" className={`form-control auth-input ${errors.gender ? "is-invalid" : ""}`} value={formData.gender} onChange={handleChange} required style={{ fontSize: "15px", paddingTop: "20px" }}>
                                  <option value="">Select Gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              {errors.gender && <div className="error-message">{errors.gender}</div>}
                            </div>
                            <div className="form-group">
                              <div className="position-relative">
                                <input type={showPassword ? "text" : "password"} name="password" className={`form-control auth-input ${errors.password ? "is-invalid" : ""}`} placeholder="Password" value={formData.password} onChange={handleChange} required style={{ paddingRight: "40px", fontSize: "14px" }} />
                                <button type="button" className="btn btn-sm position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#6c757d", padding: "0", width: "24px", height: "24px" }} onClick={() => setShowPassword(!showPassword)}>
                                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                              </div>
                              {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                            <div className="form-group">
                              <div className="position-relative">
                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={`form-control auth-input ${errors.confirmPassword ? "is-invalid" : ""}`} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={{ paddingRight: "40px", fontSize: "14px" }} />
                                <button type="button" className="btn btn-sm position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#6c757d", padding: "0", width: "24px", height: "24px" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                  <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                              </div>
                              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="col-6">
                              {/* First Name */}
                              <div className="form-group">
                                <input type="text" name="firstName" className={`form-control auth-input ${errors.firstName ? "is-invalid" : ""}`} placeholder="First Name" value={formData.firstName} onChange={handleChange} required style={{ fontSize: "14px" }} />
                                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                              </div>
                              {/* Mobile Number with Country Code */}
                              <div className="form-group">
                                <div className="d-flex">
                                  <select name="phoneCode" className="form-control auth-input me-2" style={{ maxWidth: "82px" }} value={formData.phoneCode} onChange={handleChange}>
                                    {phoneCodes.length === 0 ? (<option value="">No country codes found</option>) : (phoneCodes.map((country) => (<option key={country.id} value={country.phone_code}>{country.phone_code} {country.emoji}</option>)))}
                                  </select>
                                  <input type="tel" name="mobileNo" className={`form-control auth-input ${errors.mobileNo ? "is-invalid" : ""}`} placeholder="Mobile Number" value={formData.mobileNo} onChange={handleChange} required style={{ fontSize: "14px" }} />
                                </div>
                                {errors.mobileNo && <div className="error-message">{errors.mobileNo}</div>}
                              </div>
                              {/* Date of Birth */}
                              <div className="form-group">
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: "12px", top: "7px", fontSize: "11px", color: "#888", pointerEvents: "none" }}>Date of Birth</span>
                                  <input type="date" name="dob" id="dob" className={`form-control auth-input ${errors.dob ? "is-invalid" : ""}`} value={formData.dob} onChange={handleChange} required style={{ fontSize: "14px", paddingTop: "20px" }} />
                                </div>
                                {errors.dob && <div className="error-message">{errors.dob}</div>}
                              </div>
                              {/* Password */}
                              <div className="form-group">
                                <div className="position-relative">
                                  <input type={showPassword ? "text" : "password"} name="password" className={`form-control auth-input ${errors.password ? "is-invalid" : ""}`} placeholder="Password" value={formData.password} onChange={handleChange} required style={{ paddingRight: "40px", fontSize: "14px" }} />
                                  <button type="button" className="btn btn-sm position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#6c757d", padding: "0", width: "24px", height: "24px" }} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                  </button>
                                </div>
                                {errors.password && <div className="error-message">{errors.password}</div>}
                              </div>
                            </div>
                            <div className="col-6">
                              {/* Last Name */}
                              <div className="form-group">
                                <input type="text" name="lastName" className={`form-control auth-input ${errors.lastName ? "is-invalid" : ""}`} placeholder="Last Name" value={formData.lastName} onChange={handleChange} required style={{ fontSize: "14px" }} />
                                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                              </div>
                              {/* Email */}
                              <div className="form-group">
                                <input type="email" name="email" className={`form-control auth-input ${errors.email ? "is-invalid" : ""}`} placeholder="Email ID" value={formData.email} onChange={handleChange} required style={{ fontSize: "14px" }} />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                              </div>
                              {/* Gender */}
                              <div className="form-group">
                                <div style={{ position: "relative" }}>
                                  <span style={{ position: "absolute", left: "12px", top: "7px", fontSize: "11px", color: "#888", pointerEvents: "none" }}>Gender</span>
                                  <select name="gender" className={`form-control auth-input ${errors.gender ? "is-invalid" : ""}`} value={formData.gender} onChange={handleChange} required style={{ fontSize: "15px", paddingTop: "20px" }}>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                {errors.gender && <div className="error-message">{errors.gender}</div>}
                              </div>
                              {/* Confirm Password */}
                              <div className="form-group">
                                <div className="position-relative">
                                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={`form-control auth-input ${errors.confirmPassword ? "is-invalid" : ""}`} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={{ paddingRight: "40px", fontSize: "14px" }} />
                                  <button type="button" className="btn btn-sm position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "#6c757d", padding: "0", width: "24px", height: "24px" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                  </button>
                                </div>
                                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                              </div>
                            </div>
                          </>
                        )}
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
                            I acknowledge the
                            <a
                              href="https://youtoocanrun.com/terms-and-conditions-for-use/"
                              target="blank"
                              style={{ textDecoration: "none", color: "black" }}
                            >
                              {" "}
                              Terms of Services{" "}
                            </a>
                            &
                            <a
                              href="https://youtoocanrun.com/privacy-policy/"
                              target="blank"
                              style={{ textDecoration: "none", color: "black" }}
                            >
                              {" "}
                              Privacy Policy.{" "}
                            </a>
                          </span>
                        </label>
                        {errors.agreeToTerms && (
                          <div className="error-message">
                            {errors.agreeToTerms}
                          </div>
                        )}
                      </div>

                      {/* General Error Message */}
                      {errors.general && (
                        <div className="alert alert-danger" role="alert">
                          {errors.general}
                        </div>
                      )}

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
                            Creating Account...
                          </>
                        ) : (
                          "Sign Up"
                        )}
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
                  </>
                ) : (
                  // OTP Verification Step
                  <>
                    <div className="auth-header">
                      <h1 className="auth-title">Verify Your Account</h1>
                      <p className="auth-subtitle">
                        Please enter the OTP sent to your email and mobile
                      </p>
                    </div>
                    <form
                      onSubmit={handleOTPVerification}
                      className="auth-form"
                    >
                      {/* Email OTP */}
                      <div className="form-group">
                        <input
                          type="text"
                          name="emailOtp"
                          className="form-control auth-input"
                          placeholder="Email OTP"
                          value={otpData.emailOtp}
                          onChange={(e) =>
                            setOtpData({ ...otpData, emailOtp: e.target.value })
                          }
                          maxLength="6"
                          style={{ fontSize: "15px" }}
                        />
                      </div>

                      {/* Mobile OTP */}
                      <div className="form-group">
                        <input
                          type="text"
                          name="mobileOtp"
                          className="form-control auth-input"
                          placeholder="Mobile OTP"
                          value={otpData.mobileOtp}
                          onChange={(e) =>
                            setOtpData({
                              ...otpData,
                              mobileOtp: e.target.value,
                            })
                          }
                          maxLength="6"
                          style={{ fontSize: "15px" }}
                        />
                      </div>

                      {/* General Error Message */}
                      {errors.general && (
                        <div className="alert alert-danger" role="alert">
                          {errors.general}
                        </div>
                      )}

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
                            Verifying...
                          </>
                        ) : (
                          "Verify & Complete Signup"
                        )}
                      </button>

                      {/* Resend OTP */}
                      <div className="form-group text-center">
                        <button
                          type="button"
                          className="btn btn-link text-primary"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </form>
                    <div className="auth-footer">
                      <p className="auth-link-text">
                        <button
                          type="button"
                          className="btn btn-link text-secondary p-0"
                          onClick={() => setShowOTPStep(false)}
                        >
                          Back to Signup
                        </button>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
