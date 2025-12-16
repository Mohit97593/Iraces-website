import React, { useState, useEffect, useMemo } from "react";
import "./Profile.css";
import TopNav from "../../components/Navbar/TopNav";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../services/authAPI";
import MedicalProfile from "../../components/MedicalProfile/MedicalProfile";

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
          const userData = profileResponse.data.userData[0];
          localStorage.setItem("userData", JSON.stringify(userData));
          checkAuthStatus();
          setRefreshTrigger((prev) => prev + 1);

          // Fetch countries for address display
          try {
            const countriesResponse = await import(
              "../../services/authAPI"
            ).then(({ authAPI }) => authAPI.getCountries());
            let countriesData = [];
            if (countriesResponse?.data?.AllCountries) {
              countriesData = countriesResponse.data.AllCountries;
            } else if (countriesResponse?.data?.AllCountry) {
              countriesData = countriesResponse.data.AllCountry;
            } else if (countriesResponse?.AllCountries) {
              countriesData = countriesResponse.AllCountries;
            } else if (countriesResponse?.AllCountry) {
              countriesData = countriesResponse.AllCountry;
            } else if (Array.isArray(countriesResponse?.data)) {
              countriesData = countriesResponse.data;
            } else if (Array.isArray(countriesResponse)) {
              countriesData = countriesResponse;
            }
            setCountries(countriesData);

            // Fetch permanent address states and cities if available
            if (userData.country) {
              const statesResponse = await import(
                "../../services/authAPI"
              ).then(({ authAPI }) =>
                authAPI.getStates({ country_id: userData.country })
              );
              let statesData = [];
              if (statesResponse?.data?.AllState) {
                statesData = statesResponse.data.AllState;
              } else if (statesResponse?.AllState) {
                statesData = statesResponse.AllState;
              } else if (Array.isArray(statesResponse?.data)) {
                statesData = statesResponse.data;
              }
              setPermStates(statesData);

              if (userData.state) {
                const citiesResponse = await import(
                  "../../services/authAPI"
                ).then(({ authAPI }) =>
                  authAPI.getCities({
                    state_id: userData.state,
                    search_flag: "N",
                  })
                );
                let citiesData = [];
                if (citiesResponse?.data?.AllCities) {
                  citiesData = citiesResponse.data.AllCities;
                } else if (citiesResponse?.data?.AllCity) {
                  citiesData = citiesResponse.data.AllCity;
                } else if (citiesResponse?.AllCities) {
                  citiesData = citiesResponse.AllCities;
                } else if (citiesResponse?.AllCity) {
                  citiesData = citiesResponse.AllCity;
                } else if (Array.isArray(citiesResponse?.data)) {
                  citiesData = citiesResponse.data;
                }
                setPermCities(citiesData);
              }
            }

            // Fetch communication address states and cities if available
            if (userData.ca_country) {
              const commStatesResponse = await import(
                "../../services/authAPI"
              ).then(({ authAPI }) =>
                authAPI.getStates({ country_id: userData.ca_country })
              );
              let commStatesData = [];
              if (commStatesResponse?.data?.AllState) {
                commStatesData = commStatesResponse.data.AllState;
              } else if (commStatesResponse?.AllState) {
                commStatesData = commStatesResponse.AllState;
              } else if (Array.isArray(commStatesResponse?.data)) {
                commStatesData = commStatesResponse.data;
              }
              setCommStates(commStatesData);

              if (userData.ca_state) {
                const commCitiesResponse = await import(
                  "../../services/authAPI"
                ).then(({ authAPI }) =>
                  authAPI.getCities({
                    state_id: userData.ca_state,
                    search_flag: "N",
                  })
                );
                let commCitiesData = [];
                if (commCitiesResponse?.data?.AllCities) {
                  commCitiesData = commCitiesResponse.data.AllCities;
                } else if (commCitiesResponse?.data?.AllCity) {
                  commCitiesData = commCitiesResponse.data.AllCity;
                } else if (commCitiesResponse?.AllCities) {
                  commCitiesData = commCitiesResponse.AllCities;
                } else if (commCitiesResponse?.AllCity) {
                  commCitiesData = commCitiesResponse.AllCity;
                } else if (Array.isArray(commCitiesResponse?.data)) {
                  commCitiesData = commCitiesResponse.data;
                }
                setCommCities(commCitiesData);
              }
            }
          } catch (err) {
            console.error("Failed to fetch address data:", err);
          }
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

  // Address edit states
  const [editAddress, setEditAddress] = useState(false);
  const [permHouseNo, setPermHouseNo] = useState("");
  const [permStreet, setPermStreet] = useState("");
  const [permCountryId, setPermCountryId] = useState("");
  const [permStateId, setPermStateId] = useState("");
  const [permCityId, setPermCityId] = useState("");
  const [permPincode, setPermPincode] = useState("");
  const [commHouseNo, setCommHouseNo] = useState("");
  const [commStreet, setCommStreet] = useState("");
  const [commCountryId, setCommCountryId] = useState("");
  const [commStateId, setCommStateId] = useState("");
  const [commCityId, setCommCityId] = useState("");
  const [commPincode, setCommPincode] = useState("");
  const [nationality, setNationality] = useState("");
  const [sameAsPermAddress, setSameAsPermAddress] = useState(false);
  const [addressProofType, setAddressProofType] = useState("");
  const [addressProofNo, setAddressProofNo] = useState("");
  const [addressProofDoc, setAddressProofDoc] = useState(null);

  // Dropdown data
  const [countries, setCountries] = useState([]);
  const [permStates, setPermStates] = useState([]);
  const [permCities, setPermCities] = useState([]);
  const [commStates, setCommStates] = useState([]);
  const [commCities, setCommCities] = useState([]);

  // Loading states
  const [loadingPermStates, setLoadingPermStates] = useState(false);
  const [loadingPermCities, setLoadingPermCities] = useState(false);
  const [loadingCommStates, setLoadingCommStates] = useState(false);
  const [loadingCommCities, setLoadingCommCities] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [showAddressSuccess, setShowAddressSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Individual address field errors
  const [addressErrors, setAddressErrors] = useState({});


  // Get userData from localStorage, updates when refreshTrigger changes
  const userData = useMemo(() => {
    const data = localStorage.getItem("userData");
    return data ? JSON.parse(data) : {};
  }, [refreshTrigger]);

  // Calculate profile completion percentage
  const profileProgress = useMemo(() => {
    if (!userData || Object.keys(userData).length === 0) return 0;

    const fields = [
      // Personal Details (7 fields)
      userData.firstname,
      userData.lastname,
      userData.mobile,
      userData.email,
      userData.gender,
      userData.dob,
      userData.bio,

      // Basic Information (7 fields)
      userData.emergency_contact_name,
      userData.emergency_contact_no,
      userData.organisation,
      userData.designation,
      userData.id_proof_type,
      userData.id_proof_no,
      userData.id_proof_doc_upload,

      // Address Details (16 fields)
      userData.country,
      userData.state,
      userData.city,
      userData.pincode,
      userData.address1,
      userData.address2,
      userData.ca_country,
      userData.ca_state,
      userData.ca_city,
      userData.ca_pincode,
      userData.ca_address1,
      userData.ca_address2,
      userData.nationality,
      userData.address_proof_type,
      userData.address_proof_no,
      userData.address_proof_doc_upload,

      // Medical Profile (10 key fields)
      userData.blood_group,
      userData.height,
      userData.weight,
      userData.medical_conditions,
      userData.diabetes,
      userData.chestpain,
      userData.allergies,
      userData.familydoctorname,
      userData.familydoctorcontactno,
      userData.currentmedications,
    ];

    const filledFields = fields.filter((field) => {
      if (field === null || field === undefined || field === "") return false;
      if (typeof field === "string" && field.trim() === "") return false;
      return true;
    }).length;

    const totalFields = fields.length;
    const percentage = (filledFields / totalFields) * 100;

    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
  }, [userData]);

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
    } else if (
      orgUserDetails.some(
        (user) => user.email?.toLowerCase() === addEmail.trim().toLowerCase()
      )
    ) {
      errors.addEmail = "This email is already used by another organiser.";
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
      setRefreshTrigger((prev) => prev + 1); // Trigger profile progress update
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
      setRefreshTrigger((prev) => prev + 1); // Trigger profile progress update
      setEditBasic(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update basic info: " + (err?.message || err));
    }
  };

  // Address Edit Functions
  const handleEditAddressClick = async () => {
    let permCountry = "";
    let permState = "";
    let permCity = "";
    let commCountry = "";
    let commState = "";
    let commCity = "";

    // Fetch profile data first
    try {
      const profileResponse = await authAPI.getProfile();
      if (
        profileResponse &&
        profileResponse.data &&
        profileResponse.data.userData
      ) {
        const userData = profileResponse.data.userData[0];

        // Set permanent address fields
        setPermHouseNo(userData.address1 || "");
        setPermStreet(userData.address2 || "");
        permCountry = userData.country || "";
        permState = userData.state || "";
        permCity = userData.city || "";
        setPermCountryId(permCountry);
        setPermStateId(permState);
        setPermCityId(permCity);
        setPermPincode(userData.pincode || "");

        // Set communication address fields
        setCommHouseNo(userData.ca_address1 || "");
        setCommStreet(userData.ca_address2 || "");
        commCountry = userData.ca_country || "";
        commState = userData.ca_state || "";
        commCity = userData.ca_city || "";
        setCommCountryId(commCountry);
        setCommStateId(commState);
        setCommCityId(commCity);
        setCommPincode(userData.ca_pincode || "");

        setNationality(userData.nationality || "");
        setAddressProofType(userData.address_proof_type || "");
        setAddressProofNo(userData.address_proof_no || "");
        setSameAsPermAddress(userData.sameAsPermanent === 1);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }

    // Fetch countries
    try {
      const countriesResponse = await authAPI.getCountries();

      // Check different possible response structures
      let countriesData = [];
      if (countriesResponse?.data?.AllCountries) {
        countriesData = countriesResponse.data.AllCountries;
      } else if (countriesResponse?.data?.AllCountry) {
        countriesData = countriesResponse.data.AllCountry;
      } else if (countriesResponse?.AllCountries) {
        countriesData = countriesResponse.AllCountries;
      } else if (countriesResponse?.AllCountry) {
        countriesData = countriesResponse.AllCountry;
      } else if (Array.isArray(countriesResponse?.data)) {
        countriesData = countriesResponse.data;
      } else if (Array.isArray(countriesResponse)) {
        countriesData = countriesResponse;
      }

      setCountries(countriesData);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    }

    // Fetch permanent address states if country is selected
    if (permCountry) {
      try {
        const statesResponse = await authAPI.getStates({
          country_id: permCountry,
        });

        let statesData = [];
        if (statesResponse?.data?.AllState) {
          statesData = statesResponse.data.AllState;
        } else if (statesResponse?.AllState) {
          statesData = statesResponse.AllState;
        } else if (Array.isArray(statesResponse?.data)) {
          statesData = statesResponse.data;
        }

        setPermStates(statesData);
      } catch (error) {
        console.error("Failed to fetch perm states:", error);
      }
    }

    // Fetch permanent address cities if state is selected
    if (permState) {
      try {
        const citiesResponse = await authAPI.getCities({
          state_id: permState,
          search_flag: "N",
        });
        console.log("Perm cities response:", citiesResponse);

        let citiesData = [];
        if (citiesResponse?.data?.AllCities) {
          citiesData = citiesResponse.data.AllCities;
        } else if (citiesResponse?.data?.AllCity) {
          citiesData = citiesResponse.data.AllCity;
        } else if (citiesResponse?.AllCities) {
          citiesData = citiesResponse.AllCities;
        } else if (citiesResponse?.AllCity) {
          citiesData = citiesResponse.AllCity;
        } else if (Array.isArray(citiesResponse?.data)) {
          citiesData = citiesResponse.data;
        }

        setPermCities(citiesData);
      } catch (error) {
        console.error("Failed to fetch perm cities:", error);
      }
    }

    // Fetch communication address states if country is selected
    if (commCountry) {
      try {
        const statesResponse = await authAPI.getStates({
          country_id: commCountry,
        });

        let statesData = [];
        if (statesResponse?.data?.AllState) {
          statesData = statesResponse.data.AllState;
        } else if (statesResponse?.AllState) {
          statesData = statesResponse.AllState;
        } else if (Array.isArray(statesResponse?.data)) {
          statesData = statesResponse.data;
        }

        setCommStates(statesData);
      } catch (error) {
        console.error("Failed to fetch comm states:", error);
      }
    }

    // Fetch communication address cities if state is selected
    if (commState) {
      try {
        const citiesResponse = await authAPI.getCities({
          state_id: commState,
          search_flag: "N",
        });

        let citiesData = [];
        if (citiesResponse?.data?.AllCities) {
          citiesData = citiesResponse.data.AllCities;
        } else if (citiesResponse?.data?.AllCity) {
          citiesData = citiesResponse.data.AllCity;
        } else if (citiesResponse?.AllCities) {
          citiesData = citiesResponse.AllCities;
        } else if (citiesResponse?.AllCity) {
          citiesData = citiesResponse.AllCity;
        } else if (Array.isArray(citiesResponse?.data)) {
          citiesData = citiesResponse.data;
        }

        setCommCities(citiesData);
      } catch (error) {
        console.error("Failed to fetch comm cities:", error);
      }
    }

    // Set editAddress to true only after all data is loaded and state is updated
    // Small delay to ensure React state updates are processed
    setTimeout(() => {
      setEditAddress(true);
    }, 100);
  };

  // Fetch states when country changes for permanent address
  const fetchPermStates = async (countryId) => {
    if (!countryId) return;
    setLoadingPermStates(true);
    try {
      const statesResponse = await authAPI.getStates({ country_id: countryId });

      let statesData = [];
      if (statesResponse?.data?.AllState) {
        statesData = statesResponse.data.AllState;
      } else if (statesResponse?.AllState) {
        statesData = statesResponse.AllState;
      } else if (Array.isArray(statesResponse?.data)) {
        statesData = statesResponse.data;
      }

      setPermStates(statesData);
    } catch (error) {
      console.error("Failed to fetch states:", error);
    } finally {
      setLoadingPermStates(false);
    }
  };

  // Fetch cities when state changes for permanent address
  const fetchPermCities = async (stateId) => {
    if (!stateId) return;
    setLoadingPermCities(true);
    try {
      const citiesResponse = await authAPI.getCities({
        state_id: stateId,
        search_flag: "N",
      });

      let citiesData = [];
      if (citiesResponse?.data?.AllCities) {
        citiesData = citiesResponse.data.AllCities;
      } else if (citiesResponse?.data?.AllCity) {
        citiesData = citiesResponse.data.AllCity;
      } else if (citiesResponse?.AllCities) {
        citiesData = citiesResponse.AllCities;
      } else if (citiesResponse?.AllCity) {
        citiesData = citiesResponse.AllCity;
      } else if (Array.isArray(citiesResponse?.data)) {
        citiesData = citiesResponse.data;
      } else if (citiesResponse?.data) {
        // Check all keys in data object
        const dataKeys = Object.keys(citiesResponse.data);
        for (const key of dataKeys) {
          if (Array.isArray(citiesResponse.data[key])) {
            citiesData = citiesResponse.data[key];
            break;
          }
        }
      }

      setPermCities(citiesData);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoadingPermCities(false);
    }
  };

  // Fetch states when country changes for communication address
  const fetchCommStates = async (countryId) => {
    if (!countryId) return;
    setLoadingCommStates(true);
    try {
      const statesResponse = await authAPI.getStates({ country_id: countryId });

      let statesData = [];
      if (statesResponse?.data?.AllState) {
        statesData = statesResponse.data.AllState;
      } else if (statesResponse?.AllState) {
        statesData = statesResponse.AllState;
      } else if (Array.isArray(statesResponse?.data)) {
        statesData = statesResponse.data;
      }

      setCommStates(statesData);
    } catch (error) {
      console.error("Failed to fetch states:", error);
    } finally {
      setLoadingCommStates(false);
    }
  };

  // Fetch cities when state changes for communication address
  const fetchCommCities = async (stateId) => {
    if (!stateId) return;
    setLoadingCommCities(true);
    try {
      const citiesResponse = await authAPI.getCities({
        state_id: stateId,
        search_flag: "N",
      });

      let citiesData = [];
      if (citiesResponse?.data?.AllCities) {
        citiesData = citiesResponse.data.AllCities;
      } else if (citiesResponse?.data?.AllCity) {
        citiesData = citiesResponse.data.AllCity;
      } else if (citiesResponse?.AllCities) {
        citiesData = citiesResponse.AllCities;
      } else if (citiesResponse?.AllCity) {
        citiesData = citiesResponse.AllCity;
      } else if (Array.isArray(citiesResponse?.data)) {
        citiesData = citiesResponse.data;
      } else if (citiesResponse?.data) {
        // Check all keys in data object
        const dataKeys = Object.keys(citiesResponse.data);
        for (const key of dataKeys) {
          if (Array.isArray(citiesResponse.data[key])) {
            citiesData = citiesResponse.data[key];
            break;
          }
        }
      }

      setCommCities(citiesData);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoadingCommCities(false);
    }
  };

  // Handle permanent address country change
  const handlePermCountryChange = (e) => {
    const countryId = e.target.value;
    setPermCountryId(countryId);
    setPermStateId("");
    setPermCityId("");
    setPermStates([]);
    setPermCities([]);
    if (countryId) {
      fetchPermStates(countryId);
    }
  };

  // Handle permanent address state change
  const handlePermStateChange = (e) => {
    const stateId = e.target.value;
    setPermStateId(stateId);
    setPermCityId("");
    setPermCities([]);
    if (stateId) {
      fetchPermCities(stateId);
    }
  };

  // Handle communication address country change
  const handleCommCountryChange = (e) => {
    const countryId = e.target.value;
    setCommCountryId(countryId);
    setCommStateId("");
    setCommCityId("");
    setCommStates([]);
    setCommCities([]);
    if (countryId) {
      fetchCommStates(countryId);
    }
  };

  // Handle communication address state change
  const handleCommStateChange = (e) => {
    const stateId = e.target.value;
    setCommStateId(stateId);
    setCommCityId("");
    setCommCities([]);
    if (stateId) {
      fetchCommCities(stateId);
    }
  };

  // Handle save address
  const handleSaveAddress = async () => {
    try {
      setAddressError("");
      setAddressErrors({});

      // Validation
      let errors = {};

      if (!permCountryId) {
        errors.permCountryId = "Please select country";
      }
      if (!permPincode) {
        errors.permPincode = "Please enter pincode";
      }
      if (!permHouseNo) {
        errors.permHouseNo = "Please enter House No./Flat Block No.";
      }

      if (!sameAsPermAddress) {
        if (!commCountryId) {
          errors.commCountryId = "Please select country";
        }
        if (!commPincode) {
          errors.commPincode = "Please enter pincode";
        }
        if (!commHouseNo) {
          errors.commHouseNo = "Please enter House No./Flat Block No.";
        }
      }

      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        return;
      }

      // Create FormData
      const formData = new FormData();

      // Permanent Address
      formData.append("address1", permHouseNo || "");
      formData.append("address2", permStreet || "");
      formData.append("city", permCityId || "");
      formData.append("state", permStateId || "");
      formData.append("country", permCountryId || "");
      formData.append("pincode", permPincode || "");

      // Communication Address
      formData.append("sameAsPermanent", sameAsPermAddress ? "1" : "0");
      if (sameAsPermAddress) {
        // If same as permanent, use permanent address values
        formData.append("ca_address1", permHouseNo || "");
        formData.append("ca_address2", permStreet || "");
        formData.append("ca_city", permCityId || "");
        formData.append("ca_state", permStateId || "");
        formData.append("ca_country", permCountryId || "");
        formData.append("ca_pincode", permPincode || "");
      } else {
        formData.append("ca_address1", commHouseNo || "");
        formData.append("ca_address2", commStreet || "");
        formData.append("ca_city", commCityId || "");
        formData.append("ca_state", commStateId || "");
        formData.append("ca_country", commCountryId || "");
        formData.append("ca_pincode", commPincode || "");
      }

      // Nationality and Address Proof
      formData.append("nationality", nationality || "");
      formData.append("address_proof_type", addressProofType || "");
      formData.append("address_proof_no", addressProofNo || "");

      // Address Proof Document
      if (addressProofDoc) {
        formData.append("address_proof_doc_upload", addressProofDoc);
      }

      // Call API
      const response = await authAPI.addressDetails(formData);

      if (response) {
        // Refresh profile data
        const profileResponse = await authAPI.getProfile();
        if (profileResponse?.data?.userData) {
          const updatedUserData = profileResponse.data.userData[0];
          localStorage.setItem("userData", JSON.stringify(updatedUserData));

          // Update all states with fresh data
          setPermHouseNo(updatedUserData.address1 || "");
          setPermStreet(updatedUserData.address2 || "");
          setPermCountryId(updatedUserData.country || "");
          setPermStateId(updatedUserData.state || "");
          setPermCityId(updatedUserData.city || "");
          setPermPincode(updatedUserData.pincode || "");

          setCommHouseNo(updatedUserData.ca_address1 || "");
          setCommStreet(updatedUserData.ca_address2 || "");
          setCommCountryId(updatedUserData.ca_country || "");
          setCommStateId(updatedUserData.ca_state || "");
          setCommCityId(updatedUserData.ca_city || "");
          setCommPincode(updatedUserData.ca_pincode || "");

          setNationality(updatedUserData.nationality || "");
          setAddressProofType(updatedUserData.address_proof_type || "");
          setAddressProofNo(updatedUserData.address_proof_no || "");
          setSameAsPermAddress(
            updatedUserData.sameAsPermanent === "1" ||
            updatedUserData.sameAsPermanent === 1
          );

          // Reload states and cities for helper functions to display correctly
          if (updatedUserData.country) {
            const statesResponse = await authAPI.getStates({
              country_id: updatedUserData.country,
            });
            let statesData = [];
            if (statesResponse?.data?.AllState) {
              statesData = statesResponse.data.AllState;
            } else if (statesResponse?.AllState) {
              statesData = statesResponse.AllState;
            } else if (Array.isArray(statesResponse?.data)) {
              statesData = statesResponse.data;
            }
            setPermStates(statesData);
          }

          if (updatedUserData.state) {
            const citiesResponse = await authAPI.getCities({
              state_id: updatedUserData.state,
              search_flag: "N",
            });
            let citiesData = [];
            if (citiesResponse?.data?.AllCities) {
              citiesData = citiesResponse.data.AllCities;
            } else if (citiesResponse?.data?.AllCity) {
              citiesData = citiesResponse.data.AllCity;
            } else if (citiesResponse?.AllCities) {
              citiesData = citiesResponse.AllCities;
            } else if (citiesResponse?.AllCity) {
              citiesData = citiesResponse.AllCity;
            } else if (Array.isArray(citiesResponse?.data)) {
              citiesData = citiesResponse.data;
            }
            console.log("Perm cities loaded after save:", citiesData);
            setPermCities(citiesData);
          }

          if (updatedUserData.ca_country) {
            const statesResponse = await authAPI.getStates({
              country_id: updatedUserData.ca_country,
            });
            let statesData = [];
            if (statesResponse?.data?.AllState) {
              statesData = statesResponse.data.AllState;
            } else if (statesResponse?.AllState) {
              statesData = statesResponse.AllState;
            } else if (Array.isArray(statesResponse?.data)) {
              statesData = statesResponse.data;
            }
            setCommStates(statesData);
          }

          if (updatedUserData.ca_state) {
            const citiesResponse = await authAPI.getCities({
              state_id: updatedUserData.ca_state,
              search_flag: "N",
            });
            let citiesData = [];
            if (citiesResponse?.data?.AllCities) {
              citiesData = citiesResponse.data.AllCities;
            } else if (citiesResponse?.data?.AllCity) {
              citiesData = citiesResponse.data.AllCity;
            } else if (citiesResponse?.AllCities) {
              citiesData = citiesResponse.AllCities;
            } else if (citiesResponse?.AllCity) {
              citiesData = citiesResponse.AllCity;
            } else if (Array.isArray(citiesResponse?.data)) {
              citiesData = citiesResponse.data;
            }
            console.log("Comm cities loaded after save:", citiesData);
            setCommCities(citiesData);
          }
        }

        // Trigger UI refresh first so getCityName can find the city
        setRefreshTrigger((prev) => prev + 1);

        // Small delay to ensure state updates are reflected
        setTimeout(() => {
          setEditAddress(false);
          setShowAddressSuccess(true);
          setTimeout(() => setShowAddressSuccess(false), 3000);
        }, 50);
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      setAddressError(
        error.message || "Failed to save address. Please try again."
      );
    }
  };

  // Helper functions to get names from IDs
  const getCountryName = (countryId) => {
    if (!countryId) return "";
    const country = countries.find((c) => c.id === parseInt(countryId));
    return country ? country.name : "";
  };

  const getStateName = (stateId, isComm = false) => {
    if (!stateId) return "";
    const statesList = isComm ? commStates : permStates;
    const state = statesList.find((s) => s.id === parseInt(stateId));
    return state ? state.name : "";
  };

  const getCityName = (cityId, isComm = false) => {
    if (!cityId) return "";
    const citiesList = isComm ? commCities : permCities;
    if (!citiesList || citiesList.length === 0) {
      console.log(
        "Cities list is empty for",
        isComm ? "communication" : "permanent",
        "address"
      );
      return "";
    }
    const city = citiesList.find((c) => c.id === parseInt(cityId));
    if (!city) {
      console.log(
        "City not found for ID:",
        cityId,
        "in",
        citiesList.length,
        "cities"
      );
    }
    return city ? city.name : "";
  };

  // Load countries, states, and cities on page load for proper display
  useEffect(() => {
    const loadAddressData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) {
        console.log("No userData found in localStorage");
        return;
      }
      console.log("Loading address data for user:", userData);

      // Fetch countries
      try {
        const countriesResponse = await authAPI.getCountries();
        let countriesData = [];
        if (countriesResponse?.data?.AllCountries) {
          countriesData = countriesResponse.data.AllCountries;
        } else if (countriesResponse?.data?.AllCountry) {
          countriesData = countriesResponse.data.AllCountry;
        } else if (countriesResponse?.AllCountries) {
          countriesData = countriesResponse.AllCountries;
        } else if (countriesResponse?.AllCountry) {
          countriesData = countriesResponse.AllCountry;
        } else if (Array.isArray(countriesResponse?.data)) {
          countriesData = countriesResponse.data;
        } else if (Array.isArray(countriesResponse)) {
          countriesData = countriesResponse;
        }
        setCountries(countriesData);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }

      // Fetch permanent address states
      if (userData.country) {
        try {
          const statesResponse = await authAPI.getStates({
            country_id: userData.country,
          });
          let statesData = [];
          if (statesResponse?.data?.AllState) {
            statesData = statesResponse.data.AllState;
          } else if (statesResponse?.AllState) {
            statesData = statesResponse.AllState;
          } else if (Array.isArray(statesResponse?.data)) {
            statesData = statesResponse.data;
          }
          setPermStates(statesData);
        } catch (error) {
          console.error("Failed to fetch perm states:", error);
        }
      }

      // Fetch permanent address cities
      if (userData.state) {
        try {
          const citiesResponse = await authAPI.getCities({
            state_id: userData.state,
            search_flag: "N",
          });
          let citiesData = [];
          if (citiesResponse?.data?.AllCities) {
            citiesData = citiesResponse.data.AllCities;
          } else if (citiesResponse?.data?.AllCity) {
            citiesData = citiesResponse.data.AllCity;
          } else if (citiesResponse?.AllCities) {
            citiesData = citiesResponse.AllCities;
          } else if (citiesResponse?.AllCity) {
            citiesData = citiesResponse.AllCity;
          } else if (Array.isArray(citiesResponse?.data)) {
            citiesData = citiesResponse.data;
          }
          setPermCities(citiesData);
        } catch (error) {
          console.error("Failed to fetch perm cities:", error);
        }
      }

      // Fetch communication address states
      if (userData.ca_country) {
        try {
          const statesResponse = await authAPI.getStates({
            country_id: userData.ca_country,
          });
          let statesData = [];
          if (statesResponse?.data?.AllState) {
            statesData = statesResponse.data.AllState;
          } else if (statesResponse?.AllState) {
            statesData = statesResponse.AllState;
          } else if (Array.isArray(statesResponse?.data)) {
            statesData = statesResponse.data;
          }
          setCommStates(statesData);
        } catch (error) {
          console.error("Failed to fetch comm states:", error);
        }
      }

      // Fetch communication address cities
      if (userData.ca_state) {
        try {
          const citiesResponse = await authAPI.getCities({
            state_id: userData.ca_state,
            search_flag: "N",
          });
          let citiesData = [];
          if (citiesResponse?.data?.AllCities) {
            citiesData = citiesResponse.data.AllCities;
          } else if (citiesResponse?.data?.AllCity) {
            citiesData = citiesResponse.data.AllCity;
          } else if (citiesResponse?.AllCities) {
            citiesData = citiesResponse.AllCities;
          } else if (citiesResponse?.AllCity) {
            citiesData = citiesResponse.AllCity;
          } else if (Array.isArray(citiesResponse?.data)) {
            citiesData = citiesResponse.data;
          }
          setCommCities(citiesData);
        } catch (error) {
          console.error("Failed to fetch comm cities:", error);
        }
      }
    };

    loadAddressData();
  }, [refreshTrigger]);

  // When editAddress is set to true, fetch states and cities if country/state already selected
  useEffect(() => {
    if (editAddress && permCountryId) {
      fetchPermStates(permCountryId);
    }
  }, [editAddress, permCountryId]);

  useEffect(() => {
    if (editAddress && permStateId) {
      fetchPermCities(permStateId);
    }
  }, [editAddress, permStateId]);

  useEffect(() => {
    if (editAddress && commCountryId) {
      fetchCommStates(commCountryId);
    }
  }, [editAddress, commCountryId]);

  useEffect(() => {
    if (editAddress && commStateId) {
      fetchCommCities(commStateId);
    }
  }, [editAddress, commStateId]);

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
      {/* Address Success Popup */}
      {showAddressSuccess && (
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
          Address updated successfully
          <span
            style={{ marginLeft: "auto", cursor: "pointer" }}
            onClick={() => setShowAddressSuccess(false)}
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
                    src={(userData?.profile_pic && userData.profile_pic.trim() !== '')
                      ? (userData.profile_pic.startsWith('http')
                        ? userData.profile_pic
                        : `https://api.iraces.in/uploads/profile_images/${userData.profile_pic}`)
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="avatar"
                    onError={(e) => {
                      e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
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
                      style={{ width: `${profileProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percent">{profileProgress}%</span>
                </div>
                <div className="profile-info-section">
                  <div className="profile-info-title">Your Information</div>
                  <div className="profile-info-tabs">
                    <button
                      className={`tab ${activeTab === "personal" ? "active" : ""
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
                      className={`tab ${activeTab === "address" ? "active" : ""
                        }`}
                      onClick={() => setActiveTab("address")}
                    >
                      Your Address
                    </button>
                    <button
                      className={`tab ${activeTab === "medical" ? "active" : ""
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
                  <MedicalProfile
                    onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
                  />
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
                            src={(userData?.profile_pic && userData.profile_pic.trim() !== '')
                              ? (userData.profile_pic.startsWith('http')
                                ? userData.profile_pic
                                : `https://api.iraces.in/uploads/profile_images/${userData.profile_pic}`)
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt="avatar"
                            onError={(e) => {
                              e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            }}
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
                          <div
                            style={{
                              position: 'relative',
                              width: '140px',
                              height: '140px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              marginBottom: '16px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }}
                            onMouseEnter={(e) => {
                              const overlay = e.currentTarget.querySelector('.edit-profile-overlay');
                              if (overlay) overlay.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              const overlay = e.currentTarget.querySelector('.edit-profile-overlay');
                              if (overlay) overlay.style.opacity = '0';
                            }}
                          >
                            <img
                              src={userData?.profile_pic
                                ? (userData.profile_pic.startsWith('http')
                                  ? userData.profile_pic
                                  : `https://api.iraces.in/uploads/profile_images/${userData.profile_pic}`)
                                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                              }
                              alt="avatar"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <div
                              className="edit-profile-overlay"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '15px',
                                opacity: 0,
                                transition: 'opacity 0.3s ease'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => document.getElementById('editProfilePicInput').click()}
                                style={{
                                  background: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <i className="fas fa-camera" style={{ color: '#da251c', fontSize: '18px' }}></i>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete your profile picture?')) {
                                    try {
                                      const response = await authAPI.deleteProfilePic();
                                      if (response && response.message) {
                                        // Refresh profile data
                                        const profileResponse = await authAPI.getProfile();
                                        if (profileResponse?.data?.userData) {
                                          localStorage.setItem('userData', JSON.stringify(profileResponse.data.userData[0]));
                                          checkAuthStatus();
                                          setRefreshTrigger(prev => prev + 1);
                                          showSuccessMessage(response.message || 'Profile picture deleted successfully!');
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error deleting profile picture:', error);
                                      alert('Failed to delete profile picture');
                                    }
                                  }
                                }}
                                style={{
                                  background: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <i className="fas fa-trash" style={{ color: '#da251c', fontSize: '18px' }}></i>
                              </button>
                            </div>
                            <input
                              type="file"
                              id="editProfilePicInput"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  try {
                                    const response = await authAPI.updateProfilePic(file);
                                    if (response && response.message) {
                                      // Refresh profile data
                                      const profileResponse = await authAPI.getProfile();
                                      if (profileResponse?.data?.userData) {
                                        localStorage.setItem('userData', JSON.stringify(profileResponse.data.userData[0]));
                                        checkAuthStatus();
                                        setRefreshTrigger(prev => prev + 1);
                                        showSuccessMessage(response.message || 'Profile picture updated successfully!');
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error uploading profile picture:', error);
                                    alert('Failed to upload profile picture');
                                  }
                                }
                              }}
                            />
                          </div>
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
                                maxLength={25}
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
                                maxLength={50}
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
                              <option value="Aadhaar">Aadhaar</option>
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
                            {editIdProofFile && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "12px",
                                  background: "#e8f5e9",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  color: "#2e7d32",
                                  fontSize: "14px",
                                }}
                              >
                                ✓ New file selected: {editIdProofFile.name}
                              </div>
                            )}
                            {user?.id_proof_doc_upload && !editIdProofFile && (
                              <div
                                style={{
                                  marginTop: "12px",
                                  padding: "12px",
                                  background: "#f0f0f0",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {/* <span style={{ fontSize: "14px", color: "#666" }}>
                                  Currently uploaded:
                                </span> */}
                                <a
                                  href={user.id_proof_doc_upload}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#e53935",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                  }}
                                >
                                  View Document
                                </a>
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
                    {!editAddress ? (
                      // View Mode
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <h2 style={{ margin: 0 }}>Your Address</h2>
                          <button
                            type="button"
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
                            onClick={handleEditAddressClick}
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
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Flat No./Building No.
                            </div>
                            <div>{userData?.address1 || "NA"}</div>
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
                              Street Name, Area Name/Colony
                            </div>
                            <div>{userData?.address2 || "NA"}</div>
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
                              City
                            </div>
                            <div>
                              {getCityName(userData?.city, false) || "NA"}
                            </div>
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
                              State
                            </div>
                            <div>
                              {getStateName(userData?.state, false) || "NA"}
                            </div>
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
                              Country
                            </div>
                            <div>
                              {getCountryName(userData?.country) || "NA"}
                            </div>
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
                              Pincode
                            </div>
                            <div>{userData?.pincode || "NA"}</div>
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
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Flat No./Building No.
                            </div>
                            <div>{userData?.ca_address1 || "NA"}</div>
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
                              Street Name,Area Name/Colony
                            </div>
                            <div>{userData?.ca_address2 || "NA"}</div>
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
                              City
                            </div>
                            <div>
                              {getCityName(userData?.ca_city, true) || "NA"}
                            </div>
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
                              State
                            </div>
                            <div>
                              {getStateName(userData?.ca_state, true) || "NA"}
                            </div>
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
                              Country
                            </div>
                            <div>
                              {getCountryName(userData?.ca_country) || "NA"}
                            </div>
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
                              Pincode
                            </div>
                            <div>{userData?.ca_pincode || "NA"}</div>
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
                              style={{
                                fontWeight: "bold",
                                marginBottom: "14px",
                              }}
                            >
                              Nationality
                            </div>
                            <div>{userData?.nationality || "NA"}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Edit Mode
                      <div>
                        {/* Permanent Address Section */}
                        <div style={{ marginBottom: "32px" }}>
                          <h3
                            style={{ marginBottom: "16px", fontWeight: "bold" }}
                          >
                            Permanent Address Details
                          </h3>
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
                                }}
                              >
                                Country<span style={{ color: "red" }}>*</span>
                              </label>
                              <select
                                value={permCountryId}
                                onChange={handlePermCountryChange}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                  <option key={country.id} value={country.id}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                              {addressErrors.permCountryId && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.permCountryId}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                Pincode<span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={permPincode}
                                maxLength={6}
                                onChange={(e) => setPermPincode(e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              />
                              {addressErrors.permPincode && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.permPincode}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                House No./Flat Block No.
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={permHouseNo}
                                maxLength={30}
                                onChange={(e) => setPermHouseNo(e.target.value)}
                                placeholder="Apartment"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              />
                              {addressErrors.permHouseNo && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.permHouseNo}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                Street Name, Area Name/Colony
                              </label>
                              <input
                                type="text"
                                value={permStreet}
                                maxLength={30}
                                onChange={(e) => setPermStreet(e.target.value)}
                                placeholder="Apartment"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                State
                              </label>
                              <select
                                value={permStateId}
                                onChange={handlePermStateChange}
                                disabled={!permCountryId || loadingPermStates}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: !permCountryId
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              >
                                <option value="">
                                  {loadingPermStates
                                    ? "Loading..."
                                    : "-- Select State --"}
                                </option>
                                {permStates.map((state) => (
                                  <option key={state.id} value={state.id}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                City
                              </label>
                              <select
                                value={permCityId}
                                onChange={(e) => setPermCityId(e.target.value)}
                                disabled={!permStateId || loadingPermCities}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: !permStateId
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              >
                                <option value="">
                                  {loadingPermCities
                                    ? "Loading..."
                                    : "-- Select City --"}
                                </option>
                                {permCities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Communication Address Section */}
                        <div style={{ marginBottom: "32px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "16px",
                            }}
                          >
                            <h3 style={{ margin: 0, fontWeight: "bold" }}>
                              Communication Address Details
                            </h3>
                            <label
                              style={{
                                marginLeft: "16px",
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={sameAsPermAddress}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSameAsPermAddress(checked);
                                  if (checked) {
                                    setCommHouseNo(permHouseNo);
                                    setCommStreet(permStreet);
                                    setCommCountryId(permCountryId);
                                    setCommStateId(permStateId);
                                    setCommCityId(permCityId);
                                    setCommPincode(permPincode);
                                    if (permCountryId)
                                      fetchCommStates(permCountryId);
                                    if (permStateId)
                                      fetchCommCities(permStateId);
                                  } else {
                                    setCommHouseNo("");
                                    setCommStreet("");
                                    setCommCountryId("");
                                    setCommStateId("");
                                    setCommCityId("");
                                    setCommPincode("");
                                    setCommStates([]);
                                    // If you have setCommCities, also clear: setCommCities([]);
                                  }
                                }}
                                style={{ marginRight: "6px" }}
                              />
                              <span style={{ fontSize: "14px" }}>
                                Same as Permanent Address
                              </span>
                            </label>
                          </div>
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
                                }}
                              >
                                Country <span style={{ color: "red" }}>*</span>
                              </label>
                              <select
                                value={commCountryId}
                                onChange={handleCommCountryChange}
                                disabled={sameAsPermAddress}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: sameAsPermAddress
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                  <option key={country.id} value={country.id}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                              {addressErrors.commCountryId && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.commCountryId}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                Pincode <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={commPincode}
                                maxLenght={6}
                                onChange={(e) => setCommPincode(e.target.value)}
                                disabled={sameAsPermAddress}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: sameAsPermAddress
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              />
                              {addressErrors.commPincode && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.commPincode}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                House No./Flat Block No.{" "}
                                <span style={{ color: "red" }}>*</span>
                              </label>
                              <input
                                type="text"
                                value={commHouseNo}
                                maxLength={30}
                                onChange={(e) => setCommHouseNo(e.target.value)}
                                disabled={sameAsPermAddress}
                                placeholder="Apartment"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: sameAsPermAddress
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              />
                              {addressErrors.commHouseNo && (
                                <div style={{ color: "red", fontSize: "13px", marginTop: "4px" }}>
                                  {addressErrors.commHouseNo}
                                </div>
                              )}
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                Street Name, Area Name/Colony
                              </label>
                              <input
                                type="text"
                                value={commStreet}
                                maxLength={30}
                                onChange={(e) => setCommStreet(e.target.value)}
                                disabled={sameAsPermAddress}
                                placeholder="Apartment"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor: sameAsPermAddress
                                    ? "#f5f5f5"
                                    : "white",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                State
                              </label>
                              <select
                                value={commStateId}
                                onChange={handleCommStateChange}
                                disabled={
                                  sameAsPermAddress ||
                                  !commCountryId ||
                                  loadingCommStates
                                }
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor:
                                    sameAsPermAddress || !commCountryId
                                      ? "#f5f5f5"
                                      : "white",
                                }}
                              >
                                <option value="">
                                  {loadingCommStates
                                    ? "Loading..."
                                    : "-- Select State --"}
                                </option>
                                {commStates.map((state) => (
                                  <option key={state.id} value={state.id}>
                                    {state.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                }}
                              >
                                City
                              </label>
                              <select
                                value={commCityId}
                                onChange={(e) => setCommCityId(e.target.value)}
                                disabled={
                                  sameAsPermAddress ||
                                  !commStateId ||
                                  loadingCommCities
                                }
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  border: "1px solid #d9d6d6",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  backgroundColor:
                                    sameAsPermAddress || !commStateId
                                      ? "#f5f5f5"
                                      : "white",
                                }}
                              >
                                <option value="">
                                  {loadingCommCities
                                    ? "Loading..."
                                    : "-- Select City --"}
                                </option>
                                {commCities.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Nationality Field */}
                        <div style={{ marginBottom: "32px" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontSize: "14px",
                            }}
                          >
                            Nationality
                          </label>
                          <input
                            type="text"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "10px",
                              border: "1px solid #d9d6d6",
                              borderRadius: "6px",
                              fontSize: "14px",
                            }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setEditAddress(false)}
                            style={{
                              padding: "10px 24px",
                              border: "1px solid #d9d6d6",
                              borderRadius: "6px",
                              background: "white",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAddress}
                            disabled={savingAddress}
                            style={{
                              padding: "10px 24px",
                              border: "none",
                              borderRadius: "6px",
                              background: "#e53935",
                              color: "white",
                              cursor: savingAddress ? "not-allowed" : "pointer",
                              fontWeight: "600",
                              fontSize: "14px",
                            }}
                          >
                            {savingAddress ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
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
                    maxLength={50}
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
                    maxLength={50}
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
