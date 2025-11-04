import React, { useState } from "react";
import "./Profile.css";
import TopNav from "../../components/Navbar/TopNav";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
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
                  <div className="profile-card-details">
                    <div className="profile-name">
                      {firstName} {lastName}
                    </div>
                    <div className="profile-phone">
                      {phoneCode ? `+${phoneCode} - ` : ""}
                      {mobile}
                    </div>
                    <div className="profile-email">{email}</div>
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
                              onClick={async () => {
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
                                  setMobileError(
                                    "Please enter a valid 10-digit mobile number"
                                  );
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
                                  setDobError(
                                    "Date of birth cannot be today or a future date"
                                  );
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
                                  await import("../../services/authAPI").then(
                                    ({ authAPI }) =>
                                      authAPI.personalDetails(details)
                                  );
                                  // Fetch updated profile
                                  const profileResponse = await import(
                                    "../../services/authAPI"
                                  ).then(({ authAPI }) => authAPI.getProfile());
                                  // Save new user data to localStorage
                                  if (
                                    profileResponse &&
                                    profileResponse.data &&
                                    profileResponse.data.userData
                                  ) {
                                    localStorage.setItem(
                                      "userData",
                                      JSON.stringify(
                                        profileResponse.data.userData[0]
                                      )
                                    );
                                    // Update local bio state so UI reflects new bio
                                    setEditBio(
                                      profileResponse.data.userData[0]
                                        .about_you || ""
                                    );
                                  }
                                  // Update user state
                                  checkAuthStatus();
                                  setEditPersonal(false);
                                  setShowSuccess(true);
                                  setTimeout(() => setShowSuccess(false), 3000);
                                } catch (err) {
                                  alert(
                                    "Failed to update profile: " +
                                      (err?.message || err)
                                  );
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
                                        boxShadow:
                                          "0 2px 12px rgba(0,0,0,0.12)",
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
                                      <span style={{ fontSize: "1.5rem" }}>
                                        ✔️
                                      </span>
                                      Personal Details updated successfully
                                      <span
                                        style={{
                                          marginLeft: "auto",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => setShowSuccess(false)}
                                      >
                                        ✖️
                                      </span>
                                    </div>
                                  );
                                }
                              }}
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
                            onClick={async () => {
                              // Emergency contact number validation: must be 10 digits
                              if (!/^\d{10}$/.test(editEmergencyNumber)) {
                                setEmergencyNumberError(
                                  "Please enter a valid 10-digit emergency contact number."
                                );
                                return;
                              }
                              setEmergencyNumberError("");
                              try {
                                await import("../../services/authAPI").then(
                                  ({ authAPI }) =>
                                    authAPI.generalDetails({
                                      emergency_contact_person:
                                        editEmergencyName,
                                      emergency_contact_no: editEmergencyNumber,
                                      organization: editOrganisation,
                                      designation: editDesignation,
                                      id_proof_type: editIdProofType,
                                      id_proof_no: editIdProofNumber,
                                      id_proof_doc_upload: editIdProofFile,
                                    })
                                );
                                // Fetch updated profile after saving
                                const profileResponse = await import(
                                  "../../services/authAPI"
                                ).then(({ authAPI }) => authAPI.getProfile());
                                if (
                                  profileResponse &&
                                  profileResponse.data &&
                                  profileResponse.data.userData
                                ) {
                                  localStorage.setItem(
                                    "userData",
                                    JSON.stringify(
                                      profileResponse.data.userData[0]
                                    )
                                  );
                                  checkAuthStatus();
                                  // Update edit fields with latest data after save
                                  const userData =
                                    profileResponse.data.userData[0];
                                  setEditEmergencyName(
                                    userData.emergency_contact_person || ""
                                  );
                                  setEditEmergencyNumber(
                                    userData.emergency_contact_no || ""
                                  );
                                  setEditOrganisation(
                                    userData.organization || ""
                                  );
                                  setEditDesignation(
                                    userData.designation || ""
                                  );
                                  setEditIdProofType(
                                    userData.id_proof_type || ""
                                  );
                                  setEditIdProofNumber(
                                    userData.id_proof_no || ""
                                  );
                                  setEditIdProofFile(null);
                                }
                                setEditBasic(false);
                                setShowSuccess(true);
                                setTimeout(() => setShowSuccess(false), 3000);
                              } catch (err) {
                                alert(
                                  "Failed to update basic info: " +
                                    (err?.message || err)
                                );
                              }
                            }}
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
            <div
              style={{
                width: "100%",
                minHeight: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="coming-soon-panel"
                style={{ textAlign: "center" }}
              >
                <h3>Coming Soon</h3>
                <p>This section will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
