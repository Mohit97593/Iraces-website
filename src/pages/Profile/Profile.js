import React, { useState, useEffect } from "react";
import "./Profile.css";
import TopNav from "../../components/Navbar/TopNav";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";

const Profile = () => {
  // Add User Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Add User Form States
  const [selectedRole, setSelectedRole] = useState("");
  const [addFirstName, setAddFirstName] = useState("");
  const [addLastName, setAddLastName] = useState("");
  const [addContactNumber, setAddContactNumber] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addDob, setAddDob] = useState("");
  const [addGender, setAddGender] = useState("");
  const [eventSelection, setEventSelection] = useState("all"); // 'all' or 'select'
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Add User Modal Validation States
  const [orgUserErrors, setOrgUserErrors] = useState({});

  // Fetch latest profile on every page load
  React.useEffect(() => {
    (async () => {
      try {
        const profileResponse = await import("../../services/authAPI").then(
          ({ authAPI }) => authAPI.getProfile()
        );
        if (
          profileResponse &&
          profileResponse.data &&
          profileResponse.data.userData
        ) {
          localStorage.setItem(
            "userData",
            JSON.stringify(profileResponse.data.userData[0])
          );
          checkAuthStatus();
        }
      } catch (err) {
        // Optionally show error
        console.error("Failed to fetch profile:", err);
      }
    })();
  }, []);
  // Editing state for Personal Details
  const [editPersonal, setEditPersonal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDob, setEditDob] = useState("");
  const [dobError, setDobError] = useState("");
  // Calculate today's date for max DOB
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const maxDob = `${yyyy}-${mm}-${dd}`;
  const [editBio, setEditBio] = useState("");
  const [bioError, setBioError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Fetch profile when Basic Information tab is opened
  React.useEffect(() => {
    if (activeTab === "basic") {
      (async () => {
        try {
          const profileResponse = await import("../../services/authAPI").then(
            ({ authAPI }) => authAPI.getProfile()
          );
          if (
            profileResponse &&
            profileResponse.data &&
            profileResponse.data.userData
          ) {
            localStorage.setItem(
              "userData",
              JSON.stringify(profileResponse.data.userData[0])
            );
            checkAuthStatus();
          }
        } catch (err) {
          // Optionally show error
          console.error("Failed to fetch profile:", err);
        }
      })();
    }
  }, [activeTab]);
  const [mainSection, setMainSection] = useState("profile"); // 'profile' or 'team'
  const [orgUserDetails, setOrgUserDetails] = useState([]);
  const [loadingOrgUsers, setLoadingOrgUsers] = useState(false);

  // Basic Information edit states
  const [editBasic, setEditBasic] = useState(false);
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyNumber, setEditEmergencyNumber] = useState("");
  const [emergencyNumberError, setEmergencyNumberError] = useState("");
  const [editOrganisation, setEditOrganisation] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editIdProofType, setEditIdProofType] = useState("");
  const [editIdProofNumber, setEditIdProofNumber] = useState("");
  const [editIdProofFile, setEditIdProofFile] = useState(null);
  const { user, checkAuthStatus } = useAuth();

  // Fetch org user details when Organizing Team section is opened
  useEffect(() => {
    if (mainSection === "team") {
      (async () => {
        // Always fetch latest profile first
        try {
          const profileResponse = await authAPI.getProfile();
          if (
            profileResponse &&
            profileResponse.data &&
            profileResponse.data.userData
          ) {
            localStorage.setItem(
              "userData",
              JSON.stringify(profileResponse.data.userData[0])
            );
            checkAuthStatus();
          }
        } catch (err) {
          console.error("Failed to fetch profile for org team:", err);
        }
        // Now fetch org user details with user_id
        setLoadingOrgUsers(true);
        try {
          // Get user_id from localStorage
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          const userId = userData.id || 0;

          const orgResponse = await authAPI.orgUserDetails(userId);
          console.log("Org User Details Response:", orgResponse);
          if (orgResponse && orgResponse.data && orgResponse.data.AllOrgUsers) {
            setOrgUserDetails(
              Array.isArray(orgResponse.data.AllOrgUsers)
                ? orgResponse.data.AllOrgUsers
                : []
            );
          } else {
            setOrgUserDetails([]);
          }
        } catch (error) {
          console.error("Error fetching org user details:", error);
          setOrgUserDetails([]);
        } finally {
          setLoadingOrgUsers(false);
        }
      })();
    }
  }, [mainSection]);
  // ...existing code...

  const handleOpenAddUserModal = async () => {
    setShowAddUserModal(true);

    // Fetch roles
    setLoadingRoles(true);
    try {
      const rolesResponse = await authAPI.getRoles();
      console.log("Roles Response:", rolesResponse);
      if (rolesResponse && rolesResponse.data && rolesResponse.data.AllRoles) {
        setRoles(
          Array.isArray(rolesResponse.data.AllRoles)
            ? rolesResponse.data.AllRoles
            : []
        );
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }

    // Fetch events
    setLoadingEvents(true);
    try {
      const eventsResponse = await authAPI.getEvents();
      console.log("Events Response:", eventsResponse);
      if (eventsResponse && eventsResponse.data && eventsResponse.data.events) {
        setEvents(
          Array.isArray(eventsResponse.data.events)
            ? eventsResponse.data.events
            : []
        );
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    // Reset form fields
    setSelectedRole("");
    setAddFirstName("");
    setAddLastName("");
    setAddContactNumber("");
    setAddEmail("");
    setAddDob("");
    setAddGender("");
    setEventSelection("all");
    setSelectedEvents([]);
    setEditOrgUserId(0); // Reset edit mode
    setOrgUserErrors({}); // Reset validation errors
  };

  const handleSaveUser = async () => {
    // Validation logic for organiser user modal
    let errors = {};

    if (!selectedRole) {
      errors.selectedRole = "Role is required";
    }
    if (!addFirstName.trim()) {
      errors.addFirstName = "First name is required";
    }
    if (!addLastName.trim()) {
      errors.addLastName = "Last name is required";
    }
    if (!addContactNumber.trim()) {
      errors.addContactNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(addContactNumber.trim())) {
      errors.addContactNumber = "Please enter a valid 10-digit mobile number";
    }
    if (!addEmail.trim()) {
      errors.addEmail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(addEmail.trim())) {
      errors.addEmail = "Please enter a valid email address";
    }
    if (!addDob.trim()) {
      errors.addDob = "Date of birth is required";
    }
    if (!addGender.trim()) {
      errors.addGender = "Gender is required";
    }
    if (eventSelection === "select" && selectedEvents.length === 0) {
      errors.selectedEvents = "Please select at least one event";
    }

    setOrgUserErrors(errors);

    // If there are errors, stop here
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Validate and save user
    console.log("Saving user:", {
      role: selectedRole,
      firstName: addFirstName,
      lastName: addLastName,
      contactNumber: addContactNumber,
      email: addEmail,
      dob: addDob,
      gender: addGender,
      eventSelection,
      selectedEvents,
    });

    // Prepare payload for addEditOrgUser
    const payload = {
      edit_org_user_id: editOrgUserId || 0, // If editOrgUserId is set, we're editing
      user_role: selectedRole,
      firstname: addFirstName,
      lastname: addLastName,
      email: addEmail,
      mobile: addContactNumber,
      dob: addDob,
      gender: addGender === "Male" ? 1 : addGender === "Female" ? 2 : 3,
      event_selected_type: eventSelection === "all" ? 1 : 2,
      event_data: JSON.stringify(
        events.map((e) => ({
          id: e.id,
          name: e.name,
          checked: selectedEvents.includes(e.id),
        }))
      ),
    };

    try {
      // Call addEditOrgUser API
      const res = await authAPI.addEditOrgUser(payload);
      console.log("addEditOrgUser response:", res);
      if (res && res.message && res.message.toLowerCase().includes("success")) {
        // Success, now fetch org user details
        setLoadingOrgUsers(true);
        try {
          // Get user_id from localStorage
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          const userId = userData.id || user?.id || 0;

          const orgRes = await authAPI.orgUserDetails(userId);
          console.log("OrgUserDetails response:", orgRes);
          if (orgRes && orgRes.data && orgRes.data.AllOrgUsers) {
            setOrgUserDetails(
              Array.isArray(orgRes.data.AllOrgUsers)
                ? orgRes.data.AllOrgUsers
                : []
            );
          } else {
            setOrgUserDetails([]);
          }
        } catch (err) {
          console.error("Error fetching org users:", err);
          setOrgUserDetails([]);
        } finally {
          setLoadingOrgUsers(false);
        }
        handleCloseAddUserModal();
        showSuccessMessage(
          res.message ||
            (editOrgUserId
              ? "User updated successfully!"
              : "User added successfully!")
        );
      } else {
        alert(res?.message || "Failed to save user");
      }
    } catch (err) {
      alert("Failed to save user: " + (err?.message || err));
    }
  };

  // Edit Org User Handler
  const handleEditOrgUser = async (orgUserId) => {
    try {
      // Call EditOrgUser API to get user details
      const response = await authAPI.editOrgUser({ org_user_id: orgUserId });
      console.log("EditOrgUser response:", response);

      if (
        response &&
        response.data &&
        response.data.AllOrgUsers &&
        response.data.AllOrgUsers.length > 0
      ) {
        const orgUserData = response.data.AllOrgUsers[0];

        // Populate modal fields with existing data
        setSelectedRole(String(orgUserData.user_role || ""));
        setAddFirstName(orgUserData.firstname || "");
        setAddLastName(orgUserData.lastname || "");
        setAddContactNumber(orgUserData.mobile || "");
        setAddEmail(orgUserData.email || "");
        setAddDob(orgUserData.dob || "");

        // Set gender
        let genderValue = "";
        if (orgUserData.gender === 1 || orgUserData.gender === "1")
          genderValue = "Male";
        else if (orgUserData.gender === 2 || orgUserData.gender === "2")
          genderValue = "Female";
        else if (orgUserData.gender === 3 || orgUserData.gender === "3")
          genderValue = "Other";
        setAddGender(genderValue);

        // Set event selection
        setEventSelection(
          orgUserData.event_selected_type === 1 ? "all" : "select"
        );

        // Load events and set checked ones
        setLoadingEvents(true);
        try {
          const eventsResponse = await authAPI.getEvents();
          if (
            eventsResponse &&
            eventsResponse.data &&
            eventsResponse.data.AllEvents
          ) {
            const allEvents = Array.isArray(eventsResponse.data.AllEvents)
              ? eventsResponse.data.AllEvents
              : [];

            // Get event data from API response
            const eventData = orgUserData.eventData || [];
            const checkedEventIds = eventData
              .filter((e) => e.checked === true)
              .map((e) => e.id);

            setEvents(allEvents);
            setSelectedEvents(checkedEventIds);
          } else {
            setEvents([]);
          }
        } catch (error) {
          console.error("Error fetching events:", error);
          setEvents([]);
        } finally {
          setLoadingEvents(false);
        }

        // Load roles
        setLoadingRoles(true);
        try {
          const rolesResponse = await authAPI.getRoles();
          if (
            rolesResponse &&
            rolesResponse.data &&
            rolesResponse.data.AllRoles
          ) {
            setRoles(
              Array.isArray(rolesResponse.data.AllRoles)
                ? rolesResponse.data.AllRoles
                : []
            );
          } else {
            setRoles([]);
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
          setRoles([]);
        } finally {
          setLoadingRoles(false);
        }

        // Open modal in edit mode (we'll need to track edit mode)
        setEditOrgUserId(orgUserId);
        setShowAddUserModal(true);
      }
    } catch (err) {
      console.error("Error fetching org user for edit:", err);
      alert("Failed to load user details for editing");
    }
  };

  // Delete Org User Handler
  const handleDeleteOrgUser = async (orgUserId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await authAPI.deleteOrgUser({ org_user_id: orgUserId });
      console.log("DeleteOrgUser response:", response);

      if (response && response.message) {
        // Refresh org user list
        setLoadingOrgUsers(true);
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "{}");
          const userId = userData.id || user?.id || 0;

          const orgRes = await authAPI.orgUserDetails(userId);
          if (orgRes && orgRes.data && orgRes.data.AllOrgUsers) {
            setOrgUserDetails(
              Array.isArray(orgRes.data.AllOrgUsers)
                ? orgRes.data.AllOrgUsers
                : []
            );
          } else {
            setOrgUserDetails([]);
          }
        } catch (err) {
          console.error("Error fetching org users:", err);
          setOrgUserDetails([]);
        } finally {
          setLoadingOrgUsers(false);
        }

        showSuccessMessage(response.message || "User deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting org user:", err);
      alert("Failed to delete user");
    }
  };

  // Success Message State and Handler
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [editOrgUserId, setEditOrgUserId] = useState(0);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // Extract user fields safely
  const firstName = user?.firstName || user?.firstname || "";
  const lastName = user?.lastName || user?.lastname || "";
  const email = user?.email || user?.Email || "";
  const mobile = user?.mobile || user?.Mobile || "";
  let gender = user?.gender || user?.Gender || "";
  if (gender === 1 || gender === "1") gender = "Male";
  else if (gender === 2 || gender === "2") gender = "Female";
  else if (gender === 3 || gender === "3") gender = "Other";
  const dob = user?.dob || user?.DOB || "";
  const phoneCode = user?.phone_code || user?.phoneCode || "";
  const bio = user?.about_you || "";

  // Add validation and error states for general details
  const [personalErrors, setPersonalErrors] = useState({});

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!editFirstName.trim()) errors.editFirstName = "First name is required";
    if (!editLastName.trim()) errors.editLastName = "Last name is required";
    if (!editMobile.trim()) errors.editMobile = "Mobile number is required";
    if (!editEmail.trim()) errors.editEmail = "Email is required";
    if (!editGender.trim()) errors.editGender = "Gender is required";
    if (!editDob.trim()) errors.editDob = "Date of birth is required";
    if (!editBio.trim()) errors.editBio = "Bio is required";
    setPersonalErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // Convert gender to number for API
    let genderNum = 1;
    if (editGender === "Male") genderNum = 1;
    else if (editGender === "Female") genderNum = 2;
    else if (editGender === "Other") genderNum = 3;
    // Mobile validation: required and must be 10 digits
    if (!editMobile) {
      setMobileError("Mobile number is required");
      return;
    }
    if (!/^\d{10}$/.test(editMobile)) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }
    setMobileError("");
    // DOB validation: required and must be in the past (not today/future)
    if (!editDob) {
      setDobError("Date of birth is required");
      return;
    }
    const selectedDate = new Date(editDob);
    const now = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    if (selectedDate >= now) {
      setDobError("Date of birth cannot be today or a future date");
      return;
    }
    setDobError("");
    const details = {
      firstName: editFirstName,
      lastName: editLastName,
      mobile: editMobile,
      email: editEmail,
      gender: genderNum,
      dob: editDob,
      about_you: editBio,
    };
    try {
      // Call PersonalDetails API
      await import("../../services/authAPI").then(({ authAPI }) =>
        authAPI.personalDetails(details)
      );
      // Fetch updated profile
      const profileResponse = await import("../../services/authAPI").then(
        ({ authAPI }) => authAPI.getProfile()
      );
      // Save new user data to localStorage
      if (
        profileResponse &&
        profileResponse.data &&
        profileResponse.data.userData
      ) {
        localStorage.setItem(
          "userData",
          JSON.stringify(profileResponse.data.userData[0])
        );
        // Update local bio state so UI reflects new bio
        setEditBio(profileResponse.data.userData[0].about_you || "");
      }
      // Update user state
      checkAuthStatus();
      setEditPersonal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update profile: " + (err?.message || err));
    }
    {
      /* Success Popup */
    }
    {
      showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#22c55e",
            color: "#fff",
            padding: "18px 32px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            fontWeight: 600,
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "260px",
            maxWidth: "350px",
            border: "2px solid #22c55e",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✔️</span>
          Personal Details updated successfully
          <span
            style={{ marginLeft: "auto", cursor: "pointer" }}
            onClick={() => setShowSuccess(false)}
          >
            ✖️
          </span>
        </div>
      );
    }
  };
  // Add validation and error states for basic information
  const [basicErrors, setBasicErrors] = useState({});

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!editEmergencyName.trim())
      errors.editEmergencyName = "Emergency name is required";
    if (!editEmergencyNumber.trim())
      errors.editEmergencyNumber = "Emergency number is required";
    if (!editOrganisation.trim())
      errors.editOrganisation = "Organisation is required";
    if (!editDesignation.trim())
      errors.editDesignation = "Designation is required";
    if (!editIdProofType.trim())
      errors.editIdProofType = "ID proof type is required";
    if (!editIdProofNumber.trim())
      errors.editIdProofNumber = "ID proof number is required";
    if (!editIdProofFile) errors.editIdProofFile = "ID proof file is required";
    setBasicErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // Emergency contact number validation: must be 10 digits
    if (!/^\d{10}$/.test(editEmergencyNumber)) {
      setEmergencyNumberError(
        "Please enter a valid 10-digit emergency contact number."
      );
      return;
    }
    setEmergencyNumberError("");
    const details = {
      emergency_contact_person: editEmergencyName,
      emergency_contact_no: editEmergencyNumber,
      organization: editOrganisation,
      designation: editDesignation,
      id_proof_type: editIdProofType,
      id_proof_no: editIdProofNumber,
      id_proof_doc_upload: editIdProofFile,
    };
    try {
      // Call GeneralDetails API
      const { authAPI } = await import("../../services/authAPI");
      await authAPI.generalDetails(details);
      // Fetch updated profile
      const profileResponse = await authAPI.getProfile();
      // Save new user data to localStorage
      if (
        profileResponse &&
        profileResponse.data &&
        profileResponse.data.userData
      ) {
        localStorage.setItem(
          "userData",
          JSON.stringify(profileResponse.data.userData[0])
        );
        checkAuthStatus();
        // Update edit fields with latest data after save
        const userData = profileResponse.data.userData[0];
        setEditEmergencyName(userData.emergency_contact_person || "");
        setEditEmergencyNumber(userData.emergency_contact_no || "");
        setEditOrganisation(userData.organization || "");
        setEditDesignation(userData.designation || "");
        setEditIdProofType(userData.id_proof_type || "");
        setEditIdProofNumber(userData.id_proof_no || "");
        setEditIdProofFile(null);
      }
      setEditBasic(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update basic info: " + (err?.message || err));
    }
  };
  // When editBasic is set to true, initialize editDesignation from user data
  React.useEffect(() => {
    if (editBasic) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      setEditDesignation(userData?.designation || "");
    }
  }, [editBasic]);
  // Fix: Ensure Designation field is set from user data when editBasic is enabled
  React.useEffect(() => {
    if (editBasic) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.designation !== undefined) {
        setEditDesignation(userData.designation);
      }
    }
  }, [editBasic]);
  return (
    <div className="profile-page">
      {/* Success Popup (top-level, always rendered) */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#22c55e",
            color: "#fff",
            padding: "18px 32px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            fontWeight: 600,
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "260px",
            maxWidth: "350px",
            border: "2px solid #22c55e",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✔️</span>
          Personal Details updated successfully
          <span
            style={{ marginLeft: "auto", cursor: "pointer" }}
            onClick={() => setShowSuccess(false)}
          >
            ✖️
          </span>
        </div>
      )}
      <TopNav />
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Profile</h1>
              <nav className="contact-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">→</span>
                <span>Profile</span>
              </nav>
            </div>
          </div>
        </div>
      </section>
      <div
        className="profile-top-btn-group"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "37px 0 -56px 0",
        }}
      >
        <div style={{ flex: 1 }}></div>
        <div
          style={{
            display: "flex",
            border: "2px solid #e53935",
            borderRadius: "32px",
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <button
            className={
              mainSection === "profile"
                ? "profile-main-btn active"
                : "profile-main-btn"
            }
            style={{
              background: mainSection === "profile" ? "#e53935" : "white",
              color: mainSection === "profile" ? "white" : "#555",
              border: "none",
              padding: "12px 32px",
              fontSize: "18px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              borderRadius: "32px",
              outline: "none",
            }}
            onClick={() => setMainSection("profile")}
          >
            {" "}
            <span style={{ fontSize: "22px" }}>👤</span> My Profile{" "}
          </button>
          <button
            className={
              mainSection === "team"
                ? "profile-main-btn active"
                : "profile-main-btn"
            }
            style={{
              background: mainSection === "team" ? "#e53935" : "white",
              color: mainSection === "team" ? "white" : "#555",
              border: "none",
              padding: "12px 32px",
              fontSize: "18px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              borderRadius: "32px",
              outline: "none",
            }}
            onClick={() => setMainSection("team")}
          >
            {" "}
            <span style={{ fontSize: "22px" }}>👥</span> Organizing Team{" "}
          </button>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            marginRight: "20px",
          }}
        >
          <button
            className="profile-athlete-btn"
            style={{
              color: "#e53935",
              border: "1.5px solid #e53935",
              background: "white",
              borderRadius: "8px",
              padding: "12px 32px",
              fontSize: "18px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {" "}
            <span style={{ fontSize: "22px" }}>☁️</span> Athlete Card{" "}
          </button>
        </div>
      </div>
      <div className="profile-container">
        <div className="profile-main">
          {mainSection === "profile" ? (
            <>
              <div className="profile-sidebar">
                <div className="profile-card profile-card-horizontal">
                  <img
                    className="profile-avatar"
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="avatar"
                  />
                  <div className="profile-info">
                    <div className="profile-name">
                      {firstName} {lastName}
                    </div>
                    <div className="profile-contact">
                      <div className="profile-phone">
                        📞 {phoneCode ? `+${phoneCode} - ` : ""}
                        {mobile}
                      </div>
                      <div className="profile-email">{email}</div>
                    </div>
                  </div>
                </div>
                <div className="profile-progress">
                  <span>Profile Progress</span>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "25.89%" }}
                    ></div>
                  </div>
                  <span className="progress-percent">25.89%</span>
                </div>
                <div className="profile-info-section">
                  <div className="profile-info-title">Your Information</div>
                  <div className="profile-info-tabs">
                    <button
                      className={`tab ${
                        activeTab === "personal" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("personal")}
                    >
                      Personal Details
                    </button>
                    <button
                      className={`tab ${activeTab === "basic" ? "active" : ""}`}
                      onClick={() => setActiveTab("basic")}
                    >
                      Basic Information
                    </button>
                    <button
                      className={`tab ${
                        activeTab === "address" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("address")}
                    >
                      Your Address
                    </button>
                    <button
                      className={`tab ${
                        activeTab === "medical" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("medical")}
                    >
                      Medical Profile
                    </button>
                  </div>
                </div>
              </div>
              <div className="profile-details">
                {activeTab === "medical" && (
                  <div className="medical-profile-section">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h2 style={{ margin: 0 }}>Medical Profile</h2>
                      <button
                        className="profile-action-btn"
                        style={{
                          color: "red",
                          border: "1px solid red",
                          background: "white",
                          borderRadius: "6px",
                          padding: "6px 16px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        <span style={{ marginRight: "6px" }}>✏️</span>Edit
                      </button>
                    </div>
                    <div
                      style={{
                        marginTop: "32px",
                        marginBottom: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Medical Details
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Blood Group
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Any Medical Condition
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Allergies
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Current Medication
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "32px",
                        marginBottom: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Emergency Medical Contact
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Contact Name
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Contact Number
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "personal" && (
                  <>
                    {!editPersonal ? (
                      <>
                        <div
                          className="profile-details-header"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px",
                          }}
                        >
                          <h2 style={{ margin: 0 }}>Personal Details</h2>
                          <button
                            className="profile-action-btn"
                            style={{
                              color: "red",
                              border: "1px solid red",
                              background: "white",
                              borderRadius: "6px",
                              padding: "6px 16px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            onClick={() => {
                              setEditPersonal(true);
                              // Always use latest user state for edit fields
                              setEditFirstName(
                                user?.firstName || user?.firstname || ""
                              );
                              setEditLastName(
                                user?.lastName || user?.lastname || ""
                              );
                              setEditMobile(user?.mobile || user?.Mobile || "");
                              setEditEmail(user?.email || user?.Email || "");
                              let g = user?.gender || user?.Gender || "";
                              if (g === 1 || g === "1" || g === "Male")
                                g = "Male";
                              else if (g === 2 || g === "2" || g === "Female")
                                g = "Female";
                              else if (g === 3 || g === "3" || g === "Other")
                                g = "Other";
                              else g = editGender || "Male";
                              setEditGender(g);
                              setEditDob(user?.dob || user?.DOB || "");
                              setEditBio(user?.about_you || "");
                            }}
                          >
                            <span style={{ marginRight: "6px" }}>✏️</span>Edit
                          </button>
                        </div>
                        <div className="profile-details-card">
                          <img
                            className="profile-avatar-large"
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="avatar"
                          />
                          <div className="profile-details-info">
                            <div className="profile-details-name">
                              {firstName} {lastName}
                            </div>
                            <div className="profile-details-row">
                              <span>
                                📞 {phoneCode ? `+${phoneCode} - ` : ""}
                                {mobile}
                              </span>
                              <span>⚧️ {gender}</span>
                            </div>
                            <div className="profile-details-row">
                              <span>✉️ {email}</span>
                              <span>🎂 {dob}</span>
                            </div>
                            <div className="profile-details-bio">
                              <span>My Bio :</span> {bio}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div
                        className="profile-details-card"
                        style={{
                          background: "#fff",
                          borderRadius: "16px",
                          padding: "32px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "32px",
                        }}
                      >
                        <div
                          style={{
                            flex: "0 0 180px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="avatar"
                            style={{
                              width: "140px",
                              height: "140px",
                              borderRadius: "50%",
                              marginBottom: "16px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <form
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "24px 16px",
                              marginBottom: "0",
                            }}
                            onSubmit={handlePersonalSubmit}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Your Firstname
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                value={editFirstName}
                                onChange={(e) =>
                                  setEditFirstName(e.target.value)
                                }
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              />
                              {personalErrors.editFirstName && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editFirstName}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Your Lastname
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                value={editLastName}
                                onChange={(e) =>
                                  setEditLastName(e.target.value)
                                }
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              />
                              {personalErrors.editLastName && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editLastName}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Mobile Number
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                value={editMobile}
                                onChange={(e) => {
                                  setEditMobile(e.target.value);
                                  setMobileError("");
                                }}
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              />
                              {mobileError && (
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: "13px",
                                    marginTop: "4px",
                                  }}
                                >
                                  {mobileError}
                                </span>
                              )}
                              {personalErrors.editMobile && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editMobile}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Email ID<span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                value={editEmail}
                                disabled
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                  background: "#eee",
                                  color: "#333",
                                }}
                              />
                              {personalErrors.editEmail && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editEmail}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Select Gender
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <select
                                value={editGender}
                                onChange={(e) => setEditGender(e.target.value)}
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              {personalErrors.editGender && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editGender}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                style={{ fontWeight: 500, marginBottom: "6px" }}
                              >
                                Date Of Birth
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="date"
                                value={editDob}
                                onChange={(e) => {
                                  setEditDob(e.target.value);
                                  setDobError("");
                                }}
                                max={maxDob}
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              />
                              {dobError && (
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: "13px",
                                    marginTop: "4px",
                                  }}
                                >
                                  {dobError}
                                </span>
                              )}
                              {personalErrors.editDob && (
                                <div
                                  style={{
                                    color: "red",
                                    fontSize: "0.9em",
                                    marginTop: "4px",
                                  }}
                                >
                                  {personalErrors.editDob}
                                </div>
                              )}
                            </div>
                          </form>
                          <div
                            style={{
                              margin: "24px 0 0 0",
                              fontWeight: 500,
                              fontSize: "1.1rem",
                            }}
                          >
                            My Bio
                          </div>
                          {/* Rich text editor placeholder, will be replaced with react-quill */}
                          <div style={{ margin: "8px 0 32px 0" }}>
                            <textarea
                              value={editBio}
                              onChange={(e) => {
                                const value = e.target.value;
                                const wordCount = value
                                  .trim()
                                  .split(/\s+/)
                                  .filter(Boolean).length;
                                if (wordCount > 100) {
                                  setBioError("Bio cannot exceed 100 words.");
                                  // Prevent adding more words
                                  return;
                                } else {
                                  setBioError("");
                                  setEditBio(value);
                                }
                              }}
                              rows={6}
                              style={{
                                width: "100%",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                padding: "12px",
                                fontSize: "1rem",
                              }}
                              placeholder="Write your bio here..."
                            />
                            {bioError && (
                              <span
                                style={{
                                  color: "red",
                                  fontSize: "13px",
                                  marginTop: "4px",
                                }}
                              >
                                {bioError}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              gap: "24px",
                              marginTop: "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setEditPersonal(false)}
                              style={{
                                background: "#fff",
                                color: "#e53935",
                                border: "2px solid #e53935",
                                borderRadius: "8px",
                                padding: "12px 32px",
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handlePersonalSubmit}
                              style={{
                                background: "#e53935",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "12px 32px",
                                fontWeight: 600,
                                fontSize: "1.1rem",
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "basic" && (
                  <>
                    {!editBasic ? (
                      <div className="basic-info-section">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <h2 style={{ margin: 0 }}>Basic Information</h2>
                          <button
                            className="profile-action-btn"
                            style={{
                              color: "red",
                              border: "1px solid red",
                              background: "white",
                              borderRadius: "6px",
                              padding: "6px 16px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                            onClick={async () => {
                              // Always fetch latest profile before editing
                              try {
                                const profileResponse = await import(
                                  "../../services/authAPI"
                                ).then(({ authAPI }) => authAPI.getProfile());
                                const userData =
                                  profileResponse?.data?.userData?.[0] || {};
                                setEditEmergencyName(
                                  userData.emergency_contact_person || ""
                                );
                                setEditEmergencyNumber(
                                  userData.emergency_contact_no1 ||
                                    userData.emergency_contact_no ||
                                    ""
                                );
                                setEditOrganisation(
                                  userData.organization || ""
                                );
                                setEditIdProofType(
                                  userData.id_proof_type || ""
                                );
                                setEditIdProofNumber(
                                  userData.id_proof_no || ""
                                );
                                setEditIdProofFile(null);
                                setEditBasic(true);
                              } catch (err) {
                                setEditEmergencyName(
                                  user?.emergency_contact_person || ""
                                );
                                setEditEmergencyNumber(
                                  user?.emergency_contact_no1 ||
                                    user?.emergency_contact_no ||
                                    ""
                                );
                                setEditOrganisation(user?.organization || "");
                                setEditIdProofType(user?.id_proof_type || "");
                                setEditIdProofNumber(user?.id_proof_no || "");
                                setEditIdProofFile(null);
                                setEditBasic(true);
                              }
                            }}
                          >
                            <span style={{ marginRight: "6px" }}>✏️</span>Edit
                          </button>
                        </div>
                        <div
                          style={{
                            marginTop: "32px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Emergency Contact Details
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            marginBottom: "24px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Emergency Contact Name
                            </div>
                            <div>{user?.emergency_contact_person || "NA"}</div>
                          </div>
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Emergency Contact Number
                            </div>
                            <div>{user?.emergency_contact_no1 || "NA"}</div>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: "32px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Organisation Details
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            marginBottom: "24px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Organisation
                            </div>
                            <div>{user?.organization || "NA"}</div>
                          </div>
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Designation
                            </div>
                            <div>{user?.designation || "NA"}</div>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: "32px",
                            marginBottom: "16px",
                            fontWeight: "bold",
                          }}
                        >
                          Identification Details
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            marginBottom: "24px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Id Proof Type
                            </div>
                            <div>{user?.id_proof_type || "NA"}</div>
                          </div>
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Id Proof Number
                            </div>
                            <div>{user?.id_proof_no || "NA"}</div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "24px",
                            marginBottom: "24px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            className="basic-info-card"
                            style={{
                              border: "0.5px solid #d9d6d6",
                              borderRadius: "10px",
                              padding: "13px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Id Proof Document
                            </div>
                            <div>
                              {user?.id_proof_doc_upload ? (
                                <a
                                  href={user.id_proof_doc_upload}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Document
                                </a>
                              ) : (
                                "NA"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="basic-info-section">
                        <form
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            marginBottom: "0",
                          }}
                          encType="multipart/form-data"
                        >
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Emergency Contact Name
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Please provide your emergency contact name:"
                              value={editEmergencyName}
                              onChange={(e) =>
                                setEditEmergencyName(e.target.value)
                              }
                              required
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                marginBottom: "0",
                              }}
                            />
                            {basicErrors.editEmergencyName && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editEmergencyName}
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Emergency Contact Number
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={10}
                              placeholder="Please provide your emergency contact number:"
                              value={editEmergencyNumber}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Only allow numbers and max 10 digits
                                if (/^\d{0,10}$/.test(value)) {
                                  setEditEmergencyNumber(value);
                                  setEmergencyNumberError("");
                                }
                              }}
                              required
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                marginBottom: "0",
                              }}
                            />
                            {emergencyNumberError && (
                              <span
                                style={{
                                  color: "red",
                                  fontSize: "13px",
                                  marginTop: "4px",
                                }}
                              >
                                {emergencyNumberError}
                              </span>
                            )}
                            {basicErrors.editEmergencyNumber && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editEmergencyNumber}
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Current Organisation
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Current Organisation"
                              value={editOrganisation}
                              onChange={(e) =>
                                setEditOrganisation(e.target.value)
                              }
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                marginBottom: "0",
                              }}
                            />
                            {basicErrors.editOrganisation && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editOrganisation}
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Designation<span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Designation"
                              value={editDesignation}
                              onChange={(e) =>
                                setEditDesignation(e.target.value)
                              }
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                marginBottom: "0",
                              }}
                            />
                            {basicErrors.editDesignation && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editDesignation}
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Id Proof Type
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <select
                              value={editIdProofType}
                              onChange={(e) =>
                                setEditIdProofType(e.target.value)
                              }
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                color: editIdProofType ? "#333" : "#aaa",
                                marginBottom: "0",
                                width: "100%",
                              }}
                            >
                              <option value="">Select Id Proof Type</option>
                              <option value="Aadhar">Aadhar</option>
                              <option value="PAN">PAN</option>
                              <option value="Passport">Passport</option>
                              <option value="Other">Other</option>
                            </select>
                            {basicErrors.editIdProofType && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editIdProofType}
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Id Proof Number
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Id Proof Number"
                              value={editIdProofNumber}
                              onChange={(e) =>
                                setEditIdProofNumber(e.target.value)
                              }
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#fff",
                                marginBottom: "0",
                                width: "100%",
                              }}
                            />
                            {basicErrors.editIdProofNumber && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editIdProofNumber}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gridColumn: "1/3",
                            }}
                          >
                            <label
                              style={{ fontWeight: 500, marginBottom: "6px" }}
                            >
                              Id Proof Document
                              <span style={{ color: "red" }}>*</span>
                            </label>
                            <input
                              type="file"
                              onChange={(e) =>
                                setEditIdProofFile(e.target.files[0])
                              }
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{
                                fontSize: "14px",
                                padding: "16px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                                background: "#f7f7f7",
                                width: "100%",
                              }}
                            />
                            {basicErrors.editIdProofFile && (
                              <div style={{ color: "red", fontSize: "0.9em" }}>
                                {basicErrors.editIdProofFile}
                              </div>
                            )}
                          </div>
                        </form>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "32px",
                            marginTop: "32px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setEditBasic(false)}
                            style={{
                              background: "#fff",
                              color: "#e53935",
                              border: "2px solid #e53935",
                              borderRadius: "8px",
                              padding: "12px 32px",
                              fontWeight: 600,
                              fontSize: "1.1rem",
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleBasicSubmit}
                            style={{
                              background: "#e53935",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "12px 32px",
                              fontWeight: 600,
                              fontSize: "1.1rem",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {activeTab === "address" && (
                  <div className="address-info-section">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h2 style={{ margin: 0 }}>Your Address</h2>
                      <button
                        className="profile-action-btn"
                        style={{
                          color: "red",
                          border: "1px solid red",
                          background: "white",
                          borderRadius: "6px",
                          padding: "6px 16px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        <span style={{ marginRight: "6px" }}>✏️</span>Edit
                      </button>
                    </div>
                    <div
                      style={{
                        marginTop: "32px",
                        marginBottom: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Permanent Address Details
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Flat No./Building No.
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Street Name, Area Name/Colony
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          City
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          State
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Country
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Pincode
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "32px",
                        marginBottom: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Communication Address Details
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Flat No./Building No.
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Street Name,Area Name/Colony
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          City
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          State
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Country
                        </div>
                        <div>NA</div>
                      </div>
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Pincode
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "32px",
                        marginBottom: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      Address proof details
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "24px",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        className="basic-info-card"
                        style={{
                          border: "0.5px solid #d9d6d6",
                          borderRadius: "10px",
                          padding: "13px",
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Nationality
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ width: "100%" }}>
              <div style={{ marginTop: 32 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ fontWeight: 500, fontSize: 22, margin: 0 }}>
                    Organizing Team - New user
                  </h2>
                  <button
                    style={{
                      border: "1.5px solid #d7261a",
                      color: "#d7261a",
                      background: "#fff",
                      borderRadius: 6,
                      padding: "6px 18px",
                      fontSize: 18,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={handleOpenAddUserModal}
                  >
                    <span
                      style={{ fontSize: 22, fontWeight: 600, marginRight: 4 }}
                    >
                      +
                    </span>{" "}
                    Add User
                  </button>
                </div>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  <table className="organizing-team-table">
                    <thead>
                      <tr style={{ background: "#e6f0ff", height: 44 }}>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Sr. No.
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          User Name
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Email
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Mobile Number
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Gender
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Date of Birth
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Role
                        </th>
                        <th
                          style={{
                            fontWeight: 600,
                            fontSize: 16,
                            padding: "8px 0",
                            border: "none",
                          }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrgUsers ? (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              textAlign: "center",
                              padding: "24px 0",
                            }}
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : orgUserDetails && orgUserDetails.length > 0 ? (
                        orgUserDetails.map((orgUser, index) => (
                          <tr key={orgUser.id || index}>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.username ||
                                `${orgUser.firstname} ${orgUser.lastname}`}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.email}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.mobile}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.gender}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.dob}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              {orgUser.user_role}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "12px 8px",
                                borderBottom: "1px solid #e0e0e0",
                              }}
                            >
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  marginRight: "8px",
                                }}
                                title="Edit"
                                onClick={() => handleEditOrgUser(orgUser.id)}
                              >
                                ✏️
                              </button>
                              <button
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                title="Delete"
                                onClick={() => handleDeleteOrgUser(orgUser.id)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              textAlign: "center",
                              color: "red",
                              fontWeight: 500,
                              fontSize: 18,
                              padding: "24px 0",
                            }}
                          >
                            No Record Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={handleCloseAddUserModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#333",
                  margin: 0,
                }}
              >
                Organising Team - Add User
              </h2>
            </div>

            {/* Form Fields */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Manage Roles */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#555",
                  }}
                >
                  Manage Roles <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    color: "#333",
                  }}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(String(e.target.value))}
                >
                  <option value="">-- Select Roles --</option>
                  {loadingRoles ? (
                    <option disabled>Loading roles...</option>
                  ) : roles && roles.length > 0 ? (
                    roles.map((role, idx) => (
                      <option
                        key={role.id || role.role_id || idx}
                        value={role.id || role.role_id}
                      >
                        {role.role_name || role.name || role.roleName || "Role"}
                      </option>
                    ))
                  ) : (
                    <option disabled>No roles available</option>
                  )}
                </select>
                {orgUserErrors.selectedRole && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    {orgUserErrors.selectedRole}
                  </div>
                )}
              </div>

              {/* First Name and Last Name */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    First Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    value={addFirstName}
                    onChange={(e) => setAddFirstName(e.target.value)}
                  />
                  {orgUserErrors.addFirstName && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addFirstName}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    Last Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    value={addLastName}
                    onChange={(e) => setAddLastName(e.target.value)}
                  />
                  {orgUserErrors.addLastName && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addLastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Number and Email */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    Contact number <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    value={addContactNumber}
                    onChange={(e) =>
                      setAddContactNumber(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    maxLength={10}
                  />
                  {orgUserErrors.addContactNumber && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addContactNumber}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    Email Id <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="email"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                    }}
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                  />
                  {orgUserErrors.addEmail && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Date of Birth and Gender */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    Date Of Birth <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      color: addDob ? "#333" : "#999",
                    }}
                    placeholder="dd-mm-yyyy"
                    value={addDob}
                    max={maxDob}
                    onChange={(e) => setAddDob(e.target.value)}
                  />
                  {orgUserErrors.addDob && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addDob}
                    </div>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#555",
                    }}
                  >
                    Gender <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      color: addGender ? "#333" : "#999",
                    }}
                    value={addGender}
                    onChange={(e) => setAddGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {orgUserErrors.addGender && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.addGender}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Selection Radio Buttons */}
              <div>
                <div
                  style={{ display: "flex", gap: "24px", marginBottom: "16px" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="eventSelection"
                      value="all"
                      checked={eventSelection === "all"}
                      onChange={(e) => setEventSelection(e.target.value)}
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor:
                          eventSelection === "all" ? "#e53935" : "transparent",
                        color: eventSelection === "all" ? "white" : "#555",
                        padding: "8px 20px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border:
                          eventSelection === "all" ? "none" : "1px solid #ddd",
                      }}
                    >
                      All Events
                    </span>
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="eventSelection"
                      value="select"
                      checked={eventSelection === "select"}
                      onChange={(e) => setEventSelection(e.target.value)}
                      style={{
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor:
                          eventSelection === "select"
                            ? "transparent"
                            : "transparent",
                        color: eventSelection === "select" ? "#e53935" : "#555",
                        padding: "8px 20px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        border: "1px solid #e53935",
                      }}
                    >
                      Select Events
                    </span>
                  </label>
                </div>

                {/* Events List (shown when Select Events is chosen) */}
                {eventSelection === "select" && (
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    {loadingEvents ? (
                      <p style={{ textAlign: "center", color: "#999" }}>
                        Loading events...
                      </p>
                    ) : events.length > 0 ? (
                      events.map((event) => (
                        <label
                          key={event.id}
                          style={{
                            display: "block",
                            padding: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            value={event.id}
                            checked={selectedEvents.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEvents([
                                  ...selectedEvents,
                                  event.id,
                                ]);
                              } else {
                                setSelectedEvents(
                                  selectedEvents.filter((id) => id !== event.id)
                                );
                              }
                            }}
                            style={{ marginRight: "8px" }}
                          />
                          {event.event_name || event.name}
                        </label>
                      ))
                    ) : (
                      <p style={{ textAlign: "center", color: "#999" }}>
                        No events available
                      </p>
                    )}
                  </div>
                )}
                {eventSelection === "select" &&
                  orgUserErrors.selectedEvents && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {orgUserErrors.selectedEvents}
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                <button
                  onClick={handleCloseAddUserModal}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "8px",
                    border: "2px solid #e53935",
                    backgroundColor: "white",
                    color: "#e53935",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#e53935",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Message */}
      {showSuccessToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#4caf50",
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "20px" }}>✓</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            {successMessage}
          </span>
        </div>
      )}
    </div>
  );
};

export default Profile;
