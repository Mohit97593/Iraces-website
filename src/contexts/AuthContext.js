import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/authAPI";

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = authAPI.getToken();
      const userData = authAPI.getUserData();

      console.log("Checking auth status:", {
        token: !!token,
        userData: !!userData,
      });

      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Clear any invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginData) => {
    try {
      setIsLoading(true);

      const response = await authAPI.login(loginData);

      // Check for successful login with different response structures
      if (response.status === 200) {
        let userData =
          response.data?.userData || response.userData || response.data || {};

        // Enhance user data with login credentials
        const enhancedUserData = {
          ...userData,
          // Store the email/mobile used for login
          loginEmail: loginData.email || loginData.identifier || userData.email,
          loginMobile: loginData.mobile || userData.mobile,
          loginType: loginData.loginType || 1,
          // Ensure we have proper name fields
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

        setUser(enhancedUserData);
        setIsAuthenticated(true);

        return { success: true, data: response };
      } else {
        // Check if token was still set despite non-200 status
        const token = localStorage.getItem("token");
        if (token) {
          const storedUserData = authAPI.getUserData();
          setUser(storedUserData);
          setIsAuthenticated(true);
          return { success: true, data: response };
        }

        return {
          success: false,
          message:
            response.message ||
            response.Message ||
            "Login failed - invalid credentials",
        };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);

      // Check if token was still set despite error
      const token = localStorage.getItem("token");
      if (token) {
        console.log(
          "AuthContext: Found token despite error, considering login successful"
        );
        const storedUserData = authAPI.getUserData();
        setUser(storedUserData);
        setIsAuthenticated(true);
        return { success: true, data: { token } };
      }

      return {
        success: false,
        message: error.message || error.Message || "Network error during login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.signup(userData);
      console.log("Signup response:", response);

      // Check for successful signup
      if (response.Status === 200 || response.status === 200) {
        return { success: true, data: response };
      } else {
        return {
          success: false,
          message: response.message || response.Message || "Signup failed",
        };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: error.message || error.Message || "Signup failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (otpData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.sendOTP(otpData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Send OTP error:", error);
      return {
        success: false,
        message: error.message || "Failed to send OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = async (otpData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.loginWithOTP(otpData);

      console.log("Auth context loginWithOTP response:", response);

      if (
        (response.status === 200 || response.Status === 200) &&
        (response.data?.token || response.token)
      ) {
        const userData =
          response.data?.userData || response.userData || response.data;
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: response };
      } else {
        return {
          success: false,
          message: response.message || response.Message || "OTP login failed",
        };
      }
    } catch (error) {
      console.error("OTP login error:", error);
      return {
        success: false,
        message: error.message || error.Message || "OTP login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const validateOTP = async (otpData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.validateOTP(otpData);

      if (response.status === 200) {
        // If token is provided, set user as authenticated
        if (response.data?.token) {
          setUser(response.data.userData);
          setIsAuthenticated(true);
        }
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          message: response.message || "OTP validation failed",
        };
      }
    } catch (error) {
      console.error("OTP validation error:", error);
      return {
        success: false,
        message: error.message || "OTP validation failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (userId) => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendOTP(userId);
      return { success: true, data: response };
    } catch (error) {
      console.error("Resend OTP error:", error);
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      const response = await authAPI.forgotPassword(email);
      return { success: true, data: response };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: error.message || "Failed to send password reset email",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    sendOTP,
    loginWithOTP,
    validateOTP,
    resendOTP,
    forgotPassword,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
