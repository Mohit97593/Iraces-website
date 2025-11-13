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

  const handleProceed = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    //   const handleProceed = async () => {
    //     setLoading(true);
    //     try {
    //       // Fetch ticket info only on proceed
    //       const ticketRes = await authAPI.getEventTicket(eventId);
    //       if (ticketRes && ticketRes.data && ticketRes.data.length > 0) {
    //         setTicket(ticketRes.data[0]);
    //       }
    //       // You can add further submission logic here
    //       console.log("Form data:", formData);
    //     } catch (error) {
    //       console.error("Error fetching ticket on proceed:", error);
    //     }
    //     setLoading(false);
    //   };
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
      "tshirtSize",
      "idProofType",
      "emergencyContactName",
      "emergencyContactNumber",
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        errors[field] = "This field is required";
      }
    });
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
                {/* Participant Type Dropdown */}
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

                {/* Name Fields */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-control"
                        placeholder="first name "
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                      {formErrors.firstName && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.firstName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-control"
                        placeholder="last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                      {formErrors.lastName && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email and Mobile */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Email Address*</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {formErrors.email && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Mobile Number*</label>
                      <input
                        type="tel"
                        name="mobile"
                        className="form-control"
                        placeholder="mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                      {formErrors.mobile && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.mobile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gender Selection */}
                <div className="form-group">
                  <label>Gender*</label>
                  <div className="gender-options">
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleInputChange}
                      />
                      <span className="gender-label">Male</span>
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleInputChange}
                      />
                      <span className="gender-label">Female</span>
                    </label>
                    <label className="gender-option">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={formData.gender === "Other"}
                        onChange={handleInputChange}
                      />
                      <span className="gender-label">Other</span>
                    </label>
                  </div>
                  {formErrors.gender && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {formErrors.gender}
                    </span>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <label>Date of Birth*</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    placeholder="dd-mm-yyyy"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                  {formErrors.dob && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {formErrors.dob}
                    </span>
                  )}
                </div>

                {/* Address Line 1 */}
                <div className="form-group">
                  <label>Address Line 1*</label>
                  <textarea
                    name="addressLine1"
                    className="form-control"
                    rows="3"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                  ></textarea>
                  {formErrors.addressLine1 && (
                    <span style={{ color: "red", fontSize: "12px" }}>
                      {formErrors.addressLine1}
                    </span>
                  )}
                </div>

                {/* Address Line 2 */}
                <div className="form-group">
                  <label>Address Line 2</label>
                  <textarea
                    name="addressLine2"
                    className="form-control"
                    rows="3"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Country and State */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Country*</label>
                      <select
                        name="country"
                        className="form-select"
                        value={formData.country}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select Country--</option>
                        {(() => {
                          console.log("Countries for dropdown:", countries);
                          return (
                            Array.isArray(countries) ? countries : []
                          ).map((country) => (
                            <option
                              key={country.id || country._id || country.code}
                              value={
                                country.country_name ||
                                country.name ||
                                country.code
                              }
                            >
                              {country.country_name ||
                                country.name ||
                                country.code}
                            </option>
                          ));
                        })()}
                      </select>
                      {formErrors.country && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.country}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Select State*</label>
                      <select
                        name="state"
                        className="form-select"
                        value={formData.state}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select State--</option>
                        {(() => {
                          console.log("States for dropdown:", states);
                          return (Array.isArray(states) ? states : []).map(
                            (state) => (
                              <option
                                key={state.id || state._id || state.code}
                                value={
                                  state.state_name || state.name || state.code
                                }
                              >
                                {state.state_name || state.name || state.code}
                              </option>
                            )
                          );
                        })()}
                      </select>
                      {formErrors.state && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.state}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* City and Pincode */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Select City*</label>
                      <select
                        name="city"
                        className="form-select"
                        value={formData.city}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select City--</option>
                        {(() => {
                          console.log("Cities for dropdown:", cities);
                          return (Array.isArray(cities) ? cities : []).map(
                            (city) => (
                              <option
                                key={city.id || city._id || city.code}
                                value={city.city_name || city.name || city.code}
                              >
                                {city.city_name || city.name || city.code}
                              </option>
                            )
                          );
                        })()}
                      </select>
                      {formErrors.city && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Pincode*</label>
                      <input
                        type="text"
                        name="pincode"
                        className="form-control"
                        value={formData.pincode}
                        onChange={handleInputChange}
                      />
                      {formErrors.pincode && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.pincode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blood Group and T-Shirt Size */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Blood Group*</label>
                      <select
                        name="bloodGroup"
                        className="form-select"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Blood Group--</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                      {formErrors.bloodGroup && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Select T-Shirt Size*</label>
                      <select
                        name="tshirtSize"
                        className="form-select"
                        value={formData.tshirtSize}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Select T-Shirt Size--</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                      {formErrors.tshirtSize && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.tshirtSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ID Proof Type and Upload */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>ID Proof Type*</label>
                      <select
                        name="idProofType"
                        className="form-select"
                        value={formData.idProofType}
                        onChange={handleInputChange}
                      >
                        <option value="">-- ID Proof Type--</option>
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Passport">Passport</option>
                      </select>
                      {formErrors.idProofType && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.idProofType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Upload ID Proof*</label>
                      <input
                        type="file"
                        name="idProofFile"
                        className="form-control"
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Emergency Contact Name*</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        className="form-control"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                      />
                      {formErrors.emergencyContactName && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.emergencyContactName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Emergency Contact Number*</label>
                      <input
                        type="tel"
                        name="emergencyContactNumber"
                        className="form-control"
                        value={formData.emergencyContactNumber}
                        onChange={handleInputChange}
                      />
                      {formErrors.emergencyContactNumber && (
                        <span style={{ color: "red", fontSize: "12px" }}>
                          {formErrors.emergencyContactNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                      href="/terms-conditions"
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
    </div>
  );
}
