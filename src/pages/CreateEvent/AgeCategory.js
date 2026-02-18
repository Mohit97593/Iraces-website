import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import AddAgeCategoryForm from "./AddAgeCategoryForm";
import "./CreateEvent.css";
import Toast from "../../components/Toast/Toast";

const AgeCategory = ({ onBack, onNext }) => {
  const [hovered, setHovered] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [ageCategories, setAgeCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [loadingEditId, setLoadingEditId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const eventId = sessionStorage.getItem("event_id");
    if (eventId) {
      authAPI.getEventDetails(eventId).then((res) => {
        if (res && res.data) {
          // Set event details
          if (res.data.EventData && res.data.EventData[0]) {
            setEventDetails(res.data.EventData[0]);
          }
          // Set tickets from EventTickets array
          if (Array.isArray(res.data.EventTickets)) {
            setEventTickets(res.data.EventTickets);
          } else {
            setEventTickets([]);
          }
          // Set Age Categories from API response (use age_criteria_details)
          if (Array.isArray(res.data.age_criteria_details)) {
            console.log("Age categories loaded:", res.data.age_criteria_details);
            setAgeCategories(res.data.age_criteria_details);
          } else {
            setAgeCategories([]);
          }
        }
      });
    }
  }, []);

  const handleDeleteAgeCategory = async (ageCategoryId) => {
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId || !ageCategoryId) return;

    if (!window.confirm("Are you sure you want to delete this age category?")) {
      return;
    }

    setDeletingId(ageCategoryId);

    try {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("event_comm_id", ageCategoryId);
      formData.append("common_flag", "age_delete");

      const response = await authAPI.deleteEventCommFqa(formData);

      if (response && response.message) {
        triggerToast(response.message || "Age category deleted successfully");
        // Refresh the age categories list
        const res = await authAPI.getEventDetails(eventId);
        if (res && res.data) {
          if (Array.isArray(res.data.age_criteria_details)) {
            setAgeCategories(res.data.age_criteria_details);
          } else {
            setAgeCategories([]);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting age category:", error);
      triggerToast(error.message || "Failed to delete age category", 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditAgeCategory = async (ageCategoryId) => {
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId || !ageCategoryId) return;

    setLoadingEditId(ageCategoryId);
    try {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("event_comm_id", ageCategoryId);
      formData.append("event_edit_flag", "age_criteria_edit");

      const res = await authAPI.editEventCommFqa(formData);
      console.log("Edit API response:", res);
      if (res && res.data) {
        console.log("Edit response data:", res.data);
        // Response contains age_criteria_details array per backend
        const details = Array.isArray(res.data.age_criteria_details)
          ? res.data.age_criteria_details[0]
          : res.data.age_criteria_details || null;

        console.log("Extracted details:", details);
        if (details) {
          setInitialFormData(details);
          setShowForm(true);
          setEditingId(ageCategoryId);
        } else {
          triggerToast(res.message || "Failed to load edit details", 'error');
        }
      }
    } catch (err) {
      console.error("edit fetch error:", err);
      triggerToast(err.message || "Failed to fetch edit details", 'error');
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleToggleStatus = async (ageCategoryId, newStatus) => {
    const eventId = sessionStorage.getItem("event_id");
    if (!eventId || !ageCategoryId) return;
    // Ask for confirmation before toggling
    const confirmed = window.confirm(
      "Are you sure you want to change the status of this age category?"
    );

    if (!confirmed) return;

    setTogglingId(ageCategoryId);
    try {
      const fd = new FormData();
      fd.append("coupon_id", ageCategoryId);
      // Backend expects inverted mapping for coupon_status.
      // Send "false" when toggle is ON (newStatus === true),
      // and "true" when toggle is OFF (newStatus === false) per requirement.
      fd.append("coupon_status", newStatus ? "false" : "true");
      fd.append("action_flag", "age_criteria_changes_status");

      const res = await authAPI.statusCoupon(fd);
      if (res && res.message) {
        // Refresh list
        const details = await authAPI.getEventDetails(eventId);
        if (
          details &&
          details.data &&
          Array.isArray(details.data.age_criteria_details)
        ) {
          setAgeCategories(details.data.age_criteria_details);
        }
      }
    } catch (err) {
      console.error("status toggle error:", err);
      triggerToast(err.message || "Failed to change status", 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div
      className="age-category-section"
      style={{ maxWidth: 1200, margin: "0 auto" }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
        <div style={{ flex: 2 }}>
          {!showForm ? (
            <React.Fragment>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: "1.6rem",
                    marginBottom: 0,
                  }}
                >
                  Age Category
                </h2>
                <button
                  style={{
                    border: "1.5px solid #da251c",
                    color: "#da251c",
                    background: "#fff",
                    borderRadius: 8,
                    padding: "8px 32px",
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowForm(true)}
                >
                  + Add Age Category
                </button>
              </div>
              {/* Show Age Category cards if any exist, else show empty state */}
              {ageCategories.length > 0 ? (
                <React.Fragment>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 24,
                    }}
                  >
                    {ageCategories.map((cat, idx) => (
                      <div
                        key={cat.id || idx}
                        onMouseEnter={() => setHovered(cat.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={`comm-card ${hovered === cat.id ? "hover" : ""
                          }`}
                        style={{
                          padding: 24,
                          borderRadius: 8,
                          background: "#fff",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                          position: "relative",
                          minHeight: 107,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{ fontWeight: 600, fontSize: 18, flex: 1 }}
                          >
                            {cat.age_category || "-"}
                          </div>
                          <div style={{ marginLeft: 12 }}>
                            <div
                              className={`toggle ${cat.status ? "on" : ""}`}
                              role="button"
                              aria-label="toggle"
                              onClick={() =>
                                handleToggleStatus(cat.id, !cat.status)
                              }
                            >
                              <div className="knob" />
                            </div>
                          </div>
                        </div>

                        <div
                          className={`comm-actions ${hovered === cat.id ? "visible" : ""
                            }`}
                        >
                          <button
                            title="Edit"
                            onClick={() => handleEditAgeCategory(cat.id)}
                          >
                            ✎
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleDeleteAgeCategory(cat.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <button
                      onClick={onBack}
                      style={{
                        border: "1.5px solid #da251c",
                        color: "#da251c",
                        background: "#fff",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                      }}
                    >
                      Back
                    </button>
                    <button
                      className="next-btn"
                      onClick={onNext}
                      style={{
                        background: "#da251c",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                      }}
                    >
                      Save & Next (7/11)
                    </button>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                      padding: 0,
                      marginBottom: 24,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "260px",
                      border: "1px solid #eee",
                      position: "relative",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ padding: "48px 24px", textAlign: "center" }}>
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/747/747376.png"
                        alt="No Age Category"
                        style={{
                          width: 80,
                          marginBottom: 16,
                          display: "block",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      />
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: "1.4rem",
                          marginBottom: 12,
                        }}
                      >
                        No Age Category Added
                      </h3>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: "1.1rem",
                          marginBottom: 18,
                        }}
                      >
                        Please click on " + Add Age Category" button to add new
                        age category.
                      </div>
                    </div>
                  </div>
                  {/* Add buttons below empty state */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 12,
                      marginTop: 24,
                    }}
                  >
                    <button
                      onClick={onBack}
                      style={{
                        border: "1.5px solid #da251c",
                        color: "#da251c",
                        background: "#fff",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                      }}
                    >
                      Back
                    </button>
                    <button
                      className="next-btn"
                      onClick={onNext}
                      style={{
                        background: "#da251c",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        cursor: "pointer",
                      }}
                    >
                      Save & Next (7/11)
                    </button>
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          ) : (
            <AddAgeCategoryForm
              initialData={initialFormData || {}}
              onCancel={() => {
                setShowForm(false);
                setInitialFormData(null);
                setEditingId(null);
                // Refresh event details, tickets, and age categories after form closes
                const eventId = sessionStorage.getItem("event_id");
                if (eventId) {
                  authAPI.getEventDetails(eventId).then((res) => {
                    if (res && res.data) {
                      if (Array.isArray(res.data.age_criteria_details)) {
                        setAgeCategories(res.data.age_criteria_details);
                      } else {
                        setAgeCategories([]);
                      }
                      if (Array.isArray(res.data.EventTickets)) {
                        setEventTickets(res.data.EventTickets);
                      }
                      if (res.data.EventData && res.data.EventData[0]) {
                        setEventDetails(res.data.EventData[0]);
                      }
                    }
                  });
                }
              }}
              tickets={eventTickets}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgeCategory;
