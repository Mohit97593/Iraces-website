import React, { useState, useEffect } from "react";
import AddCustomForm from "./AddCustomForm";
import "./GeneralFormQuestions.css";
import { authAPI } from "../../services/authAPI";

const GeneralFormQuestions = ({
  onSave,
  questions,
  eventDetails,
  initialEditQuestion,
}) => {
  const [customQuestions, setCustomQuestions] = useState([]);
  const [apiQuestions, setApiQuestions] = useState(null);
  const [formCommon, setFormCommon] = useState(null);
  const [eventFormQuestionsData, setEventFormQuestionsData] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fieldMappings, setFieldMappings] = useState([]);
  const [raceTickets, setRaceTickets] = useState([]);
  const [raceCategoryMode, setRaceCategoryMode] = useState("all");
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [displayNameError, setDisplayNameError] = useState("");

  const normalizeKey = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const eventId =
          sessionStorage.getItem("event_id") ||
          localStorage.getItem("event_id") ||
          "";
        const userId = localStorage.getItem("user_id") || "";
        if (!eventId) return;
        // general form questions
        const fd = new FormData();
        fd.append("event_id", eventId);
        fd.append("user_id", userId);
        const res = await authAPI.generalFormQuestions(fd);
        console.log("generalFormQuestions response:", res);
        if (res && res.data && res.data.form_question) {
          setApiQuestions(res.data.form_question);
        }

        // form common details (form master / options)
        try {
          const commonFd = new FormData();
          commonFd.append("form_name", "");
          commonFd.append("form_edit_id", "0");
          commonFd.append("form_action_flag", "form_details");
          commonFd.append("form_flag", "general_form");
          const commonRes = await authAPI.formCommonDetails(commonFd);
          console.log("formCommonDetails response:", commonRes);
          setFormCommon(commonRes?.data || commonRes);
        } catch (err) {
          console.error("formCommonDetails failed:", err);
        }

        // event specific form questions
        try {
          const efFd = new FormData();
          efFd.append("event_id", eventId);
          const efRes = await authAPI.eventFormQuestions(efFd);
          console.log("eventFormQuestions response:", efRes);
          setEventFormQuestionsData(efRes?.data || efRes);
        } catch (err) {
          console.error("eventFormQuestions failed:", err);
        }
      } catch (err) {
        console.error("Failed to fetch general form questions:", err);
      }
    };
    fetchGeneral();
  }, []);

  useEffect(() => {
    // Robustly extract field_mapping_details from common API shapes
    const extract = (obj) => {
      if (!obj) return null;
      // If passed the full API response with .data
      if (obj.data && obj.data.field_mapping_details)
        return obj.data.field_mapping_details;
      // Some endpoints return { data: { EventData: [ { ... } ] } }
      if (
        obj.data &&
        obj.data.EventData &&
        Array.isArray(obj.data.EventData) &&
        obj.data.EventData[0] &&
        obj.data.EventData[0].field_mapping_details
      )
        return obj.data.EventData[0].field_mapping_details;
      // If eventDetails passed already as EventData[0]
      if (
        obj.EventData &&
        Array.isArray(obj.EventData) &&
        obj.EventData[0] &&
        obj.EventData[0].field_mapping_details
      )
        return obj.EventData[0].field_mapping_details;
      // Direct shape
      if (obj.field_mapping_details) return obj.field_mapping_details;
      // Sometimes field_mapping_details may be nested under first child
      const keys = Object.keys(obj || {});
      for (const k of keys) {
        const v = obj[k];
        if (v && v.field_mapping_details) return v.field_mapping_details;
      }
      return null;
    };

    const fromEvent = extract(eventDetails);
    if (fromEvent) {
      setFieldMappings(fromEvent.map((f) => f.COLUMN_NAME));
      console.log(
        "fieldMappings extracted from eventDetails:",
        fromEvent.map((f) => f.COLUMN_NAME)
      );
      return;
    }
    const fromEventForm = extract(eventFormQuestionsData);
    if (fromEventForm) {
      setFieldMappings(fromEventForm.map((f) => f.COLUMN_NAME));
      console.log(
        "fieldMappings extracted from eventFormQuestionsData:",
        fromEventForm.map((f) => f.COLUMN_NAME)
      );
      return;
    }
    setFieldMappings([]);
  }, [eventDetails, eventFormQuestionsData]);

  useEffect(() => {
    // Extract tickets from eventDetails or eventFormQuestionsData into raceTickets
    const extractTickets = (obj) => {
      if (!obj) return [];
      // possible shapes: obj.EventTickets, obj.data.EventTickets, obj.data.EventData[0].EventTickets
      if (Array.isArray(obj.EventTickets)) return obj.EventTickets;
      if (obj.data && Array.isArray(obj.data.EventTickets))
        return obj.data.EventTickets;
      if (
        obj.data &&
        Array.isArray(obj.data.EventData) &&
        obj.data.EventData[0] &&
        Array.isArray(obj.data.EventData[0].EventTickets)
      )
        return obj.data.EventData[0].EventTickets;
      // some responses use EventData directly
      if (
        Array.isArray(obj.EventData) &&
        obj.EventData[0] &&
        Array.isArray(obj.EventData[0].EventTickets)
      )
        return obj.EventData[0].EventTickets;

      // try common alternatives like 'EventTickets' nested in other keys
      const keys = Object.keys(obj || {});
      for (const k of keys) {
        const v = obj[k];
        if (v && Array.isArray(v.EventTickets)) return v.EventTickets;
      }
      return [];
    };

    const tickets = extractTickets(
      eventDetails || eventFormQuestionsData || {}
    );
    // normalize to { id, name }
    const normalized = (tickets || []).map((t) => ({
      id: String(t.id || t.ticket_id || t.ticketId || ""),
      name: t.ticket_name || t.ticket_name || t.name || t.ticketName || "",
    }));
    setRaceTickets(normalized);
  }, [eventDetails, eventFormQuestionsData]);

  // UI will render only API-provided groups in `apiQuestions`.
  // Removed defaultQuestions fallback so UI reflects backend-driven data.

  const handleToggleClick = async (question) => {
    // Build a selectedQuestion object with fields the modal expects
    const cloned = { ...question };

    // Determine mapping: prefer `user_field_mapping` (even empty string),
    // then `field_mapping`, then `question_form_name`.
    let rawMap = "";
    if (
      question.user_field_mapping !== undefined &&
      question.user_field_mapping !== null
    ) {
      rawMap = question.user_field_mapping;
    } else if (
      question.field_mapping !== undefined &&
      question.field_mapping !== null
    ) {
      rawMap = question.field_mapping;
    } else if (
      question.question_form_name !== undefined &&
      question.question_form_name !== null
    ) {
      rawMap = question.question_form_name;
    }
    cloned.field_mapping_original = rawMap == null ? "" : String(rawMap);
    cloned.field_mapping = normalizeKey(rawMap);

    // Mandatory flag: API uses `is_manadatory` (note spelling) in example
    const mand =
      question.is_mandatory ?? question.is_manadatory ?? question.isManadatory;
    cloned.is_mandatory = mand == null ? "0" : String(mand) === "1" ? "1" : "0";

    // Hint type: API uses numeric hint_type; map to 'text'|'image'
    const ht = question.hint_type ?? question.hintType;
    cloned.hint_type =
      ht == null ? "text" : Number(ht) === 2 ? "image" : "text";

    // Ensure form_id, form_name and question_label exist
    cloned.form_id =
      question.form_id || question.formId || cloned.form_id || "";
    cloned.form_name =
      question.form_name || question.formName || cloned.form_name || "";
    cloned.question_label =
      question.question_label || question.label || cloned.question_label || "";

    console.log("Opening question modal, derived selectedQuestion:", cloned);
    // Ensure we have fresh form common details before showing modal
    try {
      const commonFd = new FormData();
      commonFd.append("form_name", "");
      commonFd.append("form_edit_id", "0");
      commonFd.append("form_action_flag", "form_details");
      commonFd.append("form_flag", "general_form");
      const commonRes = await authAPI.formCommonDetails(commonFd);
      console.log("formCommonDetails (on + click) response:", commonRes);
      setFormCommon(commonRes?.data || commonRes);
    } catch (err) {
      console.error("formCommonDetails failed on + click:", err);
    }
    // normalize selected_race_tickets to array of string ids
    let sel =
      cloned.selected_race_tickets ||
      cloned.selected_race_tickets_ids ||
      cloned.selected_race_tickets_id ||
      [];
    if (!sel) sel = [];
    if (typeof sel === "string") {
      try {
        sel = JSON.parse(sel);
      } catch (e) {
        // comma separated?
        sel = sel
          .split(",")
          .map((s) => String(s).trim())
          .filter(Boolean);
      }
    }
    if (!Array.isArray(sel)) sel = [sel];
    cloned.selected_race_tickets = sel.map((s) => String(s));

    // Initialize limit length fields for text inputs
    // Prefer explicit API fields if present, otherwise default
    cloned.limit_length_enabled =
      question.limit_length_enabled ?? question.limitLengthEnabled ?? false;
    cloned.min_length =
      question.min_length ??
      question.minLength ??
      question.minLengthValue ??
      "";
    cloned.max_length =
      question.max_length ??
      question.maxLength ??
      question.maxLengthValue ??
      "";

    // Initialize email domain validation fields for email inputs
    cloned.email_validation_enabled =
      question.email_validation_enabled ??
      question.emailValidationEnabled ??
      false;
    cloned.email_domain =
      question.email_domain ??
      question.emailDomain ??
      question.domain_name ??
      "";

    // Copy question options (for radio/select types) and initialize selection/subquestions
    cloned.question_form_option =
      question.question_form_option || question.questionFormOption || [];
    cloned.selected_option_id =
      question.selected_option_id ?? question.selectedOptionId ?? "";
    cloned.add_subquestions =
      question.add_subquestions ?? question.sub_questions_added_flag ?? false;

    // Initialize date range fields for date inputs
    cloned.date_range_enabled =
      question.date_range_enabled ?? question.dateRangeEnabled ?? false;
    cloned.start_date = question.start_date ?? question.startDate ?? "";
    cloned.end_date = question.end_date ?? question.endDate ?? "";

    setSelectedQuestion(cloned);
    setShowModal(true);
    setDisplayNameError("");
  };

  // If parent requests editing a specific question, open modal with that data
  useEffect(() => {
    if (initialEditQuestion) {
      // reuse handleToggleClick logic to normalize the object before showing modal
      try {
        handleToggleClick(initialEditQuestion);
      } catch (err) {
        // fallback: set selectedQuestion raw
        setSelectedQuestion(initialEditQuestion);
        setShowModal(true);
      }
    }
  }, [initialEditQuestion]);

  const toggleRaceMode = (mode) => {
    setRaceCategoryMode(mode);
  };

  const handleToggleTicket = (ticketId) => {
    if (!selectedQuestion) return;
    const updated = { ...selectedQuestion };
    const arr = Array.isArray(updated.selected_race_tickets)
      ? [...updated.selected_race_tickets]
      : [];
    const idx = arr.findIndex((x) => String(x) === String(ticketId));
    if (idx === -1) arr.push(String(ticketId));
    else arr.splice(idx, 1);
    updated.selected_race_tickets = arr;
    setSelectedQuestion(updated);
  };

  const handleSetMandatory = (val) => {
    if (!selectedQuestion) return;
    // clone to avoid mutating original
    const updated = { ...selectedQuestion, is_mandatory: val ? "1" : "0" };
    setSelectedQuestion(updated);
  };

  const handleChangeField = (field, value) => {
    if (!selectedQuestion) return;
    const updated = { ...selectedQuestion };
    if (field === "field_mapping") {
      // `value` is the normalized key from the select; store both normalized and original
      updated.field_mapping = value;
      const match = (fieldMappings || []).find(
        (name) => normalizeKey(name) === value
      );
      updated.field_mapping_original = match || value;
    } else if (field === "hint_type") {
      updated.hint_type = value;
    } else if (field === "form_id") {
      // when user selects a form from dropdown, store both id and name
      updated.form_id = value;
      const match = (formCommon?.form_details || formCommon || []).find(
        (f) => String(f.id) === String(value)
      );
      updated.form_name = match ? match.form_name : updated.form_name;
    } else if (field === "is_mandatory" || field === "is_mandatory") {
      updated.is_mandatory = value ? "1" : "0";
    } else {
      updated[field] = value;
    }
    setSelectedQuestion(updated);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuestion(null);
  };

  // Helper: determine if a general question template `q` is already added
  // to the current event. We try several likely response shapes.
  const isQuestionAdded = (q) => {
    if (!eventFormQuestionsData) return false;
    // normalize to an array of question items
    const normalizeItems = (obj) => {
      if (!obj) return [];
      // direct response shape: { data: { form_question: { event_form_details: { ... } } } }
      if (obj.data && obj.data.form_question) {
        const fq = obj.data.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      // shape: { form_question: { event_form_details: ... } }
      if (obj.form_question) {
        const fq = obj.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      // if the object itself is an array
      if (Array.isArray(obj)) return obj;
      // try common nested keys
      if (obj.EventData && Array.isArray(obj.EventData)) {
        return obj.EventData.flatMap(
          (d) => d.event_form_details || d.form_question || []
        );
      }
      // last resort: check keys for arrays
      const keys = Object.keys(obj || {});
      for (const k of keys) {
        if (Array.isArray(obj[k])) return obj[k];
      }
      return [];
    };

    const items = normalizeItems(eventFormQuestionsData) || [];
    if (!items || items.length === 0) return false;
    // compare by general_form_id (most likely) or by label
    return items.some((it) => {
      const genId =
        it.general_form_id ||
        it.general_form ||
        it.id ||
        it.form_id ||
        it.template_id;
      if (genId && String(genId) === String(q.id)) return true;
      const label =
        (it.display_label_name || it.question_label || it.label || "") + "";
      if (label && String(label).trim() === String(q.question_label).trim())
        return true;
      return false;
    });
  };

  const handleSaveQuestion = async () => {
    // Build FormData payload according to backend expected fields
    if (!selectedQuestion) return;
    // Validate display name required
    if (
      !selectedQuestion.question_label ||
      String(selectedQuestion.question_label).trim() === ""
    ) {
      setDisplayNameError("Display name is required");
      return;
    }
    const eventId = sessionStorage.getItem("event_id") || "";
    const userId = localStorage.getItem("user_id") || "";
    let res = null;
    try {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("user_id", userId);

      formData.append("event_id", eventId);
      formData.append("user_id", userId);
      // Send the template/general question id as general_form_id (use selectedQuestion.id)
      formData.append(
        "general_form_id",
        selectedQuestion.id ||
        selectedQuestion.general_form_id ||
        selectedQuestion.form_id ||
        ""
      );
      formData.append(
        "sub_question_id",
        selectedQuestion.sub_question_id || selectedQuestion.subQuestionId || ""
      );
      formData.append("form_name", selectedQuestion.form_id || "");
      formData.append(
        "question_mandatory_status",
        selectedQuestion.is_mandatory === "1" ? "1" : "0"
      );
      formData.append(
        "display_label_name",
        selectedQuestion.question_label || ""
      );
      formData.append(
        "limit_length_check",
        selectedQuestion.limit_length_enabled ? "true" : "false"
      );
      formData.append("min_length", selectedQuestion.min_length || "");
      formData.append("max_length", selectedQuestion.max_length || "");
      formData.append(
        "field_mapping",
        selectedQuestion.field_mapping_original ||
        selectedQuestion.field_mapping ||
        ""
      );
      formData.append(
        "sub_question_flag",
        selectedQuestion.add_subquestions ? "1" : "0"
      );
      formData.append(
        "question_type",
        selectedQuestion.question_form_type || ""
      );
      formData.append(
        "sub_question_title",
        selectedQuestion.sub_question_title || ""
      );
      // send options array as JSON string if present
      formData.append(
        "sub_question_array",
        JSON.stringify(selectedQuestion.question_form_option || [])
      );
      formData.append(
        "sub_question_mandatory_status",
        selectedQuestion.sub_question_mandatory_status || "0"
      );
      formData.append(
        "sub_question_form_type",
        selectedQuestion.sub_question_form_type || ""
      );
      formData.append(
        "sub_question_price_flag",
        selectedQuestion.sub_question_price_flag ? "1" : "0"
      );
      formData.append(
        "sub_question_count_flag",
        selectedQuestion.sub_question_count_flag ? "1" : "0"
      );
      formData.append(
        "sub_question_other_amount",
        selectedQuestion.sub_question_other_amount ? "1" : "0"
      );
      formData.append(
        "parent_general_form_id",
        selectedQuestion.parent_general_form_id || "0"
      );
      // Tickets: build full ticket payload with checked flags
      const selectedIds = (selectedQuestion.selected_race_tickets || []).map(
        (s) => String(s)
      );
      const ticketPayload = (raceTickets || []).map((t) => ({
        id: Number(t.id),
        ticket_name: t.name || t.ticket_name || "",
        checked: selectedIds.includes(String(t.id)),
      }));
      const checkedCount = ticketPayload.filter((t) => t.checked).length;
      // apply_ticket should be number of selected tickets (0 if none)
      formData.append("apply_ticket", String(checkedCount));
      formData.append("ticket_selected_data", JSON.stringify(ticketPayload));

      // Main hint type and main hint text/file
      const hintTypeValue =
        selectedQuestion.hint_type === "image" ||
          selectedQuestion.hint_type === "2"
          ? "2"
          : "1";
      formData.append("hint_type", hintTypeValue);
      formData.append(
        "main_question_hint",
        selectedQuestion.question_hint ||
        selectedQuestion.main_question_hint ||
        ""
      );
      // Accept both question_hint_file and upload_hint_file keys from modal
      const mainHintFile =
        selectedQuestion.question_hint_file ||
        selectedQuestion.upload_hint_file ||
        null;
      if (mainHintFile) {
        formData.append("upload_hint_file", mainHintFile);
        formData.append(
          "upload_file_name",
          selectedQuestion.upload_file_name || mainHintFile.name || ""
        );
      } else {
        formData.append(
          "upload_file_name",
          selectedQuestion.upload_file_name || ""
        );
      }

      // Sub-question hint type and sub hint file/name
      formData.append(
        "sub_que_hint_type",
        selectedQuestion.sub_que_hint_type ||
        selectedQuestion.subQueHintType ||
        "1"
      );
      formData.append(
        "question_hint",
        selectedQuestion.sub_question_hint ||
        selectedQuestion.question_hint ||
        ""
      );
      const subHintFile =
        selectedQuestion.upload_sub_hint_file ||
        selectedQuestion.sub_question_hint_file ||
        null;
      if (subHintFile) {
        formData.append("upload_sub_hint_file", subHintFile);
        formData.append(
          "upload_sub_file_name",
          selectedQuestion.upload_sub_file_name || subHintFile.name || ""
        );
      } else {
        formData.append(
          "upload_sub_file_name",
          selectedQuestion.upload_sub_file_name || ""
        );
      }

      // Date range fields
      formData.append(
        "date_range",
        selectedQuestion.date_range_enabled ? "1" : "0"
      );
      formData.append("range_start_date", selectedQuestion.start_date || "");
      formData.append("range_end_date", selectedQuestion.end_date || "");

      // Email domain / specific domain
      formData.append(
        "specific_domain",
        selectedQuestion.email_validation_enabled ? "1" : "0"
      );
      formData.append("domain_name", selectedQuestion.email_domain || "");

      console.log("Sending addGeneralFormQuestions payload", selectedQuestion);
      res = await authAPI.addGeneralFormQuestions(formData);
      console.log("addGeneralFormQuestions response:", res);
    } catch (err) {
      console.error("Error on addGeneralFormQuestions:", err);
      // capture error info into res for downstream messaging
      res = err || { message: "Add API failed" };
    }

    // Always attempt to refresh eventFormQuestions after the add call completes
    try {
      console.log("Calling eventFormQuestions to refresh after add...");
      const efFd = new FormData();
      efFd.append("event_id", eventId);
      const efRes = await authAPI.eventFormQuestions(efFd);
      console.log("eventFormQuestions refreshed:", efRes);
      const refreshed = efRes?.data || efRes;
      setEventFormQuestionsData(refreshed);

      if (typeof onSave === "function") {
        const grouped =
          refreshed?.form_question?.event_form_details ||
          refreshed?.form_question ||
          refreshed;
        try {
          // pass both grouped data and the single updated question for instant UI merge
          const updatedQuestion =
            (res && res.data && res.data.updated_question) ||
            selectedQuestion ||
            null;
          onSave(grouped, updatedQuestion);
        } catch (err) {
          console.warn("onSave callback failed:", err);
        }
      }

      // Inform user about final status
      if (res && (res.success === 200 || String(res.success) === "1")) {
        alert(res.message || "Question saved successfully");
      } else if (res && res.message) {
        alert(res.message);
      } else {
        alert("Question operation completed; refreshed questions.");
      }
    } catch (err) {
      console.error("Failed to refresh eventFormQuestions:", err);
      // Show message even if refresh failed
      alert(res?.message || "Question saved but failed to refresh questions.");
    } finally {
      setShowModal(false);
      setSelectedQuestion(null);
    }
  };

  return (
    <div className="general-form-questions-inline">
      {/* Question Details Modal */}
      {showModal && selectedQuestion && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-questions">
              <h2>Questions Details</h2>
            </div>
            <div className="modal-subtitle">
              These are questions you can ask your attendees at the time of
              registration
            </div>
            <div className="modal-body">
              {/* Question Status */}
              <div className="form-group2">
                <label className="form-label">Question Status</label>
                <div className="status-toggle">
                  <button
                    className={`status-btn ${selectedQuestion.is_mandatory === "1" ? "active" : ""
                      }`}
                    onClick={() => handleSetMandatory(true)}
                  >
                    <span className="star-icon">★</span> Mandatory
                  </button>
                  <button
                    className={`status-btn ${selectedQuestion.is_mandatory !== "1" ? "active" : ""
                      }`}
                    onClick={() => handleSetMandatory(false)}
                  >
                    <span className="star-icon">☆</span> Optional
                  </button>
                </div>
              </div>

              {/* Display Name */}
              <div className="form-group2">
                <label className="form-label">
                  Display Name{" "}
                  <span className="required" style={{ color: "#da251c" }}>
                    *
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input compact"
                  value={selectedQuestion.question_label || ""}
                  onChange={(e) => {
                    handleChangeField("question_label", e.target.value);
                    if (e.target.value && String(e.target.value).trim() !== "")
                      setDisplayNameError("");
                  }}
                />
                {displayNameError && (
                  <div style={{ color: "#d9534f", marginTop: 8 }}>
                    {displayNameError}
                  </div>
                )}
              </div>

              {/* Choose Form */}
              <div className="form-group2">
                <label className="form-label">Choose Form</label>
                <select
                  className="form-input compact"
                  value={selectedQuestion.form_id || ""}
                  onChange={(e) => handleChangeField("form_id", e.target.value)}
                >
                  <option value="">Do Not Have Form</option>
                  {formCommon &&
                    (formCommon.form_details || formCommon) &&
                    Array.isArray(formCommon.form_details || formCommon)
                    ? (formCommon.form_details || formCommon)
                      .filter(
                        (f) => (f.form_name || "") !== "Do Not Have Form"
                      )
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.form_name}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              {/* Field Mapping */}
              <div className="form-group2">
                <label className="form-label">Field Mapping</label>
                <select
                  className="form-input compact"
                  value={selectedQuestion.field_mapping || ""}
                  onChange={(e) =>
                    handleChangeField("field_mapping", e.target.value)
                  }
                >
                  <option value="">Do Not Map</option>
                  {Array.isArray(fieldMappings) && fieldMappings.length > 0
                    ? fieldMappings.map((name) => (
                      <option key={name} value={normalizeKey(name)}>
                        {name}
                      </option>
                    ))
                    : null}
                  {/* include current mapping if it's not in the list */}
                  {selectedQuestion.field_mapping &&
                    !fieldMappings
                      .map((n) => normalizeKey(n))
                      .includes(selectedQuestion.field_mapping) && (
                      <option value={selectedQuestion.field_mapping}>
                        {selectedQuestion.field_mapping_original ||
                          selectedQuestion.field_mapping}{" "}
                        (unavailable)
                      </option>
                    )}
                </select>
              </div>

              {/* Hint Type and Question Hint */}
              <div className="form-row1">
                <div className="form-group2" style={{ flex: 1 }}>
                  <label className="form-label">Hint Type*</label>
                  <select
                    className="form-input compact"
                    value={selectedQuestion.hint_type || "text"}
                    onChange={(e) =>
                      handleChangeField("hint_type", e.target.value)
                    }
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div className="form-group2" style={{ flex: 1 }}>
                  <label className="form-label">Question Hint</label>
                  {(selectedQuestion.hint_type || "text") === "image" ? (
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input compact"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        handleChangeField("question_hint_file", file || null);
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-input compact"
                      value={selectedQuestion.question_hint || ""}
                      onChange={(e) =>
                        handleChangeField("question_hint", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>

              {/* Race Categories */}
              <div className="form-group2">
                <label className="form-label">Race Categories</label>
                <div className="race-category-toggle">
                  <button
                    className={`race-btn ${raceCategoryMode === "all" ? "active" : ""
                      }`}
                    onClick={() => toggleRaceMode("all")}
                  >
                    <span className="icon">🔊</span> All Race Categories
                  </button>
                  <button
                    className={`race-btn ${raceCategoryMode === "selected" ? "active" : ""
                      }`}
                    onClick={() => toggleRaceMode("selected")}
                  >
                    <span className="icon">🔒</span> Selected Race Categories
                  </button>
                </div>
                {raceCategoryMode === "selected" && (
                  <div className="race-tickets-list">
                    {raceTickets && raceTickets.length > 0 ? (
                      raceTickets.map((t) => (
                        <label key={t.id} className="race-ticket-item">
                          <span className="ticket-name">
                            {t.name || `Ticket ${t.id}`}
                          </span>
                          <input
                            type="checkbox"
                            checked={(
                              selectedQuestion.selected_race_tickets || []
                            ).includes(String(t.id))}
                            onChange={() => handleToggleTicket(t.id)}
                          />
                        </label>
                      ))
                    ) : (
                      <div className="muted">No race categories available.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Limit Length - only show for text type questions */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "text" && (
                  <div className="form-group2">
                    <div className="limit-length-row">
                      <label className="form-label-inline">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!!selectedQuestion.limit_length_enabled}
                          onChange={(e) =>
                            handleChangeField(
                              "limit_length_enabled",
                              e.target.checked
                            )
                          }
                        />
                        <span>Limit Length</span>
                      </label>

                      <div
                        className="limit-length-inputs"
                        style={{
                          display: selectedQuestion.limit_length_enabled
                            ? "flex"
                            : "none",
                        }}
                      >
                        <div className="input-group">
                          <label className="sub-label">Min Length*</label>
                          <input
                            type="number"
                            min="0"
                            className="form-input-small"
                            placeholder=""
                            value={selectedQuestion.min_length || ""}
                            onChange={(e) =>
                              handleChangeField("min_length", e.target.value)
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label className="sub-label">Max Length*</label>
                          <input
                            type="number"
                            min="0"
                            className="form-input-small"
                            placeholder=""
                            value={selectedQuestion.max_length || ""}
                            onChange={(e) =>
                              handleChangeField("max_length", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Radio / Option type: show Add Subquestions toggle and options dropdown */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "radio" && (
                  <div className="form-group2">
                    <label
                      className="form-label-inline"
                      style={{ display: "flex", marginTop: 22 }}
                    >
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!selectedQuestion.add_subquestions}
                        onChange={(e) =>
                          handleChangeField("add_subquestions", e.target.checked)
                        }
                      />
                      <span>Add Subquestions</span>
                    </label>

                    <div
                      className="subquestions-input"
                      style={{
                        display: selectedQuestion.add_subquestions
                          ? "block"
                          : "none",
                        marginTop: 12,
                      }}
                    >
                      <label className="form-label" style={{ display: "flex" }}>
                        Question Option Type *
                      </label>
                      <select
                        className="form-input compact"
                        value={selectedQuestion.selected_option_id || ""}
                        onChange={(e) =>
                          handleChangeField("selected_option_id", e.target.value)
                        }
                      >
                        <option value="">-- Select --</option>
                        {Array.isArray(selectedQuestion.question_form_option) &&
                          selectedQuestion.question_form_option.map((opt) => (
                            <option key={opt.id} value={String(opt.id)}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

              {/* Select type: same UI as radio for subquestions + dropdown populated from options */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "select" && (
                  <div className="form-group2">
                    <label
                      className="form-label-inline"
                      style={{ display: "flex", marginTop: -12 }}
                    >
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={!!selectedQuestion.add_subquestions}
                        onChange={(e) =>
                          handleChangeField("add_subquestions", e.target.checked)
                        }
                      />
                      <span>Add Subquestions</span>
                    </label>

                    <div
                      className="subquestions-input"
                      style={{
                        display: selectedQuestion.add_subquestions
                          ? "block"
                          : "none",
                        marginTop: 12,
                      }}
                    >
                      <label className="form-label" style={{ display: "flex" }}>
                        Question Option Type *
                      </label>
                      <select
                        className="form-input compact"
                        value={selectedQuestion.selected_option_id || ""}
                        onChange={(e) =>
                          handleChangeField("selected_option_id", e.target.value)
                        }
                      >
                        <option value="">-- Select --</option>
                        {Array.isArray(selectedQuestion.question_form_option) &&
                          selectedQuestion.question_form_option.map((opt) => (
                            <option key={opt.id} value={String(opt.id)}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}



              {/* Date Range - only for date type questions */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "date" && (
                  <div className="form-group2">
                    <label className="form-label">Date Range</label>
                    <div className="email-toggle-group">
                      <button
                        className={`email-toggle-btn ${!selectedQuestion.date_range_enabled ? "active" : ""
                          }`}
                        onClick={() =>
                          handleChangeField("date_range_enabled", false)
                        }
                      >
                        <span className="unlock-icon">🔓</span> No
                      </button>
                      <button
                        className={`email-toggle-btn ${selectedQuestion.date_range_enabled ? "active yes" : ""
                          }`}
                        onClick={() =>
                          handleChangeField("date_range_enabled", true)
                        }
                      >
                        <span className="lock-icon">🔒</span> Yes
                      </button>
                    </div>

                    {selectedQuestion.date_range_enabled && (
                      <div
                        className="limit-length-inputs"
                        style={{ marginTop: 12 }}
                      >
                        <div className="input-group">
                          <label className="sub-label">Start Date</label>
                          <input
                            type="date"
                            className="form-input compact"
                            value={selectedQuestion.start_date || ""}
                            onChange={(e) =>
                              handleChangeField("start_date", e.target.value)
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label className="sub-label">End Date</label>
                          <input
                            type="date"
                            className="form-input compact"
                            value={selectedQuestion.end_date || ""}
                            onChange={(e) =>
                              handleChangeField("end_date", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Email Domain Validation - only for email type questions */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "email" && (
                  <div className="form-group2">
                    <label className="form-label">
                      Apply Validation For Specific Domain
                    </label>
                    <div className="email-toggle-group">
                      <button
                        className={`email-toggle-btn ${!selectedQuestion.email_validation_enabled
                          ? "active"
                          : ""
                          }`}
                        onClick={() =>
                          handleChangeField("email_validation_enabled", false)
                        }
                      >
                        <span className="unlock-icon">🔓</span> No
                      </button>
                      <button
                        className={`email-toggle-btn ${selectedQuestion.email_validation_enabled
                          ? "active yes"
                          : ""
                          }`}
                        onClick={() =>
                          handleChangeField("email_validation_enabled", true)
                        }
                      >
                        <span className="lock-icon">🔒</span> Yes
                      </button>
                    </div>

                    {selectedQuestion.email_validation_enabled && (
                      <div
                        className="form-group2 email-validation-input"
                        style={{ marginTop: 12 }}
                      >
                        <label className="form-label">Domain Name</label>
                        <input
                          type="text"
                          className="form-input compact full-width"
                          value={selectedQuestion.email_domain || ""}
                          onChange={(e) =>
                            handleChangeField("email_domain", e.target.value)
                          }
                          placeholder="example.com"
                        />
                      </div>
                    )}
                  </div>
                )}

              {/* Limit Length */}
              {/* <div className="form-group2">
                <label className="form-label-inline">
                  <input type="checkbox" className="checkbox" />
                  <span>Limit Length</span>
                </label>
                <div className="limit-length-inputs">
                  <div className="input-group">
                    <label className="sub-label">Min Length*</label>
                    <input
                      type="text"
                      className="form-input-small"
                      placeholder=""
                    />
                  </div>
                  <div className="input-group">
                    <label className="sub-label">Max Length*</label>
                    <input
                      type="text"
                      className="form-input-small"
                      placeholder=""
                    />
                  </div>
                </div>
              </div> */}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={handleCloseModal}>
                Close
              </button>
              <button className="btn-modal-save" onClick={handleSaveQuestion}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAddCustomForm ? (
        <>
          <div className="modal-header">
            <h2>General Form Questions</h2>
            <button
              className="btn-add-custom"
              onClick={() => setShowAddCustomForm(true)}
            >
              + Add custom question
            </button>
          </div>
          <div className="sections-container">
            {apiQuestions && Object.keys(apiQuestions).length > 0 ? (
              Object.keys(apiQuestions).map((formName) => (
                <div className="form-section" key={formName}>
                  <h3 className="section-title">{formName}:</h3>
                  <div className="questions-list">
                    {apiQuestions[formName].map((q, idx) => (
                      <div key={q.id} className="question-card">
                        <div className="question-row">
                          <div className="question-label-wrap">
                            <div className="question-label">
                              {q.question_label}
                            </div>
                          </div>
                          <div className="question-action">
                            {isQuestionAdded(q) ? (
                              <button
                                className="btn-toggle added"
                                title="Already added"
                                onClick={(e) => e.stopPropagation()}
                              >
                                ✓
                              </button>
                            ) : (
                              <button
                                className="btn-toggle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleClick(q);
                                }}
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        {idx < apiQuestions[formName].length - 1 && (
                          <hr className="question-divider" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No general questions available.</div>
            )}
          </div>
        </>
      ) : (
        <AddCustomForm onCancel={() => setShowAddCustomForm(false)} />
      )}

      {/* Bottom Cancel button shown when not adding a custom form */}
      {!showAddCustomForm && (
        <div style={{ textAlign: "right", marginTop: 32, marginBottom: 8 }}>
          <button
            className="btn-cancel"
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
            onClick={() => onSave(questions)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default GeneralFormQuestions;
