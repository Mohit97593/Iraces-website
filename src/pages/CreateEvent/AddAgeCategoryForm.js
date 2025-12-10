import React, { useState } from "react";
import { authAPI } from "../../services/authAPI";

const AddAgeCategoryForm = ({ onCancel, tickets, initialData = {} }) => {
  // tickets: array of ticket objects from eventDetails
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const [formData, setFormData] = useState({
    event_id:
      localStorage.getItem("event_id") ||
      sessionStorage.getItem("event_id") ||
      "",
    user_id: localStorage.getItem("user_id"),
    distance_category: initialData.distance_category || "",
    age_category: initialData.age_category || "",
    age_start: initialData.age_start || "",
    age_end: initialData.age_end || "",
    // Handle gender as array - convert from string if needed
    gender: (() => {
      if (!initialData.gender) return [];
      if (Array.isArray(initialData.gender)) return initialData.gender;
      if (typeof initialData.gender === 'string') {
        return initialData.gender.split(',').filter(g => g.trim());
      }
      return [];
    })(),
    event_comm_id: initialData.id || "",
  });

  const handleChange = (key, value) => {
    if (key === "gender") {
      // Toggle gender in array for checkboxes
      setFormData((prev) => {
        const currentGenders = Array.isArray(prev.gender) ? prev.gender : [];
        const isSelected = currentGenders.includes(value);
        const newGenders = isSelected
          ? currentGenders.filter((g) => g !== value)
          : [...currentGenders, value];
        return { ...prev, gender: newGenders };
      });
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
      // Age End should be >= Age Start
      if (
        key === "age_start" &&
        formData.age_end &&
        Number(value) > Number(formData.age_end)
      ) {
        setFormData((prev) => ({ ...prev, age_end: value }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert formData object to FormData instance
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        // Convert gender array to comma-separated string for backend
        if (key === "gender" && Array.isArray(value)) {
          fd.append(key, value.join(","));
        } else {
          fd.append(key, value);
        }
      });
      // If editing existing age criteria, include the edit flag expected by backend
      if (formData.event_comm_id) {
        fd.append("event_edit_flag", "age_criteria_edit");
      }
      const res = await authAPI.addEditAgeCriteria(fd);
      if (res.success === 200) {
        alert(res.message || "Age Criteria added/updated successfully");
        if (typeof onCancel === "function") onCancel();
      } else {
        alert(res.message || "Failed to save age criteria");
        console.error("API response:", res);
      }
    } catch (err) {
      alert("Error saving age criteria");
      console.error("API error:", err);
    }
  };
  const ages = Array.from({ length: 110 }, (_, i) => i + 1);
  console.log("Distance Category Tickets:", safeTickets);
  return (
    <div
      style={{
        marginTop: 32,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: "32px 24px",
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 24 }}>
        Add Age Category
      </h2>
      <form style={{ maxWidth: 900 }} onSubmit={handleSubmit}>
        <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
          Distance Category <span style={{ color: "#da251c" }}>*</span>
        </label>
        <select
          required
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #ddd",
            borderRadius: 8,
            fontSize: "1rem",
            transition: "border-color 0.3s ease",
          }}
          value={formData.distance_category}
          onChange={(e) => handleChange("distance_category", e.target.value)}
        >
          <option value="">-- Select --</option>
          {safeTickets.length > 0 ? (
            safeTickets.map((ticket, idx) => (
              <option key={ticket.id || idx} value={ticket.id}>
                {ticket.ticket_name}
              </option>
            ))
          ) : (
            <option disabled>No tickets available</option>
          )}
        </select>
        {/* <!-- removed duplicate closing div --> */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
            Age Category Name <span style={{ color: "#da251c" }}>*</span>
          </label>
          <input
            type="text"
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: "1rem",
              transition: "border-color 0.3s ease",
            }}
            value={formData.age_category}
            onChange={(e) => handleChange("age_category", e.target.value)}
          />

          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Age Start *
              </label>
              <select
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
                value={formData.age_start || ""}
                onChange={(e) => handleChange("age_start", e.target.value)}
              >
                <option value="">-- Select --</option>
                {[...Array(110)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Age End *
              </label>
              <select
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
                value={formData.age_end || ""}
                onChange={(e) => handleChange("age_end", e.target.value)}
              >
                <option value="">-- Select --</option>
                {[...Array(110)].map((_, i) =>
                  !formData.age_start || i + 1 >= Number(formData.age_start) ? (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ) : null
                )}
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
            Gender <span style={{ color: "#da251c" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: 32 }}>
            <label
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 56,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: "1rem",
                background: "#fff",
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                value="1"
                checked={Array.isArray(formData.gender) && formData.gender.includes("1")}
                onChange={(e) => handleChange("gender", e.target.value)}
                style={{ marginRight: 12, width: 22, height: 22 }}
              />
              Male
            </label>
            <label
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 56,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: "1rem",
                background: "#fff",
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                value="2"
                checked={Array.isArray(formData.gender) && formData.gender.includes("2")}
                onChange={(e) => handleChange("gender", e.target.value)}
                style={{ marginRight: 12, width: 22, height: 22 }}
              />
              Female
            </label>
            <label
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 56,
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: "1rem",
                background: "#fff",
                fontWeight: 600,
                color: "#222",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
              }}
            >
              <input
                type="checkbox"
                value="3"
                checked={Array.isArray(formData.gender) && formData.gender.includes("3")}
                onChange={(e) => handleChange("gender", e.target.value)}
                style={{ marginRight: 12, width: 22, height: 22 }}
              />
              Other
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
            marginTop: 32,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              border: "1.5px solid #da251c",
              color: "#da251c",
              background: "#fff",
              borderRadius: 8,
              padding: "12px 32px",
              fontWeight: 600,
              fontSize: "1.15rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#da251c",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 32px",
              fontWeight: 600,
              fontSize: "1.15rem",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAgeCategoryForm;
