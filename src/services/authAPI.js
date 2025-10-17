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
  // Signup API
  signup: async (userData) => {
    try {
      console.log("Sending signup data:", userData);

      const response = await api.post("/signup", {
        firstname: userData.firstName,
        lastname: userData.lastName,
        email: userData.email,
        mobile: userData.mobile,
        dob: userData.dob, // Format: DD/MM/YYYY
        gender: userData.gender, // M या F
        password: userData.password,
        confirm_password: userData.confirmPassword,
        phone_code: userData.phoneCode || "+91",
        organising_user_id: userData.organisingUserId || 0,
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
      const response = await api.post("/login", {
        Email: loginData.email || loginData.identifier,
        Password: loginData.password,
        LoginType: loginData.loginType || 1, // 1=Email+Password, 2=Mobile+OTP, 3=Email+OTP
        Mobile: loginData.mobile,
        PhoneCode: loginData.phoneCode || "+91",
        ValidOpt: loginData.otp,
        LoginAsOrganiser: loginData.loginAsOrganiser || 0,
      });

      // Handle different response structures
      const responseData = response.data;

      let token = null;
      let userData = null;
      let isSuccess = false;

      // Check if login was successful based on HTTP status
      if (response.status === 200) {
        isSuccess = true;

        // Try to extract user data even if no token
        userData =
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
          // Generate a temporary token if none provided but login was successful
          token = `temp_token_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        }
      }

      // If login was successful (HTTP 200), proceed regardless of token format
      if (isSuccess && token) {
        // Enhance user data with login information
        const enhancedUserData = {
          ...userData,
          // Store the credentials used for login
          loginEmail: loginData.email || loginData.identifier,
          loginMobile: loginData.mobile,
          phoneCode: loginData.phoneCode,
          // Normalize field names
          firstName:
            userData.firstName || userData.firstname || userData.FirstName,
          lastName: userData.lastName || userData.lastname || userData.LastName,
          email:
            userData.email ||
            userData.Email ||
            loginData.email ||
            loginData.identifier,
          mobile: userData.mobile || userData.Mobile || loginData.mobile,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(enhancedUserData));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Return consistent structure
        return {
          status: 200,
          data: {
            token: token,
            userData: enhancedUserData,
          },
          message:
            responseData.message || responseData.Message || "Login successful",
        };
      } else {
        return {
          status: responseData.status || 400,
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
      const response = await api.post("/login", {
        Email: otpData.email || "",
        Mobile: otpData.mobile || "",
        PhoneCode: otpData.phoneCode || "+91",
        ValidOpt: otpData.otp,
        LoginType: otpData.loginType, // 2=Mobile+OTP, 3=Email+OTP
      });

      console.log("Login with OTP response:", response.data);

      // Handle different response structures
      const responseData = response.data;
      let token = null;
      let userData = null;

      // Check different possible response structures
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

      // Token save करें
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Return consistent structure
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
};

// Token को axios header में set करें app load होते समय
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default api;
