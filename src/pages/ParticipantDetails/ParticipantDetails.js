import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TopNav from "../../components/Navbar/TopNav";
import { authAPI } from "../../services/authAPI";
import SearchableSelect from "../../components/SearchableSelect/SearchableSelect";
import PartyPopperIcon from "../../assets/image/party-popper.png";
import "./ParticipantDetails.css";

export default function ParticipantDetails() {
  // Get price and coupon info from sessionStorage
  const couponDiscount = parseFloat(sessionStorage.getItem("couponDiscount")) || 0;
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuestLogin = sessionStorage.getItem("isGuestLogin") === "true";

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
  const [selectedTickets, setSelectedTickets] = useState([]); // Tickets from sessionStorage
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0); // For Save & Next
  const [activeQuestionTab, setActiveQuestionTab] = useState({}); // Track active tab for each participant {participantIndex: groupName}
  const [parentSelections, setParentSelections] = useState({}); // Track parent question selections for conditional subquestions {participantIndex_questionId: selectedValue}
  const [termsAccepted, setTermsAccepted] = useState(false); // Track terms and conditions acceptance
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('phonepe'); // Track selected payment method (phonepe or payu)

  // Coupon state variables
  const [couponCode, setCouponCode] = useState(''); // Coupon code input value
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Applied coupon details from API
  const [couponLoading, setCouponLoading] = useState(false); // Loading state for coupon API call
  const [couponError, setCouponError] = useState(''); // Coupon validation error message
  const [isProceeding, setIsProceeding] = useState(false); // Loading state for payment initiation
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal for free registration

  // Active payment gateway state
  const [activePaymentGateway, setActivePaymentGateway] = useState(null); // Active payment gateway from admin (phonepe or payu)
  const [availableGateways, setAvailableGateways] = useState([]); // List of all available gateways
  const [showGatewayModal, setShowGatewayModal] = useState(false); // Controls selection modal
  const [gatewayLoading, setGatewayLoading] = useState(true); // Loading state for gateway API call

  // Question prices state - tracks prices from question selections
  // Format: { "participantIndex_questionId_optionId": { label: "...", price: 100, questionLabel: "..." } }
  const [questionPrices, setQuestionPrices] = useState({});

  // Coupon display location state
  const [couponDisplayLocation, setCouponDisplayLocation] = useState("both"); // Default to 'both'
  const [allowUniqueRegistration, setAllowUniqueRegistration] = useState(0); // Track AllowUniqueRegistration setting

  // Load existing coupon from sessionStorage on mount
  useEffect(() => {
    const storedCouponCode = sessionStorage.getItem('couponCode');
    const storedCouponData = sessionStorage.getItem('appliedCoupon');

    if (storedCouponCode && storedCouponData) {
      try {
        const couponData = JSON.parse(storedCouponData);
        setCouponCode(storedCouponCode);
        setAppliedCoupon(couponData);
        console.log('✅ Loaded existing coupon from sessionStorage:', storedCouponCode);
      } catch (error) {
        console.error('Error parsing stored coupon data:', error);
      }
    }
  }, []);


  // Check for test success modal via URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('testSuccess') === 'true') {
      setShowSuccessModal(true);
      console.log('🧪 Success modal test mode active');
    }
  }, [location.search]);


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
    country_name: "country",
    country_id: "country",
    state: "state",
    state_name: "state",
    state_id: "state",
    city: "city",
    city_name: "city",
    city_id: "city",
    pincode: "pincode",
    blood_group: "bloodGroup",
    t_shirt_size: "tshirtSize",
    id_proof_type: "idProofType",
    emergency_contact_person: "emergencyContactName",
    emergency_contact_no1: "emergencyContactNumber"
  };

  // Initialize participant forms based on ticket quantity
  useEffect(() => {
    const ticketQuantity = parseInt(sessionStorage.getItem("ticketQuantity")) || 1;
    const ticketsData = sessionStorage.getItem("selectedTickets");
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
        const userData = sessionStorage.getItem("userData");
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
          const sortedCountries = [...countriesRes.data.AllCountries]
            .map(c => ({
              ...c,
              label: c.country_name || c.name,
              name: c.country_name || c.name
            }))
            .sort((a, b) =>
              (a.label || "").localeCompare(b.label || "")
            );
          setCountries(sortedCountries);
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
            const sortedStates = [...statesRes.data.AllStates].sort((a, b) =>
              (a.state_name || a.name || "").localeCompare(b.state_name || b.name || "")
            );
            setStates(sortedStates);
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
            const sortedCities = [...citiesRes.data.AllCities].sort((a, b) =>
              (a.city_name || a.name || "").localeCompare(b.city_name || b.name || "")
            );
            setCities(sortedCities);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      // Fetch coupon display location
      try {
        console.log('🔍 Fetching coupon status for event:', eventId);
        const couponStatusResponse = await authAPI.getCouponStatus(eventId);
        console.log("📥 getCouponStatus FULL response:", JSON.stringify(couponStatusResponse, null, 2));
        if (couponStatusResponse && couponStatusResponse.data) {
          const location = couponStatusResponse.data.coupon_status || "both"; // Changed from coupon_display_location to coupon_status
          console.log('🎯 Setting couponDisplayLocation to:', location);
          setCouponDisplayLocation(location);
          console.log("✅ Coupon display location SET:", location);
        } else {
          console.warn('⚠️ No data in coupon status response, using default "both"');
          setCouponDisplayLocation("both");
        }
      } catch (error) {
        console.error("❌ Error fetching coupon status:", error);
        // Default to 'both' if API fails
        setCouponDisplayLocation("both");
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
          const title = sessionStorage.getItem("selectedCategoryTitle");
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
        // Get ticket quantity and selected tickets from sessionStorage
        const ticketQuantity = parseInt(sessionStorage.getItem("ticketQuantity")) || 1;
        const ticketsData = sessionStorage.getItem("selectedTickets");
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

        console.log("🎫 Tickets from sessionStorage:", tickets);
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
            // Capture AllowUniqueRegistration setting
            if (questionsRes.data.AllowUniqueRegistration !== undefined) {
              setAllowUniqueRegistration(Number(questionsRes.data.AllowUniqueRegistration));
              console.log("✅ AllowUniqueRegistration set to:", questionsRes.data.AllowUniqueRegistration);
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

  // Handle automatic redirection for Himalaya Wellness (Event 349)
  useEffect(() => {
    let timer;
    if (showSuccessModal && eventId === "349") {
      console.log("🚀 Automatic redirection for Himalaya Wellness initiated...");
      timer = setTimeout(() => {
        window.location.href = 'https://ashwagandha.in/';
      }, 5000); // 5 second delay to allow reading the message
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, eventId]);

  // Fetch active payment gateway on component mount
  useEffect(() => {
    const fetchActivePaymentGateway = async () => {
      if (!eventId) return;

      try {
        setGatewayLoading(true);
        console.log("🔍 Fetching active payment gateway for event:", eventId);

        const response = await authAPI.getActivePaymentGateway();
        console.log("✅ Active payment gateway response:", response);

        if (response && response.gateway) {
          const gateway = response.gateway.toLowerCase();

          // Store all available gateways
          if (response.gateways && Array.isArray(response.gateways)) {
            setAvailableGateways(response.gateways);
          } else {
            setAvailableGateways([response.gateway]);
          }

          // Normalize gateway name: "phonepe" or "payu"
          let normalizedGateway = gateway;
          if (gateway.includes('phone')) {
            normalizedGateway = 'phonepe';
          } else if (gateway.includes('pay') && gateway.includes('u')) {
            normalizedGateway = 'payu';
          }

          setActivePaymentGateway(normalizedGateway);
          setSelectedPaymentMethod(normalizedGateway);
          console.log("✅ Active payment gateway set to:", normalizedGateway);
        } else {
          // Fallback to PhonePe if no active gateway found
          console.warn("⚠️ No active gateway found, defaulting to PhonePe");
          setActivePaymentGateway('phonepe');
          setSelectedPaymentMethod('phonepe');
          setAvailableGateways(['PhonePe']);
        }
      } catch (error) {
        console.error("❌ Error fetching active payment gateway:", error);
        // Fallback to PhonePe on error
        setActivePaymentGateway('phonepe');
        setSelectedPaymentMethod('phonepe');
        setAvailableGateways(['PhonePe']);
      } finally {
        setGatewayLoading(false);
      }
    };

    fetchActivePaymentGateway();
  }, [eventId]);

  // Sticky summary scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      // Only enable sticky on desktop (screen width > 991px)
      if (window.innerWidth <= 991) {
        return;
      }

      const summaryElement = document.querySelector('.summary-sidebar');
      if (!summaryElement) return;

      const summaryParent = summaryElement.parentElement;
      const scrollThreshold = 450; // Adjust based on hero section height

      if (window.scrollY > scrollThreshold) {
        summaryElement.classList.add('is-sticky');
        // Calculate and set the width to match the column width
        const columnWidth = summaryParent.offsetWidth;
        summaryElement.style.width = `${columnWidth}px`;
      } else {
        summaryElement.classList.remove('is-sticky');
        summaryElement.style.width = '';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Helper function to determine if a question should be shown based on coupon display location
  const shouldShowQuestion = (question) => {
    // Check if this is a coupon code question
    // Check both question_label and question_form_type
    const isCouponQuestion = (question.question_label &&
      String(question.question_label).toLowerCase().includes('coupon')) ||
      (question.question_form_type && String(question.question_form_type).toLowerCase() === 'coupon_code');

    // Debug logging
    if (isCouponQuestion) {
      console.log('🎫 Coupon Question Check:', {
        questionLabel: question.question_label,
        questionFormType: question.question_form_type,
        couponDisplayLocation: couponDisplayLocation,
        shouldShow: couponDisplayLocation === 'inside' || couponDisplayLocation === 'both'
      });
    }

    if (!isCouponQuestion) {
      // Not a coupon question, always show
      return true;
    }

    // This is a coupon question, check display location
    // Show if: inside or both
    // Hide if: outside or none or any other value
    const shouldShow = couponDisplayLocation === 'inside' || couponDisplayLocation === 'both';
    console.log('🎫 Coupon Question Decision:', shouldShow ? 'SHOW' : 'HIDE');
    return shouldShow;
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = async (participantIndex, e) => {
    let { name, value, type, checked, files } = e.target;

    // Fix for unique radio button names (name_index)
    // Strip the _participantIndex suffix if it exists to match the state key
    if (type === 'radio' && name.endsWith(`_${participantIndex}`)) {
      name = name.replace(`_${participantIndex}`, '');
    }

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

          // Calculate age if DOB exists and Age field is present
          const { hasAge, ageQuestion } = hasBothAgeAndDOB(participantIndex);
          let autoCalculatedAge = "";
          if (hasAge && user.dob) {
            autoCalculatedAge = calculateAge(user.dob);
          }

          // Update specific participant's form data
          setParticipantForms(prev => prev.map((form, idx) =>
            idx === participantIndex ? {
              ...form,
              formData: {
                ...form.formData,
                participantType: value,
                // Static mappings that are always used
                firstName: user.firstname || "",
                lastName: user.lastname || "",
                email: user.email || "",
                mobile: user.mobile ? String(user.mobile) : "",
                gender: genderValue,
                dob: user.dob || "",
                addressLine1: user.address1 || "",
                addressLine2: user.address2 || "",
                pincode: user.pincode ? String(user.pincode) : "",
                bloodGroup: user.blood_group || "",
                tshirtSize: user.t_shirt_size || "",
                idProofType: user.id_proof_type || "",
                emergencyContactName: user.emergency_contact_person || "",
                emergencyContactNumber: user.emergency_contact_no1
                  ? String(user.emergency_contact_no1)
                  : "",
                // Dynamic mappings based on question types for more reliability
                ...(() => {
                  const dynamicData = {};
                  const ticketId = participantForms[participantIndex]?.ticketInfo?.id;
                  if (formQuestions && ticketId) {
                    const questions = formQuestions[ticketId][participantIndex] || formQuestions[ticketId][0] || [];
                    questions.forEach(q => {
                      const key = getMappedKey(q);
                      if (q.question_form_type === 'countries') dynamicData[key] = user.country_name || "";
                      if (q.question_form_type === 'states') dynamicData[key] = user.state_name || "";
                      if (q.question_form_type === 'cities') dynamicData[key] = user.city_name || "";
                      // Also support generic names just in case
                      if (q.user_field_mapping && q.user_field_mapping.toLowerCase() === 'country') dynamicData[key] = user.country_name || "";
                      if (q.user_field_mapping && q.user_field_mapping.toLowerCase() === 'state') dynamicData[key] = user.state_name || "";
                      if (q.user_field_mapping && q.user_field_mapping.toLowerCase() === 'city') dynamicData[key] = user.city_name || "";
                    });
                  }
                  // Standard fallbacks if not found in questions
                  if (!dynamicData.country) dynamicData.country = user.country_name || "";
                  if (!dynamicData.state) dynamicData.state = user.state_name || "";
                  if (!dynamicData.city) dynamicData.city = user.city_name || "";
                  
                  return dynamicData;
                })(),
                // Auto-fill age if question exists
                ...(hasAge && ageQuestion ? { [getMappedKey(ageQuestion)]: autoCalculatedAge } : {}),
              }
            } : form
          ));

          // Fetch states and cities for the auto-filled country
          const selectedCountry = countries.find(
            c => c.label === user.country_name || c.name === user.country_name || c.id == user.country
          );

          if (selectedCountry) {
            const countryId = selectedCountry.id;
            try {
              const statesRes = await authAPI.getStates({ country_id: countryId });
              if (statesRes && statesRes.data && Array.isArray(statesRes.data.AllState)) {
                const sortedStates = [...statesRes.data.AllState].sort((a, b) =>
                  (a.state_name || a.name || "").localeCompare(b.state_name || b.name || "")
                );
                setStates(sortedStates);

                // Find state
                const foundState = sortedStates.find(
                  s => s.state_name === user.state_name || s.name === user.state_name || s.id == user.state
                );

                if (foundState) {
                  const stateId = foundState.id;
                  const citiesRes = await authAPI.getCities({ state_id: stateId });
                  if (citiesRes && citiesRes.data && Array.isArray(citiesRes.data.AllCities)) {
                    const sortedCities = [...citiesRes.data.AllCities].sort((a, b) =>
                      (a.city_name || a.name || "").localeCompare(b.city_name || b.name || "")
                    );
                    setCities(sortedCities);
                  }
                }
              }
            } catch (err) {
              console.error("Error fetching states/cities during auto-fill:", err);
            }
          }

          // NEW: Trigger uniqueness check after auto-fill
          if (allowUniqueRegistration === 1) {
            setParticipantForms(currentForms => {
              const uniqueErrors = checkUniqueness(currentForms);
              setFormErrors(prev => {
                const newErrors = { ...prev };
                // Clear existing uniqueness errors first
                Object.keys(newErrors).forEach(key => {
                  if (key.includes('_email') || key.includes('_mobile')) {
                    if (String(newErrors[key]).includes('already used')) {
                      delete newErrors[key];
                    }
                  }
                });
                return { ...newErrors, ...uniqueErrors };
              });
              return currentForms;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    } else if (name === "participantType" && value === "Other") {
      // Clear form when "Other" is selected
      setParticipantForms(prev => {
        const updatedForms = prev.map((form, idx) =>
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
        );

        // NEW: Trigger uniqueness check after clearing (to remove previous errors)
        if (allowUniqueRegistration === 1) {
          const uniqueErrors = checkUniqueness(updatedForms);
          setFormErrors(prev => {
            const newErrors = { ...prev };
            Object.keys(newErrors).forEach(key => {
              if (key.includes('_email') || key.includes('_mobile')) {
                if (String(newErrors[key]).includes('already used')) {
                  delete newErrors[key];
                }
              }
            });
            return { ...newErrors, ...uniqueErrors };
          });
        }

        return updatedForms;
      });
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
      setParticipantForms(prev => {
        const updatedForms = prev.map((form, idx) => {
          if (idx === participantIndex) {
            const updatedFormData = {
              ...form.formData,
              [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
            };

            // Check if both Age and DOB fields exist
            const { hasAge, hasDOB, ageQuestion, dobQuestion } = hasBothAgeAndDOB(participantIndex);

            // If both Age and DOB exist, and user is changing DOB, auto-calculate age
            if (hasAge && hasDOB && dobQuestion) {
              const dobFieldName = getMappedKey(dobQuestion);
              const ageFieldName = getMappedKey(ageQuestion);

              // If the changed field is DOB, calculate and set age
              if (name === dobFieldName && value) {
                const calculatedAge = calculateAge(value);
                updatedFormData[ageFieldName] = calculatedAge;
                console.log(`🎂 Auto-calculated age: ${calculatedAge} from DOB: ${value}`);

                // NEW: Validate auto-calculated age against ticket limits
                const currentTicket = form.ticketInfo;
                if (currentTicket) {
                  const ageStart = parseInt(currentTicket.age_start);
                  const ageEnd = parseInt(currentTicket.age_end);

                  let ageError = "";
                  if (!isNaN(ageStart) && ageStart > 0 && calculatedAge < ageStart) {
                    ageError = `Age must be at least ${ageStart} for this category`;
                  } else if (!isNaN(ageEnd) && ageEnd > 0 && calculatedAge > ageEnd) {
                    ageError = `Age must be at most ${ageEnd} for this category`;
                  }

                  if (ageError) {
                    setFormErrors(prevErr => ({
                      ...prevErr,
                      [`participant_${participantIndex}_${ageFieldName}`]: ageError
                    }));
                  } else {
                    setFormErrors(prevErr => {
                      const newErrors = { ...prevErr };
                      delete newErrors[`participant_${participantIndex}_${ageFieldName}`];
                      return newErrors;
                    });
                  }
                }
              }
            }

            // Validate date range for date fields
            const currentTicket = form.ticketInfo;
            if (formQuestions && formQuestions[currentTicket.id]) {
              const questionsData = formQuestions[currentTicket.id];
              const questionsList = questionsData[participantIndex] || questionsData[0] || [];

              // Helper function to find question recursively (including nested subquestions)
              const findQuestionRecursive = (questions, fieldNm) => {
                for (const q of questions) {
                  if (getMappedKey(q) === fieldNm) {
                    return q;
                  }
                  // Check in sub_questions_array
                  if (q.sub_questions_array && Array.isArray(q.sub_questions_array)) {
                    const found = findQuestionRecursive(q.sub_questions_array, fieldNm);
                    if (found) return found;
                  }
                }
                return null;
              };

              const question = findQuestionRecursive(questionsList, name);

              // Check if this is a date field with range validation
              if (question && question.question_form_type === 'date' && question.date_range === 1 && value) {
                const enteredDate = new Date(value);
                let isValid = true;
                let errorMessage = "";

                if (question.range_start_date) {
                  const startTimestamp = parseInt(question.range_start_date);
                  const minDt = new Date(startTimestamp * 1000);
                  minDt.setHours(0, 0, 0, 0);

                  if (enteredDate < minDt) {
                    isValid = false;
                    const minDateStr = minDt.toISOString().split('T')[0];
                    errorMessage = `Date must be on or after ${minDateStr}`;
                  }
                }

                if (question.range_end_date && isValid) {
                  const endTimestamp = parseInt(question.range_end_date);
                  const maxDt = new Date(endTimestamp * 1000);
                  maxDt.setHours(23, 59, 59, 999);

                  if (enteredDate > maxDt) {
                    isValid = false;
                    const maxDateStr = maxDt.toISOString().split('T')[0];
                    errorMessage = `Date must be on or before ${maxDateStr}`;
                  }
                }

                // Update form errors
                if (!isValid) {
                  setFormErrors(prevErrors => ({
                    ...prevErrors,
                    [`participant_${participantIndex}_${name}`]: errorMessage
                  }));
                } else {
                  // Clear error if date is valid
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`participant_${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              }
              // Validate mobile number field
              else if (question && question.question_form_type === 'mobile') {
                if (value) {
                  // Only validate if there's a value
                  const mobileRegex = /^[0-9]{10}$/;
                  const isValid = mobileRegex.test(value);

                  if (!isValid) {
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      [`participant_${participantIndex}_${name}`]: 'Mobile number must be exactly 10 digits'
                    }));
                  } else {
                    // Clear error if mobile is valid
                    setFormErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors[`participant_${participantIndex}_${name}`];
                      return newErrors;
                    });
                  }
                } else {
                  // Clear error if field is empty
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`participant_${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              }
              // Validate email field
              else if (question && question.question_form_type === 'email') {
                if (value) {
                  // Only validate if there's a value
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const isValid = emailRegex.test(value);

                  if (!isValid) {
                    setFormErrors(prevErrors => ({
                      ...prevErrors,
                      [`participant_${participantIndex}_${name}`]: 'Please enter a valid email address'
                    }));
                  } else {
                    // Clear error if email is valid
                    setFormErrors(prevErrors => {
                      const newErrors = { ...prevErrors };
                      delete newErrors[`participant_${participantIndex}_${name}`];
                      return newErrors;
                    });
                  }
                } else {
                  // Clear error if field is empty
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`participant_${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              }
              // NEW: Validate Age field against ticket limits
              else if (question && (question.question_label?.toLowerCase() === 'age' || getMappedKey(question) === 'age')) {
                const ageValue = parseInt(value);
                const ageStart = parseInt(currentTicket.age_start);
                const ageEnd = parseInt(currentTicket.age_end);

                let isValid = true;
                let errorMessage = "";

                if (!isNaN(ageValue)) {
                  if (!isNaN(ageStart) && ageStart > 0 && ageValue < ageStart) {
                    isValid = false;
                    errorMessage = `Age must be at least ${ageStart} for this category`;
                  } else if (!isNaN(ageEnd) && ageEnd > 0 && ageValue > ageEnd) {
                    isValid = false;
                    errorMessage = `Age must be at most ${ageEnd} for this category`;
                  }
                }

                if (!isValid) {
                  setFormErrors(prevErrors => ({
                    ...prevErrors,
                    [`participant_${participantIndex}_${name}`]: errorMessage
                  }));
                } else {
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`participant_${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              }
              else {
                // Clear error for non-date fields or when value is empty
                setFormErrors(prevErrors => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[`participant_${participantIndex}_${name}`];
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

                // Clear all nested subquestion prices when parent selection changes
                const clearNestedPrices = (parentQuestionId) => {
                  setQuestionPrices(prevPrices => {
                    const newPrices = { ...prevPrices };

                    // Helper to recursively find all child question IDs
                    const getAllChildQuestionIds = (parentId) => {
                      const childIds = [];

                      // Find the parent question in questionsList
                      const findQuestionById = (questions, qId) => {
                        for (const q of questions) {
                          if (q.id === qId || q.general_form_id === qId) {
                            return q;
                          }
                          if (q.sub_questions_array && Array.isArray(q.sub_questions_array)) {
                            const found = findQuestionById(q.sub_questions_array, qId);
                            if (found) return found;
                          }
                        }
                        return null;
                      };

                      const parentQ = findQuestionById(questionsList, parentId);
                      if (parentQ && parentQ.sub_questions_array) {
                        // Recursively collect all nested question IDs
                        const collectIds = (subQuestions) => {
                          subQuestions.forEach(sq => {
                            const sqId = sq.id || sq.general_form_id;
                            childIds.push(sqId);
                            if (sq.sub_questions_array && Array.isArray(sq.sub_questions_array)) {
                              collectIds(sq.sub_questions_array);
                            }
                          });
                        };
                        collectIds(parentQ.sub_questions_array);
                      }

                      return childIds;
                    };

                    // Get all child question IDs
                    const childQuestionIds = getAllChildQuestionIds(parentQuestionId);

                    // Remove prices for all child questions
                    Object.keys(newPrices).forEach(key => {
                      const [pIdx, qId] = key.split('_');
                      if (parseInt(pIdx) === participantIndex && childQuestionIds.includes(parseInt(qId))) {
                        delete newPrices[key];
                        console.log('🗑️ Removed price for nested question:', key);
                      }
                    });

                    return newPrices;
                  });
                };

                // Clear nested prices for this parent question
                clearNestedPrices(question.id || question.general_form_id);
              }

              // Track prices for 'amount' type questions (custom donations)
              if (question && question.question_form_type === 'amount') {
                const amountValue = parseFloat(value) || 0;
                setQuestionPrices(prevPrices => {
                  const newPrices = { ...prevPrices };
                  const priceKey = `${participantIndex}_${question.id}_amount`;

                  if (amountValue > 0) {
                    newPrices[priceKey] = {
                      label: question.question_label,
                      price: amountValue,
                      questionLabel: question.question_label
                    };
                  } else {
                    delete newPrices[priceKey];
                  }

                  console.log('📊 Updated custom amount price in state:', newPrices);
                  return newPrices;
                });
              }

              // Track prices from question options (Supporting select, radio, and checkbox)
              if (question && ['select', 'radio', 'checkbox'].includes(question.question_form_type)) {
                // Parse question options
                let rawOptions = [];
                try {
                  if (typeof question.question_form_option === 'string') {
                    rawOptions = JSON.parse(question.question_form_option);
                  } else if (Array.isArray(question.question_form_option)) {
                    rawOptions = question.question_form_option;
                  }
                } catch (e) {
                  console.error('Error parsing question options:', e);
                }

                // Flatten options with comma-separated labels and prices
                const flattenedOptions = [];
                rawOptions.forEach(opt => {
                  const labelStr = opt.label || opt.name || "";
                  const priceStr = String(opt.price || "0");

                  const labels = labelStr.split(',').map(l => l.trim()).filter(l => l);
                  const prices = priceStr.split(',').map(p => p.trim()).filter(p => p);

                  labels.forEach((lbl, idxx) => {
                    flattenedOptions.push({
                      ...opt,
                      label: lbl,
                      price: parseFloat(prices[idxx] || prices[0] || 0) // Fallback to first price if fewer prices than labels
                    });
                  });
                });

                console.log('🔍 Price tracking for:', {
                  type: question.question_form_type,
                  name,
                  value,
                  flattenedOptions
                });

                // Update question prices based on selection
                setQuestionPrices(prevPrices => {
                  const newPrices = { ...prevPrices };

                  // Remove all previous prices for this question/participant index
                  Object.keys(newPrices).forEach(key => {
                    if (key.startsWith(`${participantIndex}_${question.id}_`)) {
                      delete newPrices[key];
                    }
                  });

                  // Add new prices based on current selection(s)
                  if (question.question_form_type === 'checkbox') {
                    const values = Array.isArray(value) ? value : [];
                    values.forEach(v => {
                      const matchedOpt = flattenedOptions.find(opt => opt.label === v);
                      if (matchedOpt && matchedOpt.price > 0) {
                        const priceKey = `${participantIndex}_${question.id}_${matchedOpt.label}`;
                        newPrices[priceKey] = {
                          label: matchedOpt.label,
                          price: matchedOpt.price,
                          questionLabel: question.question_label
                        };
                      }
                    });
                  } else {
                    // select or radio
                    if (value) {
                      const matchedOpt = flattenedOptions.find(opt => opt.label === value || opt.id == value);
                      if (matchedOpt && matchedOpt.price > 0) {
                        const priceKey = `${participantIndex}_${question.id}_${matchedOpt.label || matchedOpt.id}`;
                        newPrices[priceKey] = {
                          label: matchedOpt.label,
                          price: matchedOpt.price,
                          questionLabel: question.question_label
                        };
                      }
                    }
                  }

                  console.log('📊 Updated item prices in state:', newPrices);
                  return newPrices;
                });
              }
            }

            return {
              ...form,
              formData: updatedFormData
            };
          }
          return form;
        });

        // Uniqueness check for email/mobile
        if (allowUniqueRegistration === 1) {
          const uniqueErrors = checkUniqueness(updatedForms);
          setFormErrors(prev => {
            const newErrors = { ...prev };
            // Clear existing uniqueness errors first
            Object.keys(newErrors).forEach(key => {
              if (key.includes('_email') || key.includes('_mobile')) {
                // Only clear if it was a uniqueness error (contains duplicate message)
                if (String(newErrors[key]).includes('already used')) {
                  delete newErrors[key];
                }
              }
            });
            return { ...newErrors, ...uniqueErrors };
          });
        }

        return updatedForms;
      });
    }
  };


  const getMappedKey = (question) => {
    if (!question || !question.user_field_mapping) return `custom_${question?.id || 'unknown'}`;
    const mappingKey = question.user_field_mapping.toLowerCase();
    return fieldMapping[mappingKey] || `custom_${question.id}`;
  };

  // Helper function to check if both Age and DOB fields exist
  const hasBothAgeAndDOB = (participantIndex) => {
    const participantForm = participantForms[participantIndex];
    if (!participantForm || !participantForm.ticketInfo) return { hasAge: false, hasDOB: false, ageQuestion: null, dobQuestion: null };

    const currentTicket = participantForm.ticketInfo;
    if (!formQuestions || !formQuestions[currentTicket.id]) return { hasAge: false, hasDOB: false, ageQuestion: null, dobQuestion: null };

    const questionsData = formQuestions[currentTicket.id];
    const questionsList = questionsData[participantIndex] || questionsData[0] || [];

    let ageQuestion = null;
    let dobQuestion = null;

    questionsList.forEach(q => {
      const label = q.question_label?.toLowerCase() || '';
      const fieldName = getMappedKey(q);

      // Check for Age field
      if (label === 'age' || fieldName === 'age') {
        ageQuestion = q;
      }
      // Check for Date of Birth field
      if (label === 'date of birth' || label === 'dob' || fieldName === 'dob') {
        dobQuestion = q;
      }
    });

    return {
      hasAge: ageQuestion !== null,
      hasDOB: dobQuestion !== null,
      ageQuestion,
      dobQuestion
    };
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper to check if a ticket is eligible for the coupon
  const isTicketEligible = (ticketId, coupon) => {
    if (!ticketId || !coupon) return false;

    // apply_ticket: "1" = all tickets, "2" = selected tickets
    const applyType = parseInt(coupon.apply_ticket);

    if (applyType === 2) {
      // 1. Check ticket_selected_data (JSON array of checked tickets)
      if (coupon.ticket_selected_data) {
        try {
          const selectedData = typeof coupon.ticket_selected_data === 'string'
            ? JSON.parse(coupon.ticket_selected_data)
            : coupon.ticket_selected_data;

          if (Array.isArray(selectedData)) {
            const isSelected = selectedData.some(t =>
              String(t.id) === String(ticketId) &&
              (t.checked === true || t.checked === "true" || t.checked === 1 || t.checked === "1")
            );
            if (isSelected) return true;
          }
        } catch (e) {
          console.error("Error parsing ticket_selected_data:", e);
        }
      }

      // 2. Check ticket_details (Comma-separated string of eligible ticket IDs)
      if (coupon.ticket_details) {
        const eligibleIds = String(coupon.ticket_details).split(',').map(id => id.trim());
        if (eligibleIds.includes(String(ticketId))) {
          return true;
        }
      }

      // If applyType is 2 and no matches found, it's not eligible
      return false;
    }

    // Default to true for all other cases (including applyType 1 or undefined)
    return true;
  };

  // Helper to calculate discount for a specific ticket
  const getTicketDiscount = (ticket, coupon) => {
    if (!isTicketEligible(ticket.id, coupon)) return 0;

    let ticketPrice = parseFloat(ticket.ticket_price);
    // Apply early bird if active
    if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
      const ebDiscount = parseFloat(ticket.discount_value || 0);
      if (ticket.discount === 1) { // percentage
        ticketPrice = ticketPrice - (ticketPrice * ebDiscount / 100);
      } else { // amount
        ticketPrice = ticketPrice - ebDiscount;
      }
    }

    const amtPerType = parseInt(coupon.discount_amt_per_type);
    const totalTicketAmount = ticketPrice * ticket.quantity;

    if (amtPerType === 1) { // Fixed Amount
      return parseFloat(coupon.discount_amount || 0);
    } else if (amtPerType === 2) { // Percentage
      const percentage = parseFloat(coupon.discount_percentage || 0);
      return (totalTicketAmount * percentage) / 100;
    }
    return 0;
  };

  // Unified calculation function - UI aur Payment Gateway dono ke liye same amount
  const calculateFinalAmount = () => {
    // Step 1: Calculate subtotal with all fees and taxes
    const subtotal = selectedTickets.reduce((sum, ticket) => {
      // Early bird discount apply karo
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

      // Check if ticket is free (status 2)
      if (ticket.ticket_status === 2 || ticket.ticket_status === "2") {
        return sum;
      }

      const baseAmount = effectivePrice * parseInt(ticket.quantity);
      const calcDetails = ticket.ticket_calculation_details || {};

      // Check if participant is paying fees/gateway
      // 2 = Participant, 1 = Organiser (from RaceCategoryForm.js)
      const isParticipantPayingFees = ticket.player_of_fee === 2 || ticket.player_of_fee === "2";
      const isParticipantPayingGateway = ticket.player_of_gateway_fee === 2 || ticket.player_of_gateway_fee === "2";

      // Check if GST enabled hai
      const isGSTEnabled = calcDetails.collect_gst === "1" || calcDetails.collect_gst === 1;

      // Platform fees (GST handling ke saath) - Only add if Participant pays
      const convenienceFeeWithGST = isParticipantPayingFees ? (parseFloat(calcDetails.convenience_fee_amount) || 0) : 0;
      const convenienceFeeBase = !isGSTEnabled && convenienceFeeWithGST > 0
        ? Math.round((convenienceFeeWithGST / 1.18) * 100) / 100
        : convenienceFeeWithGST;

      const platformFeeBase = isParticipantPayingFees ? (parseFloat(calcDetails.platform_fees_5_each) || 0) : 0;

      const paymentGatewayWithGST = isParticipantPayingGateway ? (parseFloat(calcDetails['payment_gateway_1.85_buyer'] || calcDetails.payment_gateway_1_85_buyer) || 0) : 0;
      const paymentGatewayChargesBase = !isGSTEnabled && paymentGatewayWithGST > 0
        ? Math.round((paymentGatewayWithGST / 1.18) * 100) / 100
        : paymentGatewayWithGST;

      const totalPlatformFee = (convenienceFeeBase + platformFeeBase + paymentGatewayChargesBase) * parseInt(ticket.quantity);

      // GST components - only add fee GST if Participant pays those fees
      const registrationGST = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
      const convenienceFeeGST = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0) : 0;
      const platformFeeGST = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0) : 0;
      const paymentGatewayGST = isParticipantPayingGateway ? parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0) : 0;

      const totalTaxes = (registrationGST + convenienceFeeGST + platformFeeGST + paymentGatewayGST) * parseInt(ticket.quantity);

      return sum + baseAmount + totalPlatformFee + totalTaxes;
    }, 0);

    // Step 2: Coupon discount calculate karo
    const totalDiscountAmount = appliedCoupon ? selectedTickets.reduce((sum, t) => {
      return sum + getTicketDiscount(t, appliedCoupon);
    }, 0) : 0;

    // Step 3: Question prices add karo
    const questionTotal = Object.values(questionPrices).reduce((sum, p) => sum + p.price, 0);

    // Final amount
    const finalPrice = Math.max(0, subtotal - totalDiscountAmount + questionTotal);
    return finalPrice.toFixed(2);
  };

  // Helper function to check uniqueness across participants
  const checkUniqueness = (forms) => {
    if (allowUniqueRegistration !== 1 || forms.length <= 1) return {};

    const errors = {};
    const emails = {};
    const mobiles = {};

    forms.forEach((form, idx) => {
      const { email, mobile } = form.formData;
      if (email && email.trim()) {
        const lowerEmail = email.trim().toLowerCase();
        if (emails[lowerEmail] !== undefined) {
          const errorKey = `participant_${idx}_email`;
          errors[errorKey] = `Email "${email}" is already used by Participant ${emails[lowerEmail] + 1}`;
        } else {
          emails[lowerEmail] = idx;
        }
      }
      if (mobile && mobile.trim()) {
        const cleanMobile = mobile.trim();
        if (mobiles[cleanMobile] !== undefined) {
          const errorKey = `participant_${idx}_mobile`;
          errors[errorKey] = `Mobile number "${mobile}" is already used by Participant ${mobiles[cleanMobile] + 1}`;
        } else {
          mobiles[cleanMobile] = idx;
        }
      }
    });

    return errors;
  };

  const handleApplyCoupon = async (couponCode, participantIndex, questionId) => {
    if (!couponCode || couponCode.trim() === '') {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Extract ticket IDs from selected tickets
      const ticketIds = selectedTickets.map(ticket => ticket.id);

      // Call getCoupons API
      const response = await authAPI.getCoupons({
        event_id: eventId,
        ticket_ids: ticketIds,
        coupon_code: couponCode.trim()
      });

      console.log('✅ Coupon API Response:', response);

      // Check if API call was successful
      if (response && response.data && response.data.Coupons && response.data.Coupons.length > 0) {
        const matchingCoupon = response.data.Coupons.find(
          c => (c.discount_code || c.coupon_code)?.toLowerCase() === couponCode.trim().toLowerCase()
        );

        if (!matchingCoupon) {
          setCouponError('Invalid coupon code');
          setAppliedCoupon(null);
          return;
        }

        // Calculate total discount across all eligible tickets
        const totalDiscount = selectedTickets.reduce((sum, t) => {
          return sum + getTicketDiscount(t, matchingCoupon);
        }, 0);

        // Transform coupon data
        const transformedCoupon = {
          ...matchingCoupon,
          coupon_code: matchingCoupon.discount_code || matchingCoupon.coupon_code,
          discount_type: parseInt(matchingCoupon.discount_amt_per_type),
          discount_value: parseInt(matchingCoupon.discount_amt_per_type) === 2
            ? parseFloat(matchingCoupon.discount_percentage || 0)
            : parseFloat(matchingCoupon.discount_amount || 0)
        };

        // Store applied coupon details
        setAppliedCoupon(transformedCoupon);
        setCouponError('');

        // Store in sessionStorage for cross-page synchronization
        sessionStorage.setItem('couponCode', couponCode.trim());
        sessionStorage.setItem('appliedCoupon', JSON.stringify(transformedCoupon));
        sessionStorage.setItem('couponDiscount', totalDiscount.toFixed(2));

        console.log('✅ Coupon applied successfully:', transformedCoupon);
        console.log('💰 Total Discount calculated:', totalDiscount);
      } else {
        // Invalid coupon
        let errorMessage = 'Invalid or expired coupon code';
        if (response && response.message && response.message !== 'Request processed successfully') {
          errorMessage = response.message;
        }
        setCouponError(errorMessage);
        setAppliedCoupon(null);
        sessionStorage.removeItem('couponCode');
        sessionStorage.removeItem('appliedCoupon');
        sessionStorage.removeItem('couponDiscount');
      }
    } catch (error) {
      console.error('❌ Coupon API Error:', error);
      setCouponError('Failed to apply coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle Remove Coupon
  const handleRemoveCoupon = (participantIndex, questionId) => {
    setAppliedCoupon(null);
    setCouponError('');

    // Clear the coupon code input field
    handleInputChange(participantIndex, {
      target: { name: `question_${questionId}`, value: '' }
    });

    console.log('🗑️ Coupon removed');
  };


  // Build booking payload for PayU payment
  const buildBookingPayload = () => {
    // Get total attendees
    const total_attendees = selectedTickets.reduce((sum, t) => sum + t.quantity, 0);

    const files_to_collect = [];

    // Build FormQuestions object - organize by ticket ID
    const FormQuestions = {};
    participantForms.forEach((participantForm, participantIndex) => {
      const ticketId = participantForm.ticketInfo?.id;
      if (!ticketId) return;

      if (!FormQuestions[ticketId]) {
        FormQuestions[ticketId] = [];
      }

      // Get all questions for this participant
      if (formQuestions && formQuestions[ticketId]) {
        const questionsData = formQuestions[ticketId];
        const questionsList = questionsData[participantIndex] || questionsData[0] || [];

        // Helper to recursively map questions and their subquestions
        const mapQuestion = (q) => {
          const fieldName = getMappedKey(q);
          const fieldValue = participantForm.formData[fieldName];

          // Handle File objects for "upload id" fields
          let actualValue = fieldValue || "";
          if (fieldValue instanceof File) {
            files_to_collect.push(fieldValue);
            actualValue = fieldValue.name;
          }

          // Recursively map subquestions if they exist
          const mappedSubQuestions = q.sub_questions_array
            ? q.sub_questions_array.map(sq => mapQuestion(sq))
            : undefined;

          const mappedQ = {
            ...q,
            ActualValue: actualValue,
            Error: "",
            TicketId: ticketId.toString()
          };

          if (mappedSubQuestions) {
            mappedQ.sub_questions_array = mappedSubQuestions;
          }

          return mappedQ;
        };

        const participantQuestions = questionsList.map(q => mapQuestion(q));
        FormQuestions[ticketId].push(participantQuestions);
      }
    });

    // Calculate total price using consistent logic that respects payer settings
    const subtotal = selectedTickets.reduce((sum, ticket) => {
      // Early bird discount apply karo
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

      // Check if ticket is free (status 2)
      if (ticket.ticket_status === 2 || ticket.ticket_status === "2") {
        return sum;
      }

      const baseAmount = effectivePrice * parseInt(ticket.quantity);
      const calcDetails = ticket.ticket_calculation_details || {};

      // Check if participant is paying fees/gateway
      const isParticipantPayingFees = ticket.player_of_fee === 2 || ticket.player_of_fee === "2";
      const isParticipantPayingGateway = ticket.player_of_gateway_fee === 2 || ticket.player_of_gateway_fee === "2";

      // Check if GST enabled hai
      const isGSTEnabled = calcDetails.collect_gst === "1" || calcDetails.collect_gst === 1;

      // Platform fees (GST handling ke saath) - Only add if Participant pays
      const convenienceFeeWithGST = isParticipantPayingFees ? (parseFloat(calcDetails.convenience_fee_amount) || 0) : 0;
      const convenienceFeeBase = !isGSTEnabled && convenienceFeeWithGST > 0
        ? Math.round((convenienceFeeWithGST / 1.18) * 100) / 100
        : convenienceFeeWithGST;

      const platformFeeBase = isParticipantPayingFees ? (parseFloat(calcDetails.platform_fees_5_each) || 0) : 0;

      const paymentGatewayWithGST = isParticipantPayingGateway ? (parseFloat(calcDetails['payment_gateway_1.85_buyer'] || calcDetails.payment_gateway_1_85_buyer) || 0) : 0;
      const paymentGatewayChargesBase = !isGSTEnabled && paymentGatewayWithGST > 0
        ? Math.round((paymentGatewayWithGST / 1.18) * 100) / 100
        : paymentGatewayWithGST;

      const totalPlatformFee = (convenienceFeeBase + platformFeeBase + paymentGatewayChargesBase) * parseInt(ticket.quantity);

      // GST components - only add fee GST if Participant pays those fees
      const registrationGST = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
      const convenienceFeeGST = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0) : 0;
      const platformFeeGST = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0) : 0;
      const paymentGatewayGST = isParticipantPayingGateway ? parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0) : 0;

      const totalTaxes = (registrationGST + convenienceFeeGST + platformFeeGST + paymentGatewayGST) * parseInt(ticket.quantity);

      return sum + baseAmount + totalPlatformFee + totalTaxes;
    }, 0);

    // Calculate total discount from selected tickets and applied coupon
    const totalDiscountAmount = appliedCoupon
      ? selectedTickets.reduce((sum, t) => sum + getTicketDiscount(t, appliedCoupon), 0)
      : 0;

    // Add Question prices
    const questionTotal = Object.values(questionPrices).reduce((sum, p) => sum + p.price, 0);

    const TotalPrice = Math.max(0, subtotal - totalDiscountAmount + questionTotal).toFixed(2);
    const TotalDiscount = totalDiscountAmount.toFixed(2);

    // Build AllTickets array with all ticket details
    const AllTickets = selectedTickets.map(ticket => ({
      ...ticket,
      count: ticket.quantity
    }));

    // Build GstArray (same as AllTickets for GST calculation)
    const GstArray = [...AllTickets];

    // Get event URL
    const EventUrl = event ? `https://racesregistrations.com/e/${event.url || event.name}` : "";

    // Build the complete payload
    const bookingTicketsArray = {
      event_id: eventId,
      total_attendees,
      FormQuestions,
      TotalPrice,
      TotalDiscount,
      AllTickets,
      ExtraPricing: [],
      EventUrl,
      UtmCampaign: sessionStorage.getItem('utm_campaign') || "",
      GstArray
    };

    return { bookingPayload: bookingTicketsArray, files: files_to_collect };
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
    console.log('📋 All questions before filtering:', questionsList.map(q => ({
      id: q.id,
      label: q.question_label,
      is_subquestion: q.is_subquestion
    })));

    const parentQuestions = questionsList
      .filter(q => q.is_subquestion === 0 || !q.is_subquestion)
      .filter(q => isQuestionEnabled(q))
      .filter(q => {
        const shouldShow = shouldShowQuestion(q);
        console.log(`🔍 Filter check for "${q.question_label}": ${shouldShow ? 'KEEP' : 'REMOVE'}`);
        return shouldShow;
      }); // Filter coupon questions based on display location

    console.log('✅ Final parentQuestions after all filters:', parentQuestions.map(q => q.question_label));
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

    // NEW: Process sub_questions_array from API response for nested subquestions
    const processSubQuestionsArray = (questions) => {
      questions.forEach(question => {
        if (question.sub_questions_array && Array.isArray(question.sub_questions_array)) {
          const questionId = question.general_form_id;

          if (!subQuestionMap[questionId]) {
            subQuestionMap[questionId] = [];
          }

          question.sub_questions_array.forEach(subQ => {
            subQ.is_subquestion = 1;
            subQ.parent_question_id = questionId;
            subQuestionMap[questionId].push(subQ);

            // Recursively process nested sub_questions_array
            if (subQ.sub_questions_array) {
              processSubQuestionsArray([subQ]);
            }
          });
        }
      });
    };

    processSubQuestionsArray(parentQuestions);
    processSubQuestionsArray(subQuestions);

    // Debug logging for nested subquestions
    console.log('📊 Subquestion mapping:', subQuestionMap);
    console.log('📋 All subquestions:', subQuestions.map(sq => ({
      id: sq.general_form_id,
      label: sq.question_label,
      parent_id: sq.parent_question_id,
      is_subquestion: sq.is_subquestion,
      child_question_ids: sq.child_question_ids,
      question_type: sq.question_type  // NEW: Log question_type field
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
          parentChildIds: parentQuestion.child_question_ids,
          parentOptionId: subQuestion.parent_option_id  // NEW: Log parent_option_id
        });

        // NEW: Check parent_option_id for sub_questions_array filtering
        if (subQuestion.parent_option_id) {
          // Get parent question options
          const options = parentQuestion.question_form_option
            ? (typeof parentQuestion.question_form_option === 'string'
              ? JSON.parse(parentQuestion.question_form_option)
              : parentQuestion.question_form_option)
            : [];

          if (Array.isArray(options)) {
            // Find the selected option
            const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];

            for (const value of selectedValues) {
              const selectedOption = options.find(opt => {
                if (typeof opt === 'string') return opt === value;
                const optLabel = opt.label || opt.name;
                if (optLabel === value) return true;
                const splitLabels = optLabel ? optLabel.split(',').map(l => l.trim()) : [];
                return splitLabels.includes(value);
              });

              // Check if selected option's ID matches parent_option_id
              if (selectedOption && selectedOption.id) {
                const matches = String(selectedOption.id) === String(subQuestion.parent_option_id);
                console.log('🎯 parent_option_id check:', {
                  selectedOptionId: selectedOption.id,
                  requiredParentOptionId: subQuestion.parent_option_id,
                  matches
                });

                if (matches) {
                  return true;
                }
              }
            }

            // If parent_option_id is specified but doesn't match, hide the subquestion
            console.log('❌ parent_option_id mismatch - hiding subquestion');
            return false;
          }
        }

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

          if (selectedOption) {
            // Check option-level child_question_id
            // Support comma-separated child_question_ids for multiple subquestions per option
            if (selectedOption.child_question_id) {
              const childIds = String(selectedOption.child_question_id).split(',').map(id => id.trim());
              const matches = childIds.some(childId => String(childId) === String(subQuestion.general_form_id));

              if (matches) {
                console.log('✅ Match found via option child_question_id:', {
                  optionLabel: selectedOption.label || selectedOption.name,
                  childQuestionIds: selectedOption.child_question_id,
                  subQuestionId: subQuestion.general_form_id,
                  subQuestionLabel: subQuestion.question_label
                });
                return true;
              }
            }

            // Also check question_type if available (backward compatibility)
            if (selectedOption.id && subQuestion.question_type) {
              if (String(subQuestion.question_type) === String(selectedOption.id)) {
                console.log('✅ Match found via question_type:', subQuestion.question_type, '=', selectedOption.id);
                return true;
              }
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

    // Get all group names and sort them by group_question_order_index
    const groupNames = Object.keys(groupedQuestions).sort((a, b) => {
      // Get the order index from the first question in each group
      const orderA = groupedQuestions[a][0]?.group_question_order_index || 0;
      const orderB = groupedQuestions[b][0]?.group_question_order_index || 0;
      return orderA - orderB;
    });
    const hasGroups = groupNames.length > 0;

    // Set default active tab for this participant if not set
    const currentActiveTab = activeQuestionTab[participantIndex];
    if (!currentActiveTab) {
      if (hasGroups) {
        // Prioritize first group if there are groups
        setActiveQuestionTab(prev => ({
          ...prev,
          [participantIndex]: groupNames[0]
        }));
      } else if (ungroupedQuestions.length > 0) {
        // Otherwise use General tab
        setActiveQuestionTab(prev => ({
          ...prev,
          [participantIndex]: 'general'
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
              {/* Group tabs first */}
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
              {/* General tab last if there are ungrouped questions */}
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
            if (question.question_form_type === 'text' || question.question_form_type === 'email' || question.question_form_type === 'mobile' || question.question_form_type === 'date' || question.question_form_type === 'amount') {
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

              // Check for email domain validation (specific_domain === 2)
              let domainError = "";
              if (question.question_form_type === 'email' &&
                question.specific_domain === 2 &&
                question.domain_name) {
                const emailValue = currentValue.trim();
                if (emailValue) {
                  // Extract domain from email (part after @)
                  const emailParts = emailValue.split('@');
                  if (emailParts.length === 2) {
                    const emailDomain = emailParts[1].toLowerCase();
                    const expectedDomain = question.domain_name.trim().toLowerCase();
                    if (emailDomain !== expectedDomain) {
                      domainError = `Email must be from ${question.domain_name} domain`;
                    }
                  }
                }
              }


              // For date fields, check if date_range is enabled and parse range dates
              let minDate = null;
              let maxDate = null;

              // Force max date to today if it's a DOB field
              const label = (question.question_label || "").toLowerCase();
              const isDOBField = label === 'date of birth' || label === 'dob' || fieldName.toLowerCase() === 'dob';

              if (question.question_form_type === 'date') {
                if (question.date_range === 1) {
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

                // If it's a DOB field, ensure max date is not in the future
                if (isDOBField) {
                  const todayStr = new Date().toISOString().split('T')[0];
                  if (!maxDate || maxDate > todayStr) {
                    maxDate = todayStr;
                  }
                }
              }

              // Check if this is the Age field and both Age and DOB exist
              const { hasAge, hasDOB, ageQuestion } = hasBothAgeAndDOB(participantIndex);
              const isAgeField = ageQuestion && getMappedKey(ageQuestion) === fieldName;
              const shouldDisableAge = hasAge && hasDOB && isAgeField;

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: question.description_color || '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {/* Hint icon - show if question_hint exists */}
                    {question.question_hint && question.question_hint.trim() !== '' && (
                      <span
                        style={{
                          marginLeft: '8px',
                          cursor: 'help',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1.5px solid #666',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#666',
                          position: 'relative'
                        }}
                        title={question.hint_type === 1 || !question.hint_type ? question.question_hint : undefined}
                        onMouseEnter={(e) => {
                          if (question.hint_type === 2 || question.hint_type === '2') {
                            // Show image tooltip
                            const tooltip = e.currentTarget.querySelector('.image-tooltip');
                            if (tooltip) tooltip.style.display = 'block';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (question.hint_type === 2 || question.hint_type === '2') {
                            // Hide image tooltip
                            const tooltip = e.currentTarget.querySelector('.image-tooltip');
                            if (tooltip) tooltip.style.display = 'none';
                          }
                        }}
                      >
                        i
                        {/* Image tooltip for hint_type 2 */}
                        {(question.hint_type === 2 || question.hint_type === '2') && (
                          <div
                            className="image-tooltip"
                            style={{
                              display: 'none',
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '8px',
                              padding: '8px',
                              backgroundColor: '#fff',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              zIndex: 1000,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <img
                              src={authAPI.getImageUrl(question.hint_image || question.question_hint)}
                              alt="Hint"
                              style={{
                                maxWidth: '300px',
                                maxHeight: '200px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div style="padding: 8px; color: #666;">Image not available</div>';
                              }}
                            />
                          </div>
                        )}
                      </span>
                    )}
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
                    {shouldDisableAge && (
                      <small style={{ color: '#28a745', fontSize: '11px', marginLeft: '8px' }}>
                        (Auto-calculated from Date of Birth)
                      </small>
                    )}
                  </label>
                  <input
                    type={
                      question.question_form_type === 'date'
                        ? "date"
                        : question.question_form_type === 'amount'
                          ? "number"
                          : question.question_form_type === 'mobile'
                            ? "tel"
                            : question.question_form_type === 'email'
                              ? "email"
                              : "text"
                    }
                    name={fieldName}
                    className="form-control3"
                    value={currentValue}
                    onChange={(e) => handleInputChange(participantIndex, e)}
                    onKeyPress={(e) => {
                      // For mobile fields, only allow numbers
                      if (question.question_form_type === 'mobile') {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }
                    }}
                    onInput={(e) => {
                      // For mobile fields, limit to 10 digits
                      if (question.question_form_type === 'mobile') {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      }
                    }}
                    required={isRequired}
                    minLength={minLength || undefined}
                    maxLength={question.question_form_type === 'mobile' ? 10 : (maxLength || undefined)}
                    min={minDate || undefined}
                    max={maxDate || undefined}
                    placeholder={question.question_form_type === 'mobile' ? '10 digit mobile number' : ''}
                    disabled={shouldDisableAge}
                    style={shouldDisableAge ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />

                  {/* Apply/Remove button for Enter Coupon Code field */}
                  {
                    question.question_label.toLowerCase().includes('enter coupon code') && (
                      <div style={{ marginTop: '12px' }}>
                        {!appliedCoupon ? (
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(currentValue, participantIndex, question.id)}
                            disabled={!currentValue || couponLoading}
                            style={{
                              padding: '10px 24px',
                              backgroundColor: (!currentValue || couponLoading) ? '#ccc' : '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: (!currentValue || couponLoading) ? 'not-allowed' : 'pointer',
                              transition: 'background-color 0.3s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              minWidth: '100px'
                            }}
                          >
                            {couponLoading ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Applying...
                              </>
                            ) : 'Apply'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveCoupon(participantIndex, question.id)}
                            style={{
                              padding: '10px 24px',
                              backgroundColor: '#666',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s'
                            }}
                          >
                            Remove
                          </button>
                        )}

                        {/* Success Message */}
                        {appliedCoupon && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            backgroundColor: '#d4edda',
                            border: '1px solid #c3e6cb',
                            borderRadius: '6px',
                            color: '#155724',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <i className="fas fa-check-circle"></i>
                            <span>Coupon "{appliedCoupon.coupon_code}" applied successfully!</span>
                          </div>
                        )}

                        {/* Error Message */}
                        {couponError && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '6px',
                            color: '#721c24',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{couponError}</span>
                          </div>
                        )}
                      </div>
                    )
                  }

                  {lengthError && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>{lengthError}</span>}
                  {domainError && <span style={{ color: 'red', fontSize: '12px', display: 'block', marginTop: '4px' }}>{domainError}</span>}
                  {
                    formErrors[`participant_${participantIndex}_${fieldName}`] && (
                      <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {formErrors[`participant_${participantIndex}_${fieldName}`]}
                      </span>
                    )
                  }
                  {
                    formErrors[`participant_${participantIndex}_${fieldName}_length`] && (
                      <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {formErrors[`participant_${participantIndex}_${fieldName}_length`]}
                      </span>
                    )
                  }
                  {
                    formErrors[`participant_${participantIndex}_${fieldName}_daterange`] && (
                      <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {formErrors[`participant_${participantIndex}_${fieldName}_daterange`]}
                      </span>
                    )
                  }
                  {
                    formErrors[`participant_${participantIndex}_${fieldName}_age`] && (
                      <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {formErrors[`participant_${participantIndex}_${fieldName}_age`]}
                      </span>
                    )
                  }
                  {
                    formErrors[`participant_${participantIndex}_${fieldName}_domain`] && (
                      <span className="error-message" style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {formErrors[`participant_${participantIndex}_${fieldName}_domain`]}
                      </span>
                    )
                  }
                </div>
              );
            }
            else if (question.question_form_type === 'radio') {
              // Process options to split comma-separated labels and prices
              const processedOptions = [];
              options.forEach(opt => {
                const label = opt.label || opt.name || opt;
                const priceStr = String(opt.price || "0");

                // Split by comma and trim whitespace
                const labels = label.split(',').map(l => l.trim()).filter(l => l);
                const prices = priceStr.split(',').map(p => p.trim()).filter(p => p);

                // Create separate option for each label
                labels.forEach((individualLabel, idx) => {
                  processedOptions.push({
                    ...opt,
                    label: individualLabel,
                    price: prices[idx] || prices[0] || "0", // Map index-based price or fallback to first
                    originalLabel: label,
                    child_question_id: opt.child_question_id || question.child_question_ids
                  });
                });
              });

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: question.description_color || '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {/* Hint icon */}
                    {question.question_hint && question.question_hint.trim() !== '' && (
                      <span style={{ marginLeft: '8px', cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #666', fontSize: '12px', fontWeight: 'bold', color: '#666', position: 'relative' }} title={question.hint_type === 1 || !question.hint_type ? question.question_hint : undefined} onMouseEnter={(e) => { if (question.hint_type === 2 || question.hint_type === '2') { const tooltip = e.currentTarget.querySelector('.image-tooltip'); if (tooltip) tooltip.style.display = 'block'; } }} onMouseLeave={(e) => { if (question.hint_type === 2 || question.hint_type === '2') { const tooltip = e.currentTarget.querySelector('.image-tooltip'); if (tooltip) tooltip.style.display = 'none'; } }}>
                        i
                        {(question.hint_type === 2 || question.hint_type === '2') && (<div className="image-tooltip" style={{ display: 'none', position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', padding: '8px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, whiteSpace: 'nowrap' }}><img src={authAPI.getImageUrl(question.hint_image || question.question_hint)} alt="Hint" style={{ maxWidth: '300px', maxHeight: '200px', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="padding: 8px; color: #666;">Image not available</div>'; }} /></div>)}
                      </span>
                    )}
                  </label>
                  <div className="gender-options">
                    {processedOptions.map((opt, idx) => (
                      <label className="gender-option" key={idx}>
                        <input
                          type="radio"
                          name={`${fieldName}_${participantIndex}`}
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
              // Process options to split comma-separated labels and prices
              const processedOptions = [];
              options.forEach(opt => {
                const label = opt.label || opt.name || opt;
                const priceStr = String(opt.price || "0");

                // Split by comma and trim whitespace
                const labels = label.split(',').map(l => l.trim()).filter(l => l);
                const prices = priceStr.split(',').map(p => p.trim()).filter(p => p);

                // Create separate option for each label
                labels.forEach((individualLabel, idx) => {
                  processedOptions.push({
                    ...opt,
                    label: individualLabel,
                    price: prices[idx] || prices[0] || "0",
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
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {/* Hint icon */}
                    {question.question_hint && question.question_hint.trim() !== '' && (
                      <span style={{ marginLeft: '8px', cursor: 'help', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #666', fontSize: '12px', fontWeight: 'bold', color: '#666', position: 'relative' }} title={question.hint_type === 1 || !question.hint_type ? question.question_hint : undefined} onMouseEnter={(e) => { if (question.hint_type === 2 || question.hint_type === '2') { const tooltip = e.currentTarget.querySelector('.image-tooltip'); if (tooltip) tooltip.style.display = 'block'; } }} onMouseLeave={(e) => { if (question.hint_type === 2 || question.hint_type === '2') { const tooltip = e.currentTarget.querySelector('.image-tooltip'); if (tooltip) tooltip.style.display = 'none'; } }}>
                        i
                        {(question.hint_type === 2 || question.hint_type === '2') && (<div className="image-tooltip" style={{ display: 'none', position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', padding: '8px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, whiteSpace: 'nowrap' }}><img src={authAPI.getImageUrl(question.hint_image || question.question_hint)} alt="Hint" style={{ maxWidth: '300px', maxHeight: '200px', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="padding: 8px; color: #666;">Image not available</div>'; }} /></div>)}
                      </span>
                    )}
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

              if (question.question_form_type === 'countries') {
                displayOptions = countries;
              }

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

              // Process options to split comma-separated labels and prices (for regular select)
              if (question.question_form_type === 'select') {
                const processedOptions = [];
                displayOptions.forEach(opt => {
                  const label = opt.label || opt.name || opt;
                  const priceStr = String(opt.price || "0");

                  // Split by comma and trim whitespace
                  const labels = label.split(',').map(l => l.trim()).filter(l => l);
                  const prices = priceStr.split(',').map(p => p.trim()).filter(p => p);

                  // Create separate option for each label
                  labels.forEach((individualLabel, idx) => {
                    processedOptions.push({
                      ...opt,
                      label: individualLabel,
                      price: prices[idx] || prices[0] || "0",
                      originalLabel: label,
                      child_question_id: opt.child_question_id || question.child_question_ids
                    });
                  });
                });
                displayOptions = processedOptions;

                // Special Filter: Clear S and L sizes for event 363 as requested
                if (String(eventId) === "363" && (question.question_label?.toLowerCase().includes('t-shirt') || question.user_field_mapping?.toLowerCase() === 't_shirt_size')) {
                  displayOptions = displayOptions.filter(opt => {
                    const label = (opt.label || "").toLowerCase();
                    return !label.endsWith('-s') && !label.endsWith('-l');
                  });
                }
              }

              questionElement = (
                <div className="form-group" key={question.id}>
                  <label>
                    {question.question_label}
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: question.description_color || '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {/* Hint icon */}
                    {question.question_hint && question.question_hint.trim() !== '' && (
                      <span
                        style={{
                          marginLeft: '8px',
                          cursor: 'help',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1.5px solid #666',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#666',
                          position: 'relative'
                        }}
                        title={question.hint_type === 1 || !question.hint_type ? question.question_hint : undefined}
                        onMouseEnter={(e) => {
                          if (question.hint_type === 2 || question.hint_type === '2') {
                            const tooltip = e.currentTarget.querySelector('.image-tooltip');
                            if (tooltip) tooltip.style.display = 'block';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (question.hint_type === 2 || question.hint_type === '2') {
                            const tooltip = e.currentTarget.querySelector('.image-tooltip');
                            if (tooltip) tooltip.style.display = 'none';
                          }
                        }}
                      >
                        i
                        {(question.hint_type === 2 || question.hint_type === '2') && (
                          <div
                            className="image-tooltip"
                            style={{
                              display: 'none',
                              position: 'absolute',
                              bottom: '100%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              marginBottom: '8px',
                              padding: '8px',
                              backgroundColor: '#fff',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              zIndex: 1000,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <img
                              src={authAPI.getImageUrl(question.hint_image || question.question_hint)}
                              alt="Hint"
                              style={{
                                maxWidth: '300px',
                                maxHeight: '200px',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div style="padding: 8px; color: #666;">Image not available</div>';
                              }}
                            />
                          </div>
                        )}
                      </span>
                    )}
                  </label>

                  {/* Use normal select for general questions, SearchableSelect for locations */}
                  {question.question_form_type === 'select' ? (
                    <select
                      name={fieldName}
                      className="form-control3"
                      value={currentFormData[fieldName] || ""}
                      onChange={(e) => handleInputChange(participantIndex, e)}
                      required={isRequired}
                    >
                      <option value="">Select {question.question_label}...</option>
                      {displayOptions.map((opt, idx) => (
                        <option
                          key={idx}
                          value={opt.label || opt.name || opt.id || opt}
                        >
                          {opt.label || opt.name || opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <SearchableSelect
                      name={fieldName}
                      options={displayOptions.map(opt => ({
                        value: opt.label || opt.name || opt.country_name || opt.state_name || opt.city_name || opt.code || opt.id,
                        label: opt.label || opt.name || opt.country_name || opt.state_name || opt.city_name || opt.code
                      }))}
                      value={currentFormData[fieldName] || ""}
                      placeholder={`Select ${question.question_label}...`}
                      required={isRequired}
                      searchable={['countries', 'states', 'cities'].includes(question.question_form_type)}
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
                                const sortedStates = [...statesRes.data.AllState].sort((a, b) =>
                                  (a.state_name || a.name || "").localeCompare(b.state_name || b.name || "")
                                );
                                setStates(sortedStates);
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
                                const sortedCities = [...citiesRes.data.AllCities].sort((a, b) =>
                                  (a.city_name || a.name || "").localeCompare(b.city_name || b.name || "")
                                );
                                setCities(sortedCities);
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
                    />
                  )}
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
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: question.description_color || '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
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
                    {question.question_description && (
                      <span style={{ fontSize: '12px', color: '#888', marginLeft: '5px', fontWeight: 'normal' }}>
                        ({question.question_description})
                      </span>
                    )}
                    {isRequired && <span style={{ color: 'red' }}>*</span>}
                    {/* Hint icon */}
                    {question.question_hint && question.question_hint.trim() !== '' && (
                      <span
                        style={{
                          marginLeft: '8px',
                          cursor: 'help',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1.5px solid #666',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#666'
                        }}
                        title={question.question_hint}
                      >
                        i
                      </span>
                    )}
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

        {/* Next Group Button */}
        {hasGroups && (() => {
          // Build array of all tabs in order
          const allTabs = [];
          if (ungroupedQuestions.length > 0) {
            allTabs.push('general');
          }
          allTabs.push(...groupNames);

          // Find current tab index
          const currentTabIndex = allTabs.indexOf(currentActiveTab);
          const hasNextGroup = currentTabIndex >= 0 && currentTabIndex < allTabs.length - 1;

          if (hasNextGroup) {
            const nextTab = allTabs[currentTabIndex + 1];
            return (
              <div style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveQuestionTab(prev => ({
                    ...prev,
                    [participantIndex]: nextTab
                  }))}
                  style={{
                    padding: '12px 32px',
                    background: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#c0392b';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#e74c3c';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
                  }}
                >
                  Next →
                </button>
              </div>
            );
          }
          return null;
        })()}
      </div >
    );
  };

  const handlePayNow = () => {
    if (!paymentData) {
      console.error("❌ No payment data available");
      alert("Payment data is not available. Please try again.");
      return;
    }

    console.log("💳 Redirecting to payment gateway:", selectedPaymentMethod);
    console.log("📋 Full Payment Data received from API:", paymentData);

    // For PayU, create a form and submit to PayU gateway
    if (selectedPaymentMethod === 'payu') {
      // Get API base URL
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

      // Define all PayU fields - use exact values from backend for hash validation
      const fields = {
        key: paymentData.merchant_key || paymentData.key || '',
        txnid: paymentData.txnid || '',
        amount: paymentData.amount || '',
        productinfo: paymentData.productinfo || '', // Must match backend exactly (even if empty)
        firstname: paymentData.firstname || paymentData.first_name || '',
        email: paymentData.email || '',
        phone: paymentData.phone_no || paymentData.phone || '',
        // PayU sends POST requests - React dev server CANNOT handle them
        // MUST use Laravel backend to receive POST, then redirect to React with GET
        // ALWAYS use backend API URLs (both dev and production) to handle POST callbacks
        surl: paymentData.surl || `${API_BASE_URL}/payment_gateway/success`,
        furl: paymentData.furl || `${API_BASE_URL}/payment_gateway/failure`,
        hash: paymentData.hash || ''
        // Note: UDF fields removed - backend doesn't include them in hash calculation
      };

      // Log all fields for debugging (hide sensitive hash)
      console.log("📋 PayU Form Fields (before validation):");
      Object.keys(fields).forEach(key => {
        const value = fields[key];
        const displayValue = key === 'hash' ? (value ? '[PRESENT]' : '[MISSING]') : value;
        console.log(`  ${key}: ${displayValue || '[EMPTY]'}`);
      });

      // Validate required fields (productinfo can be empty as per backend)
      const requiredFields = ['key', 'txnid', 'amount', 'firstname', 'email', 'phone', 'hash'];
      const missingFields = requiredFields.filter(field => !fields[field] || fields[field] === '');

      if (missingFields.length > 0) {
        console.error("❌ Missing required PayU fields:", missingFields);
        console.error("❌ Complete paymentData received:", paymentData);
        alert(`Payment Error: Missing required fields (${missingFields.join(', ')}). Please try again or contact support.`);
        setShowPaymentModal(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fields.email)) {
        console.error("❌ Invalid email format:", fields.email);
        alert("Payment Error: Invalid email format. Please check and try again.");
        setShowPaymentModal(false);
        return;
      }

      // Validate phone format (should be numeric)
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(fields.phone)) {
        console.error("❌ Invalid phone format:", fields.phone);
        alert("Payment Error: Invalid phone number. Please check and try again.");
        setShowPaymentModal(false);
        return;
      }

      // Create form
      console.log("✅ All validations passed. Creating payment form...");
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.payu.in/_payment'; // PayU PRODUCTION
      form.id = 'payu-payment-form';

      // Add only non-empty fields to the form
      Object.keys(fields).forEach(key => {
        const value = fields[key];
        if (value && value !== '') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value).trim();
          form.appendChild(input);
        }
      });

      // Log final form data
      console.log("📋 Final PayU Form Fields (being submitted):");
      const formData = new FormData(form);
      for (let [key, value] of formData.entries()) {
        const displayValue = key === 'hash' ? '[REDACTED]' : value;
        console.log(`  ${key}: ${displayValue}`);
      }

      // Submit form
      document.body.appendChild(form);
      console.log("🚀 Submitting PayU payment form...");
      form.submit();

      // Cleanup form after submission
      setTimeout(() => {
        const existingForm = document.getElementById('payu-payment-form');
        if (existingForm) {
          document.body.removeChild(existingForm);
          console.log("🧹 Form cleaned up");
        }
      }, 1000);
    } else if (paymentData.redirect_url) {
      // PhonePe or other payment methods with redirect URL
      console.log("🔗 Redirecting to:", paymentData.redirect_url);
      window.location.href = paymentData.redirect_url;
    } else {
      console.error("❌ No valid payment method or redirect URL");
      console.error("❌ paymentData:", paymentData);
      alert("Payment method not properly configured. Please try again or contact support.");
      setShowPaymentModal(false);
    }
  };

  const handleProceedPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("🚀 Proceed button clicked");

    if (!validateForm()) {
      console.log("❌ Validation failed, stopping proceed");
      return;
    }

    const finalAmount = parseFloat(calculateFinalAmount());

    // For free registrations (0 amount), skip payment gateway
    if (finalAmount === 0) {
      handleFreeRegistration();
      return;
    }

    setIsProceeding(true);

    try {
      // Call bookingPaymentProcess API first as requested by user
      console.log("📤 Calling Booking Payment Process API on Proceed...");
      const { bookingPayload, files } = buildBookingPayload();
      const ticketType = finalAmount > 0 ? 'paid' : 'free';

      const apiPayload = {
        event_id: eventId,
        amount: finalAmount.toFixed(2),
        ticket_type: ticketType,
        booking_tickets_array: JSON.stringify(bookingPayload),
        fils_array: files,
        UtmCampaign: sessionStorage.getItem('utm_campaign') || ""
      };

      const response = await authAPI.bookingPaymentProcess(apiPayload);
      console.log("📥 Booking Payment Process Response on Proceed:", response);

      // Store initial booking response if needed (optional)
      // setInitialBookingData(response.data);

      if (availableGateways.length > 1) {
        // Modal logic for multiple gateways
        console.log("Multiple gateways available, showing selection modal");
        setIsProceeding(false); // Stop loading before showing modal
        setShowGatewayModal(true);
      } else {
        console.log("Single gateway available, proceeding directly");
        const gateway = availableGateways[0]?.toLowerCase().includes('phone') ? 'phonepe' : (availableGateways[0]?.toLowerCase().includes('pay') ? 'payu' : activePaymentGateway);
        // executePaymentInitiation will set its own loading state
        executePaymentInitiation(gateway);
      }
    } catch (error) {
      console.error("❌ Booking process failed on proceed:", error);
      setIsProceeding(false);
      // alert("Something went wrong. Please try again.");
    }
  };

  const executePaymentInitiation = async (gatewayOverride) => {
    const targetGateway = gatewayOverride || activePaymentGateway;
    console.log("💳 Initiating payment with gateway:", targetGateway);
    setIsProceeding(true);

    // Unified amount calculation - calculateFinalAmount() use karo
    const finalAmount = parseFloat(calculateFinalAmount());

    console.log("💵 Final payment amount (unified):", finalAmount.toFixed(2));

    // Show payment modal immediately
    setShowPaymentModal(true);

    try {
      // Check which payment gateway is active and call appropriate API
      if (targetGateway === 'phonepe') {
        // Call PhonePe payment initiation API
        console.log("📤 Calling PhonePe payment API...");

        // Build the booking payload (same as PayU)
        const { bookingPayload, files } = buildBookingPayload();

        // Determine ticket type
        const ticketType = finalAmount > 0 ? 'paid' : 'free';

        const apiPayload = {
          event_id: eventId,
          amount: finalAmount.toFixed(2),
          ticket_type: ticketType,
          booking_tickets_array: JSON.stringify(bookingPayload),
          fils_array: files, // Pass collected files
          UtmCampaign: sessionStorage.getItem('utm_campaign') || ""
        };

        console.log("📦 PhonePe API Payload:", apiPayload);

        const res = await authAPI.phonepeInitiatePayment(apiPayload);
        console.log("📥 PhonePe Payment API response:", res);

        if (res && res.data && res.data.redirect_url) {
          setPaymentData(res.data);
          setSelectedPaymentMethod('phonepe');
          console.log("✅ PhonePe payment data set, redirect URL:", res.data.redirect_url);
        } else {
          throw new Error("Invalid response from PhonePe payment API");
        }
      } else if (targetGateway === 'payu') {
        // Call PayU payment API
        console.log("📤 Calling PayU payment API...");

        // Build the booking payload for PayU
        const { bookingPayload, files } = buildBookingPayload();

        // Determine ticket type
        const ticketType = finalAmount > 0 ? 'paid' : 'free';

        const apiPayload = {
          event_id: eventId,
          amount: finalAmount.toFixed(2),
          ticket_type: ticketType,
          booking_tickets_array: JSON.stringify(bookingPayload),
          fils_array: files, // Pass collected files
          UtmCampaign: sessionStorage.getItem('utm_campaign') || ""
        };

        console.log("📦 PayU API Payload:", apiPayload);

        const response = await authAPI.bookingPaymentProcess(apiPayload);

        console.log("📥 PayU Payment API response:", response);

        if (response && response.data) {
          setPaymentData(response.data);
          setSelectedPaymentMethod('payu');
          console.log("✅ PayU payment data set");
        } else {
          throw new Error("Invalid response from PayU payment API");
        }
      }
      else {
        throw new Error(`Unknown payment gateway: ${targetGateway}`);
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);

      let errorMessage = "Please try again";
      if (error.response?.data) {
        if (error.response.data.errors) {
          // If there are detailed validation errors (like email/mobile already taken)
          const detailedErrors = Object.values(error.response.data.errors).flat();
          errorMessage = detailedErrors.length > 0 ? detailedErrors.join("\n") : error.response.data.message;
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      } else {
        errorMessage = error.message;
      }

      alert(`Registration failed: ${errorMessage}`);
      setShowPaymentModal(false);
    } finally {
      setIsProceeding(false);
    }
  };

  // Handle Free Registration (Skip Payment)
  const handleFreeRegistration = async () => {
    setIsProceeding(true);
    try {
      const { bookingPayload, files } = buildBookingPayload();
      const finalAmount = parseFloat(calculateFinalAmount());
      const ticketType = finalAmount > 0 ? 'paid' : 'free';

      const apiPayload = {
        event_id: eventId,
        amount: finalAmount.toFixed(2),
        ticket_type: ticketType,
        booking_tickets_array: JSON.stringify(bookingPayload),
        fils_array: files,
        UtmCampaign: sessionStorage.getItem('utm_campaign') || ""
      };

      console.log("📤 Submitting Free Registration Payload:", apiPayload);

      const targetGateway = activePaymentGateway || (availableGateways[0]?.toLowerCase().includes('phone') ? 'phonepe' : 'payu');

      let result;
      if (targetGateway === 'payu') {
        result = await authAPI.bookingPaymentProcess(apiPayload);
      } else {
        result = await authAPI.phonepeInitiatePayment(apiPayload);
      }

      console.log("✅ Free Registration Response:", result);

      if (result && (
        result.status === 'success' ||
        result.status === 1 ||
        result.success ||
        result.message === 'Request processed successfully'
      )) {
        setShowPaymentModal(false);
        setShowSuccessModal(true);

        // Call Email API
        try {
          const booking_id = result.booking_pay_id || result.booking_id || (result.data && (result.data.booking_pay_id || result.data.booking_id));
          if (booking_id) {
            const emailPayload = {
              booking_pay_id: booking_id,
              event_id: eventId,
            };
            console.log("📧 Sending success email for free registration:", emailPayload);
            authAPI.sendEmailPaymentSuccess(emailPayload)
              .then(res => console.log("✅ Confirmation email sent:", res))
              .catch(err => console.error("❌ Failed to send confirmation email:", err));
          } else {
            console.warn("⚠️ No booking_id found in response, skipping email.");
          }
        } catch (emailErr) {
          console.error("❌ Error initiating email send:", emailErr);
        }

        // Clean up sessionStorage
        sessionStorage.removeItem('couponCode');
        sessionStorage.removeItem('appliedCoupon');
        sessionStorage.removeItem('couponDiscount');
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Free Registration Error:", error);

      let errorMessage = "Please try again";
      if (error.response?.data) {
        if (error.response.data.errors) {
          // Handle structured validation errors
          const detailedErrors = Object.values(error.response.data.errors).flat();
          errorMessage = detailedErrors.length > 0 ? detailedErrors.join("\n") : error.response.data.message;
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      } else {
        errorMessage = error.message;
      }

      alert(`Registration failed: ${errorMessage}`);
    } finally {
      setIsProceeding(false);
    }
  };

  function validateForm() {
    console.log("🔍 Starting form validation...");
    const errors = {};
    let hasErrors = false;
    let firstErrorParticipant = null;
    let firstErrorGroup = null;

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
          const groupTitle = q.group_question_title || 'general';

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
              if (!hasErrors) {
                firstErrorParticipant = participantIndex;
                firstErrorGroup = groupTitle;
              }
              hasErrors = true;
              console.log(`❌ Missing required field: ${q.question_label} for Participant ${participantIndex + 1} (Group: ${groupTitle})`);
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
                if (!hasErrors) {
                  firstErrorParticipant = participantIndex;
                  firstErrorGroup = groupTitle;
                }
                hasErrors = true;
                console.log(`❌ Length too short: ${q.question_label} for Participant ${participantIndex + 1} (${currentLength}/${minLength})`);
              }

              if (maxLength && currentLength > maxLength) {
                const errorKey = `participant_${participantIndex}_${fieldName}_length`;
                errors[errorKey] = `${q.question_label} must not exceed ${maxLength} characters for Participant ${participantIndex + 1}`;
                if (!hasErrors) {
                  firstErrorParticipant = participantIndex;
                  firstErrorGroup = groupTitle;
                }
                hasErrors = true;
                console.log(`❌ Length too long: ${q.question_label} for Participant ${participantIndex + 1} (${currentLength}/${maxLength})`);
              }
            } catch (e) {
              console.error("Error parsing limit_length in validation:", e);
            }
          }

          // Check date range validation for date fields
          if (q.question_form_type === 'date' && fieldValue) {
            const enteredDate = new Date(fieldValue);
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            const label = (q.question_label || "").toLowerCase();
            const fieldName = (getMappedKey(q) || "").toLowerCase();
            const isDOBField = label === 'date of birth' || label === 'dob' || fieldName === 'dob';

            // Special check for DOB: Cannot be in the future
            if (isDOBField && enteredDate > today) {
              const errorKey = `participant_${participantIndex}_${fieldName}_daterange`;
              errors[errorKey] = `${q.question_label} cannot be a future date for Participant ${participantIndex + 1}`;
              if (!hasErrors) {
                firstErrorParticipant = participantIndex;
                firstErrorGroup = groupTitle;
              }
              hasErrors = true;
              console.log(`❌ Future Date error: ${q.question_label} for Participant ${participantIndex + 1}`);
            }

            // NEW: Validate Age range derived from DOB against ticket limits
            if (isDOBField && enteredDate && enteredDate <= today) {
              const todayObj = new Date();
              let ageValue = todayObj.getFullYear() - enteredDate.getFullYear();
              const m = todayObj.getMonth() - enteredDate.getMonth();
              if (m < 0 || (m === 0 && todayObj.getDate() < enteredDate.getDate())) {
                ageValue--;
              }

              const ageStart = parseInt(currentTicket.age_start);
              const ageEnd = parseInt(currentTicket.age_end);

              let ageValid = true;
              let ageErrorMessage = "";

              if (!isNaN(ageValue)) {
                if (!isNaN(ageStart) && ageStart > 0 && ageValue < ageStart) {
                  ageValid = false;
                  ageErrorMessage = `According to your Date of Birth, your age (${ageValue}) must be at least ${ageStart} for Participant ${participantIndex + 1}`;
                } else if (!isNaN(ageEnd) && ageEnd > 0 && ageValue > ageEnd) {
                  ageValid = false;
                  ageErrorMessage = `According to your Date of Birth, your age (${ageValue}) must be at most ${ageEnd} for Participant ${participantIndex + 1}`;
                }
              }

              if (!ageValid) {
                const errorKey = `participant_${participantIndex}_${fieldName}_age`;
                errors[errorKey] = ageErrorMessage;
                if (!hasErrors) {
                  firstErrorParticipant = participantIndex;
                  firstErrorGroup = groupTitle;
                }
                hasErrors = true;
                console.log(`❌ Age from DOB out of range: ${q.question_label} for Participant ${participantIndex + 1} (Age: ${ageValue}, Range: ${ageStart}-${ageEnd})`);
              }
            }

            if (q.date_range === 1) {
              // Check minimum date
              if (q.range_start_date) {
                const startTimestamp = parseInt(q.range_start_date);
                const minDate = new Date(startTimestamp * 1000);
                minDate.setHours(0, 0, 0, 0);

                if (enteredDate < minDate) {
                  const minDateStr = minDate.toISOString().split('T')[0];
                  const errorKey = `participant_${participantIndex}_${fieldName}_daterange`;
                  errors[errorKey] = `${q.question_label} must be on or after ${minDateStr} for Participant ${participantIndex + 1}`;
                  if (!hasErrors) {
                    firstErrorParticipant = participantIndex;
                    firstErrorGroup = groupTitle;
                  }
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
                  if (!hasErrors) {
                    firstErrorParticipant = participantIndex;
                    firstErrorGroup = groupTitle;
                  }
                  hasErrors = true;
                  console.log(`❌ Date too late: ${q.question_label} for Participant ${participantIndex + 1}`);
                }
              }
            }
          }

          // Validate mobile number format (must be exactly 10 digits)
          if (q.question_form_type === 'mobile' && fieldValue) {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(fieldValue)) {
              const errorKey = `participant_${participantIndex}_${fieldName}`;
              errors[errorKey] = `${q.question_label} must be exactly 10 digits for Participant ${participantIndex + 1}`;
              if (!hasErrors) {
                firstErrorParticipant = participantIndex;
                firstErrorGroup = groupTitle;
              }
              hasErrors = true;
              console.log(`❌ Invalid mobile number: ${q.question_label} for Participant ${participantIndex + 1}`);
            }
          }

          // Validate email format
          if (q.question_form_type === 'email' && fieldValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(fieldValue)) {
              const errorKey = `participant_${participantIndex}_${fieldName}`;
              errors[errorKey] = `Please enter a valid email address for ${q.question_label} (Participant ${participantIndex + 1})`;
              if (!hasErrors) {
                firstErrorParticipant = participantIndex;
                firstErrorGroup = groupTitle;
              }
              hasErrors = true;
              console.log(`❌ Invalid email format: ${q.question_label} for Participant ${participantIndex + 1}`);
            }
          }

          // Validate email domain if specific_domain is enabled (specific_domain === 2)
          if (q.question_form_type === 'email' &&
            q.specific_domain === 2 &&
            q.domain_name &&
            fieldValue) {
            const emailValue = String(fieldValue).trim();
            if (emailValue) {
              // Extract domain from email (part after @)
              const emailParts = emailValue.split('@');
              if (emailParts.length === 2) {
                const emailDomain = emailParts[1].toLowerCase();
                const expectedDomain = q.domain_name.trim().toLowerCase();
                if (emailDomain !== expectedDomain) {
                  const errorKey = `participant_${participantIndex}_${fieldName}_domain`;
                  errors[errorKey] = `${q.question_label} must be from ${q.domain_name} domain for Participant ${participantIndex + 1}`;
                  if (!hasErrors) {
                    firstErrorParticipant = participantIndex;
                    firstErrorGroup = groupTitle;
                  }
                  hasErrors = true;
                  console.log(`❌ Invalid email domain: ${q.question_label} for Participant ${participantIndex + 1} (expected: ${expectedDomain}, got: ${emailDomain})`);
                }
              }
            }
          }

        });

        // Check if mobile and emergency contact are the same
        if (currentFormData.mobile && currentFormData.emergencyContactNumber &&
          currentFormData.mobile === currentFormData.emergencyContactNumber) {
          errors[`participant_${participantIndex}_emergencyContactNumber`] = "Emergency contact number cannot be the same as your mobile number";
          if (!hasErrors) {
            firstErrorParticipant = participantIndex;
            // Emergency contact is usually in Personal or Contact group, if not specified assume current or general
            firstErrorGroup = questionsList.find(q => getMappedKey(q) === 'emergencyContactNumber')?.group_question_title || 'general';
          }
          hasErrors = true;
          console.log(`❌ Contact mismatch: Mobile and Emergency are same for Participant ${participantIndex + 1}`);
        }
      }
    });

    // Check terms and conditions if they exist
    if (termsConditions && termsConditions.length > 0 && !termsAccepted) {
      errors['terms_conditions'] = 'You must accept the Terms and Conditions to proceed';
      hasErrors = true;
      console.log("❌ Terms and Conditions not accepted");
    }

    // NEW: Cross-participant uniqueness check if AllowUniqueRegistration is enabled
    if (allowUniqueRegistration === 1 && participantForms.length > 1) {
      console.log("🔍 Checking for unique mobile/email across participants in validateForm...");
      const uniqueErrors = checkUniqueness(participantForms);
      if (Object.keys(uniqueErrors).length > 0) {
        Object.assign(errors, uniqueErrors);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("❌ Validation failed:", errors);
      setFormErrors(errors);

      // Switch to the first participant and group with an error
      if (firstErrorParticipant !== null) {
        // If your UI supports switching participants, update setCurrentParticipantIndex
        setCurrentParticipantIndex(firstErrorParticipant);

        // Switch to the group/tab with the first error
        if (firstErrorGroup) {
          const tabToSet = firstErrorGroup.trim() === '' ? 'general' : firstErrorGroup;
          setActiveQuestionTab(prev => ({
            ...prev,
            [firstErrorParticipant]: tabToSet
          }));
          console.log(`🎯 Switched to Participant ${firstErrorParticipant + 1}, Group: ${tabToSet}`);
        }
      }

      // Scroll to first error after a small delay to allow tab switching to render
      setTimeout(() => {
        const errorElements = document.querySelectorAll('.error-message');
        if (errorElements.length > 0) {
          errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return false;
    }

    console.log("✅ Validation passed!");
    setFormErrors({});
    return true;
  }

  // Handle Proceed with PayU Payment
  const handleProceedWithPayU = async () => {
    console.log("🔵 PayU Payment - Starting validation...");

    // Validate all forms first
    let hasErrors = false;
    const errors = {};

    // Validate each participant's form
    participantForms.forEach((participantForm, participantIndex) => {
      const currentFormData = participantForm.formData;
      const currentTicket = participantForm.ticketInfo;

      if (formQuestions && currentTicket && formQuestions[currentTicket.id]) {
        const questionsData = formQuestions[currentTicket.id];
        const questionsList = questionsData[participantIndex] || questionsData[0] || [];

        questionsList.forEach(q => {
          const fieldName = getMappedKey(q);
          const fieldValue = currentFormData[fieldName];

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
    });

    // Check terms and conditions
    if (termsConditions && termsConditions.length > 0 && !termsAccepted) {
      errors['terms_conditions'] = 'You must accept the Terms and Conditions to proceed';
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(errors);
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Clear errors
    setFormErrors({});

    try {
      console.log("📦 Building booking payload...");

      // Build the booking payload
      const bookingPayload = buildBookingPayload();

      // Calculate total amount using same logic as PhonePe
      const totalAmount = selectedTickets.reduce((sum, ticket) => {
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

        // Check if participant is paying fees/gateway
        const isParticipantPayingFees = ticket.player_of_fee === 2 || ticket.player_of_fee === "2";
        const isParticipantPayingGateway = ticket.player_of_gateway_fee === 2 || ticket.player_of_gateway_fee === "2";

        // Individual fee components - these are PER TICKET from backend
        // Only include if Participant is the payer
        const convenienceFeePerTicket = isParticipantPayingFees ? (parseFloat(calcDetails.total_convenience_fees || (effectivePrice * 0.02)) || 0) : 0;
        const platformFeePerTicket = isParticipantPayingFees ? (parseFloat(calcDetails.platform_fees_5_each || 5) || 5) : 0;
        const paymentGatewayPerTicket = isParticipantPayingGateway ? (parseFloat(calcDetails.payment_gateway_1_85_buyer || (effectivePrice * 0.0185)) || 0) : 0;

        // Platform Fee total = (per ticket fees) * quantity
        const totalPlatformFee = (convenienceFeePerTicket + platformFeePerTicket + paymentGatewayPerTicket) * parseInt(ticket.quantity);

        // Extract individual GST components - these are PER TICKET
        // Only include fee GST if Participant pays those fees
        const registrationGSTPerTicket = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
        const convenienceFeeGSTPerTicket = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0) : 0;
        const platformFeeGSTPerTicket = isParticipantPayingFees ? parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0) : 0;
        const paymentGatewayGSTPerTicket = isParticipantPayingGateway ? parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0) : 0;

        // Calculate total taxes = (per ticket taxes) * quantity
        const totalTaxes = (registrationGSTPerTicket + convenienceFeeGSTPerTicket + platformFeeGSTPerTicket + paymentGatewayGSTPerTicket) * parseInt(ticket.quantity);

        // Sub Total = Base + Platform Fee + Total Taxes
        return sum + baseAmount + totalPlatformFee + totalTaxes;
      }, 0);

      // Apply coupon discount if any
      const couponDiscount = parseFloat(sessionStorage.getItem("couponDiscount")) || 0;
      const finalAmount = (totalAmount - couponDiscount).toFixed(2);

      // Determine ticket type
      const ticketType = finalAmount > 0 ? 'paid' : 'free';

      console.log("💰 Payment Details:", {
        totalAmount,
        couponDiscount,
        finalAmount,
        ticketType
      });

      // Call PayU payment API
      console.log("🚀 Calling PayU payment API...");
      console.log("📦 Event ID:", eventId);
      console.log("💰 Final Amount:", finalAmount);
      console.log("🎫 Ticket Type:", ticketType);
      console.log("📋 Booking Payload (before stringify):", bookingPayload);
      console.log("📋 Booking Payload (stringified):", JSON.stringify(bookingPayload));

      const apiPayload = {
        event_id: eventId,
        amount: finalAmount,
        ticket_type: ticketType,
        booking_tickets_array: JSON.stringify(bookingPayload)
      };

      console.log("🔍 Complete API Payload:", apiPayload);

      const response = await authAPI.bookingPaymentProcess(apiPayload);

      console.log("✅ PayU API Response:", response);

      if (response && response.data) {
        // Set payment data and open modal
        setPaymentData(response.data);
        setSelectedPaymentMethod('payu');
        setShowPaymentModal(true);
        console.log("✅ Payment modal opened for PayU");
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ PayU payment error:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      alert(`Payment initiation failed: ${error.response?.data?.message || error.message || 'Please try again'}`);
    }
  };

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
                {sessionStorage.getItem("eventInfo") || "Event Info"}
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
                  {!isGuestLogin && (
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
                  )}

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

                        // Check if mobile and emergency contact are the same
                        if (currentFormData.mobile && currentFormData.emergencyContactNumber &&
                          currentFormData.mobile === currentFormData.emergencyContactNumber) {
                          errors[`participant_${participantIndex}_emergencyContactNumber`] = "Emergency contact number cannot be the same as your mobile number";
                          hasErrors = true;
                          console.log(`❌ Contact mismatch: Mobile and Emergency are same for Participant ${participantIndex + 1}`);
                        }
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
                const isFreeTicket = ticket.ticket_status === 2 || ticket.ticket_status === "2";

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

                const baseAmount = isFreeTicket ? 0 : (effectivePrice * parseInt(ticket.quantity));

                // Calculate fees from ticket_calculation_details if available
                const calcDetails = ticket.ticket_calculation_details || {};

                console.log('🔍 Full calcDetails:', calcDetails);

                // Individual fee components (base amounts only, without GST)
                // Check if GST is enabled
                const isGSTEnabled = calcDetails.collect_gst === "1" || calcDetails.collect_gst === 1;

                // Check if participant is paying fees/gateway
                const isParticipantPayingFees = ticket.player_of_fee === 2 || ticket.player_of_fee === "2";
                const isParticipantPayingGateway = ticket.player_of_gateway_fee === 2 || ticket.player_of_gateway_fee === "2";

                // IMPORTANT: When GST is ON, convenience_fee_amount and payment_gateway_1.85_buyer INCLUDE GST
                // When GST is OFF, they are already base amounts
                const convenienceFeeWithGST = isFreeTicket ? 0 : (isParticipantPayingFees ? (parseFloat(calcDetails.convenience_fee_amount) || 0) : 0);
                const convenienceFeeBase = !isGSTEnabled && convenienceFeeWithGST > 0
                  ? Math.round((convenienceFeeWithGST / 1.18) * 100) / 100
                  : convenienceFeeWithGST;

                const platformFeeBase = isFreeTicket ? 0 : (isParticipantPayingFees ? (parseFloat(calcDetails.platform_fees_5_each) || 0) : 0);

                const paymentGatewayWithGST = isFreeTicket ? 0 : (isParticipantPayingGateway ? (parseFloat(calcDetails['payment_gateway_1.85_buyer'] || calcDetails.payment_gateway_1_85_buyer) || 0) : 0);
                const paymentGatewayChargesBase = !isGSTEnabled && paymentGatewayWithGST > 0
                  ? Math.round((paymentGatewayWithGST / 1.18) * 100) / 100
                  : paymentGatewayWithGST;

                console.log('🔍 Platform Fee Components:', {
                  isGSTEnabled,
                  convenienceFeeWithGST,
                  convenienceFeeBase,
                  platformFeeBase,
                  paymentGatewayWithGST,
                  paymentGatewayChargesBase,
                  sum: convenienceFeeBase + platformFeeBase + paymentGatewayChargesBase
                });

                // Platform Fee = Convenience + Platform + Payment Gateway (base amounts only)
                // Multiply by quantity to get total for all tickets
                const totalPlatformFee = (convenienceFeeBase + platformFeeBase + paymentGatewayChargesBase) * parseInt(ticket.quantity);

                // Extract individual GST components from ticket_calculation_details
                const registrationGST = isFreeTicket ? 0 : parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
                const convenienceFeeGST = (isFreeTicket || !isParticipantPayingFees) ? 0 : parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0);
                const platformFeeGST = (isFreeTicket || !isParticipantPayingFees) ? 0 : parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0);
                const paymentGatewayGST = (isFreeTicket || !isParticipantPayingGateway) ? 0 : parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0);

                // Calculate total taxes from individual components
                // Multiply by quantity to get total for all tickets
                const totalTaxes = (registrationGST + convenienceFeeGST + platformFeeGST + paymentGatewayGST) * parseInt(ticket.quantity);

                // Sub Total = Base + Platform Fee + Total Taxes
                const ticketSubTotal = baseAmount + totalPlatformFee + totalTaxes;
                const ticketDiscount = appliedCoupon ? getTicketDiscount(ticket, appliedCoupon) : 0;

                return (
                  <div key={index} style={{ marginBottom: index < selectedTickets.length - 1 ? '20px' : '0' }}>
                    {/* Ticket Name and Base Price */}
                    <div className="summary-item" style={{ fontWeight: '600', fontSize: '15px' }}>
                      <span>{ticket.ticket_name || ticket.display_ticket_name} (x{ticket.quantity})</span>
                      <span>₹{baseAmount.toFixed(2)}</span>
                    </div>

                    {/* Per-ticket Discount */}
                    {ticketDiscount > 0 && (
                      <div className="summary-item" style={{ color: '#28a745', fontSize: '14px', marginTop: '-5px', marginBottom: '5px', paddingLeft: '10px' }}>
                        <span>↳ Discount ({appliedCoupon.coupon_code})</span>
                        <span>- ₹{ticketDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Platform Fee (Combined) - Multiplied by quantity */}
                    {totalPlatformFee > 0 && (
                      <div className="summary-item">
                        <span>Platform Fee</span>
                        <span>₹{totalPlatformFee.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Tax - Sum of all GST components - Multiplied by quantity */}
                    {totalTaxes > 0 && (
                      <div className="summary-item">
                        <span>Tax</span>
                        <span>₹{totalTaxes.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Sub Total for this ticket */}
                    <div className="summary-item" style={{ fontWeight: '600', marginTop: '8px' }}>
                      <span>Sub Total</span>
                      <span>₹{(ticketSubTotal - ticketDiscount).toFixed(2)}</span>
                    </div>

                    {/* Divider between tickets */}
                    {index < selectedTickets.length - 1 && <div className="divider" style={{ margin: '15px 0' }}></div>}
                  </div>
                );
              })}

              <div className="divider"></div>

              {/* Attendee-specific prices from question selections */}
              {(() => {
                // Group question prices by participant index
                const pricesByParticipant = {};
                Object.entries(questionPrices).forEach(([key, priceData]) => {
                  const participantIndex = parseInt(key.split('_')[0]);
                  if (!pricesByParticipant[participantIndex]) {
                    pricesByParticipant[participantIndex] = [];
                  }
                  pricesByParticipant[participantIndex].push(priceData);
                });

                // Display prices grouped by participant
                return Object.entries(pricesByParticipant).map(([participantIndex, prices]) => {
                  const attendeeNumber = parseInt(participantIndex) + 1;
                  const totalForAttendee = prices.reduce((sum, p) => sum + p.price, 0);

                  return (
                    <div key={participantIndex} style={{ marginBottom: '15px' }}>
                      {/* Attendee header */}
                      <div className="summary-item" style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>
                        <span>{attendeeNumber === 1 ? '1st' : attendeeNumber === 2 ? '2nd' : attendeeNumber === 3 ? '3rd' : `${attendeeNumber}th`} Attendee</span>
                        <span>₹{totalForAttendee.toFixed(2)}</span>
                      </div>

                      {/* Individual question prices */}
                      {prices.map((priceData, idx) => (
                        <div key={idx} className="summary-item" style={{ fontSize: '14px', paddingLeft: '10px', color: '#666' }}>
                          <span>{priceData.label}</span>
                          <span>₹{priceData.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}

              {/* Add divider if there are question prices */}
              {Object.keys(questionPrices).length > 0 && <div className="divider"></div>}

              {/* Per-ticket discounts are now shown under each ticket for clarity */}

              {/* Total Amount */}
              <div className="summary-item total">
                <span>Total Amount</span>
                <span className="total-amount">
                  ₹{calculateFinalAmount()}
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

              {/* Payment Buttons Container */}
              <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                {/* Single Proceed Button - Dynamic based on active gateway */}
                <button
                  className="btn-proceed-final"
                  onClick={handleProceedPayment}
                  disabled={gatewayLoading || isProceeding}
                  style={{
                    marginBottom: '0',
                    backgroundColor: activePaymentGateway === 'payu' ? '#17C653' : '#5f259f',
                    opacity: (gatewayLoading || isProceeding) ? 0.6 : 1,
                    cursor: (gatewayLoading || isProceeding) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProceeding ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span className="proceed-text">PLEASE WAIT...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-users"></i>
                      <span className="proceed-count">
                        {selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}
                      </span>
                      <span className="proceed-text">
                        {gatewayLoading
                          ? 'LOADING...'
                          : `PROCEED`
                        }
                      </span>
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Gateway Selection Modal */}
      {showGatewayModal && (
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
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowGatewayModal(false)}
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

            <h2 style={{ marginBottom: '20px', fontWeight: '600', fontSize: '20px' }}>Select Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableGateways.map((gw, idx) => {
                const normalizedGW = gw.toLowerCase().includes('phone') ? 'phonepe' : (gw.toLowerCase().includes('pay') ? 'payu' : gw.toLowerCase());
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActivePaymentGateway(normalizedGW);
                      setSelectedPaymentMethod(normalizedGW);
                      setShowGatewayModal(false);
                      executePaymentInitiation(normalizedGW);
                    }}
                    style={{
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #ddd',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#e74c3c';
                      e.currentTarget.style.backgroundColor = '#fff5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {normalizedGW === 'phonepe' ? (
                        <i className="fas fa-mobile-alt" style={{ color: '#5f259f' }}></i>
                      ) : (
                        <i className="fas fa-credit-card" style={{ color: '#17C653' }}></i>
                      )}
                      {gw}
                    </span>
                    <i className="fas fa-chevron-right" style={{ fontSize: '12px', color: '#ccc' }}></i>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

      {/* Success Modal for Free Registration */}
      {showSuccessModal && (
        <div className="registration-success-overlay">
          <div className="registration-success-modal">
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowSuccessModal(false);
                if (!isGuestLogin) {
                  if (eventId === "349") {
                    window.location.href = 'https://ashwagandha.in/';
                  } else {
                    window.location.href = '/registration-tracker';
                  }
                }
              }}
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="success-icon-container">
              <img
                src={PartyPopperIcon}
                alt="Success"
                className="success-party-popper"
              />
            </div>

            <div className={`success-content-wrapper ${eventId === "349" ? "himalaya-content" : ""}`}>
              <div className="success-header-wrapper">
                {eventId === "349" ? (
                  <>
                    <h2 className="success-yay" style={{ margin: '0 0 4px 0 !important' }}>YAY!</h2>
                    <h3 className="success-subtitle" style={{ color: '#27ae60', fontSize: '28px', margin: '0 !important' }}>You have successfully registered!</h3>
                  </>
                ) : (
                  <h4 className="success-title">YAY!</h4>
                )}
              </div>

              <div className="success-message">
                {eventId === "349"
                  ? (
                    <div className="himalaya-details">
                      <p>Your spot for the Himalaya Walkathon Delhi on April 12, 2026, is confirmed.</p>
                      <p>As you gear up for the Mindful Strides walkathon, check in on your mental wellness with this quick one-minute stress test.</p>
                      <p>You can also track your registration through your RACES Profile → Registration Tracker.</p>
                    </div>
                  )
                  : <p>Your registration is successful..!</p>}
              </div>
            </div>

            {isGuestLogin ? (
              <p style={{
                color: "#1a237e",
                fontWeight: "600",
                fontSize: "16px",
                marginTop: "20px",
                padding: "12px",
                backgroundColor: "#e8eaf6",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                Your registration details have been sent to your email.
              </p>
            ) : (
              <button
                className="view-tickets-btn"
                onClick={() => {
                  if (String(eventId) === "349") {
                    window.location.href = 'https://ashwagandha.in/';
                  } else {
                    window.location.href = '/registration-tracker';
                  }
                }}
                style={{ backgroundColor: String(eventId) === "349" ? "#17C653" : "" }}
              >
                {eventId === "349" ? "Check Your Score Now!" : "View my Registration Details"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
