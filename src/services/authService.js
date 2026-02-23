const API_BASE_URL = "http://localhost:8000/api"; // Replace with your Laravel API URL

const authService = {
  // Signup function
  async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          phone: userData.mobileNo,
          password: userData.password,
          password_confirmation: userData.confirmPassword,
          date_of_birth: userData.dob,
          gender: userData.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Store token if provided
      if (data.token) {
        sessionStorage.setItem("auth_token", data.token);
      }
      // Store user_id if provided
      if (data.user_id) {
        sessionStorage.setItem("user_id", data.user_id);
      } else if (data.user && data.user.id) {
        sessionStorage.setItem("user_id", data.user.id);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Login function
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token if provided
      if (data.token) {
        sessionStorage.setItem("auth_token", data.token);
      }
      // Store user_id if provided
      if (data.user_id) {
        sessionStorage.setItem("user_id", data.user_id);
      } else if (data.user && data.user.id) {
        sessionStorage.setItem("user_id", data.user.id);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Logout function
  async logout() {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      sessionStorage.removeItem("auth_token");
      return true;
    } catch (error) {
      // Even if logout fails on server, remove token locally
      sessionStorage.removeItem("auth_token");
      return true;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get user");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!sessionStorage.getItem("auth_token");
  },

  // Get token
  getToken() {
    return sessionStorage.getItem("auth_token");
  },
};

export default authService;
