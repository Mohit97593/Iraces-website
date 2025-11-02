import React, { useState } from "react";
import "./Profile.css";
import TopNav from "../../components/Navbar/TopNav";
import { useAuth } from "../../contexts/AuthContext";

const Profile = () => {
  // Editing state for Personal Details
  const [editPersonal, setEditPersonal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editBio, setEditBio] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [mainSection, setMainSection] = useState("profile"); // 'profile' or 'team'
  const { user } = useAuth();

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

  return (
    <div className="profile-page">
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
                              setEditFirstName(firstName);
                              setEditLastName(lastName);
                              setEditMobile(mobile);
                              setEditEmail(email);
                              setEditGender(gender);
                              setEditDob(dob);
                              setEditBio(""); // Set to user's bio if available
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
                              <span>My Bio :</span>
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
                                onChange={(e) => setEditMobile(e.target.value)}
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
                                onChange={(e) => setEditDob(e.target.value)}
                                style={{
                                  padding: "10px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                }}
                              />
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
                              onChange={(e) => setEditBio(e.target.value)}
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
                              onClick={() => setEditPersonal(false)}
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
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Emergency Contact Name
                        </div>
                        <div>abc</div>
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
                          Emergency Contact Number
                        </div>
                        <div>9988776655</div>
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
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Organisation
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
                          Designation
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
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Id Proof Type
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
                          Id Proof Number
                        </div>
                        <div>NA</div>
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
                          style={{ fontWeight: "bold", marginBottom: "14px" }}
                        >
                          Id Proof Document
                        </div>
                        <div>NA</div>
                      </div>
                    </div>
                  </div>
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
