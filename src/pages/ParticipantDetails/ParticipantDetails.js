import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import "./ParticipantDetails.css";

export default function ParticipantDetails() {
  // Get price from localStorage and calculate taxes
  const price = parseFloat(localStorage.getItem("summaryTotalAmount")) || 0;
  const taxes = +(price * 0.18).toFixed(2);
  const subTotal = +(price + taxes).toFixed(2);
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

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

        // 2. Fetch Form Questions if ticket found
        if (currentTicket) {
          const payload = {
            event_id: eventId,
            total_attendee: 1,
            AllTickets: [{ ...currentTicket, count: 1 }]
          };
          const questionsRes = await authAPI.getFormQuestions(payload);
          if (questionsRes && questionsRes.data && questionsRes.data.FormQuestions) {
            setFormQuestions(questionsRes.data.FormQuestions);
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

  const handleInputChange = async (e) => {
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
          // Map gender: 1=Male, 2=Female, other=Other
          const genderValue =
            user.gender === 1 ? "Male" : user.gender === 2 ? "Female" : "Other";
          const newFormData = {
            ...formData,
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
          };
          setFormData(newFormData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    } else if (name === "participantType" && value === "Other") {
      // Clear form when "Other" is selected
      setFormData((prev) => ({
        ...prev,
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
        emergencyContactName: "",
        emergencyContactNumber: "",
      }));
    } else if (name === "country") {
      // Country changed: fetch states
      setFormData((prev) => ({ ...prev, country: value, state: "", city: "" }));
      const selectedCountry = countries.find(
        (c) => c.country_name === value || c.name === value || c.code === value
      );
      if (selectedCountry) {
        const countryId =
          selectedCountry.id || selectedCountry._id || selectedCountry.code;
        const statesRes = await authAPI.getStates({ country_id: countryId });
        console.log("States API response:", statesRes);
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
      setFormData((prev) => ({ ...prev, state: value, city: "" }));
      const selectedState = states.find(
        (s) => s.state_name === value || s.name === value || s.code === value
      );
      if (selectedState) {
        const stateId =
          selectedState.id || selectedState._id || selectedState.code;
        const citiesRes = await authAPI.getCities({ state_id: stateId });
        console.log("Cities API response:", citiesRes);
        if (citiesRes && citiesRes.data) {
          if (Array.isArray(citiesRes.data.AllCities)) {
            setCities(citiesRes.data.AllCities);
          } else {
            setCities([]);
          }
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? checked : type === "file" ? files[0] : value,
      }));
    }
  };


  const getMappedKey = (question) => {
    return fieldMapping[question.user_field_mapping] || `custom_${question.id}`;
  };

  const renderDynamicFields = () => {
    if (!ticket || !formQuestions || !formQuestions[ticket.id]) return null;

    const questionsData = formQuestions[ticket.id];
    // Assuming structure is [ [q1, q2...], [q1, q2...] ] for attendees. We only have 1 attendee.
    const questionsList = questionsData[0] || [];

    // Sort by sort_order
    questionsList.sort((a, b) => a.sort_order - b.sort_order);

    return (
      <div className="dynamic-form-fields">
        {questionsList.map((q, index) => {
          const fieldName = getMappedKey(q);
          const isRequired = q.is_manadatory === 1;

          let options = [];
          if (q.question_form_option) {
            try {
              // Handle cases where option is already an object or a string
              options = typeof q.question_form_option === 'string'
                ? JSON.parse(q.question_form_option)
                : q.question_form_option;
            } catch (e) {
              console.error("Error parsing options for", q.question_label, e);
            }
          }

          // Render based on type
          if (q.question_form_type === 'text' || q.question_form_type === 'email' || q.question_form_type === 'mobile' || q.question_form_type === 'date') {
            return (
              <div className="form-group" key={q.id}>
                <label>
                  {q.question_label}
                  {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type={q.question_form_type === 'mobile' ? 'tel' : q.question_form_type}
                  name={fieldName}
                  className="form-control3"
                  value={formData[fieldName] || ""}
                  onChange={handleInputChange}
                  required={isRequired}
                />
                {formErrors[fieldName] && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors[fieldName]}</span>}
              </div>
            );
          }
          else if (q.question_form_type === 'radio') {
            return (
              <div className="form-group" key={q.id}>
                <label>
                  {q.question_label}
                  {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <div className="gender-options">
                  {options.map(opt => (
                    <label className="gender-option" key={opt.id}>
                      <input
                        type="radio"
                        name={fieldName}
                        value={opt.label || opt.name} // Sometimes label, sometimes name (countries)
                        checked={(formData[fieldName] || "") === (opt.label || opt.name)}
                        onChange={(e) => {
                          // Special handling if using IDs vs Labels.
                          // For simple mapping, we store the Label/Name as per static form logic.
                          // But for correct payload, we might need ID in some cases. 
                          // Sticking to value as Label/Name for now to match static logic.
                          handleInputChange(e);
                        }}
                      />
                      <span className="gender-label">{opt.label || opt.name}</span>
                    </label>
                  ))}
                </div>
                {formErrors[fieldName] && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors[fieldName]}</span>}
              </div>
            );
          }
          else if (q.question_form_type === 'select' || q.question_form_type === 'countries' || q.question_form_type === 'states' || q.question_form_type === 'cities') {
            // For countries type, use the options from API response
            // For states/cities, they will be populated by handleInputChange when country/state changes
            let displayOptions = options;

            // If this is a states field, use the states from state
            if (q.question_form_type === 'states') {
              displayOptions = states.map(s => ({
                id: s.id,
                label: s.state_name || s.name,
                name: s.state_name || s.name
              }));
            }

            // If this is a cities field, use the cities from state
            if (q.question_form_type === 'cities') {
              displayOptions = cities.map(c => ({
                id: c.id,
                label: c.city_name || c.name,
                name: c.city_name || c.name
              }));
            }

            return (
              <div className="form-group" key={q.id}>
                <label>
                  {q.question_label}
                  {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <select
                  name={fieldName}
                  className="form-select"
                  value={formData[fieldName] || ""}
                  onChange={async (e) => {
                    const { name, value } = e.target;

                    // If this is a country field, fetch states
                    if (q.question_form_type === 'countries') {
                      setFormData((prev) => ({ ...prev, [name]: value, state: "", city: "" }));
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
                    // If this is a state field, fetch cities
                    else if (q.question_form_type === 'states') {
                      setFormData((prev) => ({ ...prev, [name]: value, city: "" }));
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
                    // For other selects, just update the value
                    else {
                      handleInputChange(e);
                    }
                  }}
                  required={isRequired}
                >
                  <option value="">-- Select --</option>
                  {displayOptions.map(opt => (
                    <option key={opt.id} value={opt.label || opt.name || opt.code || opt.id}>
                      {opt.label || opt.name || opt.code}
                    </option>
                  ))}
                </select>
                {formErrors[fieldName] && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors[fieldName]}</span>}
              </div>
            );
          }
          // Handling for textarea (address) - if type is 'textarea' (not in list but robust to add)
          else if (q.question_form_type === 'textarea') {
            return (
              <div className="form-group" key={q.id}>
                <label>
                  {q.question_label}
                  {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <textarea
                  name={fieldName}
                  className="form-control3"
                  rows="3"
                  value={formData[fieldName] || ""}
                  onChange={handleInputChange}
                ></textarea>
                {formErrors[fieldName] && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors[fieldName]}</span>}
              </div>
            );
          }
          else if (q.question_form_type === 'file') {
            return (
              <div className="form-group" key={q.id}>
                <label>
                  {q.question_label}
                  {isRequired && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type="file"
                  name={fieldName}
                  className="form-control3"
                  onChange={handleInputChange}
                />
              </div>
            );
          }

          return null;
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
    if (!validateForm()) {
      return;
    }

    // Show payment modal immediately
    setShowPaymentModal(true);

    try {
      // Call PhonePe payment initiation API
      const res = await authAPI.phonepeInitiatePayment({
        event_id: eventId,
        amount: subTotal.toFixed(2)
      });

      if (res && res.data && res.data.redirect_url) {
        setPaymentData(res.data);
      } else {
        throw new Error("Invalid response from payment API");
      }
    } catch (error) {
      console.error("Payment Error", error);
      alert("Payment initiation failed. Please try again.");
      setShowPaymentModal(false);
    }
  };

  function validateForm() {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "gender",
      "dob",
      "addressLine1",
      "country",
      "state",
      "city",
      "pincode",
      "bloodGroup",
      // "tshirtSize", // Dynamic fields will handle their own validation check technically, 
      // but if we rely on formData check below, we need to know which keys to check.
      // Better: Iterate over `formQuestions` to check mandatory fields.
    ];

    // Dynamic Validation
    const errors = {};
    if (ticket && formQuestions && formQuestions[ticket.id]) {
      const qList = formQuestions[ticket.id][0] || [];
      qList.forEach(q => {
        if (q.is_manadatory === 1) {
          const key = getMappedKey(q);
          if (!formData[key] || String(formData[key]).trim() === "") {
            errors[key] = "This field is required";
          }
        }
      });
    } else {
      // Fallback to static validation if no questions loaded (shouldn't happen)
      requiredFields.forEach((field) => {
        if (!formData[field] || String(formData[field]).trim() === "") {
          errors[field] = "This field is required";
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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

            {/* Participant Form */}
            <div className="participant-form-card">
              <div className="participant-header">
                <div className="participant-title">
                  <i className="fas fa-user"></i>
                  <span>Participant - 1</span>
                </div>
                <div className="participant-category">
                  <i className="fas fa-ticket-alt"></i>
                  {localStorage.getItem("selectedCategoryTitle") || "Category"}
                </div>
              </div>

              <div className="form-content">
                {/* Participant Type Dropdown - Always visible */}
                <div className="form-group">
                  <select
                    name="participantType"
                    className="form-select"
                    value={formData.participantType}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Registration For
                    </option>
                    <option value="Myself">Myself</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Dynamic Fields */}
                {renderDynamicFields()}

              </div>
            </div>
          </div>

          {/* Right Column - Summary - Dynamic */}
          <div className="col-lg-4">
            <div className="summary-sidebar">
              <h3 className="summary-sidebar-title">SUMMARY</h3>

              <div className="summary-item">
                <span>Price (1 Registration)</span>
                <span>₹{price.toFixed(2)}</span>
              </div>

              <div className="summary-item ticket-info">
                <span>
                  {localStorage.getItem("selectedCategoryTitle") || "Price"}{" "}
                  (x1)
                </span>
                <span>₹{price.toFixed(2)}</span>
              </div>

              <div className="divider"></div>

              <div className="summary-item">
                <span>Taxes</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>

              <div className="summary-item">
                <span>Sub Total</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>

              <div className="divider"></div>

              <div className="summary-item total">
                <span>Total Amount</span>
                <span className="total-amount">₹{subTotal.toFixed(2)}</span>
              </div>

              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                  />
                  <span>
                    <a
                      href={`/event-terms/${eventId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      Terms and Condition
                    </a>
                  </span>
                </label>
              </div>

              <button className="btn-proceed-final" onClick={handleProceed}>
                <i className="fas fa-users"></i>
                <span className="proceed-count">1</span>
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
