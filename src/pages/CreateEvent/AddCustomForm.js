import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GeneralFormQuestions.css";
import { authAPI } from "../../services/authAPI";
import Toast from "../../components/Toast/Toast";

const AddCustomForm = ({ onCancel }) => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  const [formCommon, setFormCommon] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [hintType, setHintType] = useState("text");
  const [hintText, setHintText] = useState("");
  const [hintImageFile, setHintImageFile] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [options, setOptions] = useState([""]);
  const [isMandatory, setIsMandatory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddFormModal, setShowAddFormModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [editingFormId, setEditingFormId] = useState(null);

  const addNewForm = async () => {
    if (!newFormName.trim()) { triggerToast("Please enter form name", 'error'); return; }
    try {
      const fd = new FormData();
      fd.append("form_name", newFormName.trim());
      // fd.append("form_edit_id", editingFormId ? String(editingFormId) : "0");
      fd.append("form_action_flag", "data_add_edit");
      // include form_flag for server to know which form master to update
      fd.append("form_flag", "general_form");

      // Use formCommonDetails API to add the new form (per updated requirement)
      const res = await authAPI.formCommonDetails(fd);
      console.log("formCommonDetails (add new form) response:", res);
      triggerToast(res?.message || "Form saved");

      // After adding, refresh formCommon list
      try {
        const fd2 = new FormData();
        fd2.append("form_name", "");
        // fd2.append("form_edit_id", "0");
        fd2.append("form_action_flag", "form_details");
        fd2.append("form_flag", "general_form");
        const commonRes = await authAPI.formCommonDetails(fd2);
        if (commonRes && commonRes.data) setFormCommon(commonRes.data);
      } catch (err) {
        console.error("Failed to refresh form common after add:", err);
      }

      setShowAddFormModal(false);
      setNewFormName("");
    } catch (err) {
      console.error("Failed to add form via formCommonDetails:", err);
      triggerToast("Failed to save form. See console.", 'error');
    }
  };

  const handleSave = async () => {
    // basic validation
    if (!questionType) { triggerToast("Please select question type", 'error'); return; }
    const questionLabelEl = document.querySelector(
      ".form-group input.form-input"
    );
    const question_label = questionLabelEl ? questionLabelEl.value.trim() : "";
    if (!question_label) { triggerToast("Please enter question title", 'error'); return; }


    // Handle options - if it's a string (comma-separated), split it
    let filteredOptions = [];
    if (typeof options === 'string') {
      filteredOptions = options
        .split(',')
        .map(opt => opt.trim())
        .filter(opt => opt !== '');
    } else if (Array.isArray(options)) {
      filteredOptions = options
        .map((o) => o || "")
        .filter((o) => String(o).trim() !== "");
    }

    const fd = new FormData();
    fd.append("user_id", sessionStorage.getItem("user_id") || "");
    // Use default form_id as "1" since Choose Form dropdown is removed
    // fd.append("form_id", selectedFormId || "1");
    fd.append("question_label", question_label);
    fd.append(
      "question_form_type",
      questionType === "checkboxes" ? "checkbox" : questionType
    );
    fd.append("question_hint", hintType === "text" ? hintText : "");
    fd.append("is_manadatory", isMandatory ? "1" : "0");
    fd.append("question_form_option", JSON.stringify(filteredOptions));
    fd.append("hint_type", hintType === "image" ? "2" : "1");
    if (hintType === "image" && hintImageFile)
      fd.append("upload_hint_file", hintImageFile);

    try {
      setSaving(true);
      const res = await authAPI.addCustomFormQuestions(fd);
      console.log("addCustomFormQuestions response:", res);
      triggerToast(res?.message || "Saved");
      // refresh general form questions after successful save
      try {
        const fd2 = new FormData();
        fd2.append("event_id", sessionStorage.getItem("event_id") || "");
        fd2.append("user_id", sessionStorage.getItem("user_id") || "");
        const gfRes = await authAPI.generalFormQuestions(fd2);
        console.log("generalFormQuestions (after save):", gfRes);
        if (gfRes && gfRes.data && gfRes.data.form_question) {
          setQuestions(gfRes.data.form_question || []);
        }
      } catch (err) {
        console.error(
          "Failed to refresh general form questions after save:",
          err
        );
      }
      setSaving(false);
      // navigate to Create Event -> Form Questions step so user sees the updated list
      try {
        // Use query param step=6 (Form Questions) which CreateEvent will read
        navigate("/create-event?step=6");
      } catch (e) {
        console.error("Navigation after save failed:", e);
      }
      // optionally close modal/callback
      if (typeof onCancel === "function") onCancel();
    } catch (err) {
      console.error("Failed to save custom question:", err);
      triggerToast("Failed to save question. See console.", 'error');
      setSaving(false);
    }
  };

  useEffect(() => {
    const eventId =
      sessionStorage.getItem("event_id") ||
      sessionStorage.getItem("event_id") ||
      "";
    const load = async () => {
      try {
        const fd = new FormData();
        fd.append("form_name", "");
        // fd.append("form_edit_id", "0");
        fd.append("form_action_flag", "form_details");
        fd.append("form_flag", "general_form");
        const commonRes = await authAPI.formCommonDetails(fd);
        console.log("formCommonDetails (AddCustomForm):", commonRes);
        if (commonRes && commonRes.data) setFormCommon(commonRes.data);
      } catch (err) {
        console.error("Failed to load form common details:", err);
      }

      try {
        const fd2 = new FormData();
        fd2.append("event_id", eventId);
        fd2.append("user_id", sessionStorage.getItem("user_id") || "");
        const res = await authAPI.generalFormQuestions(fd2);
        console.log("generalFormQuestions (AddCustomForm):", res);
        if (res && res.data && res.data.form_question) {
          // general form master/options returned here
          const grouped = res.data.form_question || [];
          setQuestions(grouped);
        }
      } catch (err) {
        console.error("Failed to load general form questions:", err);
      }
    };
    load();
  }, []);

  // When the Add New Form modal opens, refresh form common details
  useEffect(() => {
    if (!showAddFormModal) return;
    const loadCommon = async () => {
      try {
        const fd = new FormData();
        fd.append("form_name", "");
        // fd.append("form_edit_id", "0");
        fd.append("form_action_flag", "form_details");
        fd.append("form_flag", "general_form");
        const commonRes = await authAPI.formCommonDetails(fd);
        console.log("formCommonDetails (modal open):", commonRes);
        if (commonRes && commonRes.data) setFormCommon(commonRes.data);
      } catch (err) {
        console.error("Failed to load form common details on modal open:", err);
      }
    };
    loadCommon();
  }, [showAddFormModal]);

  // You can use `formCommon` and `questions` to populate selects and defaults

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: 24 }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.5rem" }}>
          Add Custom Form Questions
        </h2>
        {/* <button
          className="btn-add-custom"
          onClick={() => setShowAddFormModal(true)}
        >
          + Add New Form
        </button> */}
      </div>
      {showAddFormModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Form Details</h3>
            <div className="form-group">
              <label className="form-label">
                Form Name <span className="required">*</span>
              </label>
              <input
                className="form-input compact"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <button
                className="btn-modal-close"
                onClick={() => {
                  setShowAddFormModal(false);
                  setNewFormName("");
                }}
              >
                Close
              </button>
              <button className="btn-modal-save" onClick={addNewForm}>
                Save
              </button>
            </div>

            <h3 style={{ marginTop: 22 }}>Form Details</h3>
            <div style={{ position: "relative" }}>
              {formCommon && Array.isArray(formCommon.form_details) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 12,
                  }}
                >
                  {formCommon.form_details.map((f, idx) => (
                    <div
                      key={String(f.id || idx)}
                      className="form-details-card"
                      style={{ position: "relative" }}
                    >
                      <button
                        className="edit-badge"
                        onClick={() => {
                          setShowAddFormModal(true);
                          setNewFormName(f.form_name || "");
                          setEditingFormId(f.id ?? f.ID ?? String(f.id || idx));
                        }}
                        aria-label={`Edit form ${f.form_name}`}
                      >
                        ✎
                      </button>
                      <div style={{ padding: "12px 8px" }}>{f.form_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        <div className="form-group">
          <label className="form-label">
            Question Title <span className="required">*</span>
          </label>
          <input className="form-input compact" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ flex: 0.3 }} className="form-group">
            <label className="form-label">
              Hint Type <span className="required">*</span>
            </label>
            <select
              className="form-input compact"
              value={hintType}
              onChange={(e) => setHintType(e.target.value)}
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
          </div>
          <div style={{ flex: 0.7 }} className="form-group">
            {hintType === "text" ? (
              <>
                <label className="form-label">Question Hint</label>
                <input
                  className="form-input compact"
                  value={hintText}
                  onChange={(e) => setHintText(e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="form-label">Upload Hint Image</label>
                <input
                  className="form-input compact"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setHintImageFile(e.target.files && e.target.files[0])
                  }
                />
              </>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">
            Question Type <span className="required">*</span>
          </label>
          <select
            className="form-input compact"
            value={questionType}
            onChange={(e) => {
              const newType = e.target.value;
              setQuestionType(newType);
              // Jab checkbox, radio, ya select choose karein to ek khali option dikhayen
              if (newType === "radio" || newType === "checkboxes" || newType === "select") {
                setOptions([""]);
              }
            }}
          >
            <option value="">-- Select --</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="mobile">Mobile</option>
            <option value="amount">Amount</option>
            <option value="textarea">Textarea</option>
            <option value="checkboxes">Checkboxes</option>
            <option value="radio">Radio</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="file">File</option>
            <option value="select">Select (Dropdown)</option>
          </select>
        </div>


        {(questionType === "radio" || questionType === "checkboxes" || questionType === "select") && (
          <div style={{ marginTop: 12 }} className="form-group">
            <label className="form-label">
              Options <span className="required">*</span>
            </label>
            <input
              className="form-input compact"
              placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
              value={Array.isArray(options) ? options.join(", ") : options}
              onChange={(e) => {
                // Just store the raw string value, don't split yet
                setOptions(e.target.value);
              }}
              style={{ width: '100%' }}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              💡 Hint: Enter multiple options separated by commas. Example: Male, Female, Other
            </small>
          </div>
        )}

        <div style={{ marginTop: 12 }} className="form-group">
          {/* <div className="form-label">Question Status</div>
          <div className="status-toggle" style={{ marginTop: 8 }}>
            <button
              className={`status-btn ${isMandatory ? "active" : ""}`}
              onClick={() => setIsMandatory(true)}
            >
              Mandatory
            </button>
            <button
              className={`status-btn ${!isMandatory ? "active" : ""}`}
              onClick={() => setIsMandatory(false)}
            >
              Optional
            </button>
          </div> */}
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}
        >
          <button className="btn-modal-close" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-modal-save"
            style={{ marginLeft: 12 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomForm;
