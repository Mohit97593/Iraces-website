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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('phonepe'); // Track selected payment method (phonepe or payu)

  // Coupon state variables
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Applied coupon details from API
  const [couponLoading, setCouponLoading] = useState(false); // Loading state for coupon API call
  const [couponError, setCouponError] = useState(''); // Coupon validation error message

  // Active payment gateway state
  const [activePaymentGateway, setActivePaymentGateway] = useState(null); // Active payment gateway from admin (phonepe or payu)
  const [gatewayLoading, setGatewayLoading] = useState(true); // Loading state for gateway API call


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

  // Fetch active payment gateway on component mount
  useEffect(() => {
    const fetchActivePaymentGateway = async () => {
      if (!eventId) return;

      try {
        setGatewayLoading(true);
        console.log("🔍 Fetching active payment gateway for event:", eventId);

        const response = await authAPI.getActivePaymentGateway(eventId);
        console.log("✅ Active payment gateway response:", response);

        if (response && response.gateway) {
          const gateway = response.gateway.toLowerCase();

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
        }
      } catch (error) {
        console.error("❌ Error fetching active payment gateway:", error);
        // Fallback to PhonePe on error
        setActivePaymentGateway('phonepe');
        setSelectedPaymentMethod('phonepe');
      } finally {
        setGatewayLoading(false);
      }
    };

    fetchActivePaymentGateway();
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
            }
          }

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
                    [`${participantIndex}_${name}`]: 'Mobile number must be exactly 10 digits'
                  }));
                } else {
                  // Clear error if mobile is valid
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              } else {
                // Clear error if field is empty
                setFormErrors(prevErrors => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[`${participantIndex}_${name}`];
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
                    [`${participantIndex}_${name}`]: 'Please enter a valid email address'
                  }));
                } else {
                  // Clear error if email is valid
                  setFormErrors(prevErrors => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[`${participantIndex}_${name}`];
                    return newErrors;
                  });
                }
              } else {
                // Clear error if field is empty
                setFormErrors(prevErrors => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[`${participantIndex}_${name}`];
                  return newErrors;
                });
              }
            }
            else {
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
    if (!dob) return '';

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  };

  // Handle Apply Coupon
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
        const couponData = response.data.Coupons[0];

        // Transform coupon data
        // discount_amt_per_type: 1 = fixed amount, 2 = percentage
        const transformedCoupon = {
          ...couponData,
          coupon_code: couponData.discount_code || couponData.coupon_code,
          discount_type: couponData.discount_amt_per_type,
          discount_value: couponData.discount_amt_per_type === 2
            ? couponData.discount_percentage
            : couponData.discount_amount
        };

        // Store applied coupon details
        setAppliedCoupon(transformedCoupon);
        setCouponError('');

        console.log('✅ Coupon applied successfully:', transformedCoupon);
      } else {
        // Invalid coupon
        let errorMessage = 'Invalid or expired coupon code';
        if (response && response.message && response.message !== 'Request processed successfully') {
          errorMessage = response.message;
        }
        setCouponError(errorMessage);
        setAppliedCoupon(null);
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

        const participantQuestions = questionsList.map(q => {
          const fieldName = getMappedKey(q);
          const fieldValue = participantForm.formData[fieldName];

          return {
            id: q.id,
            event_id: q.event_id,
            general_form_id: q.general_form_id,
            question_label: q.question_label,
            form_id: q.form_id,
            question_form_type: q.question_form_type,
            question_form_name: q.question_form_name,
            hint_type: q.hint_type,
            question_hint: q.question_hint || "",
            question_form_option: q.question_form_option || "",
            question_option_limit_flag: q.question_option_limit_flag || 0,
            child_question_ids: q.child_question_ids || "",
            sub_child_question_ids1: q.sub_child_question_ids1 || "",
            sub_child_question_ids2: q.sub_child_question_ids2 || "",
            user_field_mapping: q.user_field_mapping || "",
            is_manadatory: q.is_manadatory,
            date_range: q.date_range,
            range_start_date: q.range_start_date || "",
            range_end_date: q.range_end_date || "",
            specific_domain: q.specific_domain,
            domain_name: q.domain_name || "",
            limit_check: q.limit_check,
            limit_length: q.limit_length || "",
            question_status: q.question_status,
            is_subquestion: q.is_subquestion,
            parent_question_id: q.parent_question_id,
            sort_order: q.sort_order,
            is_compulsory: q.is_compulsory,
            created_by: q.created_by,
            is_custom_form: q.is_custom_form,
            apply_ticket: q.apply_ticket,
            ticket_details: q.ticket_details,
            show_on_ticket_pdf: q.show_on_ticket_pdf,
            hint_image: q.hint_image || "",
            ActualValue: fieldValue || "",
            Error: "",
            TicketId: ticketId.toString()
          };
        });

        FormQuestions[ticketId].push(participantQuestions);
      }
    });

    // Calculate total price
    const TotalPrice = selectedTickets.reduce((sum, t) => {
      const calcDetails = t.ticket_calculation_details || {};
      const totalBuyer = parseFloat(calcDetails.total_buyer || t.ticket_price * t.quantity);
      return sum + totalBuyer;
    }, 0).toFixed(2);

    // Get discount from localStorage
    const TotalDiscount = parseFloat(localStorage.getItem("couponDiscount")) || 0;

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
      UtmCampaign: "",
      GstArray
    };

    return bookingTicketsArray;
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

              // Check if this is the Age field and both Age and DOB exist
              const { hasAge, hasDOB, ageQuestion } = hasBothAgeAndDOB(participantIndex);
              const isAgeField = ageQuestion && getMappedKey(ageQuestion) === fieldName;
              const shouldDisableAge = hasAge && hasDOB && isAgeField;

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
                    {shouldDisableAge && (
                      <small style={{ color: '#28a745', fontSize: '11px', marginLeft: '8px' }}>
                        (Auto-calculated from Date of Birth)
                      </small>
                    )}
                  </label>
                  <input
                    type={question.question_form_type === 'mobile' ? 'tel' : question.question_form_type}
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
                              transition: 'background-color 0.3s'
                            }}
                          >
                            {couponLoading ? 'Applying...' : 'Apply'}
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
    e.preventDefault();
    console.log("🚀 Proceed button clicked");
    console.log("💳 Active payment gateway:", activePaymentGateway);

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

      // Individual fee components - these are PER TICKET from backend
      // We need to multiply by quantity to get total
      const convenienceFeePerTicket = parseFloat(calcDetails.total_convenience_fees || (effectivePrice * 0.02)) || 0;
      const platformFeePerTicket = parseFloat(calcDetails.platform_fees_5_each || 5) || 5;
      const paymentGatewayPerTicket = parseFloat(calcDetails.payment_gateway_1_85_buyer || (effectivePrice * 0.0185)) || 0;

      // Platform Fee total = (per ticket fees) * quantity
      const totalPlatformFee = (convenienceFeePerTicket + platformFeePerTicket + paymentGatewayPerTicket) * parseInt(ticket.quantity);

      // Extract individual GST components from ticket_calculation_details - these are PER TICKET
      const registrationGSTPerTicket = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
      const convenienceFeeGSTPerTicket = parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0);
      const platformFeeGSTPerTicket = parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0);
      const paymentGatewayGSTPerTicket = parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0);

      // Calculate total taxes = (per ticket taxes) * quantity
      const totalTaxes = (registrationGSTPerTicket + convenienceFeeGSTPerTicket + platformFeeGSTPerTicket + paymentGatewayGSTPerTicket) * parseInt(ticket.quantity);

      // Sub Total = Base + Platform Fee + Total Taxes
      return sum + baseAmount + totalPlatformFee + totalTaxes;
    }, 0) - couponDiscount; // Subtract coupon discount from subtotal

    console.log("✅ Validation passed, proceeding to payment");
    console.log("💰 Payment amount:", subTotal.toFixed(2));

    // Show payment modal immediately
    setShowPaymentModal(true);

    try {
      // Check which payment gateway is active and call appropriate API
      if (activePaymentGateway === 'phonepe') {
        // Call PhonePe payment initiation API
        console.log("📤 Calling PhonePe payment API...");

        // Build the booking payload (same as PayU)
        const bookingPayload = buildBookingPayload();

        // Determine ticket type
        const ticketType = subTotal > 0 ? 'paid' : 'free';

        const apiPayload = {
          event_id: eventId,
          amount: subTotal.toFixed(2),
          ticket_type: ticketType,
          booking_tickets_array: JSON.stringify(bookingPayload)
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
      } else if (activePaymentGateway === 'payu') {
        // Call PayU payment API
        console.log("📤 Calling PayU payment API...");

        // Build the booking payload for PayU
        const bookingPayload = buildBookingPayload();

        // Determine ticket type
        const ticketType = subTotal > 0 ? 'paid' : 'free';

        const apiPayload = {
          event_id: eventId,
          amount: subTotal.toFixed(2),
          ticket_type: ticketType,
          booking_tickets_array: JSON.stringify(bookingPayload)
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
      } else {
        throw new Error(`Unknown payment gateway: ${activePaymentGateway}`);
      }
    } catch (error) {
      console.error("❌ Payment Error:", error);
      alert(`Payment initiation failed: ${error.response?.data?.message || error.message || 'Please try again'}`);
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

          // Validate mobile number format (must be exactly 10 digits)
          if (q.question_form_type === 'mobile' && fieldValue) {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(fieldValue)) {
              const errorKey = `participant_${participantIndex}_${fieldName}`;
              errors[errorKey] = `${q.question_label} must be exactly 10 digits for Participant ${participantIndex + 1}`;
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
              hasErrors = true;
              console.log(`❌ Invalid email format: ${q.question_label} for Participant ${participantIndex + 1}`);
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

        // Individual fee components - these are PER TICKET from backend
        const convenienceFeePerTicket = parseFloat(calcDetails.total_convenience_fees || (effectivePrice * 0.02)) || 0;
        const platformFeePerTicket = parseFloat(calcDetails.platform_fees_5_each || 5) || 5;
        const paymentGatewayPerTicket = parseFloat(calcDetails.payment_gateway_1_85_buyer || (effectivePrice * 0.0185)) || 0;

        // Platform Fee total = (per ticket fees) * quantity
        const totalPlatformFee = (convenienceFeePerTicket + platformFeePerTicket + paymentGatewayPerTicket) * parseInt(ticket.quantity);

        // Extract individual GST components - these are PER TICKET
        const registrationGSTPerTicket = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
        const convenienceFeeGSTPerTicket = parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0);
        const platformFeeGSTPerTicket = parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0);
        const paymentGatewayGSTPerTicket = parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0);

        // Calculate total taxes = (per ticket taxes) * quantity
        const totalTaxes = (registrationGSTPerTicket + convenienceFeeGSTPerTicket + platformFeeGSTPerTicket + paymentGatewayGSTPerTicket) * parseInt(ticket.quantity);

        // Sub Total = Base + Platform Fee + Total Taxes
        return sum + baseAmount + totalPlatformFee + totalTaxes;
      }, 0);

      // Apply coupon discount if any
      const couponDiscount = parseFloat(localStorage.getItem("couponDiscount")) || 0;
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

                console.log('🔍 Full calcDetails:', calcDetails);

                // Individual fee components (base amounts only, without GST)
                // Check if GST is enabled
                const isGSTEnabled = calcDetails.collect_gst === "1" || calcDetails.collect_gst === 1;

                // IMPORTANT: When GST is ON, convenience_fee_amount and payment_gateway_1.85_buyer INCLUDE GST
                // When GST is OFF, they are already base amounts
                const convenienceFeeWithGST = parseFloat(calcDetails.convenience_fee_amount) || 0;
                const convenienceFeeBase = !isGSTEnabled && convenienceFeeWithGST > 0
                  ? Math.round((convenienceFeeWithGST / 1.18) * 100) / 100
                  : convenienceFeeWithGST;

                const platformFeeBase = parseFloat(calcDetails.platform_fees_5_each) || 0;

                const paymentGatewayWithGST = parseFloat(calcDetails['payment_gateway_1.85_buyer'] || calcDetails.payment_gateway_1_85_buyer) || 0;
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
                const registrationGST = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
                const convenienceFeeGST = parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0);
                const platformFeeGST = parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0);
                const paymentGatewayGST = parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0);

                // Calculate total taxes from individual components
                // Multiply by quantity to get total for all tickets
                const totalTaxes = (registrationGST + convenienceFeeGST + platformFeeGST + paymentGatewayGST) * parseInt(ticket.quantity);

                // Sub Total = Base + Platform Fee + Total Taxes
                const ticketSubTotal = baseAmount + totalPlatformFee + totalTaxes;

                return (
                  <div key={index} style={{ marginBottom: index < selectedTickets.length - 1 ? '20px' : '0' }}>
                    {/* Ticket Name and Base Price */}
                    <div className="summary-item" style={{ fontWeight: '600', fontSize: '15px' }}>
                      <span>{ticket.ticket_name || ticket.display_ticket_name} (x{ticket.quantity})</span>
                      <span>₹{baseAmount.toFixed(2)}</span>
                    </div>

                    {/* Platform Fee (Combined) - Multiplied by quantity */}
                    <div className="summary-item">
                      <span>Platform Fee</span>
                      <span>₹{totalPlatformFee.toFixed(2)}</span>
                    </div>

                    {/* Tax - Sum of all GST components - Multiplied by quantity */}
                    <div className="summary-item">
                      <span>Tax</span>
                      <span>₹{totalTaxes.toFixed(2)}</span>
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
              {appliedCoupon && (() => {
                // Calculate base price only (without fees and taxes)
                const basePrice = selectedTickets.reduce((sum, ticket) => {
                  let effectivePrice = parseFloat(ticket.ticket_price);

                  if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
                    const discountValue = parseFloat(ticket.discount_value || 0);
                    if (ticket.discount === 1) {
                      effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                    } else {
                      effectivePrice = effectivePrice - discountValue;
                    }
                  }

                  const baseAmount = effectivePrice * parseInt(ticket.quantity);
                  return sum + baseAmount;
                }, 0);

                // Calculate discount based on coupon type (apply on base price only)
                // discount_amt_per_type: 1 = fixed amount, 2 = percentage
                let discountAmount = 0;
                if (appliedCoupon.discount_type === 2) {
                  // Percentage discount on base price
                  const discountPercent = parseFloat(appliedCoupon.discount_value || 0);
                  discountAmount = (basePrice * discountPercent) / 100;
                } else if (appliedCoupon.discount_type === 1) {
                  // Fixed amount discount
                  discountAmount = parseFloat(appliedCoupon.discount_value || 0);
                }

                // Ensure discount doesn't exceed base price
                discountAmount = Math.min(discountAmount, basePrice);

                return (
                  <div className="summary-item" style={{ color: '#28a745', fontWeight: '600' }}>
                    <span>Discount ({appliedCoupon.coupon_code})</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                );
              })()}

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

                      // Individual fee components (base amounts only, without GST)
                      // Check if GST is enabled
                      const isGSTEnabled = calcDetails.collect_gst === "1" || calcDetails.collect_gst === 1;

                      // IMPORTANT: When GST is ON, convenience_fee_amount and payment_gateway_1.85_buyer INCLUDE GST
                      // When GST is OFF, they are already base amounts
                      const convenienceFeeWithGST = parseFloat(calcDetails.convenience_fee_amount) || 0;
                      const convenienceFeeBase = !isGSTEnabled && convenienceFeeWithGST > 0
                        ? Math.round((convenienceFeeWithGST / 1.18) * 100) / 100
                        : convenienceFeeWithGST;

                      const platformFeeBase = parseFloat(calcDetails.platform_fees_5_each) || 0;

                      const paymentGatewayWithGST = parseFloat(calcDetails['payment_gateway_1.85_buyer'] || calcDetails.payment_gateway_1_85_buyer) || 0;
                      const paymentGatewayChargesBase = !isGSTEnabled && paymentGatewayWithGST > 0
                        ? Math.round((paymentGatewayWithGST / 1.18) * 100) / 100
                        : paymentGatewayWithGST;

                      // Platform Fee = Convenience + Platform + Payment Gateway (base amounts only)
                      // Multiply by quantity to get total for all tickets
                      const totalPlatformFee = (convenienceFeeBase + platformFeeBase + paymentGatewayChargesBase) * parseInt(ticket.quantity);

                      // Extract individual GST components from ticket_calculation_details
                      const registrationGST = parseFloat(calcDetails.registration_18_percent_GST || calcDetails['registration_18_percent_GST'] || 0);
                      const convenienceFeeGST = parseFloat(calcDetails['18_percent_GST_convenience_fees'] || 0);
                      const platformFeeGST = parseFloat(calcDetails['18_percent_GST_platform_fees'] || 0);
                      const paymentGatewayGST = parseFloat(calcDetails['18_per_payment_gateway_GST'] || 0);

                      // Calculate total taxes from individual components
                      // Multiply by quantity to get total for all tickets
                      const totalTaxes = (registrationGST + convenienceFeeGST + platformFeeGST + paymentGatewayGST) * parseInt(ticket.quantity);

                      // Sub Total = Base + Platform Fee + Total Taxes
                      return sum + baseAmount + totalPlatformFee + totalTaxes;
                    }, 0);

                    // Calculate coupon discount on base price only
                    let couponDiscountAmount = 0;
                    if (appliedCoupon) {
                      // Calculate base price (without fees and taxes)
                      const basePrice = selectedTickets.reduce((sum, ticket) => {
                        let effectivePrice = parseFloat(ticket.ticket_price);

                        if (ticket.early_bird === 1 && ticket.show_early_bird === 1) {
                          const discountValue = parseFloat(ticket.discount_value || 0);
                          if (ticket.discount === 1) {
                            effectivePrice = effectivePrice - (effectivePrice * discountValue / 100);
                          } else {
                            effectivePrice = effectivePrice - discountValue;
                          }
                        }

                        const baseAmount = effectivePrice * parseInt(ticket.quantity);
                        return sum + baseAmount;
                      }, 0);

                      // discount_amt_per_type: 1 = fixed amount, 2 = percentage
                      if (appliedCoupon.discount_type === 2) {
                        // Percentage discount on base price
                        const discountPercent = parseFloat(appliedCoupon.discount_value || 0);
                        couponDiscountAmount = (basePrice * discountPercent) / 100;
                      } else if (appliedCoupon.discount_type === 1) {
                        // Fixed amount discount
                        couponDiscountAmount = parseFloat(appliedCoupon.discount_value || 0);
                      }
                      // Ensure discount doesn't exceed base price
                      couponDiscountAmount = Math.min(couponDiscountAmount, basePrice);
                    }

                    // Subtract coupon discount from subtotal
                    const finalTotal = subtotal - couponDiscountAmount;
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

              {/* Payment Buttons Container */}
              <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                {/* Single Proceed Button - Dynamic based on active gateway */}
                <button
                  className="btn-proceed-final"
                  onClick={handleProceedPayment}
                  disabled={gatewayLoading}
                  style={{
                    marginBottom: '0',
                    backgroundColor: activePaymentGateway === 'payu' ? '#17C653' : '#5f259f',
                    opacity: gatewayLoading ? 0.6 : 1,
                    cursor: gatewayLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="fas fa-users"></i>
                  <span className="proceed-count">
                    {selectedTickets.reduce((sum, t) => sum + t.quantity, 0)}
                  </span>
                  <span className="proceed-text">
                    {gatewayLoading
                      ? 'LOADING...'
                      : `PROCEED WITH ${activePaymentGateway?.toUpperCase() || 'PAYMENT'}`
                    }
                  </span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
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
