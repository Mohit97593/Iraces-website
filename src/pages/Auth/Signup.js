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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpData, setOtpData] = useState({
    userId: null,
    emailOtp: "",
    mobileOtp: "",
  });
  const [phoneCodes, setPhoneCodes] = useState([
    { country_code: "IN", phone_code: "+91", country_name: "India" },
    { country_code: "US", phone_code: "+1", country_name: "United States" },
    { country_code: "UK", phone_code: "+44", country_name: "United Kingdom" },
    { country_code: "CA", phone_code: "+1", country_name: "Canada" },
    { country_code: "AU", phone_code: "+61", country_name: "Australia" },
    { country_code: "AE", phone_code: "+971", country_name: "UAE" },
    { country_code: "SG", phone_code: "+65", country_name: "Singapore" },
    { country_code: "MY", phone_code: "+60", country_name: "Malaysia" },
    { country_code: "PK", phone_code: "+92", country_name: "Pakistan" },
    { country_code: "BD", phone_code: "+880", country_name: "Bangladesh" },
    { country_code: "LK", phone_code: "+94", country_name: "Sri Lanka" },
    { country_code: "NP", phone_code: "+977", country_name: "Nepal" },
  ]);

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
        console.log("Phone codes API response:", response);

        // Check different possible response structures
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

        console.log("Extracted codes:", codes);

        if (codes.length > 0) {
          // Ensure the data has the right format
          const formattedCodes = codes
            .map((code) => {
              const formatted = {
                country_code:
                  code.country_code ||
                  code.CountryCode ||
                  code.code ||
                  code.Code ||
                  "XX",
                phone_code:
                  code.phone_code ||
                  code.PhoneCode ||
                  code.phoneCode ||
                  code.code ||
                  "+1",
                country_name:
                  code.country_name ||
                  code.CountryName ||
                  code.name ||
                  code.Name ||
                  code.country_code ||
                  "Unknown",
              };
              return formatted;
            })
            .filter(
              (code) =>
                code.phone_code &&
                code.country_code &&
                code.phone_code !== "+1" &&
                code.country_code !== "XX"
            );
          console.log("Formatted codes:", formattedCodes);

          if (formattedCodes.length > 0) {
            setPhoneCodes(formattedCodes);
          } else {
            throw new Error("No valid phone codes after formatting");
          }
        } else {
          throw new Error("No phone codes found in response");
        }
      } catch (error) {
        console.error("Failed to fetch phone codes:", error);
        // Set comprehensive default phone codes if API fails
        const defaultCodes = [
          { country_code: "IN", phone_code: "+91", country_name: "India" },
          {
            country_code: "US",
            phone_code: "+1",
            country_name: "United States",
          },
          {
            country_code: "UK",
            phone_code: "+44",
            country_name: "United Kingdom",
          },
          { country_code: "CA", phone_code: "+1", country_name: "Canada" },
          { country_code: "AU", phone_code: "+61", country_name: "Australia" },
          { country_code: "DE", phone_code: "+49", country_name: "Germany" },
          { country_code: "FR", phone_code: "+33", country_name: "France" },
          { country_code: "JP", phone_code: "+81", country_name: "Japan" },
          { country_code: "CN", phone_code: "+86", country_name: "China" },
          { country_code: "AE", phone_code: "+971", country_name: "UAE" },
          { country_code: "SG", phone_code: "+65", country_name: "Singapore" },
          { country_code: "MY", phone_code: "+60", country_name: "Malaysia" },
          { country_code: "TH", phone_code: "+66", country_name: "Thailand" },
          { country_code: "ID", phone_code: "+62", country_name: "Indonesia" },
          {
            country_code: "PH",
            phone_code: "+63",
            country_name: "Philippines",
          },
          { country_code: "VN", phone_code: "+84", country_name: "Vietnam" },
          {
            country_code: "BD",
            phone_code: "+880",
            country_name: "Bangladesh",
          },
          { country_code: "PK", phone_code: "+92", country_name: "Pakistan" },
          { country_code: "LK", phone_code: "+94", country_name: "Sri Lanka" },
          { country_code: "NP", phone_code: "+977", country_name: "Nepal" },
        ];
        setPhoneCodes(defaultCodes);
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
          formData.gender === "male"
            ? "M"
            : formData.gender === "female"
            ? "F"
            : "O",
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

        if (responseData?.data?.UserId) {
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

        // If userId is returned, move to OTP verification step
        if (userId) {
          setOtpData({
            userId: userId,
            emailOtp: "",
            mobileOtp: "",
          });
          setShowOTPStep(true);
        } else {
          // Check if signup was successful but no OTP required
          alert("Signup successful! Please login with your credentials.");
          navigate("/login");
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
                      <div className="row">
                        {/* First Column */}
                        <div className="col-6">
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
                          {/* Mobile Number with Country Code */}
                          <div className="form-group">
                            <div className="input-icon">
                              <i className="fas fa-phone"></i>
                            </div>
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
                                    key={
                                      country.country_code || country.phone_code
                                    }
                                    value={country.phone_code}
                                  >
                                    {country.phone_code} (
                                    {country.country_name ||
                                      country.country_code}
                                    )
                                  </option>
                                ))}
                              </select>
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
                            </div>
                            {errors.mobileNo && (
                              <div className="error-message">
                                {errors.mobileNo}
                              </div>
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
                              <div className="error-message">
                                {errors.password}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Second Column */}
                        <div className="col-6">
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
                              <div className="error-message">
                                {errors.lastName}
                              </div>
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
                              <div className="error-message">
                                {errors.email}
                              </div>
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
                              <div className="error-message">
                                {errors.gender}
                              </div>
                            )}
                          </div>
                          {/* Confirm Password */}
                          <div className="form-group">
                            <div className="input-icon">
                              <i className="fas fa-lock"></i>
                            </div>
                            <div className="position-relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className={`form-control auth-input ${
                                  errors.confirmPassword ? "is-invalid" : ""
                                }`}
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
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
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                              >
                                <i
                                  className={`fas ${
                                    showConfirmPassword
                                      ? "fa-eye-slash"
                                      : "fa-eye"
                                  }`}
                                ></i>
                              </button>
                            </div>
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
                        <div className="input-icon">
                          <i className="fas fa-envelope"></i>
                        </div>
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
                        />
                      </div>

                      {/* Mobile OTP */}
                      <div className="form-group">
                        <div className="input-icon">
                          <i className="fas fa-mobile-alt"></i>
                        </div>
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
