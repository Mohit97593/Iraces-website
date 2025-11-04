import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// Axios instance बनाएं
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor - headers के लिए
api.interceptors.request.use(
  (config) => {
    // Token add करें if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - token handling के लिए
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired या invalid
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API Functions
export const authAPI = {
  // Send Reset Password Link
  sendResetPasswordLink: async ({ email, base_url }) => {
    try {
      const response = await api.post("/send_reset_password_link", {
        email,
        base_url,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Personal Details API
  personalDetails: async (details) => {
    try {
      const formData = new FormData();
      formData.append("firstname", details.firstName);
      formData.append("lastname", details.lastName);
      formData.append("mobile", details.mobile);
      formData.append("email", details.email);
      formData.append("gender", details.gender);
      formData.append("dob", details.dob);
      formData.append("about_you", details.about_you);
      const response = await api.post("/personal_details", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("PersonalDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Signup API
  signup: async (userData) => {
    try {
      console.log("Sending signup data:", userData);

      const formData = new FormData();
      formData.append("firstname", userData.firstName);
      formData.append("lastname", userData.lastName);
      formData.append("email", userData.email);
      formData.append("mobile", userData.mobile);
      formData.append("dob", userData.dob); // Format: DD/MM/YYYY
      formData.append("gender", userData.gender); // M या F
      formData.append("password", userData.password);
      formData.append("confirm_password", userData.confirmPassword);
      formData.append("phone_code", userData.phoneCode || "+91");
      formData.append("organising_user_id", userData.organisingUserId || 0);
      const response = await api.post("/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Signup API response:", response);
      console.log("Signup response data:", response.data);

      return response.data;
    } catch (error) {
      console.error("Signup API error:", error);
      console.error("Error response:", error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Login API
  login: async (loginData) => {
    try {
      const formData = new FormData();
      formData.append("LoginType", loginData.loginType || 1);
      formData.append("Email", loginData.email || loginData.identifier || "");
      formData.append("Password", loginData.password || "");
      const response = await api.post("/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const responseData = response.data;
      let token = null;
      let userData = null;
      let isSuccess = false;

      // Success if validate === 0, failure if validate === 1
      if (response.status === 200 && responseData.validate === 0) {
        isSuccess = true;
        userData =
          responseData.data?.userData ||
          responseData.data ||
          responseData.user ||
          responseData.userData ||
          responseData;

        // Extract token from different possible locations
        if (responseData.data?.token) {
          token = responseData.data.token;
        } else if (responseData.token) {
          token = responseData.token;
        } else if (responseData.data?.Token) {
          token = responseData.data.Token;
        } else if (responseData.Token) {
          token = responseData.Token;
        } else if (responseData.access_token) {
          token = responseData.access_token;
        } else if (responseData.data?.access_token) {
          token = responseData.data.access_token;
        } else if (responseData.auth_token) {
          token = responseData.auth_token;
        } else if (responseData.data?.auth_token) {
          token = responseData.data.auth_token;
        } else {
          token = `temp_token_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        }

        // Merge all possible user fields
        const enhancedUserData = {
          ...userData,
          loginEmail: loginData.email || loginData.identifier,
          loginMobile: loginData.mobile,
          phoneCode:
            userData.phone_code ||
            userData.phoneCode ||
            loginData.phoneCode ||
            "",
          firstName:
            userData.firstName ||
            userData.firstname ||
            userData.FirstName ||
            "",
          lastName:
            userData.lastName || userData.lastname || userData.LastName || "",
          email:
            userData.email ||
            userData.Email ||
            loginData.email ||
            loginData.identifier ||
            "",
          mobile: userData.mobile || userData.Mobile || loginData.mobile || "",
          dob: userData.dob || userData.DOB || userData.birth_date || "",
          gender: userData.gender || userData.Gender || "",
        };

        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(enhancedUserData));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return {
          success: true,
          status: 200,
          data: {
            token: token,
            userData: enhancedUserData,
          },
          message:
            responseData.message || responseData.Message || "Login successful",
        };
      } else {
        // Failure case: validate === 1 or other error
        userData =
          responseData.data?.userData ||
          responseData.data ||
          responseData.user ||
          responseData.userData ||
          responseData;
        return {
          success: false,
          status: responseData.status || 400,
          data: {
            userData: userData,
          },
          message:
            responseData.message ||
            responseData.Message ||
            "Login failed - invalid credentials",
        };
      }
    } catch (error) {
      console.error("Login API error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        error.message ||
        "Login failed";
      throw { message: errorMessage, ...error.response?.data };
    }
  },

  // Send OTP
  sendOTP: async (otpData) => {
    try {
      const response = await api.post("/user_send_otp", {
        Email: otpData.email || "",
        Mobile: otpData.mobile || "",
        PhoneCode: otpData.phoneCode || "+91",
        LoginType: otpData.loginType, // 2=Mobile, 3=Email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login with OTP
  loginWithOTP: async (otpData) => {
    try {
      // Determine LoginType and identifier for OTP login
      let payload = {
        PhoneCode: otpData.phoneCode || "+91",
        ValidOpt: otpData.otp,
      };
      if (otpData.loginType === 2) {
        // Mobile OTP login
        payload.Mobile = otpData.mobile || "";
        payload.LoginType = 2;
      } else if (otpData.loginType === 3) {
        // Email OTP login
        payload.Email = otpData.email || "";
        payload.LoginType = 3;
      }
      const response = await api.post("/login", payload);
      console.log("Login with OTP response:", response.data);
      const responseData = response.data;
      let token = null;
      let userData = null;
      if (responseData.data?.token) {
        token = responseData.data.token;
        userData = responseData.data.userData || responseData.data;
      } else if (responseData.token) {
        token = responseData.token;
        userData = responseData.userData || responseData;
      } else if (responseData.data?.Token) {
        token = responseData.data.Token;
        userData = responseData.data;
      }
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return {
          status: 200,
          data: {
            token: token,
            userData: userData,
          },
          message: responseData.message || "Login successful",
        };
      }
      return response.data;
    } catch (error) {
      console.error("Login with OTP API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // OTP Validation (after signup)
  validateOTP: async (otpData) => {
    try {
      const response = await api.post("/validate_otp", {
        UserId: otpData.userId,
        EmailOtp: otpData.emailOtp || "",
        MobileOtp: otpData.mobileOtp || "",
      });

      // Token save करें if provided
      if (response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.data.userData)
        );
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.data.token}`;
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resend OTP
  resendOTP: async (userId) => {
    try {
      const response = await api.post("/resend_otp", {
        UserId: userId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Country Phone Codes
  getPhoneCodes: async () => {
    try {
      const response = await api.post("/country_phonecode");
      return response.data;
    } catch (error) {
      console.error("Phone codes API error:", error);
      // Don't throw error, return empty to use fallback
      return { PhoneCode: [] };
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/forgot_password", {
        email: email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.post("/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      delete api.defaults.headers.common["Authorization"];
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Get Profile API
  getProfile: async () => {
    try {
      const response = await api.get("/get_profile");
      return response.data;
    } catch (error) {
      console.error("GetProfile API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // General Details API (for Basic Information)
  generalDetails: async (details) => {
    try {
      const formData = new FormData();
      formData.append(
        "emergency_contact_person",
        details.emergency_contact_person
      );
      formData.append("emergency_contact_no", details.emergency_contact_no);
      formData.append("organization", details.organization);
      formData.append("designation", details.designation);
      formData.append("id_proof_type", details.id_proof_type);
      formData.append("id_proof_no", details.id_proof_no);
      if (details.id_proof_doc_upload) {
        formData.append("id_proof_doc_upload", details.id_proof_doc_upload);
      }
      const response = await api.post("/general_details", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("GeneralDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Token को axios header में set करें app load होते समय
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
