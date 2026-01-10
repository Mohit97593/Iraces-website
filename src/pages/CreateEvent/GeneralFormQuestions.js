import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AddCustomForm from "./AddCustomForm";
import "./GeneralFormQuestions.css";
import { authAPI } from "../../services/authAPI";

const GeneralFormQuestions = ({
  onSave,
  questions,
  eventDetails,
  initialEditQuestion,
}) => {
  const location = useLocation();
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
  const [subQuestionErrors, setSubQuestionErrors] = useState({}); // Track validation errors for subquestions
  const [subQuestions, setSubQuestions] = useState([]);
  const [showSubQuestionModal, setShowSubQuestionModal] = useState(false);
  const [selectedQuestionForSubDetails, setSelectedQuestionForSubDetails] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const normalizeKey = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

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

  useEffect(() => {
    fetchGeneral();
  }, [refreshTrigger]);

  // Refetch when component becomes visible (user returns from AddCustomForm)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing questions...");
        setRefreshTrigger(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Refetch when AddCustomForm closes
  useEffect(() => {
    if (!showAddCustomForm) {
      console.log("AddCustomForm closed, refreshing questions...");
      setRefreshTrigger(prev => prev + 1);
    }
  }, [showAddCustomForm]);

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

  // Helper: check if a question has subquestions by looking in eventFormQuestionsData
  const hasSubQuestions = (q) => {
    if (!eventFormQuestionsData) return false;
    const normalizeItems = (obj) => {
      if (!obj) return [];
      if (obj.data && obj.data.form_question) {
        const fq = obj.data.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      if (obj.form_question) {
        const fq = obj.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      if (Array.isArray(obj)) return obj;
      if (obj.EventData && Array.isArray(obj.EventData)) {
        return obj.EventData.flatMap(
          (d) => d.event_form_details || d.form_question || []
        );
      }
      const keys = Object.keys(obj || {});
      for (const k of keys) {
        if (Array.isArray(obj[k])) return obj[k];
      }
      return [];
    };

    const items = normalizeItems(eventFormQuestionsData) || [];
    const matchedQuestion = items.find((it) => {
      const genId =
        it.general_form_id ||
        it.general_form ||
        it.id ||
        it.form_id ||
        it.template_id;
      return genId && String(genId) === String(q.id);
    });

    return matchedQuestion &&
      matchedQuestion.sub_questions_array &&
      Array.isArray(matchedQuestion.sub_questions_array) &&
      matchedQuestion.sub_questions_array.length > 0;
  };

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
    // Set BOTH is_mandatory and is_manadatory (backend uses the typo version)
    const updated = {
      ...selectedQuestion,
      is_mandatory: val ? "1" : "0",
      is_manadatory: val ? "1" : "0"  // Backend field (with typo)
    };
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
    setSubQuestions([]); // Reset subquestions when closing modal
  };

  // Helper functions for managing subquestions (2-level system)
  // Level 1: Parent subquestions (limited by dropdown options)
  // Level 2: Child subquestions (unlimited inside each parent)

  const addSubQuestion = () => {
    setSubQuestions([...subQuestions, {
      selectedOptionId: "",
      subQuestionTitle: "",
      subQueHintType: "1",
      subQuestionHint: "",
      subQuestionHintFile: null,
      subQuestionFormType: "",
      subQuestionMandatory: "0",
      childSubquestions: [],  // Array for unlimited children
      options: [],  // Initialize empty options array
      priceEnabled: false,  // Initialize price toggle
      maxCountEnabled: false,  // Initialize count toggle
      newOptionLabel: "",  // Initialize input fields
      newOptionPrice: "",
      newOptionCount: ""
    }]);
  };

  const removeSubQuestion = (index) => {
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (index, field, value) => {
    const updated = [...subQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setSubQuestions(updated);
  };

  // NEW: Child subquestion management functions
  const addChildSubQuestion = (parentIndex) => {
    const updated = [...subQuestions];
    if (!updated[parentIndex].childSubquestions) {
      updated[parentIndex].childSubquestions = [];
    }
    updated[parentIndex].childSubquestions.push({
      subQuestionTitle: "",
      subQueHintType: "1",
      subQuestionHint: "",
      subQuestionHintFile: null,
      subQuestionFormType: "",
      subQuestionMandatory: "0",
      // Options UI fields
      priceEnabled: false,
      maxCountEnabled: false,
      newOptionLabel: "",
      newOptionPrice: "",
      newOptionCount: "",
      options: []
    });
    setSubQuestions(updated);
  };

  const removeChildSubQuestion = (parentIndex, childIndex) => {
    const updated = [...subQuestions];
    updated[parentIndex].childSubquestions = updated[parentIndex].childSubquestions.filter(
      (_, i) => i !== childIndex
    );
    setSubQuestions(updated);
  };

  const updateChildSubQuestion = (parentIndex, childIndex, field, value) => {
    const updated = [...subQuestions];
    updated[parentIndex].childSubquestions[childIndex] = {
      ...updated[parentIndex].childSubquestions[childIndex],
      [field]: value
    };
    setSubQuestions(updated);
  };

  // Helper function to parse comma-separated values and create options
  const parseCommaSeparatedOptions = (labels, prices, counts, priceEnabled, countEnabled) => {
    // Split by comma and trim whitespace
    const labelArray = labels.split(',').map(s => s.trim()).filter(Boolean);

    if (labelArray.length === 0) {
      return { error: ' Please enter at least one label' };
    }

    const priceArray = prices ? prices.split(',').map(s => s.trim()).filter(Boolean) : [];
    const countArray = counts ? counts.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Validation: if price is enabled, price count must match label count
    if (priceEnabled && priceArray.length > 0 && priceArray.length !== labelArray.length) {
      return {
        error: `Prices  (${priceArray.length}) Labels (${labelArray.length})  Number of prices (${priceArray.length}) must match number of labels (${labelArray.length})`
      };
    }

    // Validation: if count is enabled, count count must match label count
    if (countEnabled && countArray.length > 0 && countArray.length !== labelArray.length) {
      return {
        error: `Counts  (${countArray.length}) Labels  (${labelArray.length})  Number of counts (${countArray.length}) must match number of labels (${labelArray.length})`
      };
    }

    // Create options array
    const options = labelArray.map((label, idx) => {
      const option = { label };

      if (priceEnabled && priceArray[idx]) {
        option.price = priceArray[idx];
      }

      if (countEnabled && countArray[idx]) {
        option.count = countArray[idx];
      }

      return option;
    });

    return { options };
  };

  const getAvailableOptions = (currentIndex) => {
    if (!selectedQuestion || !Array.isArray(selectedQuestion.question_form_option)) {
      return [];
    }
    // Return all options without filtering - allow duplicate selections
    return selectedQuestion.question_form_option;
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

  // Helper: check if a question with specific label is added
  const isQuestionAddedByLabel = (labelToCheck) => {
    if (!eventFormQuestionsData) return false;
    const normalizeItems = (obj) => {
      if (!obj) return [];
      if (obj.data && obj.data.form_question) {
        const fq = obj.data.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      if (obj.form_question) {
        const fq = obj.form_question;
        if (fq.event_form_details) {
          const vals = Object.values(fq.event_form_details || {}).flat();
          return Array.isArray(vals) ? vals : [];
        }
        if (Array.isArray(fq)) return fq;
      }
      if (Array.isArray(obj)) return obj;
      if (obj.EventData && Array.isArray(obj.EventData)) {
        return obj.EventData.flatMap(
          (d) => d.event_form_details || d.form_question || []
        );
      }
      const keys = Object.keys(obj || {});
      for (const k of keys) {
        if (Array.isArray(obj[k])) return obj[k];
      }
      return [];
    };

    const items = normalizeItems(eventFormQuestionsData) || [];
    return items.some((it) => {
      const label = (it.display_label_name || it.question_label || it.label || "") + "";
      return label && String(label).trim().toLowerCase() === String(labelToCheck).trim().toLowerCase();
    });
  };

  // Helper: check if Country is added
  const isCountryAdded = () => {
    return isQuestionAddedByLabel("Country");
  };

  // Helper: check if State is added
  const isStateAdded = () => {
    return isQuestionAddedByLabel("State");
  };

  const handleSaveQuestion = async () => {
    // Build FormData payload according to backend expected fields
    if (!selectedQuestion) return;

    // IMPORTANT: Before saving, check if there are any pending option values
    // that the user filled but didn't click the + button for
    const updatedSubQuestions = subQuestions.map((subQ, index) => {
      // Check if this subquestion has option-based input type
      const hasOptions = subQ.subQuestionFormType === 'checkbox' ||
        subQ.subQuestionFormType === 'radio' ||
        subQ.subQuestionFormType === 'select';

      if (hasOptions && subQ.newOptionLabel && subQ.newOptionLabel.trim()) {
        console.log(`🔄 Auto-adding pending option for subquestion ${index}:`, {
          label: subQ.newOptionLabel,
          price: subQ.newOptionPrice,
          count: subQ.newOptionCount
        });

        // Create the new option object
        const newOption = { label: subQ.newOptionLabel.trim() };

        // Include price if enabled and has value
        if (subQ.priceEnabled && subQ.newOptionPrice !== undefined &&
          subQ.newOptionPrice !== null && subQ.newOptionPrice !== '') {
          newOption.price = subQ.newOptionPrice;
        }

        // Include count if enabled and has value
        if (subQ.maxCountEnabled && subQ.newOptionCount !== undefined &&
          subQ.newOptionCount !== null && subQ.newOptionCount !== '') {
          newOption.count = subQ.newOptionCount;
        }

        // Add to options array
        const updatedOptions = [...(subQ.options || []), newOption];

        console.log(`✅ Added pending option. Total options now:`, updatedOptions);

        return {
          ...subQ,
          options: updatedOptions,
          newOptionLabel: '',
          newOptionPrice: '',
          newOptionCount: ''
        };
      }

      return subQ;
    });

    // Update the subQuestions state with any auto-added options
    setSubQuestions(updatedSubQuestions);

    // Validate display name required
    if (
      !selectedQuestion.question_label ||
      String(selectedQuestion.question_label).trim() === ""
    ) {
      setDisplayNameError("Display name is required");
      return;
    }

    // Clear previous subquestion errors
    setSubQuestionErrors({});

    // Validate subquestions if add_subquestions is enabled
    if (selectedQuestion.add_subquestions && updatedSubQuestions && updatedSubQuestions.length > 0) {
      const errors = {};

      for (let i = 0; i < updatedSubQuestions.length; i++) {
        const subQ = updatedSubQuestions[i];

        // Validate Question Option Type (selectedOptionId) - Required field with *
        if (!subQ.selectedOptionId || String(subQ.selectedOptionId).trim() === "") {
          errors[`${i}_selectedOptionId`] = "Please select Question Option Type";
          setSubQuestionErrors(errors);
          return;
        }

        // Validate Question Title - Required field with *
        if (!subQ.subQuestionTitle || String(subQ.subQuestionTitle).trim() === "") {
          errors[`${i}_title`] = "Please enter Question Title";
          setSubQuestionErrors(errors);
          return;
        }

        // Validate Question Input Type (Form Type) - Required field with *
        if (!subQ.subQuestionFormType || String(subQ.subQuestionFormType).trim() === "") {
          errors[`${i}_formType`] = "Please select Question Input Type";
          setSubQuestionErrors(errors);
          return;
        }

        // Validate child subquestions if they exist
        if (subQ.childSubquestions && Array.isArray(subQ.childSubquestions) && subQ.childSubquestions.length > 0) {
          for (let j = 0; j < subQ.childSubquestions.length; j++) {
            const childSubQ = subQ.childSubquestions[j];

            // Validate Child Title - Required field with *
            if (!childSubQ.subQuestionTitle || String(childSubQ.subQuestionTitle).trim() === "") {
              errors[`${i}_child_${j}_title`] = "Please enter Title";
              setSubQuestionErrors(errors);
              return;
            }

            // Validate Child Form Type - Required field with *
            if (!childSubQ.subQuestionFormType || String(childSubQ.subQuestionFormType).trim() === "") {
              errors[`${i}_child_${j}_formType`] = "Please select Form Type";
              setSubQuestionErrors(errors);
              return;
            }
          }
        }
      }
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
        (selectedQuestion.is_mandatory === "1" || selectedQuestion.is_manadatory === "1" || selectedQuestion.is_manadatory === 1) ? "1" : "0"
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

      // Helper function to convert form type string to numeric code
      const getFormTypeNumeric = (formTypeString) => {
        const typeMap = {
          'text': 1,
          'email': 2,
          'mobile': 3,
          'amount': 4,
          'textarea': 5,
          'checkbox': 6,
          'radio': 7,
          'date': 8,
          'time': 9,
          'file': 10,
          'select': 11,
          'dropdown': 11,
          'number': 12
        };
        const normalized = String(formTypeString || '').toLowerCase().trim();
        return typeMap[normalized] || 1; // Default to 1 (text) if unknown
      };

      // Send question_type for main question
      // If subquestions exist, use the first subquestion's selectedOptionId
      // Otherwise use form type numeric
      let mainQuestionType;
      if (updatedSubQuestions && updatedSubQuestions.length > 0 && updatedSubQuestions[0].selectedOptionId) {
        mainQuestionType = updatedSubQuestions[0].selectedOptionId;
      } else {
        mainQuestionType = getFormTypeNumeric(selectedQuestion.question_form_type);
      }

      formData.append(
        "question_type",
        mainQuestionType
      );

      // Recursive function to build sub_questions array with nesting support
      const buildSubQuestionsArray = (subQuestionsArray) => {
        return (subQuestionsArray || []).map((subQ) => {
          // Use selectedOptionId as question_type (the ID from "Question Option Type" dropdown)
          // This is the ID of the option user selected (Male, Female, S, M, L, etc.)
          const questionTypeValue = subQ.selectedOptionId || "";

          const subQuestionObj = {
            question_type: questionTypeValue,
            title: subQ.subQuestionTitle || "",
            form_type: subQ.subQuestionFormType || "",
            mandatory: subQ.subQuestionMandatory === "1" ? 1 : 0,
          };

          // Add options if the subquestion has any (for select, radio, checkbox types)
          if (subQ.subQuestionFormType === 'select' ||
            subQ.subQuestionFormType === 'radio' ||
            subQ.subQuestionFormType === 'checkbox') {

            // Use the options array that was built in the UI (with price/count if enabled)
            if (subQ.options && Array.isArray(subQ.options) && subQ.options.length > 0) {
              subQuestionObj.options = subQ.options.map((opt, optIdx) => {
                const optionData = {
                  label: opt.label || opt.option_name || opt.name || ""
                };

                // Include price if it was provided
                if (opt.price !== undefined && opt.price !== null && opt.price !== '') {
                  optionData.price = opt.price;
                }

                // Include count if it was provided
                if (opt.count !== undefined && opt.count !== null && opt.count !== '') {
                  optionData.count = opt.count;
                }

                // NEW: Add child_question_id if there's a nested subquestion for this option
                if (subQ.childSubquestions && subQ.childSubquestions.length > 0) {
                  // Automatic mapping: First child subquestion → First option, Second → Second option, etc.
                  // Find child subquestion at the same index as this option
                  if (subQ.childSubquestions[optIdx]) {
                    // Use a temporary ID format that will be replaced with real ID after backend saves
                    optionData.child_question_id = `child_${optIdx}`;
                  }
                }

                return optionData;
              });
            } else if (selectedQuestion.question_form_option && Array.isArray(selectedQuestion.question_form_option)) {
              // Fallback: use parent question options if no custom options were added
              const relevantOptions = selectedQuestion.question_form_option.filter(
                opt => String(opt.id) === String(subQ.selectedOptionId)
              );

              if (relevantOptions.length > 0) {
                subQuestionObj.options = relevantOptions.map(opt => ({
                  label: opt.option_name || opt.label || opt.name || ""
                }));
              } else {
                // Include all parent options as fallback
                subQuestionObj.options = selectedQuestion.question_form_option.map(opt => ({
                  label: opt.option_name || opt.label || opt.name || ""
                }));
              }
            }
          }

          // NEW: Process child sub-questions (2-level system)
          if (subQ.childSubquestions && subQ.childSubquestions.length > 0) {
            subQuestionObj.sub_questions = subQ.childSubquestions.map(childSubQ => {
              const childFormTypeNumeric = getFormTypeNumeric(childSubQ.subQuestionFormType);

              // Build child subquestion object with all necessary fields
              const childObj = {
                question_type: childFormTypeNumeric,
                title: childSubQ.subQuestionTitle || "",
                form_type: childSubQ.subQuestionFormType || "",
                mandatory: childSubQ.subQuestionMandatory === "1" ? 1 : 0
              };

              // Add options data for checkbox/radio/select types
              if (childSubQ.subQuestionFormType === 'checkbox' ||
                childSubQ.subQuestionFormType === 'radio' ||
                childSubQ.subQuestionFormType === 'select') {

                // Process comma-separated labels into options array
                if (childSubQ.newOptionLabel && childSubQ.newOptionLabel.trim()) {
                  const labels = childSubQ.newOptionLabel.split(',').map(l => l.trim()).filter(l => l);
                  const prices = childSubQ.priceEnabled && childSubQ.newOptionPrice
                    ? childSubQ.newOptionPrice.split(',').map(p => p.trim()).filter(p => p)
                    : [];
                  const counts = childSubQ.maxCountEnabled && childSubQ.newOptionCount
                    ? childSubQ.newOptionCount.split(',').map(c => c.trim()).filter(c => c)
                    : [];

                  // Build options array
                  childObj.options = labels.map((label, idx) => ({
                    label: label,
                    price: childSubQ.priceEnabled && prices[idx] ? prices[idx] : null,
                    count: childSubQ.maxCountEnabled && counts[idx] ? counts[idx] : null
                  }));
                }

                // Add price and count enabled flags
                childObj.priceEnabled = childSubQ.priceEnabled || false;
                childObj.maxCountEnabled = childSubQ.maxCountEnabled || false;
              }

              return childObj;
            });
          }


          return subQuestionObj;
        });
      };

      // Build the sub_questions array using the function with UPDATED subquestions
      // (includes any auto-added pending options)
      const subQuestionsArray = buildSubQuestionsArray(updatedSubQuestions);

      // Debug: Log child subquestions data
      console.log('📤 Sending sub_questions to API:', JSON.stringify(subQuestionsArray, null, 2));

      // Send sub_questions as JSON string
      formData.append(
        "sub_questions",
        JSON.stringify(subQuestionsArray)
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


      console.log("=== Sending Subquestion Data ===");
      console.log("subQuestions state (raw):", JSON.stringify(subQuestions, null, 2));
      console.log("subQuestionsArray (built for API):", JSON.stringify(subQuestionsArray, null, 2));

      // Log each subquestion's options separately for clarity
      subQuestions.forEach((sq, idx) => {
        console.log(`Subquestion ${idx} options:`, sq.options);
        console.log(`  - priceEnabled: ${sq.priceEnabled}`);
        console.log(`  - maxCountEnabled: ${sq.maxCountEnabled}`);
      });
      console.log("===============================");


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
      console.log("📤 FormData sub_questions value:", formData.get("sub_questions"));

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
                  <label className="form-label">
                    Hint{" "}
                    <span className="required" style={{ color: "#da251c" }}>
                      *
                    </span>
                  </label>
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

              {/* Radio/Checkbox type: show Add Subquestions toggle and dynamic subquestion forms */}
              {((selectedQuestion.question_form_type || "").toLowerCase() === "radio" ||
                (selectedQuestion.question_form_type || "").toLowerCase() === "checkbox") && (
                  <div className="form-group2">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: 22,
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {/* Toggle Switch */}
                      <div
                        onClick={() => {
                          const newValue = !selectedQuestion.add_subquestions;
                          handleChangeField("add_subquestions", newValue);
                          if (newValue && subQuestions.length === 0) {
                            // Add first subquestion when toggle is turned on
                            addSubQuestion();
                          } else if (!newValue) {
                            // Clear all subquestions when turned off
                            setSubQuestions([]);
                          }
                        }}
                        style={{
                          position: 'relative',
                          width: 48,
                          height: 28,
                          borderRadius: 14,
                          background: selectedQuestion.add_subquestions ? '#da251c' : '#ccc',
                          transition: 'background 0.3s',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            left: selectedQuestion.add_subquestions ? 22 : 2,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            background: '#fff',
                            transition: 'left 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Add Subquestions</span>
                      <span style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        marginLeft: 'auto'
                      }}>
                        {selectedQuestion.add_subquestions ? subQuestions.length : 0}
                      </span>
                    </label>

                    {selectedQuestion.add_subquestions && (
                      <div style={{ marginTop: 16, width: '100%' }}>
                        {/* Display each subquestion */}
                        {subQuestions.map((subQ, index) => (
                          <div key={index} style={{ marginBottom: 20, width: '100%' }}>
                            {/* Question Option Type Dropdown */}
                            <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                              <label className="form-label">
                                Question Option Type <span style={{ color: "#da251c" }}>*</span>
                              </label>
                              <select
                                className="form-input compact"
                                value={subQ.selectedOptionId || ""}
                                onChange={(e) => {
                                  updateSubQuestion(index, "selectedOptionId", e.target.value);
                                  // Clear error when user selects an option
                                  if (e.target.value) {
                                    setSubQuestionErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors[`${index}_selectedOptionId`];
                                      return newErrors;
                                    });
                                  }
                                }}
                              >
                                <option value="">-- Select --</option>
                                {getAvailableOptions(index).map((opt) => (
                                  <option key={opt.id} value={String(opt.id)}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {subQuestionErrors[`${index}_selectedOptionId`] && (
                                <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                  {subQuestionErrors[`${index}_selectedOptionId`]}
                                </div>
                              )}
                            </div>

                            {/* Show full form only if option is selected */}
                            {subQ.selectedOptionId && (
                              <>
                                {/* Question Title */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <label className="form-label">
                                    Question Title <span style={{ color: "#da251c" }}>*</span>
                                    {subQ.subQuestionMandatory === "1" && (
                                      <span style={{ color: "#da251c", marginLeft: 8, fontSize: "0.9em" }}>
                                        * (Mandatory)
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input compact"
                                    value={subQ.subQuestionTitle || ""}
                                    onChange={(e) => {
                                      updateSubQuestion(index, "subQuestionTitle", e.target.value);
                                      // Clear error when user types
                                      if (e.target.value.trim()) {
                                        setSubQuestionErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[`${index}_title`];
                                          return newErrors;
                                        });
                                      }
                                    }}
                                    placeholder=""
                                  />
                                  {subQuestionErrors[`${index}_title`] && (
                                    <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                      {subQuestionErrors[`${index}_title`]}
                                    </div>
                                  )}
                                </div>

                                {/* Hint Type and Sub Question Hint - side by side */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: 12, width: '100%' }}>
                                  {/* Hint Type */}
                                  <div className="form-group2" style={{ flex: 1 }}>
                                    <label className="form-label">Hint Type <span style={{ color: "#da251c" }}>*</span></label>
                                    <select
                                      className="form-input compact"
                                      value={subQ.subQueHintType || "1"}
                                      onChange={(e) =>
                                        updateSubQuestion(index, "subQueHintType", e.target.value)
                                      }
                                    >
                                      <option value="1">Text</option>
                                      <option value="2">Image</option>
                                    </select>
                                  </div>

                                  {/* Sub Question Hint */}
                                  <div className="form-group2" style={{ flex: 1 }}>
                                    <label className="form-label">Sub Question Hint</label>
                                    {subQ.subQueHintType === "2" ? (
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="form-input compact"
                                        onChange={(e) => {
                                          const file = e.target.files && e.target.files[0];
                                          updateSubQuestion(index, "subQuestionHintFile", file || null);
                                        }}
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        className="form-input compact"
                                        value={subQ.subQuestionHint || ""}
                                        onChange={(e) =>
                                          updateSubQuestion(index, "subQuestionHint", e.target.value)
                                        }
                                        placeholder=""
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Question Input Type */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <label className="form-label">
                                    Question Input Type <span style={{ color: "#da251c" }}>*</span>
                                  </label>
                                  <select
                                    className="form-input compact"
                                    value={subQ.subQuestionFormType || ""}
                                    onChange={(e) => {
                                      updateSubQuestion(index, "subQuestionFormType", e.target.value);
                                      // Clear error when user selects
                                      if (e.target.value) {
                                        setSubQuestionErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[`${index}_formType`];
                                          return newErrors;
                                        });
                                      }
                                    }}
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="mobile">Mobile</option>
                                    <option value="amount">Amount</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="checkbox">Checkboxes</option>
                                    <option value="radio">Radio</option>
                                    <option value="date">Date</option>
                                    <option value="time">Time</option>
                                    <option value="file">File</option>
                                    <option value="select">Select (Dropdown)</option>
                                  </select>
                                  {subQuestionErrors[`${index}_formType`] && (
                                    <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                      {subQuestionErrors[`${index}_formType`]}
                                    </div>
                                  )}
                                </div>

                                {/* Options UI for checkbox, radio, and select types */}
                                {(subQ.subQuestionFormType === 'checkbox' ||
                                  subQ.subQuestionFormType === 'radio' ||
                                  subQ.subQuestionFormType === 'select') && (
                                    <div style={{ marginBottom: 12, width: '100%' }}>
                                      {/* Price and Maximum Count Limit RED TOGGLES */}
                                      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                        {/* Price Toggle */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                          <div
                                            onClick={() => updateSubQuestion(index, 'priceEnabled', !subQ.priceEnabled)}
                                            style={{
                                              width: 50,
                                              height: 26,
                                              borderRadius: 13,
                                              background: subQ.priceEnabled ? '#da251c' : '#ccc',
                                              position: 'relative',
                                              cursor: 'pointer',
                                              transition: 'background 0.3s'
                                            }}
                                          >
                                            <div style={{
                                              width: 22,
                                              height: 22,
                                              borderRadius: '50%',
                                              background: '#fff',
                                              position: 'absolute',
                                              top: 2,
                                              left: subQ.priceEnabled ? 26 : 2,
                                              transition: 'left 0.3s'
                                            }} />
                                          </div>
                                          <span style={{ fontWeight: 500 }}>Price</span>
                                        </label>

                                        {/* Maximum Count Limit Toggle */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                          <div
                                            onClick={() => updateSubQuestion(index, 'maxCountEnabled', !subQ.maxCountEnabled)}
                                            style={{
                                              width: 50,
                                              height: 26,
                                              borderRadius: 13,
                                              background: subQ.maxCountEnabled ? '#da251c' : '#ccc',
                                              position: 'relative',
                                              cursor: 'pointer',
                                              transition: 'background 0.3s'
                                            }}
                                          >
                                            <div style={{
                                              width: 22,
                                              height: 22,
                                              borderRadius: '50%',
                                              background: '#fff',
                                              position: 'absolute',
                                              top: 2,
                                              left: subQ.maxCountEnabled ? 26 : 2,
                                              transition: 'left 0.3s'
                                            }} />
                                          </div>
                                          <span style={{ fontWeight: 500 }}>Maximum Count Limit</span>
                                        </label>
                                      </div>

                                      {/* Options Table with DYNAMIC columns */}
                                      <div style={{
                                        background: '#fff0f0',
                                        borderRadius: 8,
                                        padding: '16px',
                                        marginBottom: 12
                                      }}>
                                        {/* Existing options display */}
                                        {(subQ.options || []).length > 0 && (
                                          <>
                                            <div style={{
                                              display: 'grid',
                                              gridTemplateColumns: `1fr ${subQ.priceEnabled ? 'auto ' : ''}${subQ.maxCountEnabled ? 'auto ' : ''}auto`,
                                              gap: 16,
                                              marginBottom: 12,
                                              paddingBottom: 8,
                                              borderBottom: '2px solid #da251c'
                                            }}>
                                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Label</div>
                                              {subQ.priceEnabled && <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Price</div>}
                                              {subQ.maxCountEnabled && <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Count</div>}
                                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Action</div>
                                            </div>

                                            {/* Existing options - Dynamic columns */}
                                            {(subQ.options || []).map((opt, optIdx) => (
                                              <div
                                                key={optIdx}
                                                style={{
                                                  display: 'grid',
                                                  gridTemplateColumns: `1fr ${subQ.priceEnabled ? 'auto ' : ''}${subQ.maxCountEnabled ? 'auto ' : ''}auto`,
                                                  gap: 16,
                                                  alignItems: 'center',
                                                  marginBottom: 8,
                                                  paddingBottom: 8,
                                                  borderBottom: '1px solid #eee'
                                                }}
                                              >
                                                <div style={{ color: '#333' }}>{opt.label || opt}</div>
                                                {subQ.priceEnabled && <div style={{ color: '#666' }}>{opt.price || '-'}</div>}
                                                {subQ.maxCountEnabled && <div style={{ color: '#666' }}>{opt.count || '-'}</div>}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newOptions = [...(subQ.options || [])];
                                                    newOptions.splice(optIdx, 1);
                                                    updateSubQuestion(index, 'options', newOptions);
                                                  }}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#e74c3c',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    padding: 4
                                                  }}
                                                  title="Delete option"
                                                >
                                                  🗑
                                                </button>
                                              </div>
                                            ))}
                                          </>
                                        )}

                                        {/* Comma-separated input section */}
                                        <div style={{
                                          marginTop: (subQ.options || []).length > 0 ? 16 : 0,
                                          paddingTop: (subQ.options || []).length > 0 ? 16 : 0,
                                          borderTop: (subQ.options || []).length > 0 ? '1px dashed #ddd' : 'none'
                                        }}>
                                          {/* Label input */}
                                          <div style={{ marginBottom: 12 }}>
                                            <label style={{
                                              display: 'block',
                                              fontWeight: 600,
                                              fontSize: '0.9rem',
                                              marginBottom: 6,
                                              color: '#333'
                                            }}>
                                              Labels (comma-separated) <span style={{ color: '#da251c' }}>*</span>
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="e.g., Male, Female, Other"
                                              value={subQ.newOptionLabel || ''}
                                              onChange={(e) => updateSubQuestion(index, 'newOptionLabel', e.target.value)}
                                              style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: 6,
                                                fontSize: '0.95rem'
                                              }}
                                            />
                                          </div>

                                          {/* Price input (if enabled) */}
                                          {subQ.priceEnabled && (
                                            <div style={{ marginBottom: 12 }}>
                                              <label style={{
                                                display: 'block',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                marginBottom: 6,
                                                color: '#333'
                                              }}>
                                                Prices (comma-separated)
                                              </label>
                                              <input
                                                type="text"
                                                placeholder="e.g., 100, 200, 150"
                                                value={subQ.newOptionPrice || ''}
                                                onChange={(e) => updateSubQuestion(index, 'newOptionPrice', e.target.value)}
                                                style={{
                                                  width: '100%',
                                                  padding: '10px 12px',
                                                  border: '1px solid #ddd',
                                                  borderRadius: 6,
                                                  fontSize: '0.95rem'
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Count input (if enabled) */}
                                          {subQ.maxCountEnabled && (
                                            <div style={{ marginBottom: 12 }}>
                                              <label style={{
                                                display: 'block',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                marginBottom: 6,
                                                color: '#333'
                                              }}>
                                                Counts (comma-separated)
                                              </label>
                                              <input
                                                type="text"
                                                placeholder="e.g., 50, 75, 100"
                                                value={subQ.newOptionCount || ''}
                                                onChange={(e) => updateSubQuestion(index, 'newOptionCount', e.target.value)}
                                                style={{
                                                  width: '100%',
                                                  padding: '10px 12px',
                                                  border: '1px solid #ddd',
                                                  borderRadius: 6,
                                                  fontSize: '0.95rem'
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Hint text */}
                                          <div style={{
                                            background: '#e8f5e9',
                                            border: '1px solid #4caf50',
                                            borderRadius: 6,
                                            padding: '10px 12px',
                                            fontSize: '0.85rem',
                                            color: '#2e7d32'
                                          }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                              💡 Tip: You can send different values in a single line
                                            </div>
                                            <div>
                                              • Separate multiple values with comma (,)<br />
                                              • Example: Male, Female, Other<br />
                                              • If you have 3 labels, provide 3 prices and 3 counts
                                            </div>
                                          </div>

                                          {/* Error message display */}
                                          {subQ.optionError && (
                                            <div style={{
                                              background: '#ffebee',
                                              border: '1px solid #f44336',
                                              borderRadius: 6,
                                              padding: '10px 12px',
                                              marginTop: 12,
                                              fontSize: '0.85rem',
                                              color: '#c62828'
                                            }}>
                                              ⚠️ {subQ.optionError}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* Mandatory/Optional Toggle */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <div className="status-toggle">
                                    <button
                                      type="button"
                                      className={`status-btn ${subQ.subQuestionMandatory === "1" ? "active" : ""}`}
                                      onClick={() =>
                                        updateSubQuestion(index, "subQuestionMandatory", "1")
                                      }
                                    >
                                      <span className="star-icon">★</span> Mandatory
                                    </button>
                                    <button
                                      type="button"
                                      className={`status-btn ${subQ.subQuestionMandatory !== "1" ? "active" : ""}`}
                                      onClick={() =>
                                        updateSubQuestion(index, "subQuestionMandatory", "0")
                                      }
                                    >
                                      <span className="star-icon">☆</span> Optional
                                    </button>
                                  </div>
                                </div>

                                {/* Delete button for this subquestion (except first one) */}
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubQuestion(index)}
                                    style={{
                                      background: "#fff",
                                      border: "1px solid #e74c3c",
                                      color: "#e74c3c",
                                      borderRadius: 6,
                                      padding: "6px 12px",
                                      cursor: "pointer",
                                      fontSize: "0.9rem",
                                      marginBottom: 12
                                    }}
                                  >
                                    🗑 Remove
                                  </button>
                                )}

                                {/* CHILD SUBQUESTIONS SECTION - Only show for option-based input types */}
                                {(subQ.subQuestionFormType === 'radio' ||
                                  subQ.subQuestionFormType === 'checkbox' ||
                                  subQ.subQuestionFormType === 'select') && (
                                    <div style={{
                                      marginTop: '20px',
                                      paddingTop: '16px',
                                      borderTop: '2px dashed #4CAF50'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#4CAF50' }}>
                                          🔹 Child Sub-Questions (Unlimited)
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => addChildSubQuestion(index)}
                                          style={{
                                            padding: '6px 14px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                          }}
                                        >
                                          ➕ Add Subquestion (Inside This)
                                        </button>
                                      </div>

                                      {/* Render Child Subquestions */}
                                      {subQ.childSubquestions && subQ.childSubquestions.length > 0 ? (
                                        <div>
                                          {subQ.childSubquestions.map((child, childIdx) => (
                                            <div
                                              key={childIdx}
                                              style={{
                                                marginLeft: '20px',
                                                marginBottom: '16px',
                                                padding: '16px',
                                                borderLeft: '4px solid #4CAF50',
                                                backgroundColor: '#f9fdf9',
                                                borderRadius: '6px'
                                              }}
                                            >
                                              <div style={{ fontSize: '0.8rem', color: '#4CAF50', marginBottom: '12px', fontWeight: 'bold' }}>
                                                📌 Child Sub-Question #{childIdx + 1}
                                              </div>

                                              {/* Child Title */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Title <span style={{ color: "#da251c" }}>*</span></label>
                                                <input
                                                  type="text"
                                                  className="form-input compact"
                                                  value={child.subQuestionTitle || ""}
                                                  onChange={(e) => {
                                                    updateChildSubQuestion(index, childIdx, 'subQuestionTitle', e.target.value);
                                                    // Clear error when user types
                                                    if (e.target.value.trim()) {
                                                      setSubQuestionErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors[`${index}_child_${childIdx}_title`];
                                                        return newErrors;
                                                      });
                                                    }
                                                  }}
                                                  placeholder="Enter child title"
                                                />
                                                {subQuestionErrors[`${index}_child_${childIdx}_title`] && (
                                                  <div style={{ color: "#da251c", fontSize: "0.75rem", marginTop: 4 }}>
                                                    {subQuestionErrors[`${index}_child_${childIdx}_title`]}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Child Hint Type and Hint - side by side */}
                                              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                {/* Hint Type */}
                                                <div className="form-group2" style={{ flex: 1 }}>
                                                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Hint Type<span style={{ color: "#da251c" }}>*</span></label>
                                                  <select
                                                    className="form-input compact"
                                                    value={child.subQueHintType || "1"}
                                                    onChange={(e) => updateChildSubQuestion(index, childIdx, 'subQueHintType', e.target.value)}
                                                  >
                                                    <option value="1">Text</option>
                                                    <option value="2">Image</option>
                                                  </select>
                                                </div>

                                                {/* Sub Question Hint */}
                                                <div className="form-group2" style={{ flex: 1 }}>
                                                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Sub Question Hint</label>
                                                  {child.subQueHintType === "2" ? (
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="form-input compact"
                                                      onChange={(e) => {
                                                        const file = e.target.files && e.target.files[0];
                                                        updateChildSubQuestion(index, childIdx, 'subQuestionHintFile', file || null);
                                                      }}
                                                    />
                                                  ) : (
                                                    <input
                                                      type="text"
                                                      className="form-input compact"
                                                      value={child.subQuestionHint || ""}
                                                      onChange={(e) => updateChildSubQuestion(index, childIdx, 'subQuestionHint', e.target.value)}
                                                      placeholder=""
                                                    />
                                                  )}
                                                </div>
                                              </div>

                                              {/* Child Form Type */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Form Type <span style={{ color: "#da251c" }}>*</span></label>
                                                <select
                                                  className="form-input compact"
                                                  value={child.subQuestionFormType || ""}
                                                  onChange={(e) => {
                                                    updateChildSubQuestion(index, childIdx, 'subQuestionFormType', e.target.value);
                                                    // Clear error when user selects
                                                    if (e.target.value) {
                                                      setSubQuestionErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors[`${index}_child_${childIdx}_formType`];
                                                        return newErrors;
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <option value="">-- Select --</option>
                                                  <option value="text">Text</option>
                                                  <option value="email">Email</option>
                                                  <option value="mobile">Mobile</option>
                                                  <option value="amount">Amount</option>
                                                  <option value="textarea">Textarea</option>
                                                  <option value="checkbox">Checkboxes</option>
                                                  <option value="radio">Radio</option>
                                                  <option value="date">Date</option>
                                                  <option value="time">Time</option>
                                                  <option value="file">File</option>
                                                  <option value="select">Select (Dropdown)</option>
                                                </select>
                                                {subQuestionErrors[`${index}_child_${childIdx}_formType`] && (
                                                  <div style={{ color: "#da251c", fontSize: "0.75rem", marginTop: 4 }}>
                                                    {subQuestionErrors[`${index}_child_${childIdx}_formType`]}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Options UI for checkbox, radio, and select types in child subquestions */}
                                              {(child.subQuestionFormType === 'checkbox' ||
                                                child.subQuestionFormType === 'radio' ||
                                                child.subQuestionFormType === 'select') && (
                                                  <div style={{ marginBottom: 12, width: '100%' }}>
                                                    {/* Price and Maximum Count Limit toggle switches */}
                                                    <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                                                      {/* Price Toggle */}
                                                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                                        <div
                                                          onClick={() => updateChildSubQuestion(index, childIdx, 'priceEnabled', !child.priceEnabled)}
                                                          style={{
                                                            width: 48,
                                                            height: 28,
                                                            borderRadius: 14,
                                                            background: child.priceEnabled ? '#da251c' : '#ccc',
                                                            position: 'relative',
                                                            transition: 'background 0.3s',
                                                            cursor: 'pointer'
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              position: 'absolute',
                                                              top: 2,
                                                              left: child.priceEnabled ? 22 : 2,
                                                              width: 24,
                                                              height: 24,
                                                              borderRadius: 12,
                                                              background: '#fff',
                                                              transition: 'left 0.3s',
                                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                          />
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Price</span>
                                                      </label>

                                                      {/* Maximum Count Limit Toggle */}
                                                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                                        <div
                                                          onClick={() => updateChildSubQuestion(index, childIdx, 'maxCountEnabled', !child.maxCountEnabled)}
                                                          style={{
                                                            width: 48,
                                                            height: 28,
                                                            borderRadius: 14,
                                                            background: child.maxCountEnabled ? '#da251c' : '#ccc',
                                                            position: 'relative',
                                                            transition: 'background 0.3s',
                                                            cursor: 'pointer'
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              position: 'absolute',
                                                              top: 2,
                                                              left: child.maxCountEnabled ? 22 : 2,
                                                              width: 24,
                                                              height: 24,
                                                              borderRadius: 12,
                                                              background: '#fff',
                                                              transition: 'left 0.3s',
                                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                          />
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Maximum Count Limit</span>
                                                      </label>
                                                    </div>

                                                    {/* Options input section with pink background */}
                                                    <div style={{
                                                      background: '#fff0f0',
                                                      borderRadius: 8,
                                                      padding: '16px',
                                                      marginBottom: 12
                                                    }}>
                                                      {/* Label input */}
                                                      <div style={{ marginBottom: 12 }}>
                                                        <label style={{
                                                          display: 'block',
                                                          fontWeight: 600,
                                                          fontSize: '0.85rem',
                                                          marginBottom: 6,
                                                          color: '#333',
                                                          textAlign: 'center'
                                                        }}>
                                                          Labels (comma-separated) <span style={{ color: '#da251c' }}>*</span>
                                                        </label>
                                                        <input
                                                          type="text"
                                                          placeholder="e.g., Male, Female, Other"
                                                          value={child.newOptionLabel || ''}
                                                          onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionLabel', e.target.value)}
                                                          style={{
                                                            width: '100%',
                                                            padding: '8px 10px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: 6,
                                                            fontSize: '0.85rem'
                                                          }}
                                                        />
                                                      </div>

                                                      {/* Price input (if enabled) */}
                                                      {child.priceEnabled && (
                                                        <div style={{ marginBottom: 12 }}>
                                                          <label style={{
                                                            display: 'block',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem',
                                                            marginBottom: 6,
                                                            color: '#333',
                                                            textAlign: 'center'
                                                          }}>
                                                            Prices (comma-separated)
                                                          </label>
                                                          <input
                                                            type="text"
                                                            placeholder="e.g., 100, 200, 150"
                                                            value={child.newOptionPrice || ''}
                                                            onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionPrice', e.target.value)}
                                                            style={{
                                                              width: '100%',
                                                              padding: '8px 10px',
                                                              border: '1px solid #ddd',
                                                              borderRadius: 6,
                                                              fontSize: '0.85rem'
                                                            }}
                                                          />
                                                        </div>
                                                      )}

                                                      {/* Count input (if enabled) */}
                                                      {child.maxCountEnabled && (
                                                        <div style={{ marginBottom: 12 }}>
                                                          <label style={{
                                                            display: 'block',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem',
                                                            marginBottom: 6,
                                                            color: '#333',
                                                            textAlign: 'center'
                                                          }}>
                                                            Counts (comma-separated)
                                                          </label>
                                                          <input
                                                            type="text"
                                                            placeholder="e.g., 50, 75, 100"
                                                            value={child.newOptionCount || ''}
                                                            onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionCount', e.target.value)}
                                                            style={{
                                                              width: '100%',
                                                              padding: '8px 10px',
                                                              border: '1px solid #ddd',
                                                              borderRadius: 6,
                                                              fontSize: '0.85rem'
                                                            }}
                                                          />
                                                        </div>
                                                      )}

                                                      {/* Hint text */}
                                                      <div style={{
                                                        background: '#e8f5e9',
                                                        border: '1px solid #4caf50',
                                                        borderRadius: 6,
                                                        padding: '8px 10px',
                                                        fontSize: '0.75rem',
                                                        color: '#2e7d32',
                                                        textAlign: 'center'
                                                      }}>
                                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                          💡 Tip: You can send different values in a single line
                                                        </div>
                                                        <div>
                                                          • Separate multiple values with comma (,)<br />
                                                          • Example: Male, Female, Other<br />
                                                          • If you have 3 labels, provide 3 prices and 3 counts
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                              {/* Child Mandatory */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Status</label>
                                                <div className="email-toggle-group">
                                                  <button
                                                    type="button"
                                                    className={`email-toggle-btn ${child.subQuestionMandatory === "1" ? "active yes" : ""}`}
                                                    onClick={() => updateChildSubQuestion(index, childIdx, 'subQuestionMandatory', "1")}
                                                    style={{ fontSize: '0.85rem' }}
                                                  >
                                                    <span className="lock-icon">🔒</span> Mandatory
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={`email-toggle-btn ${child.subQuestionMandatory !== "1" ? "active" : ""}`}
                                                    onClick={() => updateChildSubQuestion(index, childIdx, 'subQuestionMandatory', "0")}
                                                    style={{ fontSize: '0.85rem' }}
                                                  >
                                                    <span className="unlock-icon">🔓</span> Optional
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Remove Child Button */}
                                              <button
                                                type="button"
                                                onClick={() => removeChildSubQuestion(index, childIdx)}
                                                style={{
                                                  background: "#fff",
                                                  border: "1px solid #e74c3c",
                                                  color: "#e74c3c",
                                                  borderRadius: 6,
                                                  padding: "6px 12px",
                                                  cursor: "pointer",
                                                  fontSize: "0.85rem"
                                                }}
                                              >
                                                🗑 Remove Child
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div style={{
                                          padding: '16px',
                                          textAlign: 'center',
                                          color: '#999',
                                          backgroundColor: '#fafafa',
                                          borderRadius: '6px',
                                          border: '1px dashed #ddd',
                                          fontSize: '0.85rem'
                                        }}>
                                          No child sub-questions yet. Click "➕ Add Subquestion (Inside This)" to add one.
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        ))}

                        {/* Add More Subquestion Button - shown as + icon */}
                        {subQuestions.length < (selectedQuestion.question_form_option?.length || 0) && (
                          <button
                            type="button"
                            onClick={addSubQuestion}
                            style={{
                              background: "#fff",
                              border: "2px solid #da251c",
                              color: "#da251c",
                              borderRadius: "50%",
                              width: 40,
                              height: 40,
                              cursor: "pointer",
                              fontSize: "1.5rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: 8
                            }}
                            title="Add another subquestion"
                          >
                            +
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Select type: same UI as radio for subquestions + dynamic subquestion forms */}
              {(selectedQuestion.question_form_type || "").toLowerCase() ===
                "select" && (
                  <div className="form-group2">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: 12,
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {/* Toggle Switch */}
                      <div
                        onClick={() => {
                          const newValue = !selectedQuestion.add_subquestions;
                          handleChangeField("add_subquestions", newValue);
                          if (newValue && subQuestions.length === 0) {
                            // Add first subquestion when toggle is turned on
                            addSubQuestion();
                          } else if (!newValue) {
                            // Clear all subquestions when turned off
                            setSubQuestions([]);
                          }
                        }}
                        style={{
                          position: 'relative',
                          width: 48,
                          height: 28,
                          borderRadius: 14,
                          background: selectedQuestion.add_subquestions ? '#da251c' : '#ccc',
                          transition: 'background 0.3s',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: 2,
                            left: selectedQuestion.add_subquestions ? 22 : 2,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            background: '#fff',
                            transition: 'left 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>Add Subquestions</span>
                      <span style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        marginLeft: 'auto'
                      }}>
                        {selectedQuestion.add_subquestions ? subQuestions.length : 0}
                      </span>
                    </label>

                    {selectedQuestion.add_subquestions && (
                      <div style={{ marginTop: 16, width: '100%' }}>
                        {/* Display each subquestion */}
                        {subQuestions.map((subQ, index) => (
                          <div key={index} style={{ marginBottom: 20, width: '100%' }}>
                            {/* Question Option Type Dropdown */}
                            <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                              <label className="form-label">
                                Question Option Type <span style={{ color: "#da251c" }}>*</span>
                              </label>
                              <select
                                className="form-input compact"
                                value={subQ.selectedOptionId || ""}
                                onChange={(e) => {
                                  updateSubQuestion(index, "selectedOptionId", e.target.value);
                                  // Clear error when user selects an option
                                  if (e.target.value) {
                                    setSubQuestionErrors(prev => {
                                      const newErrors = { ...prev };
                                      delete newErrors[`${index}_selectedOptionId`];
                                      return newErrors;
                                    });
                                  }
                                }}
                              >
                                <option value="">-- Select --</option>
                                {getAvailableOptions(index).map((opt) => (
                                  <option key={opt.id} value={String(opt.id)}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {subQuestionErrors[`${index}_selectedOptionId`] && (
                                <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                  {subQuestionErrors[`${index}_selectedOptionId`]}
                                </div>
                              )}
                            </div>

                            {/* Show full form only if option is selected */}
                            {subQ.selectedOptionId && (
                              <>
                                {/* Question Title */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <label className="form-label">
                                    Question Title <span style={{ color: "#da251c" }}>*</span>
                                    {subQ.subQuestionMandatory === "1" && (
                                      <span style={{ color: "#da251c", marginLeft: 8, fontSize: "0.9em" }}>
                                        * (Mandatory)
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input compact"
                                    value={subQ.subQuestionTitle || ""}
                                    onChange={(e) => {
                                      updateSubQuestion(index, "subQuestionTitle", e.target.value);
                                      // Clear error when user types
                                      if (e.target.value.trim()) {
                                        setSubQuestionErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[`${index}_title`];
                                          return newErrors;
                                        });
                                      }
                                    }}
                                    placeholder=""
                                  />
                                  {subQuestionErrors[`${index}_title`] && (
                                    <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                      {subQuestionErrors[`${index}_title`]}
                                    </div>
                                  )}
                                </div>

                                {/* Hint Type and Sub Question Hint - side by side */}
                                <div style={{ display: 'flex', gap: '16px', marginBottom: 12, width: '100%' }}>
                                  {/* Hint Type */}
                                  <div className="form-group2" style={{ flex: 1 }}>
                                    <label className="form-label">Hint Type <span style={{ color: "#da251c" }}>*</span></label>
                                    <select
                                      className="form-input compact"
                                      value={subQ.subQueHintType || "1"}
                                      onChange={(e) =>
                                        updateSubQuestion(index, "subQueHintType", e.target.value)
                                      }
                                    >
                                      <option value="1">Text</option>
                                      <option value="2">Image</option>
                                    </select>
                                  </div>

                                  {/* Sub Question Hint */}
                                  <div className="form-group2" style={{ flex: 1 }}>
                                    <label className="form-label">Sub Question Hint</label>
                                    {subQ.subQueHintType === "2" ? (
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="form-input compact"
                                        onChange={(e) => {
                                          const file = e.target.files && e.target.files[0];
                                          updateSubQuestion(index, "subQuestionHintFile", file || null);
                                        }}
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        className="form-input compact"
                                        value={subQ.subQuestionHint || ""}
                                        onChange={(e) =>
                                          updateSubQuestion(index, "subQuestionHint", e.target.value)
                                        }
                                        placeholder=""
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Question Input Type */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <label className="form-label">
                                    Question Input Type <span style={{ color: "#da251c" }}>*</span>
                                  </label>
                                  <select
                                    className="form-input compact"
                                    value={subQ.subQuestionFormType || ""}
                                    onChange={(e) => {
                                      updateSubQuestion(index, "subQuestionFormType", e.target.value);
                                      // Clear error when user selects
                                      if (e.target.value) {
                                        setSubQuestionErrors(prev => {
                                          const newErrors = { ...prev };
                                          delete newErrors[`${index}_formType`];
                                          return newErrors;
                                        });
                                      }
                                    }}
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="mobile">Mobile</option>
                                    <option value="amount">Amount</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="checkbox">Checkboxes</option>
                                    <option value="radio">Radio</option>
                                    <option value="date">Date</option>
                                    <option value="time">Time</option>
                                    <option value="file">File</option>
                                    <option value="select">Select (Dropdown)</option>
                                  </select>
                                  {subQuestionErrors[`${index}_formType`] && (
                                    <div style={{ color: "#da251c", fontSize: "0.85rem", marginTop: 4 }}>
                                      {subQuestionErrors[`${index}_formType`]}
                                    </div>
                                  )}
                                </div>

                                {/* Options UI for checkbox, radio, and select types */}
                                {(subQ.subQuestionFormType === 'checkbox' ||
                                  subQ.subQuestionFormType === 'radio' ||
                                  subQ.subQuestionFormType === 'select') && (
                                    <div style={{ marginBottom: 12, width: '100%' }}>
                                      {/* Price and Maximum Count Limit toggle switches */}
                                      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                                        {/* Price Toggle */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                          <div
                                            onClick={() => updateSubQuestion(index, 'priceEnabled', !subQ.priceEnabled)}
                                            style={{
                                              width: 48,
                                              height: 28,
                                              borderRadius: 14,
                                              background: subQ.priceEnabled ? '#da251c' : '#ccc',
                                              position: 'relative',
                                              transition: 'background 0.3s',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <div
                                              style={{
                                                position: 'absolute',
                                                top: 2,
                                                left: subQ.priceEnabled ? 22 : 2,
                                                width: 24,
                                                height: 24,
                                                borderRadius: 12,
                                                background: '#fff',
                                                transition: 'left 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                              }}
                                            />
                                          </div>
                                          <span style={{ fontWeight: 500, fontSize: '1rem' }}>Price</span>
                                        </label>

                                        {/* Maximum Count Limit Toggle */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                          <div
                                            onClick={() => updateSubQuestion(index, 'maxCountEnabled', !subQ.maxCountEnabled)}
                                            style={{
                                              width: 48,
                                              height: 28,
                                              borderRadius: 14,
                                              background: subQ.maxCountEnabled ? '#da251c' : '#ccc',
                                              position: 'relative',
                                              transition: 'background 0.3s',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            <div
                                              style={{
                                                position: 'absolute',
                                                top: 2,
                                                left: subQ.maxCountEnabled ? 22 : 2,
                                                width: 24,
                                                height: 24,
                                                borderRadius: 12,
                                                background: '#fff',
                                                transition: 'left 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                              }}
                                            />
                                          </div>
                                          <span style={{ fontWeight: 500, fontSize: '1rem' }}>Maximum Count Limit</span>
                                        </label>
                                      </div>

                                      {/* Options Table */}
                                      <div style={{
                                        background: '#fff0f0',
                                        borderRadius: 8,
                                        padding: '16px',
                                        marginBottom: 12
                                      }}>
                                        {/* Existing options display */}
                                        {(subQ.options || []).length > 0 && (
                                          <>
                                            {/* Table Header */}
                                            <div style={{
                                              display: 'grid',
                                              gridTemplateColumns: subQ.priceEnabled && subQ.maxCountEnabled
                                                ? '2fr 1fr 1fr auto'
                                                : subQ.priceEnabled || subQ.maxCountEnabled
                                                  ? '2fr 1fr auto'
                                                  : '1fr auto',
                                              gap: 16,
                                              marginBottom: 12,
                                              paddingBottom: 8,
                                              borderBottom: '2px solid #da251c'
                                            }}>
                                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Label</div>
                                              {subQ.priceEnabled && <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Price</div>}
                                              {subQ.maxCountEnabled && <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Count</div>}
                                              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Action</div>
                                            </div>

                                            {/* Existing options */}
                                            {(subQ.options || []).map((opt, optIdx) => (
                                              <div
                                                key={optIdx}
                                                style={{
                                                  display: 'grid',
                                                  gridTemplateColumns: subQ.priceEnabled && subQ.maxCountEnabled
                                                    ? '2fr 1fr 1fr auto'
                                                    : subQ.priceEnabled || subQ.maxCountEnabled
                                                      ? '2fr 1fr auto'
                                                      : '1fr auto',
                                                  gap: 16,
                                                  alignItems: 'center',
                                                  marginBottom: 8,
                                                  paddingBottom: 8,
                                                  borderBottom: '1px solid #eee'
                                                }}
                                              >
                                                <div style={{ color: '#333' }}>{opt.label || opt}</div>
                                                {subQ.priceEnabled && <div style={{ color: '#666' }}>{opt.price || '-'}</div>}
                                                {subQ.maxCountEnabled && <div style={{ color: '#666' }}>{opt.count || '-'}</div>}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const newOptions = [...(subQ.options || [])];
                                                    newOptions.splice(optIdx, 1);
                                                    updateSubQuestion(index, 'options', newOptions);
                                                  }}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#e74c3c',
                                                    cursor: 'pointer',
                                                    fontSize: '1.2rem',
                                                    padding: 4
                                                  }}
                                                  title="Delete option"
                                                >
                                                  🗑
                                                </button>
                                              </div>
                                            ))}
                                          </>
                                        )}

                                        {/* Comma-separated input section */}
                                        <div style={{
                                          marginTop: (subQ.options || []).length > 0 ? 16 : 0,
                                          paddingTop: (subQ.options || []).length > 0 ? 16 : 0,
                                          borderTop: (subQ.options || []).length > 0 ? '1px dashed #ddd' : 'none'
                                        }}>
                                          {/* Label input */}
                                          <div style={{ marginBottom: 12 }}>
                                            <label style={{
                                              display: 'block',
                                              fontWeight: 600,
                                              fontSize: '0.9rem',
                                              marginBottom: 6,
                                              color: '#333'
                                            }}>
                                              Labels (comma-separated) <span style={{ color: '#da251c' }}>*</span>
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="e.g., Male, Female, Other"
                                              value={subQ.newOptionLabel || ''}
                                              onChange={(e) => updateSubQuestion(index, 'newOptionLabel', e.target.value)}
                                              style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: 6,
                                                fontSize: '0.95rem'
                                              }}
                                            />
                                          </div>

                                          {/* Price input (if enabled) */}
                                          {subQ.priceEnabled && (
                                            <div style={{ marginBottom: 12 }}>
                                              <label style={{
                                                display: 'block',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                marginBottom: 6,
                                                color: '#333'
                                              }}>
                                                Prices (comma-separated)
                                              </label>
                                              <input
                                                type="text"
                                                placeholder="e.g., 100, 200, 150"
                                                value={subQ.newOptionPrice || ''}
                                                onChange={(e) => updateSubQuestion(index, 'newOptionPrice', e.target.value)}
                                                style={{
                                                  width: '100%',
                                                  padding: '10px 12px',
                                                  border: '1px solid #ddd',
                                                  borderRadius: 6,
                                                  fontSize: '0.95rem'
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Count input (if enabled) */}
                                          {subQ.maxCountEnabled && (
                                            <div style={{ marginBottom: 12 }}>
                                              <label style={{
                                                display: 'block',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                marginBottom: 6,
                                                color: '#333'
                                              }}>
                                                Counts (comma-separated)
                                              </label>
                                              <input
                                                type="text"
                                                placeholder="e.g., 50, 75, 100"
                                                value={subQ.newOptionCount || ''}
                                                onChange={(e) => updateSubQuestion(index, 'newOptionCount', e.target.value)}
                                                style={{
                                                  width: '100%',
                                                  padding: '10px 12px',
                                                  border: '1px solid #ddd',
                                                  borderRadius: 6,
                                                  fontSize: '0.95rem'
                                                }}
                                              />
                                            </div>
                                          )}

                                          {/* Hint text */}
                                          <div style={{
                                            background: '#e8f5e9',
                                            border: '1px solid #4caf50',
                                            borderRadius: 6,
                                            padding: '10px 12px',
                                            fontSize: '0.85rem',
                                            color: '#2e7d32'
                                          }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                              💡 Tip: You can send different values in a single line
                                            </div>
                                            <div>
                                              • Separate multiple values with comma (,)<br />
                                              • Example: Male, Female, Other<br />
                                              • If you have 3 labels, provide 3 prices and 3 counts
                                            </div>
                                          </div>

                                          {/* Error message display */}
                                          {subQ.optionError && (
                                            <div style={{
                                              background: '#ffebee',
                                              border: '1px solid #f44336',
                                              borderRadius: 6,
                                              padding: '10px 12px',
                                              marginTop: 12,
                                              fontSize: '0.85rem',
                                              color: '#c62828'
                                            }}>
                                              ⚠️ {subQ.optionError}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* Mandatory/Optional Toggle */}
                                <div className="form-group2" style={{ marginBottom: 12, width: '100%' }}>
                                  <div className="status-toggle">
                                    <button
                                      type="button"
                                      className={`status-btn ${subQ.subQuestionMandatory === "1" ? "active" : ""}`}
                                      onClick={() =>
                                        updateSubQuestion(index, "subQuestionMandatory", "1")
                                      }
                                    >
                                      <span className="star-icon">★</span> Mandatory
                                    </button>
                                    <button
                                      type="button"
                                      className={`status-btn ${subQ.subQuestionMandatory !== "1" ? "active" : ""}`}
                                      onClick={() =>
                                        updateSubQuestion(index, "subQuestionMandatory", "0")
                                      }
                                    >
                                      <span className="star-icon">☆</span> Optional
                                    </button>
                                  </div>
                                </div>

                                {/* Delete button for this subquestion (except first one) */}
                                {index > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSubQuestion(index)}
                                    style={{
                                      background: "#fff",
                                      border: "1px solid #e74c3c",
                                      color: "#e74c3c",
                                      borderRadius: 6,
                                      padding: "6px 12px",
                                      cursor: "pointer",
                                      fontSize: "0.9rem",
                                      marginBottom: 12
                                    }}
                                  >
                                    🗑 Remove
                                  </button>
                                )}

                                {/* CHILD SUBQUESTIONS SECTION - Only show for option-based input types */}
                                {(subQ.subQuestionFormType === 'radio' ||
                                  subQ.subQuestionFormType === 'checkbox' ||
                                  subQ.subQuestionFormType === 'select') && (
                                    <div style={{
                                      marginTop: '20px',
                                      paddingTop: '16px',
                                      borderTop: '2px dashed #4CAF50'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#4CAF50' }}>
                                          🔹 Child Sub-Questions (Unlimited)
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => addChildSubQuestion(index)}
                                          style={{
                                            padding: '6px 14px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                          }}
                                        >
                                          ➕ Add Subquestion (Inside This)
                                        </button>
                                      </div>

                                      {/* Render Child Subquestions */}
                                      {subQ.childSubquestions && subQ.childSubquestions.length > 0 ? (
                                        <div>
                                          {subQ.childSubquestions.map((child, childIdx) => (
                                            <div
                                              key={childIdx}
                                              style={{
                                                marginLeft: '20px',
                                                marginBottom: '16px',
                                                padding: '16px',
                                                borderLeft: '4px solid #4CAF50',
                                                backgroundColor: '#f9fdf9',
                                                borderRadius: '6px'
                                              }}
                                            >
                                              <div style={{ fontSize: '0.8rem', color: '#4CAF50', marginBottom: '12px', fontWeight: 'bold' }}>
                                                📌 Child Sub-Question #{childIdx + 1}
                                              </div>

                                              {/* Child Title */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Title *</label>
                                                <input
                                                  type="text"
                                                  className="form-input compact"
                                                  value={child.subQuestionTitle || ""}
                                                  onChange={(e) => updateChildSubQuestion(index, childIdx, 'subQuestionTitle', e.target.value)}
                                                  placeholder="Enter child title"
                                                />
                                              </div>

                                              {/* Child Hint Type and Hint - side by side */}
                                              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                                {/* Hint Type */}
                                                <div className="form-group2" style={{ flex: 1 }}>
                                                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Hint Type <span style={{ color: "#da251c" }}>*</span></label>
                                                  <select
                                                    className="form-input compact"
                                                    value={child.subQueHintType || "1"}
                                                    onChange={(e) => updateChildSubQuestion(index, childIdx, 'subQueHintType', e.target.value)}
                                                  >
                                                    <option value="1">Text</option>
                                                    <option value="2">Image</option>
                                                  </select>
                                                </div>

                                                {/* Sub Question Hint */}
                                                <div className="form-group2" style={{ flex: 1 }}>
                                                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Sub Question Hint</label>
                                                  {child.subQueHintType === "2" ? (
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="form-input compact"
                                                      onChange={(e) => {
                                                        const file = e.target.files && e.target.files[0];
                                                        updateChildSubQuestion(index, childIdx, 'subQuestionHintFile', file || null);
                                                      }}
                                                    />
                                                  ) : (
                                                    <input
                                                      type="text"
                                                      className="form-input compact"
                                                      value={child.subQuestionHint || ""}
                                                      onChange={(e) => updateChildSubQuestion(index, childIdx, 'subQuestionHint', e.target.value)}
                                                      placeholder=""
                                                    />
                                                  )}
                                                </div>
                                              </div>

                                              {/* Child Form Type */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Form Type <span style={{ color: "#da251c" }}>*</span></label>
                                                <select
                                                  className="form-input compact"
                                                  value={child.subQuestionFormType || ""}
                                                  onChange={(e) => {
                                                    updateChildSubQuestion(index, childIdx, 'subQuestionFormType', e.target.value);
                                                    // Clear error when user selects
                                                    if (e.target.value) {
                                                      setSubQuestionErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors[`${index}_child_${childIdx}_formType`];
                                                        return newErrors;
                                                      });
                                                    }
                                                  }}
                                                >
                                                  <option value="">-- Select --</option>
                                                  <option value="text">Text</option>
                                                  <option value="email">Email</option>
                                                  <option value="mobile">Mobile</option>
                                                  <option value="amount">Amount</option>
                                                  <option value="textarea">Textarea</option>
                                                  <option value="checkbox">Checkboxes</option>
                                                  <option value="radio">Radio</option>
                                                  <option value="date">Date</option>
                                                  <option value="time">Time</option>
                                                  <option value="file">File</option>
                                                  <option value="select">Select (Dropdown)</option>
                                                </select>
                                                {subQuestionErrors[`${index}_child_${childIdx}_formType`] && (
                                                  <div style={{ color: "#da251c", fontSize: "0.75rem", marginTop: 4 }}>
                                                    {subQuestionErrors[`${index}_child_${childIdx}_formType`]}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Options UI for checkbox, radio, and select types in child subquestions */}
                                              {(child.subQuestionFormType === 'checkbox' ||
                                                child.subQuestionFormType === 'radio' ||
                                                child.subQuestionFormType === 'select') && (
                                                  <div style={{ marginBottom: 12, width: '100%' }}>
                                                    {/* Price and Maximum Count Limit toggle switches */}
                                                    <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                                                      {/* Price Toggle */}
                                                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                                        <div
                                                          onClick={() => updateChildSubQuestion(index, childIdx, 'priceEnabled', !child.priceEnabled)}
                                                          style={{
                                                            width: 48,
                                                            height: 28,
                                                            borderRadius: 14,
                                                            background: child.priceEnabled ? '#da251c' : '#ccc',
                                                            position: 'relative',
                                                            transition: 'background 0.3s',
                                                            cursor: 'pointer'
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              position: 'absolute',
                                                              top: 2,
                                                              left: child.priceEnabled ? 22 : 2,
                                                              width: 24,
                                                              height: 24,
                                                              borderRadius: 12,
                                                              background: '#fff',
                                                              transition: 'left 0.3s',
                                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                          />
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Price</span>
                                                      </label>

                                                      {/* Maximum Count Limit Toggle */}
                                                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                                                        <div
                                                          onClick={() => updateChildSubQuestion(index, childIdx, 'maxCountEnabled', !child.maxCountEnabled)}
                                                          style={{
                                                            width: 48,
                                                            height: 28,
                                                            borderRadius: 14,
                                                            background: child.maxCountEnabled ? '#da251c' : '#ccc',
                                                            position: 'relative',
                                                            transition: 'background 0.3s',
                                                            cursor: 'pointer'
                                                          }}
                                                        >
                                                          <div
                                                            style={{
                                                              position: 'absolute',
                                                              top: 2,
                                                              left: child.maxCountEnabled ? 22 : 2,
                                                              width: 24,
                                                              height: 24,
                                                              borderRadius: 12,
                                                              background: '#fff',
                                                              transition: 'left 0.3s',
                                                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                          />
                                                        </div>
                                                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Maximum Count Limit</span>
                                                      </label>
                                                    </div>

                                                    {/* Options input section with pink background */}
                                                    <div style={{
                                                      background: '#fff0f0',
                                                      borderRadius: 8,
                                                      padding: '16px',
                                                      marginBottom: 12
                                                    }}>
                                                      {/* Label input */}
                                                      <div style={{ marginBottom: 12 }}>
                                                        <label style={{
                                                          display: 'block',
                                                          fontWeight: 600,
                                                          fontSize: '0.85rem',
                                                          marginBottom: 6,
                                                          color: '#333',
                                                          textAlign: 'center'
                                                        }}>
                                                          Labels (comma-separated) <span style={{ color: '#da251c' }}>*</span>
                                                        </label>
                                                        <input
                                                          type="text"
                                                          placeholder="e.g., Male, Female, Other"
                                                          value={child.newOptionLabel || ''}
                                                          onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionLabel', e.target.value)}
                                                          style={{
                                                            width: '100%',
                                                            padding: '8px 10px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: 6,
                                                            fontSize: '0.85rem'
                                                          }}
                                                        />
                                                      </div>

                                                      {/* Price input (if enabled) */}
                                                      {child.priceEnabled && (
                                                        <div style={{ marginBottom: 12 }}>
                                                          <label style={{
                                                            display: 'block',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem',
                                                            marginBottom: 6,
                                                            color: '#333',
                                                            textAlign: 'center'
                                                          }}>
                                                            Prices (comma-separated)
                                                          </label>
                                                          <input
                                                            type="text"
                                                            placeholder="e.g., 100, 200, 150"
                                                            value={child.newOptionPrice || ''}
                                                            onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionPrice', e.target.value)}
                                                            style={{
                                                              width: '100%',
                                                              padding: '8px 10px',
                                                              border: '1px solid #ddd',
                                                              borderRadius: 6,
                                                              fontSize: '0.85rem'
                                                            }}
                                                          />
                                                        </div>
                                                      )}

                                                      {/* Count input (if enabled) */}
                                                      {child.maxCountEnabled && (
                                                        <div style={{ marginBottom: 12 }}>
                                                          <label style={{
                                                            display: 'block',
                                                            fontWeight: 600,
                                                            fontSize: '0.85rem',
                                                            marginBottom: 6,
                                                            color: '#333',
                                                            textAlign: 'center'
                                                          }}>
                                                            Counts (comma-separated)
                                                          </label>
                                                          <input
                                                            type="text"
                                                            placeholder="e.g., 50, 75, 100"
                                                            value={child.newOptionCount || ''}
                                                            onChange={(e) => updateChildSubQuestion(index, childIdx, 'newOptionCount', e.target.value)}
                                                            style={{
                                                              width: '100%',
                                                              padding: '8px 10px',
                                                              border: '1px solid #ddd',
                                                              borderRadius: 6,
                                                              fontSize: '0.85rem'
                                                            }}
                                                          />
                                                        </div>
                                                      )}

                                                      {/* Hint text */}
                                                      <div style={{
                                                        background: '#e8f5e9',
                                                        border: '1px solid #4caf50',
                                                        borderRadius: 6,
                                                        padding: '8px 10px',
                                                        fontSize: '0.75rem',
                                                        color: '#2e7d32',
                                                        textAlign: 'center'
                                                      }}>
                                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                          💡 Tip: You can send different values in a single line
                                                        </div>
                                                        <div>
                                                          • Separate multiple values with comma (,)<br />
                                                          • Example: Male, Female, Other<br />
                                                          • If you have 3 labels, provide 3 prices and 3 counts
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}

                                              {/* Child Mandatory */}
                                              <div className="form-group2" style={{ marginBottom: '12px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Status</label>
                                                <div className="email-toggle-group">
                                                  <button
                                                    type="button"
                                                    className={`email-toggle-btn ${child.subQuestionMandatory === "1" ? "active yes" : ""}`}
                                                    onClick={() => updateChildSubQuestion(index, childIdx, 'subQuestionMandatory', "1")}
                                                    style={{ fontSize: '0.85rem' }}
                                                  >
                                                    <span className="lock-icon">🔒</span> Mandatory
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={`email-toggle-btn ${child.subQuestionMandatory !== "1" ? "active" : ""}`}
                                                    onClick={() => updateChildSubQuestion(index, childIdx, 'subQuestionMandatory', "0")}
                                                    style={{ fontSize: '0.85rem' }}
                                                  >
                                                    <span className="unlock-icon">🔓</span> Optional
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Remove Child Button */}
                                              <button
                                                type="button"
                                                onClick={() => removeChildSubQuestion(index, childIdx)}
                                                style={{
                                                  background: "#fff",
                                                  border: "1px solid #e74c3c",
                                                  color: "#e74c3c",
                                                  borderRadius: 6,
                                                  padding: "6px 12px",
                                                  cursor: "pointer",
                                                  fontSize: "0.85rem"
                                                }}
                                              >
                                                🗑 Remove Child
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div style={{
                                          padding: '16px',
                                          textAlign: 'center',
                                          color: '#999',
                                          backgroundColor: '#fafafa',
                                          borderRadius: '6px',
                                          border: '1px dashed #ddd',
                                          fontSize: '0.85rem'
                                        }}>
                                          No child sub-questions yet. Click "➕ Add Subquestion (Inside This)" to add one.
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        ))}

                        {/* Add More Subquestion Button - shown as + icon */}
                        {subQuestions.length < (selectedQuestion.question_form_option?.length || 0) && (
                          <button
                            type="button"
                            onClick={addSubQuestion}
                            style={{
                              background: "#fff",
                              border: "2px solid #da251c",
                              color: "#da251c",
                              borderRadius: "50%",
                              width: 40,
                              height: 40,
                              cursor: "pointer",
                              fontSize: "1.5rem",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginTop: 8
                            }}
                            title="Add another subquestion"
                          >
                            +
                          </button>
                        )}
                      </div>
                    )}
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

      {/* Subquestion Details Modal */}
      {showSubQuestionModal && selectedQuestionForSubDetails && (
        <div className="modal-overlay" onClick={() => setShowSubQuestionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header-questions">
              <h2>Sub Questions Details</h2>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {console.log("=== MODAL DEBUG ===", selectedQuestionForSubDetails)}
              {selectedQuestionForSubDetails.ChildQuestionArray &&
                Array.isArray(selectedQuestionForSubDetails.ChildQuestionArray) &&
                selectedQuestionForSubDetails.ChildQuestionArray.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedQuestionForSubDetails.ChildQuestionArray.map((childItem, idx) => (
                    <div key={idx}>
                      {/* Parent Question */}
                      <div style={{
                        background: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.2rem' }}>↳</span>
                          <span style={{ fontWeight: 500 }}>{selectedQuestionForSubDetails.question_label}</span>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>✓</span>
                      </div>

                      {/* Selected Option */}
                      <div style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        marginLeft: 20
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.2rem' }}>↳</span>
                          <span style={{ fontWeight: 500 }}>{childItem.question_label}</span>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>✓</span>
                      </div>

                      {/* Child Questions (recursive) */}
                      {childItem.ChildQuestionArray && Array.isArray(childItem.ChildQuestionArray) &&
                        childItem.ChildQuestionArray.length > 0 && childItem.ChildQuestionArray.map((nestedChild, nestedIdx) => (
                          <div key={nestedIdx} style={{
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: 8,
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginLeft: 40
                          }}>
                            <span style={{ fontWeight: 500 }}>{nestedChild.question_label}</span>
                            <span style={{ fontSize: '1.2rem' }}>✓</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>No subquestions found</p>
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="btn-modal-close"
                onClick={() => setShowSubQuestionModal(false)}
                style={{
                  width: '80%',
                  color: '#da251c',
                  border: '1px solid #da251c',
                  background: '#fff'
                }}
              >
                Close
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
                    {apiQuestions[formName].map((q, idx) => {
                      // Check if this is State or City question
                      const questionLabel = (q.question_label || "").trim();
                      const isState = questionLabel.toLowerCase() === "state";
                      const isCity = questionLabel.toLowerCase() === "city";

                      // Determine if we should show info icon instead of + button
                      const showStateInfo = isState && !isCountryAdded();
                      const showCityInfo = isCity && !isStateAdded();
                      const showInfoIcon = showStateInfo || showCityInfo;

                      // Tooltip message
                      let tooltipMessage = "";
                      if (showStateInfo) {
                        tooltipMessage = "Please add Country first. Without Country, State cannot be added.";
                      } else if (showCityInfo) {
                        tooltipMessage = "Please add State first. Without State, City cannot be added.";
                      }

                      return (
                        <div key={q.id} className="question-card">
                          <div className="question-row">
                            <div className="question-label-wrap">
                              <div className="question-label">
                                {q.question_label}
                              </div>
                            </div>
                            <div className="question-action">
                              {isQuestionAdded(q) ? (
                                <>
                                  <button
                                    className="btn-toggle added"
                                    title="Already added"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    ✓
                                  </button>
                                  {/* Eye icon for questions with subquestions */}
                                  {hasSubQuestions(q) && (
                                    <button
                                      className="btn-toggle"
                                      title="Subquestion Details"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        console.log("=== EYE ICON CLICKED ===");
                                        console.log("Fetching subquestion tree for question:", q);

                                        try {
                                          const eventId = sessionStorage.getItem("event_id") || "";
                                          const payload = {
                                            event_id: eventId,
                                            question_id: q.id
                                          };

                                          console.log("Calling viewSubQuestionTree API with:", payload);
                                          const response = await authAPI.viewSubQuestionTree(payload);
                                          console.log("viewSubQuestionTree response:", response);

                                          if (response && response.data && response.data.length > 0) {
                                            setSelectedQuestionForSubDetails(response.data[0]);
                                            setShowSubQuestionModal(true);
                                          } else {
                                            console.error("No data returned from API");
                                            alert("Failed to load subquestion details");
                                          }
                                        } catch (error) {
                                          console.error("Error fetching subquestion tree:", error);
                                          alert("Failed to load subquestion details");
                                        }
                                      }}
                                      style={{
                                        marginLeft: 8,
                                        background: '#4a90e2',
                                        color: '#fff',
                                        fontSize: '1.2rem'
                                      }}
                                    >
                                      👁
                                    </button>
                                  )}
                                </>
                              ) : showInfoIcon ? (
                                <button
                                  className="btn-toggle info-icon"
                                  title={tooltipMessage}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(tooltipMessage);
                                  }}
                                  style={{
                                    background: '#ffc107',
                                    color: '#fff',
                                    cursor: 'help',
                                    fontSize: '1.2rem'
                                  }}
                                >
                                  ℹ️
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
                      );
                    })}
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
