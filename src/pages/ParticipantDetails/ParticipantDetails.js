import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./ParticipantDetails.css";

export default function ParticipantDetails() {
  // Get price and coupon info from localStorage
  const couponDiscount = parseFloat(localStorage.getItem("couponDiscount")) || 0;
  const couponCode = localStorage.getItem("couponCode") || "";
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    participantType: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    gender: "",
    dob: "",
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    bloodGroup: "",
    tshirtSize: "",
    idProofType: "",
    idProofFile: null,
    emergencyContactName: "",
    emergencyContactNumber: "",
    termsAccepted: false,
  });

  // State for dynamic data
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lastLogin, setLastLogin] = useState(null);
  const [loading, setLoading] = useState(true);
  // Country, State, City dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [formQuestions, setFormQuestions] = useState(null); // Keyed by ticket ID
  const [termsConditions, setTermsConditions] = useState([]); // Terms and Conditions from API
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [participantForms, setParticipantForms] = useState([]); // Array of participant form data
  const [selectedTickets, setSelectedTickets] = useState([]); // Tickets from localStorage
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0); // For Save & Next
  const [activeQuestionTab, setActiveQuestionTab] = useState({}); // Track active tab for each participant {participantIndex: groupName}
  const [parentSelections, setParentSelections] = useState({}); // Track parent question selections for conditional subquestions {participantIndex_questionId: selectedValue}
  const [termsAccepted, setTermsAccepted] = useState(false); // Track terms and conditions acceptance

  const fieldMapping = {
    firstname: "firstName",
    lastname: "lastName",
    email: "email",
    mobile: "mobile",
    gender: "gender",
    dob: "dob",
    address1: "addressLine1",
    address2: "addressLine2",
    country: "country",
    state: "state",
    city: "city",
    pincode: "pincode",
    blood_group: "bloodGroup",
    t_shirt_size: "tshirtSize",
    id_proof_type: "idProofType",
    emergency_contact_person: "emergencyContactName",
    emergency_contact_no1: "emergencyContactNumber"
  };

  // Initialize participant forms based on ticket quantity
  useEffect(() => {
    const ticketQuantity = parseInt(localStorage.getItem("ticketQuantity")) || 1;
    const ticketsData = localStorage.getItem("selectedTickets");
    let tickets = [];

    try {
      tickets = ticketsData ? JSON.parse(ticketsData) : [];
    } catch (e) {
      console.error("Error parsing selectedTickets:", e);
    }

    setSelectedTickets(tickets);

    // Create array of participant forms
    const forms = Array.from({ length: ticketQuantity }, (_, index) => {
      // Assign ticket to each participant based on quantity
      let assignedTicket = null;
      let count = 0;

      for (let i = 0; i < tickets.length; i++) {
        count += tickets[i].quantity;
        if (index < count) {
          assignedTicket = tickets[i];
          break;
        }
      }

      return {
        participantIndex: index,
        ticketInfo: assignedTicket || (tickets[0] || null),
        formData: {
          participantType: "",
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          gender: "",
          dob: "",
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pincode: "",
          bloodGroup: "",
          tshirtSize: "",
          idProofType: "",
          idProofFile: null,
          emergencyContactName: "",
          emergencyContactNumber: "",
          termsAccepted: false,
        }
      };
    });

    setParticipantForms(forms);
    console.log("✅ Initialized", ticketQuantity, "participant forms", forms);
  }, []);

  // Fetch all data on page load
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Call events API
        const eventRes = await authAPI.getEvents({ event_id: eventId });
        if (eventRes && eventRes.EventData && eventRes.EventData.length > 0) {
          setEvent(eventRes.EventData[0]);
        }

        // 2. Call get profile API
        const profileRes = await authAPI.getProfile();
        if (profileRes && profileRes.data) {
          setProfile(profileRes.data);
        }

        // 3. Call check last login API
        const userData = localStorage.getItem("userData");
        let user_id = null;
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            user_id = parsed.ID || parsed.id || null;
          } catch (e) {
            console.error("Error parsing userData:", e);
          }
        }
        const lastLoginRes = await authAPI.checkUserLastLoginDetails(user_id);
        setLastLogin(lastLoginRes);

        // 4. Fetch countries
        const countriesRes = await authAPI.getCountries();
        console.log("Fetched countries:", countriesRes);
        if (
          countriesRes &&
          countriesRes.data &&
          Array.isArray(countriesRes.data.AllCountries)
        ) {
          setCountries(countriesRes.data.AllCountries);
        }
        // 5. Fetch states for default country (India or first country)
        let countryId = null;
        if (countriesRes && countriesRes.data && countriesRes.data.length > 0) {
          const india = countriesRes.data.find(
            (c) => c.country_name?.toLowerCase() === "india"
          );
          countryId = india ? india.id : countriesRes.data[0].id;
        }
        if (countryId) {
          const statesRes = await authAPI.getStates({ country_id: countryId });
          console.log("Fetched states:", statesRes);
          if (
            statesRes &&
            statesRes.data &&
            Array.isArray(statesRes.data.AllStates)
          ) {
            setStates(statesRes.data.AllStates);
          }
        }
        // 6. Fetch cities for default state (first state)
        let stateId = null;
        if (states && states.length > 0) {
          stateId = states[0].id;
        }
        if (stateId) {
          const citiesRes = await authAPI.getCities({ state_id: stateId });
          console.log("Fetched cities:", citiesRes);
          if (
            citiesRes &&
            citiesRes.data &&
            Array.isArray(citiesRes.data.AllCities)
          ) {
            setCities(citiesRes.data.AllCities);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [eventId]);

  // Fetch ticket and then form questions
  useEffect(() => {
    const fetchTicketAndQuestions = async () => {
      try {
        // 1. Fetch Ticket
        const ticketRes = await authAPI.getEventTicket(eventId);
        let currentTicket = null;
        if (ticketRes && ticketRes.data && ticketRes.data.event_tickets) {
          const title = localStorage.getItem("selectedCategoryTitle");
          if (title) {
            const found = ticketRes.data.event_tickets.find(
              (t) =>
                t.ticket_name === title || t.display_ticket_name === title
            );
            if (found) {
              setTicket(found);
              currentTicket = found;
            }
          }
        }

        // 2. Fetch Form Questions with dynamic ticket data
        // Get ticket quantity and selected tickets from localStorage
        const ticketQuantity = parseInt(localStorage.getItem("ticketQuantity")) || 1;
        const ticketsData = localStorage.getItem("selectedTickets");
        let tickets = [];

        try {
          tickets = ticketsData ? JSON.parse(ticketsData) : [];
        } catch (e) {
          console.error("Error parsing selectedTickets:", e);
        }

        // Build AllTickets array with count from each ticket's quantity
        const allTicketsPayload = tickets.length > 0
          ? tickets.map(t => ({ ...t, count: t.quantity }))
          : currentTicket ? [{ ...currentTicket, count: ticketQuantity }] : [];

        console.log("🎫 Tickets from localStorage:", tickets);
        console.log("📦 AllTickets payload:", allTicketsPayload);

        if (allTicketsPayload.length > 0) {
          // Create FormData instead of JSON object
          const formData = new FormData();
          formData.append("event_id", eventId);
          formData.append("total_attendee", ticketQuantity);

          // Add each ticket's data with array notation
          allTicketsPayload.forEach((ticket, index) => {
            // Add all ticket properties with bracket notation
            Object.keys(ticket).forEach(key => {
              const value = ticket[key];

              // Handle nested objects (like ticket_calculation_details)
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.keys(value).forEach(nestedKey => {
                  formData.append(`AllTickets[${index}][${key}][${nestedKey}]`, value[nestedKey]);
                });
              } else {
                // Simple values
                formData.append(`AllTickets[${index}][${key}]`, value !== null && value !== undefined ? value : '');
              }
            });
          });

          console.log("📤 Fetching form questions with FormData:");
          // Log FormData entries for debugging
          for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
          }

          const questionsRes = await authAPI.getFormQuestions(formData);
          if (questionsRes && questionsRes.data) {
            if (questionsRes.data.FormQuestions) {
              setFormQuestions(questionsRes.data.FormQuestions);
              console.log("✅ Form questions received:", questionsRes.data.FormQuestions);
            }
            // Save TermsConditions if present
            if (questionsRes.data.TermsConditions && Array.isArray(questionsRes.data.TermsConditions)) {
              setTermsConditions(questionsRes.data.TermsConditions);
              console.log("✅ Terms and Conditions received:", questionsRes.data.TermsConditions);
            } else {
              setTermsConditions([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ticket or questions:", error);
      }
    };
    if (eventId) {
      fetchTicketAndQuestions();
    }
  }, [eventId]);

  // Auto-fill form when "Myself" is selected
  useEffect(() => {
    if (formData.participantType === "Myself" && profile) {
      const genderValue =
        profile.gender === 1
          ? "Male"
          : profile.gender === 2
            ? "Female"
            : "Other";

      // Set country first
      setFormData((prev) => ({
        ...prev,
        firstName: profile.firstname || "",
        lastName: profile.lastname || "",
        email: profile.email || "",
        mobile: profile.mobile ? String(profile.mobile) : "",
        gender: genderValue,
        dob: profile.dob || "",
        addressLine1: profile.address1 || "",
        addressLine2: profile.address2 || "",
        country: profile.country_name || "",
        state: "",
        city: "",
        pincode: profile.pincode ? String(profile.pincode) : "",
        bloodGroup: profile.blood_group || "",
        tshirtSize: profile.t_shirt_size || "",
        idProofType: profile.id_proof_type || "",
        emergencyContactName: profile.emergency_contact_person || "",
        emergencyContactNumber: profile.emergency_contact_no1
          ? String(profile.emergency_contact_no1)
          : "",
      }));

      // Fetch states for country id
      const selectedCountry = countries.find(
        (c) =>
          c.country_name === profile.country_name ||
          c.name === profile.country_name ||
          c.code === profile.country_name ||
          c.id == profile.country
      );
      if (selectedCountry) {
        const countryId =
          selectedCountry.id || selectedCountry._id || selectedCountry.code;
        authAPI.getStates({ country_id: countryId }).then((statesRes) => {
          if (
            statesRes &&
            statesRes.data &&
            Array.isArray(statesRes.data.AllState)
          ) {
            setStates(statesRes.data.AllState);
            // Find state by id or name
            const foundState = statesRes.data.AllState.find(
              (s) =>
                s.id == profile.state ||
                s.state_name === profile.state_name ||
                s.name === profile.state_name
            );
            if (foundState) {
              setFormData((prev) => ({
                ...prev,
                state: foundState.state_name || foundState.name || "",
              }));
              // Fetch cities for state id
              const stateId =
                foundState.id || foundState._id || foundState.code;
              authAPI.getCities({ state_id: stateId }).then((citiesRes) => {
                if (
                  citiesRes &&
                  citiesRes.data &&
                  Array.isArray(citiesRes.data.AllCities)
                ) {
                  setCities(citiesRes.data.AllCities);
                  // Find city by id or name
                  const foundCity = citiesRes.data.AllCities.find(
                    (c) =>
                      c.id == profile.city ||
                      c.city_name === profile.city_name ||
                      c.name === profile.city_name
                  );
                  if (foundCity) {
                    setFormData((prev) => ({
                      ...prev,
                      city: foundCity.city_name || foundCity.name || "",
                    }));
                  }
                }
              });
            }
          }
        });
      }
    }
  }, [formData.participantType, profile]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = async (participantIndex, e) => {
    const { name, value, type, checked, files } = e.target;

    // If participantType changed to "Myself", fetch profile and auto-fill
    if (name === "participantType" && value === "Myself") {
      try {
        const profileRes = await authAPI.getProfile();
        if (
          profileRes &&
          profileRes.data &&
          Array.isArray(profileRes.data.userData) &&
          profileRes.data.userData.length > 0
        ) {
          const user = profileRes.data.userData[0];
          setProfile(user);
          const genderValue =
            user.gender === 1 ? "Male" : user.gender === 2 ? "Female" : "Other";

          // Update specific participant's form data
          setParticipantForms(prev => prev.map((form, idx) =>
            idx === participantIndex ? {
              ...form,
              formData: {
                ...form.formData,
                participantType: value,
                firstName: user.firstname || "",
                lastName: user.lastname || "",
                email: user.email || "",
                mobile: user.mobile ? String(user.mobile) : "",
                gender: genderValue,
                dob: user.dob || "",
                addressLine1: user.address1 || "",
                addressLine2: user.address2 || "",
                country: user.country_name || "",
                state: user.state_name || "",
                city: user.city_name || "",
                pincode: user.pincode ? String(user.pincode) : "",
                bloodGroup: user.blood_group || "",
                tshirtSize: user.t_shirt_size || "",
                idProofType: user.id_proof_type || "",
                emergencyContactName: user.emergency_contact_person || "",
                emergencyContactNumber: user.emergency_contact_no1
                  ? String(user.emergency_contact_no1)
                  : "",
              }
            } : form
          ));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    } else if (name === "participantType" && value === "Other") {
      // Clear form when "Other" is selected
      setParticipantForms(prev => prev.map((form, idx) =>
        idx === participantIndex ? {
          ...form,
          formData: {
            participantType: value,
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            gender: "",
            dob: "",
            addressLine1: "",
            addressLine2: "",
            country: "",
            state: "",
            city: "",
            pincode: "",
            bloodGroup: "",
            tshirtSize: "",
            idProofType: "",
            idProofFile: null,
            emergencyContactName: "",
            emergencyContactNumber: "",
            termsAccepted: false,
          }
        } : form
      ));
    } else if (name === "country") {
      // Country changed: fetch states
      setParticipantForms(prev => prev.map((form, idx) =>
        idx === participantIndex ? {
          ...form,
          formData: { ...form.formData, country: value, state: "", city: "" }
        } : form
      ));
      const selectedCountry = countries.find(
        (c) => c.country_name === value || c.name === value || c.code === value
      );
      if (selectedCountry) {
        const countryId =
          selectedCountry.id || selectedCountry._id || selectedCountry.code;
        const statesRes = await authAPI.getStates({ country_id: countryId });
        if (statesRes && statesRes.data) {
          if (Array.isArray(statesRes.data.AllState)) {
            setStates(statesRes.data.AllState);
          } else {
            setStates([]);
          }
          setCities([]);
        }
      }
    } else if (name === "state") {
      // State changed: fetch cities
      setParticipantForms(prev => prev.map((form, idx) =>
        idx === participantIndex ? {
          ...form,
          formData: { ...form.formData, state: value, city: "" }
        } : form
      ));
      const selectedState = states.find(
        (s) => s.state_name === value || s.name === value || s.code === value
      );
      if (selectedState) {
        const stateId =
          selectedState.id || selectedState._id || selectedState.code;
        const citiesRes = await authAPI.getCities({ state_id: stateId });
        if (citiesRes && citiesRes.data) {
          if (Array.isArray(citiesRes.data.AllCities)) {
            setCities(citiesRes.data.AllCities);
          } else {
            setCities([]);
          }
        }
      }
    } else {
      // Update specific participant's form data
      setParticipantForms(prev => prev.map((form, idx) => {
        if (idx === participantIndex) {
          const updatedFormData = {
            ...form.formData,
            [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
          };

          // Validate date range for date fields
          const currentTicket = form.ticketInfo;
          if (formQuestions && formQuestions[currentTicket.id]) {
            const questionsData = formQuestions[currentTicket.id];
            const questionsList = questionsData[participantIndex] || questionsData[0] || [];
            const question = questionsList.find(q => getMappedKey(q) === name);

            // Check if this is a date field with range validation
            if (question && question.question_form_type === 'date' && question.date_range === 1 && value) {
              const enteredDate = new Date(value);
              let isValid = true;
              let errorMessage = "";

              if (question.range_start_date) {
                const startTimestamp = parseInt(question.range_start_date);
                const minDate = new Date(startTimestamp * 1000);
                minDate.setHours(0, 0, 0, 0);

                if (enteredDate < minDate) {
                  isValid = false;
                  const minDateStr = minDate.toISOString().split('T')[0];
                  errorMessage = `Date must be on or after ${minDateStr}`;
                }
              }

              if (question.range_end_date && isValid) {
                const endTimestamp = parseInt(question.range_end_date);
                const maxDate = new Date(endTimestamp * 1000);
                maxDate.setHours(23, 59, 59, 999);

                if (enteredDate > maxDate) {
                  isValid = false;
                  const maxDateStr = maxDate.toISOString().split('T')[0];
                  errorMessage = `Date must be on or before ${maxDateStr}`;
                }
              }

              // Update form errors
              if (!isValid) {
                setFormErrors(prevErrors => ({
                  ...prevErrors,
                  [`${participantIndex}_${name}`]: errorMessage
                }));
              } else {
                // Clear error if date is valid
                setFormErrors(prevErrors => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[`${participantIndex}_${name}`];
                  return newErrors;
                });
              }
            } else {
              // Clear error for non-date fields or when value is empty
              setFormErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[`${participantIndex}_${name}`];
                return newErrors;
              });
            }

            // Track parent selection for conditional subquestions
            if (question && question.child_question_ids && question.child_question_ids.trim() !== '') {
              // Store parent selection with actual value
              let valueToStore;
              if (type === "checkbox") {
                // For checkbox, store the updated array of selected values
                valueToStore = updatedFormData[name];
              } else {
                // For radio/select, store the selected value
                valueToStore = value;
              }

              setParentSelections(prevSelections => ({
                ...prevSelections,
                [`${participantIndex}_${question.id}`]: valueToStore
              }));
            }
          }

          return {
            ...form,
            formData: updatedFormData
          };
        }
        return form;
      }));
    }
  };


  const getMappedKey = (question) => {
    return fieldMapping[question.user_field_mapping] || `custom_${question.id}`;
  };

  const renderDynamicFields = (participantIndex) => {
    // Get participant's form data and ticket info
    const participantForm = participantForms[participantIndex];
    if (!participantForm || !participantForm.ticketInfo) return null;

    const currentTicket = participantForm.ticketInfo;
    const currentFormData = participantForm.formData;

    if (!formQuestions || !formQuestions[currentTicket.id]) return null;

    const questionsData = formQuestions[currentTicket.id];
    // Get questions for this participant index
    const questionsList = questionsData[participantIndex] || questionsData[0] || [];

    // Sort by sort_order
    questionsList.sort((a, b) => a.sort_order - b.sort_order);

    // Helper function to check if question is enabled (toggle is ON)
    // question_status: true means toggle is ON (enabled)
    // question_status: false/null/undefined means toggle is OFF (disabled)
    const isQuestionEnabled = (q) => {
      const status = q.question_status;
      // If status is explicitly false, question is disabled
      if (status === false || status === "false" || status === "0" || status === 0) {
        return false;
      }
      // If status is true or truthy, question is enabled
      if (status === true || status === "true" || status === "1" || status === 1) {
        return true;
      }
      // Default: if status is null/undefined, show the question (enabled by default)
      return true;
    };

    // Separate parent questions from subquestions and filter out disabled ones
    const parentQuestions = questionsList
      .filter(q => q.is_subquestion === 0 || !q.is_subquestion)
      .filter(q => isQuestionEnabled(q));
    const subQuestions = questionsList
      .filter(q => q.is_subquestion === 1)
      .filter(q => isQuestionEnabled(q));

    // Create lookup map for subquestions by parent_question_id
    const subQuestionMap = {};
    subQuestions.forEach(sq => {
      const parentId = sq.parent_question_id;
      if (!subQuestionMap[parentId]) {
        subQuestionMap[parentId] = [];
      }
      subQuestionMap[parentId].push(sq);
    });

    // Debug logging for nested subquestions
    console.log('📊 Subquestion mapping:', subQuestionMap);
    console.log('📋 All subquestions:', subQuestions.map(sq => ({
      id: sq.general_form_id,
      label: sq.question_label,
      parent_id: sq.parent_question_id,
      is_subquestion: sq.is_subquestion,
      child_question_ids: sq.child_question_ids
    })));


    // Helper function to check if subquestion should be visible
    const shouldShowSubquestion = (subQuestion, parentQuestion, selectedValue) => {
      try {
        console.log('🔍 Checking visibility for:', {
          subQuestion: subQuestion.question_label,
          subQuestionId: subQuestion.general_form_id,
          parentQuestion: parentQuestion.question_label,
          parentType: parentQuestion.question_form_type,
          parentIsSubquestion: parentQuestion.is_subquestion,
          selectedValue,
          parentChildIds: parentQuestion.child_question_ids
        });

        // CHECKBOX type: Always use question-level child_question_ids
        if (parentQuestion.question_form_type === 'checkbox') {
          if (parentQuestion.child_question_ids && parentQuestion.child_question_ids.trim() !== '') {
            const childIds = parentQuestion.child_question_ids.split(',').map(id => id.trim());
            const matches = childIds.some(childId => String(childId) === String(subQuestion.general_form_id));

            console.log('✅ Checkbox parent - question-level match:', matches);
            if (matches) {
              return true;
            }
          }
          return false;
        }

        // RADIO/SELECT types for SUBQUESTIONS acting as parents (nested subquestions)
        // Check BOTH question-level AND option-level child_question_ids
        if (parentQuestion.is_subquestion === 1) {
          // First check question-level child_question_ids (for checkbox/radio/select subquestions)
          if (parentQuestion.child_question_ids && parentQuestion.child_question_ids.trim() !== '') {
            const childIds = parentQuestion.child_question_ids.split(',').map(id => id.trim());
            const matches = childIds.some(childId => String(childId) === String(subQuestion.general_form_id));

            if (matches) {
              console.log('✅ Subquestion parent - question-level match:', matches);
              // For subquestions with question-level child_question_ids, always show
              // This keeps nested subquestions visible even when parent value changes
              return true;
            }
          }

          // Then check option-level child_question_id (for radio/select subquestions)
          if (selectedValue && parentQuestion.question_form_option) {
            const options = typeof parentQuestion.question_form_option === 'string'
              ? JSON.parse(parentQuestion.question_form_option)
              : parentQuestion.question_form_option;

            if (Array.isArray(options)) {
              const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

              for (const value of selectedValues) {
                const selectedOption = options.find(opt => {
                  if (typeof opt === 'string') return opt === value;

                  const optLabel = opt.label || opt.name;
                  if (optLabel === value) return true;

                  const splitLabels = optLabel ? optLabel.split(',').map(l => l.trim()) : [];
                  return splitLabels.includes(value);
                });

                if (selectedOption && selectedOption.child_question_id) {
                  const matches = String(selectedOption.child_question_id) === String(subQuestion.general_form_id);
                  console.log('✅ Subquestion parent - option-level match:', matches, 'for option:', value);
                  if (matches) {
                    return true;
                  }
                }
              }
            }
          }

          // If we reached here and parent is a subquestion, return false
          return false;
        }

        // For parent RADIO/SELECT questions (not subquestions): ONLY use option-level child_question_id
        // This ensures only selected option's subquestions show
        if (!selectedValue || !parentQuestion.question_form_option) {
          return false;
        }

        // Parse parent options
        const options = typeof parentQuestion.question_form_option === 'string'
          ? JSON.parse(parentQuestion.question_form_option)
          : parentQuestion.question_form_option;

        if (!Array.isArray(options)) {
          return false;
        }

        // Handle both single values (radio/select) and arrays (checkbox)
        const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

        // Check if any selected value has a matching option with child_question_id
        for (const value of selectedValues) {
          const selectedOption = options.find(opt => {
            if (typeof opt === 'string') return opt === value;

            // Also check if the label was split (e.g., "mm,ll" split to "mm" and "ll")
            const optLabel = opt.label || opt.name;
            if (optLabel === value) return true;

            // Check if value is part of comma-separated label
            const splitLabels = optLabel ? optLabel.split(',').map(l => l.trim()) : [];
            return splitLabels.includes(value);
          });

          if (selectedOption && selectedOption.child_question_id) {
            // Check if this subquestion's general_form_id matches the child_question_id
            const matches = String(selectedOption.child_question_id) === String(subQuestion.general_form_id);

            if (matches) {
              return true;
            }
          }
        }

        return false;
      } catch (e) {
        console.error("Error checking subquestion visibility:", e);
        return false;
      }
    };

    // Helper function to get subquestions for a parent question
    const getSubquestionsForParent = (parentQuestion) => {
      const subQs = subQuestionMap[parentQuestion.general_form_id] || [];
      const parentValue = parentSelections[`${participantIndex}_${parentQuestion.id}`];

      console.log(`🔎 Getting subquestions for parent: ${parentQuestion.question_label} (ID: ${parentQuestion.general_form_id})`);
      console.log(`   Total subquestions in map: ${subQs.length}`, subQs.map(sq => sq.question_label));
      console.log(`   Parent value selected: ${parentValue}`);

      const filtered = subQs.filter(sq => shouldShowSubquestion(sq, parentQuestion, parentValue));

      console.log(`   ✅ Visible subquestions after filter: ${filtered.length}`, filtered.map(sq => sq.question_label));

      return filtered;
    };

    // Group questions by group_question_title (only parent questions)
    const groupedQuestions = {};
    const ungroupedQuestions = [];

    parentQuestions.forEach(q => {
      const groupTitle = q.group_question_title;
      if (groupTitle && groupTitle.trim() !== '') {
        if (!groupedQuestions[groupTitle]) {
          groupedQuestions[groupTitle] = [];
        }
        groupedQuestions[groupTitle].push(q);
      } else {
        ungroupedQuestions.push(q);
      }
    });

    // Get all group names
    const groupNames = Object.keys(groupedQuestions);
    const hasGroups = groupNames.length > 0;

    // Set default active tab for this participant if not set
    const currentActiveTab = activeQuestionTab[participantIndex];
    if (!currentActiveTab) {
      if (ungroupedQuestions.length > 0) {
        // Prioritize General tab if there are ungrouped questions
        setActiveQuestionTab(prev => ({
          ...prev,
          [participantIndex]: 'general'
        }));
      } else if (hasGroups) {
        // Otherwise use first group
        setActiveQuestionTab(prev => ({
          ...prev,
          [participantIndex]: groupNames[0]
        }));
      }
    }

    // Filter questions to show based on active tab
    // IMPORTANT: Only render parent questions in main loop, subquestions will be rendered recursively
    let questionsToRender = ungroupedQuestions; // Default to parent questions only
    if (hasGroups && currentActiveTab) {
      if (currentActiveTab === 'general') {
        questionsToRender = ungroupedQuestions;
      } else if (groupedQuestions[currentActiveTab]) {
        questionsToRender = groupedQuestions[currentActiveTab];
      }
    }

    return (
      <div className="dynamic-form-fields">
        {/* Render tabs if there are groups */}
        {hasGroups && (
          <div style={{ marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
            <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
              {/* General tab first if there are ungrouped questions */}
              {ungroupedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveQuestionTab(prev => ({
                    ...prev,
                    [participantIndex]: 'general'
                  }))}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderBottom: currentActiveTab === 'general' ? '3px solid #e74c3c' : '3px solid transparent',
                    background: currentActiveTab === 'general' ? '#fff' : '#f5f5f5',
                    color: currentActiveTab === 'general' ? '#e74c3c' : '#666',
                    fontWeight: currentActiveTab === 'general' ? '600' : '500',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📝 General
                </button>
              )}
              {/* Group tabs after General */}
              {groupNames.map((groupName, idx) => {
                const isActive = currentActiveTab === groupName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveQuestionTab(prev => ({
                      ...prev,
                      [participantIndex]: groupName
                    }))}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderBottom: isActive ? '3px solid #e74c3c' : '3px solid transparent',
                      background: isActive ? '#fff' : '#f5f5f5',
                      color: isActive ? '#e74c3c' : '#666',
                      fontWeight: isActive ? '600' : '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📋 {groupName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {questionsToRender.map((q, index) => {
          // Recursive function to render question with its subquestions
          const renderQuestionWithSubquestions = (question, level = 0) => {
            const fieldName = getMappedKey(question);
            const isRequired = question.is_manadatory === 1;

            let options = [];
            if (question.question_form_option) {
              try {
                options = typeof question.question_form_option === 'string'
                  ? JSON.parse(question.question_form_option)
                  : question.question_form_option;
              } catch (e) {
                console.error("Error parsing options for", question.question_label, e);
              }
            }

            // Get visible subquestions for this question
            const visibleSubquestions = getSubquestionsForParent(question);

            // Render the main question
            let questionElement = null;

            // Render based on type
            if (question.question_form_type === 'text' || question.question_form_type === 'email' || question.question_form_type === 'mobile' || question.question_form_type === 'date') {
              // Parse limit_length if available
              let minLength = null;
              let maxLength = null;
              if (question.limit_check === 1 && question.limit_length) {
                try {
                  const limitObj = typeof question.limit_length === 'string'
                    ? JSON.parse(question.limit_length)
                    : question.limit_length;
                  minLength = limitObj.min_length || null;
                  maxLength = limitObj.max_length || null;
                } catch (e) {
                  console.error("Error parsing limit_length for", question.question_label, e);
                }
              }

              // Get current value length
              const currentValue = currentFormData[fieldName] || "";
              const currentLength = currentValue.length;

              // Check for length errors
              let lengthError = "";
              if (currentValue && minLength && currentLength < minLength) {
                lengthError = `Minimum ${minLength} characters required`;
              } else if (currentValue && maxLength && currentLength > maxLength) {
                lengthError = `Maximum ${maxLength} characters allowed`;
              }

              // For date fields, check if date_range is enabled and parse range dates
              let minDate = null;
              let maxDate = null;
              if (question.question_form_type === 'date' && question.date_range === 1) {
                // Convert Unix timestamps to YYYY-MM-DD format
                if (question.range_start_date) {
                  const startTimestamp = parseInt(question.range_start_date);
                  const startDate = new Date(startTimestamp * 1000);
                  minDate = startDate.toISOString().split('T')[0];
                }
                if (question.range_end_date) {
                  const endTimestamp = parseInt(question.range_end_date);
                  const endDate = new Date(endTimestamp * 1000);
                  maxDate = endDate.toISOString().split('T')[0];
                }
              }

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {minLength && maxLength && (
                      <small style={{ color: '#666', fontSize: '11px', marginLeft: '8px' }}>
                        ({minLength}-{maxLength} characters)
                      </small>
                    )}
                    {minDate && maxDate && (
                      <small style={{ color: '#666', fontSize: '11px', marginLeft: '8px' }}>
                        (Select date between {minDate} and {maxDate})
                      </small>
                    )}
                  </label>
                  <input
                    type={question.question_form_type === 'mobile' ? 'tel' : question.question_form_type}
                    name={fieldName}
                    className="form-control3"
                    value={currentValue}
                    onChange={(e) => handleInputChange(participantIndex, e)}
                    required={isRequired}
                    minLength={minLength || undefined}
                    maxLength={maxLength || undefined}
                    min={minDate || undefined}
                    max={maxDate || undefined}
                  />
                  {lengthError && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>{lengthError}</span>}
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }
            else if (question.question_form_type === 'radio') {
              // Process options to split comma-separated labels
              const processedOptions = [];
              options.forEach(opt => {
                const label = opt.label || opt.name || opt;
                // Split by comma and trim whitespace
                const labels = label.split(',').map(l => l.trim()).filter(l => l);

                // Create separate option for each label
                labels.forEach(individualLabel => {
                  processedOptions.push({
                    ...opt,
                    label: individualLabel,
                    originalLabel: label,
                    child_question_id: opt.child_question_id || question.child_question_ids
                  });
                });
              });

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <div className="gender-options">
                    {processedOptions.map((opt, idx) => (
                      <label className="gender-option" key={idx}>
                        <input
                          type="radio"
                          name={fieldName}
                          value={opt.label}
                          checked={(currentFormData[fieldName] || "") === opt.label}
                          onChange={(e) => handleInputChange(participantIndex, e)}
                        />
                        <span className="gender-label">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }
            else if (question.question_form_type === 'checkbox') {
              // Process options to split comma-separated labels
              const processedOptions = [];
              options.forEach(opt => {
                const label = opt.label || opt.name || opt;
                // Split by comma and trim whitespace
                const labels = label.split(',').map(l => l.trim()).filter(l => l);

                // Create separate option for each label
                labels.forEach(individualLabel => {
                  processedOptions.push({
                    ...opt,
                    label: individualLabel,
                    originalLabel: label,
                    // For checkbox, child_question_id comes from question level, not option level
                    child_question_id: opt.child_question_id || question.child_question_ids
                  });
                });
              });

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <div>
                    {processedOptions.map((opt, idx) => (
                      <label key={idx} style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          name={fieldName}
                          value={opt.label}
                          checked={Array.isArray(currentFormData[fieldName]) && currentFormData[fieldName].includes(opt.label)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const value = e.target.value;
                            const currentValues = Array.isArray(currentFormData[fieldName]) ? currentFormData[fieldName] : [];
                            const newValues = checked
                              ? [...currentValues, value]
                              : currentValues.filter(v => v !== value);
                            handleInputChange(participantIndex, { target: { name: fieldName, value: newValues } });
                          }}
                          style={{ marginRight: '8px' }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }
            else if (question.question_form_type === 'select' || question.question_form_type === 'countries' || question.question_form_type === 'states' || question.question_form_type === 'cities') {
              let displayOptions = options;

              if (question.question_form_type === 'states') {
                displayOptions = states.map(s => ({
                  id: s.id,
                  label: s.state_name || s.name,
                  name: s.state_name || s.name
                }));
              }

              if (question.question_form_type === 'cities') {
                displayOptions = cities.map(c => ({
                  id: c.id,
                  label: c.city_name || c.name,
                  name: c.city_name || c.name
                }));
              }

              // Process options to split comma-separated labels (for regular select, not for countries/states/cities)
              if (question.question_form_type === 'select') {
                const processedOptions = [];
                displayOptions.forEach(opt => {
                  const label = opt.label || opt.name || opt;
                  // Split by comma and trim whitespace
                  const labels = label.split(',').map(l => l.trim()).filter(l => l);

                  // Create separate option for each label
                  labels.forEach(individualLabel => {
                    processedOptions.push({
                      ...opt,
                      label: individualLabel,
                      originalLabel: label,
                      child_question_id: opt.child_question_id || question.child_question_ids
                    });
                  });
                });
                displayOptions = processedOptions;
              }

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <select
                    name={fieldName}
                    className="form-select"
                    value={currentFormData[fieldName] || ""}
                    onChange={async (e) => {
                      const { name, value } = e.target;

                      if (question.question_form_type === 'countries') {
                        setParticipantForms(prev => prev.map((form, idx) =>
                          idx === participantIndex ? {
                            ...form,
                            formData: { ...form.formData, [name]: value, state: "", city: "" }
                          } : form
                        ));
                        const selectedCountry = options.find(
                          (c) => (c.label || c.name) === value || c.id == value
                        );
                        if (selectedCountry && selectedCountry.id) {
                          try {
                            const statesRes = await authAPI.getStates({ country_id: selectedCountry.id });
                            if (statesRes && statesRes.data && Array.isArray(statesRes.data.AllState)) {
                              setStates(statesRes.data.AllState);
                            } else {
                              setStates([]);
                            }
                            setCities([]);
                          } catch (error) {
                            console.error("Error fetching states:", error);
                            setStates([]);
                          }
                        }
                      }
                      else if (question.question_form_type === 'states') {
                        setParticipantForms(prev => prev.map((form, idx) =>
                          idx === participantIndex ? {
                            ...form,
                            formData: { ...form.formData, [name]: value, city: "" }
                          } : form
                        ));
                        const selectedState = states.find(
                          (s) => (s.state_name || s.name) === value || s.id == value
                        );
                        if (selectedState && selectedState.id) {
                          try {
                            const citiesRes = await authAPI.getCities({ state_id: selectedState.id });
                            if (citiesRes && citiesRes.data && Array.isArray(citiesRes.data.AllCities)) {
                              setCities(citiesRes.data.AllCities);
                            } else {
                              setCities([]);
                            }
                          } catch (error) {
                            console.error("Error fetching cities:", error);
                            setCities([]);
                          }
                        }
                      }
                      else {
                        handleInputChange(participantIndex, e);
                      }
                    }}
                    required={isRequired}
                  >
                    <option value="">-- Select --</option>
                    {displayOptions.map((opt, idx) => (
                      <option key={idx} value={opt.label || opt.name || opt.code || opt.id}>
                        {opt.label || opt.name || opt.code}
                      </option>
                    ))}
                  </select>
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }
            else if (question.question_form_type === 'textarea') {
              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <textarea
                    name={fieldName}
                    className="form-control3"
                    rows="3"
                    value={currentFormData[fieldName] || ""}
                    onChange={(e) => handleInputChange(participantIndex, e)}
                  ></textarea>
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }
            else if (question.question_form_type === 'file') {
              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                  </label>
                  <input
                    type="file"
                    name={fieldName}
                    className="form-control3"
                    onChange={(e) => handleInputChange(participantIndex, e)}
                  />
                  {formErrors[`participant_${participantIndex}_${fieldName}`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                    </span>
                  )}
                  {formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                    <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                    </span>
                  )}
                </div>
              );
            }

            // Return the question element with its subquestions
            return (
              <React.Fragment key={question.id}>
                {/* Render the main question with indentation and styling based on level */}
                <div style={{
                  marginLeft: `${level * 20}px`,
                  paddingLeft: level > 0 ? '15px' : '0',
                  borderLeft: level > 0 ? '3px solid #e0e0e0' : 'none',
                  backgroundColor: level > 0 ? (level === 1 ? '#f9f9f9' : '#f0f0f0') : 'transparent',
                  padding: level > 0 ? '10px' : '0',
                  borderRadius: level > 0 ? '4px' : '0',
                  marginBottom: level > 0 ? '8px' : '0'
                }}>
                  {level > 0 && (
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      marginBottom: '5px',
                      fontWeight: '500'
                    }}>
                      {'└─ '} Nested Question (Level {level})
                    </div>
                  )}
                  {questionElement}
                </div>

                {/* Recursively render visible subquestions */}
                {visibleSubquestions.length > 0 && (
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {visibleSubquestions.map(subQ => renderQuestionWithSubquestions(subQ, level + 1))}
                  </div>
                )}
              </React.Fragment>
            );
          };

          // Call the recursive function for this parent question
          return renderQuestionWithSubquestions(q, 0);
        })}
      </div>
    );
  };

  const handlePayNow = () => {
    if (paymentData && paymentData.redirect_url) {
      // Open PhonePe payment URL in new window
      window.location.href = paymentData.redirect_url;
    }
  };

  const handleProceed = async (e) => {
    e.preventDefault();
    console.log("🚀 Proceed button clicked");

    if (!validateForm()) {
      console.log("❌ Validation failed, stopping proceed");
      return;
    }

    // Calculate subTotal
    const subTotal = selectedTickets.reduce((sum, ticket) => {
      // Calculate effective price based on early bird discount
      let effectivePrice = parseFloat(ticket.ticket_price);

      if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
        const discountValue = parseFloat(ticket.discount_value || 0);
        if (ticket.discount === 1) {
          // Percentage discount
          effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
        } else {
          // Amount discount
          effectivePrice = effectivePrice - discountValue;
        }
      }

      const baseAmount = effectivePrice * parseInt(ticket.quantity);
      const calcDetails = ticket.ticket_calculation_details || {};

      // Individual fee components
      const convenienceFee = parseFloat(calcDetails.total_convenience_fees || (baseAmount * 0.02)) || 0;
      const platformFeeBase = parseFloat(calcDetails.platform_fees_5_each || 5) || 5;
      const paymentGatewayCharges = parseFloat(calcDetails.payment_gateway_1_85_buyer || (baseAmount * 0.0185)) || 0;

      // Platform Fee = Convenience + Platform + Payment Gateway
      const totalPlatformFee = convenienceFee + platformFeeBase + paymentGatewayCharges;

      // Taxes = 18% of (Base Amount + Platform Fee)
      const taxableAmount = baseAmount + totalPlatformFee;
      const ticketTaxes = parseFloat(taxableAmount * 0.18) || 0;

      // Sub Total = Base + Platform Fee + Taxes
      return sum + baseAmount + totalPlatformFee + ticketTaxes;
    }, 0) - couponDiscount; // Subtract coupon discount from subtotal

    console.log("✅ Validation passed, proceeding to payment");
    console.log("💰 Payment amount:", subTotal.toFixed(2));

    // Show payment modal immediately
    setShowPaymentModal(true);

    try {
      // Call PhonePe payment initiation API
      console.log("📤 Calling payment API...");
      const res = await authAPI.phonepeInitiatePayment({
        event_id: eventId,
        amount: subTotal.toFixed(2)
      });

      console.log("📥 Payment API response:", res);

      if (res && res.data && res.data.redirect_url) {
        setPaymentData(res.data);
        console.log("✅ Payment data set, redirect URL:", res.data.redirect_url);
      } else {
        throw new Error("Invalid response from payment API");
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);
      alert("Payment initiation failed. Please try again.");
      setShowPaymentModal(false);
    }
  };

  function validateForm() {
    console.log("🔍 Starting form validation...");
    const errors = {};
    let hasErrors = false;

    // Validate each participant's form
    participantForms.forEach((participantForm, participantIndex) => {
      const currentFormData = participantForm.formData;
      const currentTicket = participantForm.ticketInfo;

      console.log(`✅ Validating Participant ${participantIndex + 1}:`, currentFormData);

      // Get questions for this participant's ticket
      if (formQuestions && currentTicket && formQuestions[currentTicket.id]) {
        const questionsData = formQuestions[currentTicket.id];
        const questionsList = questionsData[participantIndex] || questionsData[0] || [];

        // Validate each mandatory question and length constraints
        questionsList.forEach(q => {
          const fieldName = getMappedKey(q);
          const fieldValue = currentFormData[fieldName];

          // Check if mandatory field is filled
          if (q.is_manadatory === 1) {
            let isEmpty = false;

            // Check for different types of empty values
            if (!fieldValue) {
              isEmpty = true;
            } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
              // Empty array for checkboxes
              isEmpty = true;
            } else if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
              // Empty string
              isEmpty = true;
            }

            if (isEmpty) {
              const errorKey = `participant_${participantIndex}_${fieldName}`;
              errors[errorKey] = `${q.question_label} is required`;
              hasErrors = true;
              console.log(`❌ Missing required field: ${q.question_label} for Participant ${participantIndex + 1}`);
            }
          }

          // Check length constraints if limit_check is enabled
          if (q.limit_check === 1 && q.limit_length && fieldValue) {
            try {
              const limitObj = typeof q.limit_length === 'string'
                ? JSON.parse(q.limit_length)
                : q.limit_length;
              const minLength = limitObj.min_length || null;
              const maxLength = limitObj.max_length || null;
              const currentLength = String(fieldValue).length;

              if (minLength && currentLength < minLength) {
                const errorKey = `participant_${participantIndex}_${fieldName}_length`;
                errors[errorKey] = `${q.question_label} must be at least ${minLength} characters for Participant ${participantIndex + 1}`;
                hasErrors = true;
                console.log(`❌ Length too short: ${q.question_label} for Participant ${participantIndex + 1} (${currentLength}/${minLength})`);
              }

              if (maxLength && currentLength > maxLength) {
                const errorKey = `participant_${participantIndex}_${fieldName}_length`;
                errors[errorKey] = `${q.question_label} must not exceed ${maxLength} characters for Participant ${participantIndex + 1}`;
                hasErrors = true;
                console.log(`❌ Length too long: ${q.question_label} for Participant ${participantIndex + 1} (${currentLength}/${maxLength})`);
              }
            } catch (e) {
              console.error("Error parsing limit_length in validation:", e);
            }
          }

          // Check date range validation for date fields
          if (q.question_form_type === 'date' && q.date_range === 1 && fieldValue) {
            const enteredDate = new Date(fieldValue);

            // Check minimum date
            if (q.range_start_date) {
              const startTimestamp = parseInt(q.range_start_date);
              const minDate = new Date(startTimestamp * 1000);
              minDate.setHours(0, 0, 0, 0);

              if (enteredDate < minDate) {
                const minDateStr = minDate.toISOString().split('T')[0];
                const errorKey = `participant_${participantIndex}_${fieldName}_daterange`;
                errors[errorKey] = `${q.question_label} must be on or after ${minDateStr} for Participant ${participantIndex + 1}`;
                hasErrors = true;
                console.log(`❌ Date too early: ${q.question_label} for Participant ${participantIndex + 1}`);
              }
            }

            // Check maximum date
            if (q.range_end_date) {
              const endTimestamp = parseInt(q.range_end_date);
              const maxDate = new Date(endTimestamp * 1000);
              maxDate.setHours(23, 59, 59, 999);

              if (enteredDate > maxDate) {
                const maxDateStr = maxDate.toISOString().split('T')[0];
                const errorKey = `participant_${participantIndex}_${fieldName}_daterange`;
                errors[errorKey] = `${q.question_label} must be on or before ${maxDateStr} for Participant ${participantIndex + 1}`;
                hasErrors = true;
                console.log(`❌ Date too late: ${q.question_label} for Participant ${participantIndex + 1}`);
              }
            }
          }
        });
      }
    });

    // Check terms and conditions if they exist
    if (termsConditions && termsConditions.length > 0 && !termsAccepted) {
      errors['terms_conditions'] = 'You must accept the Terms and Conditions to proceed';
      hasErrors = true;
      console.log("❌ Terms and Conditions not accepted");
    }

    if (hasErrors) {
      console.log("❌ Validation failed:", errors);
      // Removed alert - errors will be shown inline
      setFormErrors(errors);

      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return false;
    }

    console.log("✅ Validation passed!");
    setFormErrors({});
    return true;
  }

  return (
    <div className="participant-details-page">
      <TopNav />

      {/* Blue Header Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="contact-hero-title">Participant Details</h1>
              <nav className="contact-breadcrumb">
                <span onClick={() => navigate("/")}>Home</span>
                <span className="breadcrumb-separator">−</span>
                <span>Safe Checkout</span>
                <span className="breadcrumb-separator">−</span>
                <span>Participant Details</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container participant-container">
        <div className="row">
          {/* Left Column - Form */}
          <div className="col-lg-8">
            {/* Event Info - Full Details from API */}
            <div className="event-info-box">
              <button className="back-button" onClick={handleBack}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <h2 className="event-name">
                {localStorage.getItem("eventInfo") || "Event Info"}
              </h2>
            </div>

            {/* Participant Forms - Loop through all participants */}
            {participantForms.map((participantForm, participantIndex) => (
              <div key={participantIndex} className="participant-form-card" style={{ marginBottom: '20px' }}>
                <div className="participant-header">
                  <div className="participant-title">
                    <i className="fas fa-user"></i>
                    <span>Participant - {participantIndex + 1}</span>
                  </div>
                  <div className="participant-category">
                    <i className="fas fa-ticket-alt"></i>
                    {participantForm.ticketInfo?.ticket_name || participantForm.ticketInfo?.display_ticket_name || "Category"}
                  </div>
                </div>

                <div className="form-content">
                  {/* Participant Type Dropdown */}
                  <div className="form-group">
                    <select
                      name="participantType"
                      className="form-select"
                      value={participantForm.formData.participantType}
                      onChange={(e) => handleInputChange(participantIndex, e)}
                    >
                      <option value="" disabled>
                        Registration For
                      </option>
                      <option value="Myself">Myself</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Dynamic Fields */}
                  {renderDynamicFields(participantIndex)}
                </div>

                {/* Save & Next button (except for last participant) */}
                {participantIndex < participantForms.length - 1 && (
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '20px',
                      backgroundColor: '#e74c3c',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Validate current participant's form before proceeding
                      const currentFormData = participantForms[participantIndex].formData;
                      const currentTicket = participantForms[participantIndex].ticketInfo;
                      const errors = {};
                      let hasErrors = false;

                      // Get questions for this participant's ticket
                      if (formQuestions && currentTicket && formQuestions[currentTicket.id]) {
                        const questionsData = formQuestions[currentTicket.id];
                        const questionsList = questionsData[participantIndex] || questionsData[0] || [];

                        // Validate each mandatory question
                        questionsList.forEach(q => {
                          const fieldName = getMappedKey(q);
                          const fieldValue = currentFormData[fieldName];

                          // Check if mandatory field is filled
                          if (q.is_manadatory === 1) {
                            let isEmpty = false;

                            if (!fieldValue) {
                              isEmpty = true;
                            } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                              isEmpty = true;
                            } else if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
                              isEmpty = true;
                            }

                            if (isEmpty) {
                              const errorKey = `participant_${participantIndex}_${fieldName}`;
                              errors[errorKey] = `${q.question_label} is required`;
                              hasErrors = true;
                            }
                          }
                        });
                      }

                      if (hasErrors) {
                        // Show errors and don't proceed
                        setFormErrors(prev => ({ ...prev, ...errors }));

                        // Scroll to first error
                        setTimeout(() => {
                          const firstErrorElement = document.querySelector('.error-message');
                          if (firstErrorElement) {
                            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);

                        console.log(`❌ Validation failed for Participant ${participantIndex + 1}`);
                        return;
                      }

                      // Clear errors for this participant if validation passed
                      setFormErrors(prev => {
                        const newErrors = { ...prev };
                        Object.keys(newErrors).forEach(key => {
                          if (key.startsWith(`participant_${participantIndex}_`)) {
                            delete newErrors[key];
                          }
                        });
                        return newErrors;
                      });

                      // Scroll to next participant form
                      const nextForm = document.querySelectorAll('.participant-form-card')[participantIndex + 1];
                      if (nextForm) {
                        nextForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    Save &amp; Next ({participantIndex + 1}/{participantForms.length})
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Right Column - Summary - Dynamic */}
          <div className="col-lg-4">
            <div className="summary-sidebar">
              <h3 className="summary-sidebar-title">SUMMARY</h3>

              {/* Total Registration Count */}
              <div className="summary-item" style={{ fontWeight: '600', fontSize: '16px', marginBottom: '10px' }}>
                <span>Price ({selectedTickets.reduce((sum, t) => sum + t.quantity, 0)} Registration)</span>
                <span>₹{selectedTickets.reduce((sum, t) => sum + (t.ticket_price * t.quantity), 0).toFixed(2)}</span>
              </div>

              <div className="divider"></div>

              {/* Show detailed breakdown for each ticket type */}
              {selectedTickets.map((ticket, index) => {
                // Calculate effective price based on early bird discount
                let effectivePrice = parseFloat(ticket.ticket_price);

                if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
                  const discountValue = parseFloat(ticket.discount_value || 0);
                  if (ticket.discount === 1) {
                    // Percentage discount
                    effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                  } else {
                    // Amount discount
                    effectivePrice = effectivePrice - discountValue;
                  }
                }

                const baseAmount = effectivePrice * parseInt(ticket.quantity);

                // Calculate fees from ticket_calculation_details if available
                const calcDetails = ticket.ticket_calculation_details || {};

                // Individual fee components
                const convenienceFee = parseFloat(calcDetails.total_convenience_fees || (baseAmount * 0.02)) || 0;
                const platformFeeBase = parseFloat(calcDetails.platform_fees_5_each || 5) || 5;
                const paymentGatewayCharges = parseFloat(calcDetails.payment_gateway_1_85_buyer || (baseAmount * 0.0185)) || 0;

                // Platform Fee = Convenience + Platform + Payment Gateway
                const totalPlatformFee = convenienceFee + platformFeeBase + paymentGatewayCharges;

                // Taxes = 18% of (Base Amount + Platform Fee)
                const taxableAmount = baseAmount + totalPlatformFee;
                const ticketTaxes = parseFloat(taxableAmount * 0.18) || 0;

                // Sub Total = Base + Platform Fee + Taxes
                const ticketSubTotal = baseAmount + totalPlatformFee + ticketTaxes;

                return (
                  <div key={index} style={{ marginBottom: index < selectedTickets.length - 1 ? '20px' : '0' }}>
                    {/* Ticket Name and Base Price */}
                    <div className="summary-item" style={{ fontWeight: '600', fontSize: '15px' }}>
                      <span>{ticket.ticket_name || ticket.display_ticket_name} (x{ticket.quantity})</span>
                      <span>₹{baseAmount.toFixed(2)}</span>
                    </div>

                    {/* Platform Fee (Combined) */}
                    <div className="summary-item">
                      <span>Platform Fee</span>
                      <span>₹{totalPlatformFee.toFixed(2)}</span>
                    </div>

                    {/* Taxes (18% on Base + Platform Fee) */}
                    <div className="summary-item">
                      <span>Taxes</span>
                      <span>₹{ticketTaxes.toFixed(2)}</span>
                    </div>

                    {/* Sub Total for this ticket */}
                    <div className="summary-item" style={{ fontWeight: '600', marginTop: '8px' }}>
                      <span>Sub Total</span>
                      <span>₹{ticketSubTotal.toFixed(2)}</span>
                    </div>

                    {/* Divider between tickets */}
                    {index < selectedTickets.length - 1 && <div className="divider" style={{ margin: '15px 0' }}></div>}
                  </div>
                );
              })}

              <div className="divider"></div>

              {/* Coupon Discount - only show if applied */}
              {couponDiscount > 0 && (
                <div className="summary-item" style={{ color: '#28a745', fontWeight: '600' }}>
                  <span>Discount ({couponCode})</span>
                  <span>- ₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Total Amount */}
              <div className="summary-item total">
                <span>Total Amount</span>
                <span className="total-amount">
                  ₹{(() => {
                    const subtotal = selectedTickets.reduce((sum, ticket) => {
                      // Calculate effective price based on early bird discount
                      let effectivePrice = parseFloat(ticket.ticket_price);

                      if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
                        const discountValue = parseFloat(ticket.discount_value || 0);
                        if (ticket.discount === 1) {
                          // Percentage discount
                          effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                        } else {
                          // Amount discount
                          effectivePrice = effectivePrice - discountValue;
                        }
                      }

                      const baseAmount = effectivePrice * parseInt(ticket.quantity);
                      const calcDetails = ticket.ticket_calculation_details || {};

                      // Individual fee components
                      const convenienceFee = parseFloat(calcDetails.total_convenience_fees || (baseAmount * 0.02)) || 0;
                      const platformFeeBase = parseFloat(calcDetails.platform_fees_5_each || 5) || 5;
                      const paymentGatewayCharges = parseFloat(calcDetails.payment_gateway_1_85_buyer || (baseAmount * 0.0185)) || 0;

                      // Platform Fee = Convenience + Platform + Payment Gateway
                      const totalPlatformFee = convenienceFee + platformFeeBase + paymentGatewayCharges;

                      // Taxes = 18% of (Base Amount + Platform Fee)
                      const taxableAmount = baseAmount + totalPlatformFee;
                      const ticketTaxes = parseFloat(taxableAmount * 0.18) || 0;

                      // Sub Total = Base + Platform Fee + Taxes
                      return sum + baseAmount + totalPlatformFee + ticketTaxes;
                    }, 0);

                    // Subtract coupon discount from subtotal
                    const finalTotal = subtotal - couponDiscount;
                    return finalTotal.toFixed(2);
                  })()}
                </span>
              </div>

              {/* Terms and Conditions - only show if TermsConditions data exists */}
              {termsConditions && termsConditions.length > 0 && (
                <div className="terms-checkbox" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        // Clear error when checked
                        if (e.target.checked) {
                          setFormErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors['terms_conditions'];
                            return newErrors;
                          });
                        }
                        console.log("Terms checkbox clicked:", e.target.checked);
                      }}
                      style={{ marginTop: '4px', width: '18px', height: '18px' }}
                    />
                    <span>
                      I accept the{' '}
                      <a
                        href={`/event-terms/${eventId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "underline", color: '#e74c3c' }}
                      >
                        Terms and Conditions
                      </a>
                      <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                    </span>
                  </label>
                  {formErrors['terms_conditions'] && (
                    <div className="error-message" style={{
                      color: '#e74c3c',
                      fontSize: '13px',
                      marginTop: '5px',
                      marginLeft: '26px'
                    }}>
                      {formErrors['terms_conditions']}
                    </div>
                  )}
                </div>
              )}

              <button className="btn-proceed-final" onClick={handleProceed}>
                <i className="fas fa-users"></i>
                <span className="proceed-count">
                  {selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}
                </span>
                <span className="proceed-text">PROCEED</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999'
              }}
            >×</button>

            <img
              src="https://cdn-icons-png.flaticon.com/512/893/893081.png"
              alt="Payment"
              style={{ width: '150px', marginBottom: '20px' }}
            />

            <h2 style={{ marginBottom: '15px', fontWeight: '600' }}>Redirect to payment</h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
              You are being redirected to payment gateway site
            </p>

            <button
              onClick={handlePayNow}
              disabled={!paymentData}
              style={{
                backgroundColor: paymentData ? '#00c853' : '#ccc',
                color: 'white',
                border: 'none',
                padding: '12px 40px',
                fontSize: '16px',
                borderRadius: '5px',
                cursor: paymentData ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                width: '100%'
              }}
            >
              {paymentData ? "Pay Now" : "Processing..."}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
