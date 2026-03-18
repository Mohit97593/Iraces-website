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

  // Check authentication status on app load and sync across tabs
  useEffect(() => {
    // 1. Storage event listener for cross-tab synchronization
    const handleStorageChange = (event) => {
      // a. Request for session from a new tab
      if (event.key === "request_session_sync") {
        const token = sessionStorage.getItem("token");
        const userData = sessionStorage.getItem("userData");

        if (token && userData) {
          // Send session data (including guest flag) to the requesting tab
          localStorage.setItem("session_sync_data", JSON.stringify({
            token,
            userData,
            isGuestLogin: sessionStorage.getItem("isGuestLogin") || "",
            ts: Date.now() // Use timestamp to ensure event fires
          }));
          // Immediately remove to keep localStorage clean
          localStorage.removeItem("session_sync_data");
        }
      }
      // b. Receiving session data from an existing tab
      else if (event.key === "session_sync_data" && event.newValue) {
        try {
          const syncData = JSON.parse(event.newValue);
          if (syncData.token && syncData.userData) {
            sessionStorage.setItem("token", syncData.token);
            sessionStorage.setItem("userData", syncData.userData);
            // Also restore guest login status so the navbar correctly hides options
            if (syncData.isGuestLogin) {
              sessionStorage.setItem("isGuestLogin", syncData.isGuestLogin);
            } else {
              sessionStorage.removeItem("isGuestLogin");
            }
            checkAuthStatus(); // Update state with synced data
          }
        } catch (e) {
          console.error("Session sync parse error:", e);
        }
      }
      // c. Receiving logout signal from another tab
      else if (event.key === "logout_event") {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 2. Initial synchronization request
    const token = sessionStorage.getItem("token");
    if (!token) {
      // If no session exists in this tab, ask other tabs
      localStorage.setItem("request_session_sync", Date.now().toString());
      localStorage.removeItem("request_session_sync");
    }

    // 3. Normal auth check
    checkAuthStatus();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 4. Automatic processing of pending invitations after login
  useEffect(() => {
    if (isAuthenticated) {
      const processPendingInvitation = async () => {
        const pendingInv = sessionStorage.getItem("pendingInvitation");
        if (pendingInv) {
          try {
            const { orgId, email } = JSON.parse(pendingInv);
            console.log("🔄 Processing pending invitation for:", email);
            await authAPI.acceptOrgInvitation(orgId, email);
            console.log("✅ Invitation accepted automatically after login");
          } catch (error) {
            console.error("❌ Failed to accept invitation after login:", error);
          } finally {
            // Always clean up to prevent repeat calls or stale UI
            sessionStorage.removeItem("pendingInvitation");
            sessionStorage.removeItem("authNote");
          }
        }
      };
      processPendingInvitation();
    }
  }, [isAuthenticated]);

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
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
      setIsAuthenticated(false);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
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
        // Login success, ab getProfile call karo
        try {
          const profileResponse = await authAPI.getProfile();
          if (
            profileResponse &&
            profileResponse.data &&
            profileResponse.data.userData
          ) {
            userData = profileResponse.data.userData[0] || userData;
          }
        } catch (profileError) {
          console.error("Profile fetch after login failed:", profileError);
        }
        // Enhance user data with login credentials
        const enhancedUserData = {
          ...userData,
          loginEmail: loginData.email || loginData.identifier || userData.email,
          loginMobile: loginData.mobile || userData.mobile,
          loginType: loginData.loginType || 1,
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
        const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
      // Signal other tabs to logout
      localStorage.setItem("logout_event", Date.now().toString());
      localStorage.removeItem("logout_event");
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
