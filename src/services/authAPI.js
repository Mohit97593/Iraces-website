import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const IMG_BASE_URL = BASE_URL.replace("/api", "") + "/uploads/profile_images/";

// Axios instance बनाएं
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor - headers के लिए
api.interceptors.request.use(
  (config) => {
    // Token add करें if available
    const token = sessionStorage.getItem("token");
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
      // Check if we're on payment success page - don't redirect
      const currentPath = window.location.pathname;
      if (currentPath.includes('/payment/success') || currentPath.includes('/payment/failure')) {
        console.warn('⚠️ 401 error on payment page - not redirecting to login');
        return Promise.reject(error);
      }

      // Token expired या invalid
      // Save current URL to redirect back after login
      const fullPath = window.location.pathname + window.location.search;
      console.log("🔐 401 Error - Current path:", fullPath);
      if (fullPath !== "/login" && fullPath !== "/") {
        sessionStorage.setItem("redirectAfterLogin", fullPath);
        console.log("💾 Saved redirect URL:", fullPath);
      } else {
        console.log("⏭️ Skipping redirect save (login or home page)");
      }

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API Functions
export const authAPI = {
  // Get Maintenance Mode Status
  getMaintenanceMode: async () => {
    try {
      const response = await api.get("/get_maintancemode");
      return response.data;
    } catch (error) {
      console.error("getMaintenanceMode API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Helper to get full image URL
  getImageUrl: (path) => {
    if (!path || path.trim() === "")
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    if (path.startsWith("http")) return path;
    return `${IMG_BASE_URL}${path}`;
  },
  // All Event Details API (for MyEvents page)
  allEventDetails: async (payload) => {
    try {
      // Accepts either FormData or plain object
      let formData;
      if (payload instanceof FormData) {
        formData = payload;
      } else {
        formData = new FormData();
        if (payload) {
          Object.keys(payload).forEach((key) => {
            formData.append(key, payload[key]);
          });
        }
      }
      const response = await api.post("/AllEventDetails", formData);
      return response.data;
    } catch (error) {
      console.error("allEventDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get All Events (Simple - only id and name) for Team Member Assignment
  getEvent: async () => {
    try {
      const response = await api.post("/get_events");
      return response.data;
    } catch (error) {
      console.error("getEvent API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // ...existing code...
  // Add/Edit Age Criteria API
  addEditAgeCriteria: async (payload) => {
    try {
      // Accept FormData directly
      const response = await api.post("/add_edit_age_criteria", payload, {
        headers:
          payload instanceof FormData
            ? {}
            : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("addEditAgeCriteria API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get Ticket Detail API
  getTicketDetail: async (ticket_id) => {
    try {
      const formData = new FormData();
      formData.append("ticket_id", ticket_id.toString());
      const response = await api.post("/get_ticket_detail", formData);
      return response.data;
    } catch (error) {
      console.error("getTicketDetail API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Form common details (form master list / form actions)
  formCommonDetails: async (formData) => {
    try {
      const response = await api.post("/FormCommonDetails", formData);
      return response.data;
    } catch (error) {
      console.error("formCommonDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // General Form Questions API
  generalFormQuestions: async (formData) => {
    try {
      const response = await api.post("/GeneralFormQuestions", formData);
      return response.data;
    } catch (error) {
      console.error("generalFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Add General Form Questions API
  addGeneralFormQuestions: async (formData) => {
    try {
      const response = await api.post("/AddGeneralFormQuestions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("addGeneralFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Update Event Form Question API
  updateEventFormQuestion: async (payload) => {
    try {
      // Convert payload to JSON format as per API documentation
      const response = await api.post("/updateEventFormQuestion", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("updateEventFormQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Delete Event Form Question API
  deleteEventFormQuestions: async (formData) => {
    try {
      const response = await api.post("/deleteEventFormQuestions", formData);
      return response.data;
    } catch (error) {
      console.error("deleteEventFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Delete General Form Question API
  deleteGeneralFormQuestion: async (id) => {
    try {
      const response = await api.post("/deleteGeneralFormQuestion", { id }, {
        headers: { "Content-Type": "application/json" }
      });
      return response.data;
    } catch (error) {
      console.error("deleteGeneralFormQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Delete Event Ticket API
  deleteEventTicket: async (formData) => {
    try {
      const response = await api.post("/delete_event_ticket", formData);
      return response.data;
    } catch (error) {
      console.error("deleteEventTicket API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Delete Event Communication/FAQ/Age Category API
  deleteEventCommFqa: async (formData) => {
    try {
      const response = await api.post("/delete_event_comm_faq", formData);
      return response.data;
    } catch (error) {
      console.error("deleteEventCommFqa API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Alternate wrapper with snake_case name required by caller
  delete_event_comm_faq: async (formData) => {
    try {
      const response = await api.post("/delete_event_comm_faq", formData);
      return response.data;
    } catch (error) {
      console.error("delete_event_comm_faq API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Convenience helper to delete coupon (sends FormData)
  deleteCoupon: async (event_id, event_comm_id) => {
    try {
      const formData = new FormData();
      formData.append("event_id", event_id);
      formData.append("event_comm_id", event_comm_id);
      formData.append("common_flag", "coupon_delete");
      const response = await api.post("/delete_event_comm_faq", formData);
      return response.data;
    } catch (error) {
      console.error("deleteCoupon API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Remove/Add Question Ticket PDF display flag
  removeAddQuestionTicketPdf: async (formData) => {
    try {
      const response = await api.post("/removeAddQuestionTicketPdf", formData);
      return response.data;
    } catch (error) {
      console.error("removeAddQuestionTicketPdf API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Event Form Question Sorting API
  eventFormQuestionSorting: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);

      // Add event_form_question_array as nested array structure
      if (payload.event_form_question_array && Array.isArray(payload.event_form_question_array)) {
        payload.event_form_question_array.forEach((question, index) => {
          Object.keys(question).forEach((key) => {
            formData.append(`event_form_question_array[${index}][${key}]`, question[key] || "");
          });
        });
      }

      const response = await api.post("/EventFormQuestionsSorting", formData);
      return response.data;
    } catch (error) {
      console.error("eventFormQuestionSorting API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Add custom form question API
  addCustomFormQuestions: async (formData) => {
    try {
      const response = await api.post("/AddCustomFormQuestions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("addCustomFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Edit Event Communication/FAQ/Age Category API (fetch details for edit)
  editEventCommFqa: async (formData) => {
    try {
      const response = await api.post("/edit_event_comm_faq", formData);
      return response.data;
    } catch (error) {
      console.error("editEventCommFqa API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Add/Edit Terms & Conditions API
  addEditTermsConditions: async (formData) => {
    try {
      const response = await api.post("/add_edit_terms_conditions", formData);
      return response.data;
    } catch (error) {
      console.error("addEditTermsConditions API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Add Event FAQ API
  addEventFaq: async (formData) => {
    try {
      const response = await api.post("/event_faq", formData);
      return response.data;
    } catch (error) {
      console.error("addEventFaq API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Event Integration API - toggle popup flag for event
  eventIntegration: async (event_id, popup_flag = 0) => {
    try {
      const formData = new FormData();
      formData.append("event_id", String(event_id));
      formData.append("popup_flag", String(popup_flag));
      const response = await api.post("/event_integration", formData);
      return response.data;
    } catch (error) {
      console.error("eventIntegration API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Event delete or change status API
  eventDeleteChangeStatus: async (payload) => {
    try {
      // Accepts either FormData or plain object
      let formData;
      if (payload instanceof FormData) {
        formData = payload;
      } else {
        formData = new FormData();
        if (payload) {
          Object.keys(payload).forEach((key) => {
            formData.append(key, payload[key]);
          });
        }
      }
      const response = await api.post("/EventDeleteChangeStatus", formData);
      return response.data;
    } catch (error) {
      console.error("eventDeleteChangeStatus API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get Timezones API
  getTimezones: async (params = {}) => {
    try {
      const response = await api.post("/timezone", params);
      return response.data;
    } catch (error) {
      console.error("GetTimezones API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get Event Ticket API
  getEventTicket: async (event_id) => {
    try {
      const payload = { event_id };
      const response = await api.post("/get_event_ticket", payload);
      return response.data;
    } catch (error) {
      console.error("getEventTicket API error:", error);
      throw error.response?.data || error.message;
      3;
    }
  },
  // Add/Edit Coupon API

  addEditCoupon: async (formData) => {
    try {
      // Let axios set multipart/form-data and boundary when sending FormData
      const config =
        formData instanceof FormData
          ? {}
          : { headers: { "Content-Type": "application/json" } };
      const response = await api.post("/add_edit_coupon", formData, config);
      return response.data;
    } catch (error) {
      console.error("addEditCoupon API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Edit Individual Coupon Code API
  editCouponCode: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("coupon_id", payload.coupon_id);
      formData.append("DiscountCodeEdit", payload.DiscountCodeEdit);
      if (payload.edit_coupon_id) {
        formData.append("edit_coupon_id", payload.edit_coupon_id);
      }
      const response = await api.post("/add_edit_coupon_code", formData);
      return response.data;
    } catch (error) {
      console.error("editCouponCode API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Coupon Status API - returns coupon display location
  getCouponStatus: async (event_id) => {
    try {
      const payload = { event_id };
      const response = await api.post("/getCouponStatus", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("getCouponStatus API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get Roles API
  getRoles: async () => {
    try {
      const response = await api.post("/get_roles");
      return response.data;
    } catch (error) {
      console.error("GetRoles API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Check User Last Login Details API
  checkUserLastLoginDetails: async (user_id = null) => {
    try {
      const payload = {};
      if (user_id) payload.user_id = user_id;
      const response = await api.post("/checkUserLastLoginDetails", payload);
      return response.data;
    } catch (error) {
      console.error("checkUserLastLogin API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Events API
  getEvents: async (params = {}) => {
    try {
      const response = await api.post("/events", params);
      return response.data;
    } catch (error) {
      console.error("GetEvents API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Marketing by Event API
  getMarketingByEvent: async (payload) => {
    try {
      const formData = new FormData();
      if (payload.event_id) {
        formData.append("event_id", payload.event_id);
      }
      const response = await api.post("/get_marketing_by_event", formData);
      return response.data;
    } catch (error) {
      console.error("getMarketingByEvent API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Category API
  getCategory: async () => {
    try {
      const response = await api.get("/category");
      return response.data;
    } catch (error) {
      console.error("getCategory API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create Event Basic Info API
  createEventBasicInfo: async (payload) => {
    try {
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object") {
              Object.entries(item).forEach(([subKey, subValue]) => {
                formData.append(`${key}[${index}][${subKey}]`, subValue);
              });
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else {
          formData.append(key, value);
        }
      });
      const response = await api.post("/create_event", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (error) {
      console.error("createEventBasicInfo API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Event Details API
  getEventDetails: async (event_id) => {
    try {
      const payload = { event_id };
      const response = await api.post("/event_details", payload);
      return response.data;
    } catch (error) {
      console.error("getEventDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Copy Event API
  copyEvent: async (payload) => {
    try {
      const response = await api.post("/copy_event", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("copyEvent API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add/Edit Org User API
  addEditOrgUser: async (payload) => {
    try {
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await api.post("/add_edit_org_user", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (error) {
      console.error("addEditOrgUser API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Edit Org User API
  editOrgUser: async (payload) => {
    try {
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await api.post("/edit_org_user", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (error) {
      console.error("editOrgUser API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete Org User API
  deleteOrgUser: async (payload) => {
    try {
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await api.post("/delete_org_user", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (error) {
      console.error("deleteOrgUser API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Organizer Details API
  getOrganizerDetails: async () => {
    try {
      const response = await api.post("/get_organizer");
      return response.data;
    } catch (error) {
      console.error("getOrganizerDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // All Organizer Data API - Get organizer profile with events
  allOrganizerData: async (params = {}) => {
    try {
      const formData = new FormData();
      if (params.user_id) {
        formData.append("user_id", params.user_id);
      }
      if (params.organiser_name) {
        formData.append("organiser_name", params.organiser_name);
      }
      const response = await api.post("/organizer_details", formData);
      return response.data;
    } catch (error) {
      console.error("allOrganizerData API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Event Terms and Conditions API
  getEventTermsConditions: async (event_id) => {
    try {
      const formData = new FormData();
      formData.append("event_id", event_id);
      const response = await api.post("/get_event_term_and_conditions", formData);
      return response.data;
    } catch (error) {
      console.error("getEventTermsConditions API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update Profile Picture API
  updateProfilePic: async (profilePicFile) => {
    try {
      const formData = new FormData();
      formData.append("profile_pic", profilePicFile);
      const response = await api.post("/update_profile_pic", formData);
      return response.data;
    } catch (error) {
      console.error("updateProfilePic API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete Profile Picture API
  deleteProfilePic: async () => {
    try {
      const response = await api.post("/delete_profile");
      return response.data;
    } catch (error) {
      console.error("deleteProfilePic API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add/Edit Organizer API
  addEditOrganizer: async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      const response = await api.post("/add_edit_organizer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("addEditOrganizer API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Reset Password
  resetPassword: async ({ token, new_password, confirm_new_password }) => {
    try {
      const response = await api.post(`/reset_password/${token}`, {
        new_password,
        confirm_new_password,
        password: new_password,
        password_confirmation: confirm_new_password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
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
      if (loginData.otp) {
        formData.append("ValidOpt", loginData.otp);
      }
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

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userData", JSON.stringify(enhancedUserData));
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
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("userData", JSON.stringify(userData));
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

  // Get Form Questions API
  getFormQuestions: async (payload) => {
    try {
      const response = await api.post("/get_form_questions", payload);
      return response.data;
    } catch (error) {
      console.error("getFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Coupons API
  getCoupons: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      // Append ticket_ids as array
      if (payload.ticket_ids && Array.isArray(payload.ticket_ids)) {
        payload.ticket_ids.forEach(ticketId => {
          formData.append("ticket_ids[]", ticketId);
        });
      }
      // Append coupon_code if provided
      if (payload.coupon_code) {
        formData.append("coupon_code", payload.coupon_code);
      }
      const response = await api.post("/get_coupons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getCoupons API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Booking Payment Process API (PayU)
  bookingPaymentProcess: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("amount", payload.amount);
      formData.append("ticket_type", payload.ticket_type);
      formData.append("booking_tickets_array", payload.booking_tickets_array);

      // Append file uploads if present
      if (payload.fils_array && Array.isArray(payload.fils_array)) {
        payload.fils_array.forEach(file => {
          formData.append("fils_array[]", file);
        });
      }

      const response = await api.post("/bookingPaymentProcess", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("bookingPaymentProcess API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // PhonePe Payment Initiation API
  phonepeInitiatePayment: async (payload) => {
    try {
      const response = await api.post("/phonepeInitiatePayment", payload);
      return response.data;
    } catch (error) {
      console.error("phonepeInitiatePayment API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Bookings API for Registration Tracker
  getBookings: async () => {
    try {
      const response = await api.post("/get_bookings");
      return response.data;
    } catch (error) {
      console.error("GetBookings API error:", error);
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
        sessionStorage.setItem("token", response.data.data.token);
        sessionStorage.setItem(
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
      const token = sessionStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await api.post("/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("userData");
      delete api.defaults.headers.common["Authorization"];
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    const token = sessionStorage.getItem("token");
    return !!token;
  },

  // Get user data
  getUserData: () => {
    const userData = sessionStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Get token
  getToken: () => {
    return sessionStorage.getItem("token");
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

  // Org User Details API
  orgUserDetails: async (user_id) => {
    try {
      // Call as POST with user_id in payload
      const response = await api.post("/org_user_details", { user_id });
      return response.data;
    } catch (error) {
      console.error("OrgUserDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Cities API
  getCities: async (params = {}) => {
    try {
      const response = await api.post("/city", params);
      return response.data;
    } catch (error) {
      console.error("GetCities API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Types API (Event Types)
  getTypes: async () => {
    try {
      const response = await api.get("/types");
      return response.data;
    } catch (error) {
      console.error("getTypes API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get States API
  getStates: async (params = {}) => {
    try {
      const response = await api.post("/state", params);
      return response.data;
    } catch (error) {
      console.error("GetStates API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Countries API
  getCountries: async (params = {}) => {
    try {
      const response = await api.post("/country", params);
      return response.data;
    } catch (error) {
      console.error("GetCountries API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Address Details API
  addressDetails: async (formData) => {
    try {
      const response = await api.post("/address_details", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("AddressDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Edit User Medical Profile
  editUserMedical: async (medicalData) => {
    try {
      const response = await api.post("/edit_user_medical", medicalData);
      return response.data;
    } catch (error) {
      console.error("EditUserMedical API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Follow/Unfollow Event API
  followEvent: async (eventId, isFollow) => {
    try {
      const response = await api.post("/follow", {
        event_id: eventId,
        is_follow: isFollow, // 0 = follow, 1 = unfollow
      });
      return response.data;
    } catch (error) {
      console.error("FollowEvent API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Send Message to Organiser API
  sendOrgMail: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("fullname", payload.fullname);
      formData.append("email", payload.email);
      formData.append("contact_no", payload.contact_no);
      formData.append("message", payload.message);

      const response = await api.post("/send_notification_org", formData);
      return response.data;
    } catch (error) {
      console.error("sendOrgMail API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Event Details API
  getEventDetailsPage: async (params = {}) => {
    try {
      const response = await api.post("/event_details_page", params);
      return response.data;
    } catch (error) {
      console.error("GetEventDetailsPage API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get User Followed Events API
  getUserFollowedEvents: async () => {
    try {
      const response = await api.post("/userfollowevent");
      return response.data;
    } catch (error) {
      console.error("GetUserFollowedEvents API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Popular Cities API
  getPopularCities: async () => {
    try {
      const response = await api.get("/popular_cities");
      return response.data;
    } catch (error) {
      console.error("GetPopularCities API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Location City API (Search Cities)
  getLocationCity: async (params = {}) => {
    try {
      const response = await api.post("/location_city", params);
      return response.data;
    } catch (error) {
      console.error("GetLocationCity API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Data Location Wise API (Location based events)
  getDataLocationWise: async (params = {}) => {
    try {
      const response = await api.post("/get_data_location_wise", params);
      return response.data;
    } catch (error) {
      console.error("GetDataLocationWise API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add Event Duration API
  addEventDuration: async (payload) => {
    try {
      const response = await api.post("/event_duration", payload);
      return response.data;
    } catch (error) {
      console.error("addEventDuration API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add Event Description API
  addEventDescription: async (formData) => {
    try {
      // Use multipart/form-data for file uploads
      const response = await api.post("/event_description", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("AddEventDescription API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add Event Setting API
  addEventSetting: async (formData) => {
    try {
      const response = await api.post("/event_setting", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("addEventSetting API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update GST and Price Taxes for Event
  updateEventGstTaxes: async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await api.post("/delete_event_images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("updateEventGstTaxes API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get All Events API
  getAllEvents: async (params = {}) => {
    try {
      // Convert params to FormData
      const formData = new FormData();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await api.post("/AllEventDetails", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("getAllEvents API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Add/Edit Event Ticket API
  addEditEventTicket: async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const response = await api.post("/add_edit_event_ticket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("addEditEventTicket API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Change status (coupons / age criteria / faq / communication)
  statusCoupon: async (formData) => {
    try {
      const response = await api.post("/status_coupon", formData);
      return response.data;
    } catch (error) {
      console.error("statusCoupon API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Get Event Form Questions
  eventFormQuestions: async (formData) => {
    try {
      const response = await api.post("/eventFormQuestions", formData);
      return response.data;
    } catch (error) {
      console.error("eventFormQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Create Group Question API
  createGroupQuestion: async (payload) => {
    try {
      const response = await api.post("/create_group_question", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("createGroupQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Group Questions API
  getGroupQuestions: async () => {
    try {
      const response = await api.post("/get_group_questions", {}, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("getGroupQuestions API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Delete Group Question API
  deleteGroupQuestion: async (id) => {
    try {
      const response = await api.post("/delete_group_question", { id }, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("deleteGroupQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update Group Question API
  updateGroupQuestion: async (payload) => {
    try {
      const response = await api.post("/edit_group_question", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("updateGroupQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Update Event Form Question API
  updateEventFormQuestion: async (payload) => {
    try {
      const response = await api.post("/updateEventFormQuestion", payload, {
        headers: payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("updateEventFormQuestion API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // View Sub Question Tree API
  viewSubQuestionTree: async (payload) => {
    try {
      const response = await api.post("/ViewSubquestionsTree", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("viewSubQuestionTree API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Insights API - Event Analytics
  getInsights: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);

      if (payload.filter) {
        formData.append("filter", payload.filter);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.Ticket) {
        formData.append("Ticket", payload.Ticket);
      }

      const response = await api.post("/get_insights", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getInsights API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Category Wise Data API - Event Analytics Charts
  getCategoryWiseData: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);

      if (payload.filter) {
        formData.append("filter", payload.filter);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.Ticket) {
        formData.append("Ticket", payload.Ticket);
      }

      const response = await api.post("/get_category_wise_data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getCategoryWiseData API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Registered Users API - Registration Details
  getRegisteredUsers: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);

      if (payload.user_name) {
        formData.append("user_name", payload.user_name);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.TransactionStatus) {
        formData.append("TransactionStatus", payload.TransactionStatus);
      }
      if (payload.TransactionID) {
        formData.append("TransactionID", payload.TransactionID);
      }
      formData.append("limit", payload.limit || 30);
      formData.append("page", payload.page || 1);

      const response = await api.post("/get_registered_users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getRegisteredUsers API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Net Sales API - Participants/Attendee Details
  getNetSales: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);

      if (payload.participant_name) {
        formData.append("participant_name", payload.participant_name);
      }
      if (payload.reg_id) {
        formData.append("reg_id", payload.reg_id);
      }
      if (payload.mobile_number) {
        formData.append("mobile_number", payload.mobile_number);
      }
      if (payload.email) {
        formData.append("email", payload.email);
      }
      if (payload.ticket_id) {
        formData.append("ticket_id", payload.ticket_id);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.TransactionStatus) {
        formData.append("TransactionStatus", payload.TransactionStatus);
      }
      if (payload.coupon_used_flag !== undefined) {
        formData.append("coupon_used_flag", payload.coupon_used_flag);
      }
      if (payload.TransactionID) {
        formData.append("TransactionID", payload.TransactionID);
      }
      if (payload.include_pending !== undefined) {
        formData.append("include_pending", payload.include_pending);
      }
      formData.append("limit", payload.limit || 30);
      formData.append("page", payload.page || 1);

      const response = await api.post("/get_netsales", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getNetSales API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Attendee Net Sales Excel Data API - Download Excel for Attendee or Revenue
  attendeeNetsalesExcellData: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("command", payload.command); // 'attendee' or 'revenue'

      // Optional filters
      if (payload.participant_name) {
        formData.append("participant_name", payload.participant_name);
      }
      if (payload.reg_id) {
        formData.append("reg_id", payload.reg_id);
      }
      if (payload.mobile_number) {
        formData.append("mobile_number", payload.mobile_number);
      }
      if (payload.email) {
        formData.append("email", payload.email);
      }
      if (payload.ticket_id) {
        formData.append("ticket_id", payload.ticket_id);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.TransactionStatus) {
        formData.append("TransactionStatus", payload.TransactionStatus);
      }
      if (payload.coupon_used_flag !== undefined) {
        formData.append("coupon_used_flag", payload.coupon_used_flag);
      }
      if (payload.TransactionID) {
        formData.append("TransactionID", payload.TransactionID);
      }
      if (payload.include_pending !== undefined) {
        formData.append("include_pending", payload.include_pending);
      }

      const response = await api.post("/attendeeNetsalesExcellData", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("attendeeNetsalesExcellData API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Change Event Status API - Toggle event active/inactive
  changeEventStatus: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("event_status", payload.event_status);
      formData.append("action_flag", payload.action_flag || "change_status");

      const response = await api.post("/EventDeleteChangeStatus", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("changeEventStatus API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Booking Details API
  getBookingDetails: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("BookingId", payload.BookingId);
      formData.append("BookingDetailId", payload.BookingDetailId);
      const response = await api.post("/get_booking_details", formData);
      return response.data;
    } catch (error) {
      console.error("getBookingDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Communication Master Details API
  getCommunicationMasterDetails: async () => {
    try {
      const response = await api.get("/CommunicationMasterDetails");
      return response.data;
    } catch (error) {
      console.error("getCommunicationMasterDetails API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Send Participant Email API
  sendParticipantEmail: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("user_id", payload.user_id);
      formData.append("event_url", payload.event_url);
      formData.append("email_type", payload.email_type);
      formData.append("subject_name", payload.subject_name || "");
      formData.append("message_content", payload.message_content || "");
      formData.append("participant_data", JSON.stringify(payload.participant_data));
      const response = await api.post("/participant_send_multiple_email", formData);
      return response.data;
    } catch (error) {
      console.error("sendParticipantEmail API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Payment Log API
  getPaymentLog: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("page", payload.page || 1);
      formData.append("limit", payload.limit || 30);

      if (payload.user_name) formData.append("user_name", payload.user_name);
      if (payload.email) formData.append("email", payload.email);
      if (payload.TransactionID) formData.append("TransactionID", payload.TransactionID);
      if (payload.TransactionStatus) formData.append("TransactionStatus", payload.TransactionStatus);
      if (payload.from_date) formData.append("from_date", payload.from_date);
      if (payload.to_date) formData.append("to_date", payload.to_date);

      const response = await api.post("/get_payment_log", formData);
      return response.data;
    } catch (error) {
      console.error("getPaymentLog API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Active Payment Gateway API
  getActivePaymentGateway: async () => {
    try {
      const response = await api.get(`/active-payment-gateway`);
      return response.data;
    } catch (error) {
      console.error("getActivePaymentGateway API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // PhonePe Verify Payment Status API
  phonepeVerifyStatus: async (merchant_transaction_id) => {
    try {
      const response = await api.post("/phonepeVerifyStatus", {
        merchant_transaction_id: merchant_transaction_id,
      });
      return response.data;
    } catch (error) {
      console.error("phonepeVerifyStatus API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Send Email Payment Success API
  sendEmailPaymentSuccess: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("booking_pay_id", payload.booking_pay_id);
      formData.append("event_id", payload.event_id);

      const response = await api.post("/send_email_payment_success", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": "" // Remove auth - endpoint should be public
        },
      });
      return response.data;
    } catch (error) {
      console.error("sendEmailPaymentSuccess API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // WhatsApp - Get Templates API
  getWhatsAppTemplates: async () => {
    try {
      const response = await api.post("/whatsapp_templates");
      return response.data;
    } catch (error) {
      console.error("getWhatsAppTemplates API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // WhatsApp - Send Message to Single Participant API
  sendWhatsAppMessage: async (payload) => {
    try {
      const response = await api.post("/whatsapp_send_message", {
        participant_id: payload.participant_id,
        template_id: payload.template_id,
        params: payload.params || []
      });
      return response.data;
    } catch (error) {
      console.error("sendWhatsAppMessage API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // WhatsApp - Send Message to Multiple Participants API
  sendWhatsAppMultiple: async (payload) => {
    try {
      const response = await api.post("/whatsapp_send_multiple", {
        participant_data: JSON.stringify(payload.participant_data),
        template_id: payload.template_id,
        params: payload.params || []
      });
      return response.data;
    } catch (error) {
      console.error("sendWhatsAppMultiple API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Attendee/Participant Excel Download API
  attendeeNetsalesExcellData: async (payload) => {
    try {
      const formData = new FormData();
      formData.append("event_id", payload.event_id);
      formData.append("command", payload.command); // 'attendee' or 'revenue'
      formData.append("coupon_used_flag", payload.coupon_used_flag || 0);

      // Add optional filters
      if (payload.participant_name) {
        formData.append("participant_name", payload.participant_name);
      }
      if (payload.reg_id) {
        formData.append("reg_id", payload.reg_id);
      }
      if (payload.mobile_number) {
        formData.append("mobile_number", payload.mobile_number);
      }
      if (payload.email) {
        formData.append("email", payload.email);
      }
      if (payload.ticket_id) {
        formData.append("ticket_id", payload.ticket_id);
      }
      if (payload.from_date) {
        formData.append("from_date", payload.from_date);
      }
      if (payload.to_date) {
        formData.append("to_date", payload.to_date);
      }
      if (payload.TransactionStatus) {
        formData.append("TransactionStatus", payload.TransactionStatus);
      }
      if (payload.TransactionID) {
        formData.append("TransactionID", payload.TransactionID);
      }
      if (payload.include_pending !== undefined) {
        formData.append("include_pending", payload.include_pending);
      }

      const response = await api.post("/attendee_netsales_excell_data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("attendeeNetsalesExcellData API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Event Booking Tickets API
  getEventBookingTickets: async (event_id) => {
    try {
      const formData = new FormData();
      formData.append("event_id", event_id);
      const response = await api.post("/get_event_booking_tickets", formData);
      return response.data;
    } catch (error) {
      console.error("getEventBookingTickets API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Data Location Wise API - for trending events on homepage
  getDataLocationWise: async (payload) => {
    try {
      const formData = new FormData();

      // Add all location parameters as FormData
      if (payload.city) formData.append("city", payload.city);
      if (payload.scity) formData.append("scity", payload.scity);
      if (payload.state) formData.append("state", payload.state);
      if (payload.country) formData.append("country", payload.country);
      if (payload.search_flag) formData.append("search_flag", payload.search_flag);
      if (payload.home_flag !== undefined) formData.append("home_flag", payload.home_flag);

      const response = await api.post("/get_data_location_wise", formData);
      return response.data;
    } catch (error) {
      console.error("getDataLocationWise API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Athlete Card Preview API - Download athlete card PDF
  athleteCardPreview: async (user_id) => {
    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      const response = await api.post("/athleteCard", formData);
      return response.data;
    } catch (error) {
      console.error("athleteCardPreview API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Generate Ticket PDF API
  generatePDF: async (ticketData) => {
    try {
      const formData = new FormData();

      // Add all ticket fields to FormData
      Object.keys(ticketData).forEach(key => {
        if (key === 'ticket') {
          // Handle nested ticket object
          Object.keys(ticketData.ticket).forEach(ticketKey => {
            formData.append(`ticket[${ticketKey}]`, ticketData.ticket[ticketKey]);
          });
        } else {
          formData.append(key, ticketData[key]);
        }
      });

      const response = await api.post("/ticket_pdf", formData);
      return response.data;
    } catch (error) {
      console.error("generatePDF API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Edit group question order
  editGroupQuestionOrder: async (data) => {
    try {
      const formData = new FormData();
      formData.append("api_token", "test");
      formData.append("id", data.id);
      formData.append("order_index", data.order_index);

      const response = await api.post("/edit_group_question", formData);
      return response.data;
    } catch (error) {
      console.error("editGroupQuestionOrder API error:", error);
      throw error.response?.data || error.message;
    }
  },

  // Get Remittance By Event API
  getRemittanceByEvent: async (payload) => {
    try {
      const formData = new FormData();
      const event_id = typeof payload === 'object' ? payload.event_id : payload;
      formData.append("event_id", event_id);

      if (payload.from_date) formData.append("from_date", payload.from_date);
      if (payload.to_date) formData.append("to_date", payload.to_date);

      const response = await api.post("/get_remittance_by_event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("getRemittanceByEvent API error:", error);
      throw error.response?.data || error.message;
    }
  },
  // Accept Organizer Invitation API
  acceptOrgInvitation: async (orgId, email) => {
    try {
      console.log("🚀 Calling accept_org_invitation API:", { org_id: orgId, email });
      const formData = new FormData();
      formData.append("orgId", orgId);
      formData.append("email", email);
      const response = await api.post("/accept_org_invitation", formData);
      console.log("📄 API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ acceptOrgInvitation API error:", error);
      throw error.response?.data || error.message;
    }
  },
};

// Token को axios header में set करें app load होते समय
const token = sessionStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}
