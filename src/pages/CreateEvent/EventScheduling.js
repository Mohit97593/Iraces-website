import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";

export default function EventScheduling({ onBack, onNext }) {
  const defaultFormData = {
    timeZone: "",
    country: "",
    pincode: "",
    state: "",
    city: "",
    googleMapLink: "",
    eventAddress: "",
    eventStartDate: "",
    eventStartTime: "",
    eventEndDate: "",
    eventEndTime: "",
    registrationStartDate: "",
    registrationStartTime: "",
    registrationEndDate: "",
    registrationEndTime: "",
  };
  const getInitialFormData = () => {
    const saved = sessionStorage.getItem("eventSchedulingFormData");
    if (saved) {
      try {
        return { ...defaultFormData, ...JSON.parse(saved) };
      } catch {
        return defaultFormData;
      }
    }
    return defaultFormData;
  };
  const [timezones, setTimezones] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const getTodayString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const minStartDate = getTodayString();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      sessionStorage.setItem(
        "eventSchedulingFormData",
        JSON.stringify(updated)
      );
      // clear error for this field when user updates it
      setErrors((prevErr) => ({ ...prevErr, [name]: "" }));
      return updated;
    });
  };

  const renderError = (field) => {
    if (!errors || !errors[field]) return null;
    return (
      <div style={{ color: "#d9534f", marginTop: 6, fontSize: "0.9rem" }}>
        {errors[field]}
      </div>
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch timezones
        const timezonesRes = await authAPI.getTimezones();
        if (
          timezonesRes &&
          timezonesRes.data &&
          Array.isArray(timezonesRes.data.AllTimezones)
        ) {
          setTimezones(
            timezonesRes.data.AllTimezones.filter(
              (tz) => tz.area && tz.active === 1
            )
          );
        }

        // Fetch event details if event_id exists
        const eventId = sessionStorage.getItem("event_id");
        if (eventId) {
          const eventDetailsRes = await authAPI.getEventDetails(eventId);
          if (eventDetailsRes && eventDetailsRes.data) {
            const details = eventDetailsRes.data;
            if (!sessionStorage.getItem("eventSchedulingFormData")) {
              setFormData({
                ...defaultFormData,
                timeZone: details.timezone || "",
                country: details.country || "",
                pincode: details.pincode || "",
                state: details.state || "",
                city: details.city || "",
                googleMapLink: details.google_map_link || "",
                eventAddress: details.event_address || "",
                eventStartDate: details.event_start_date || "",
                eventStartTime: details.event_start_time || "",
                eventEndDate: details.event_end_date || "",
                eventEndTime: details.event_end_time || "",
                registrationStartDate: details.registration_start_date || "",
                registrationStartTime: details.registration_start_time || "",
                registrationEndDate: details.registration_end_date || "",
                registrationEndTime: details.registration_end_time || "",
              });
            }
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch countries on mount
    const fetchCountries = async () => {
      try {
        const res = await authAPI.getCountries();
        let countryList = [];
        if (res && res.data) {
          if (Array.isArray(res.data.AllCountry)) {
            countryList = res.data.AllCountry;
          } else if (Array.isArray(res.data.AllCountries)) {
            countryList = res.data.AllCountries;
          }
        }
        setCountries(countryList.filter((country) => country.name));
      } catch (err) {
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    // Fetch states when country changes
    if (!formData.country) {
      setStates([]);
      return;
    }
    const selectedCountry = countries.find((c) => c.name === formData.country);
    const fetchStates = async () => {
      try {
        const res = await authAPI.getStates({
          country_id: selectedCountry ? selectedCountry.id : null,
        });
        if (res && res.data && Array.isArray(res.data.AllState)) {
          setStates(res.data.AllState);
        } else {
          setStates([]);
        }
      } catch (err) {
        setStates([]);
      }
    };
    fetchStates();
  }, [formData.country, countries]);

  useEffect(() => {
    // Fetch cities when state changes
    if (!formData.state) {
      setCities([]);
      return;
    }
    const selectedState = states.find((s) => s.name === formData.state);
    const fetchCities = async () => {
      try {
        const res = await authAPI.getCities({
          state_id: selectedState ? selectedState.id : null,
        });
        let cityList = [];
        if (res && res.data) {
          if (Array.isArray(res.data.AllCities)) {
            cityList = res.data.AllCities;
          } else if (Array.isArray(res.data.AllCity)) {
            cityList = res.data.AllCity;
          }
        }
        setCities(cityList.filter((city) => city.name));
      } catch (err) {
        setCities([]);
      }
    };
    fetchCities();
  }, [formData.state, states]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // client-side validation for required fields
    const requiredFields = [
      "timeZone",
      "country",
      "pincode",
      "state",
      "city",
      "eventAddress",
      "eventStartDate",
      "eventStartTime",
      "eventEndDate",
      "eventEndTime",
      "registrationStartDate",
      "registrationStartTime",
      "registrationEndDate",
      "registrationEndTime",
    ];
    const newErrors = {};
    requiredFields.forEach((f) => {
      if (
        !formData[f] ||
        (typeof formData[f] === "string" && formData[f].trim() === "")
      ) {
        newErrors[f] = "This field is required";
      }
    });

    // simple date ordering checks
    if (formData.eventStartDate) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(`${formData.eventStartDate}T00:00`);
      if (startDateOnly < todayDate) {
        newErrors.eventStartDate = "Event start date cannot be in the past";
      }
    }
    if (formData.eventStartDate && formData.eventEndDate) {
      const start = new Date(
        `${formData.eventStartDate}T${formData.eventStartTime || "00:00"}`
      );
      const end = new Date(
        `${formData.eventEndDate}T${formData.eventEndTime || "00:00"}`
      );
      if (start > end) {
        newErrors.eventEndDate = "Event end must be after start";
      }
    }
    if (formData.registrationStartDate && formData.registrationEndDate) {
      const rstart = new Date(
        `${formData.registrationStartDate}T${
          formData.registrationStartTime || "00:00"
        }`
      );
      const rend = new Date(
        `${formData.registrationEndDate}T${
          formData.registrationEndTime || "00:00"
        }`
      );
      if (rstart > rend) {
        newErrors.registrationEndDate = "Registration end must be after start";
      }
    }

    // registration should not start or end before the event start date
    if (formData.eventStartDate && formData.registrationStartDate) {
      const eventStartOnly = new Date(`${formData.eventStartDate}T00:00`);
      const regStartOnly = new Date(`${formData.registrationStartDate}T00:00`);
      if (regStartOnly < eventStartOnly) {
        newErrors.registrationStartDate =
          "Registration cannot start before event start date";
      }
    }
    if (formData.eventStartDate && formData.registrationEndDate) {
      const eventStartOnly = new Date(`${formData.eventStartDate}T00:00`);
      const regEndOnly = new Date(`${formData.registrationEndDate}T00:00`);
      if (regEndOnly < eventStartOnly) {
        newErrors.registrationEndDate =
          "Registration end cannot be before event start date";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // scroll to first error field (optional)
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementsByName(firstKey)[0];
      if (el && el.scrollIntoView)
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const eventId = sessionStorage.getItem("event_id");
    const selectedCountry = countries.find((c) => c.name === formData.country);
    const selectedState = states.find((s) => s.name === formData.state);
    const selectedCity = cities.find((c) => c.name === formData.city);
    const selectedTimezone = timezones.find(
      (tz) => tz.area === formData.timeZone
    );
    const payload = {
      event_id: eventId,
      timezone_id: selectedTimezone ? selectedTimezone.id : 0,
      event_start_date: formData.eventStartDate,
      event_start_time: formData.eventStartTime,
      event_end_date: formData.eventEndDate,
      event_end_time: formData.eventEndTime,
      repeating_event: 0,
      pincode: formData.pincode,
      country_id: selectedCountry ? selectedCountry.id : 0,
      state_id: selectedState ? selectedState.id : 0,
      city_id: selectedCity ? selectedCity.id : 0,
      address: formData.eventAddress,
      latitude: formData.latitude || "",
      longitude: formData.longitude || "",
      registration_start_date: formData.registrationStartDate,
      registration_start_time: formData.registrationStartTime,
      registration_end_date: formData.registrationEndDate,
      registration_end_time: formData.registrationEndTime,
      google_map_link: formData.googleMapLink,
    };
    authAPI
      .addEventDuration(payload)
      .then((res) => {
        if (res.success === 200) {
          alert(res.message || "Event duration updated successfully");
          // Save registration end date to sessionStorage
          sessionStorage.setItem(
            "registerEndDate",
            formData.registrationEndDate
          );
          sessionStorage.setItem(
            "registerEndTime",
            formData.registrationEndTime
          );
          sessionStorage.setItem(
            "registerEndDateDisplay",
            `${formData.registrationEndDate} ${formData.registrationEndTime}`
          );
          onNext(formData);
        } else {
          alert(res.message || "Failed to update event duration");
        }
      })
      .catch((err) => {
        alert("Failed to update event duration");
      });
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Event Scheduling</h3>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Time Zone */}
        <div className="form-group">
          <label>
            Time Zone <span className="required">*</span>
          </label>
          <select
            className="form-control"
            name="timeZone"
            value={formData.timeZone}
            onChange={handleChange}
            required
          >
            <option value="">Select Time Zone</option>
            {Array.isArray(timezones) && timezones.length > 0 ? (
              timezones.map((tz) => (
                <option key={tz.id} value={tz.area}>
                  {tz.area}
                </option>
              ))
            ) : (
              <option disabled>Loading timezones...</option>
            )}
          </select>
          {renderError("timeZone")}
        </div>

        {/* Country and Pincode */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Country <span className="required">*</span>
              </label>
              <select
                className="form-control"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="">Select Country</option>
                {countries.length > 0 ? (
                  countries.map((country) => (
                    <option key={country.id} value={country.name}>
                      {country.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading countries...</option>
                )}
              </select>
              {renderError("country")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Pincode <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
              {renderError("pincode")}
            </div>
          </div>
        </div>

        {/* State and City */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                State <span className="required">*</span>
                {!formData.country && (
                  <span
                    className="info-icon"
                    title="Please select Country before selecting State"
                  >
                    i
                  </span>
                )}
              </label>
              <select
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {states.length > 0 ? (
                  states.map((state) => (
                    <option key={state.id} value={state.name}>
                      {state.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading states...</option>
                )}
              </select>
              {renderError("state")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                City <span className="required">*</span>
                {!formData.state && (
                  <span
                    className="info-icon"
                    title="Please select State before selecting City"
                  >
                    i
                  </span>
                )}
              </label>
              <select
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select City</option>
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading cities...</option>
                )}
              </select>
              {renderError("city")}
            </div>
          </div>
        </div>

        {/* Google Map Embed Code */}
        <div className="form-group">
          <label>Google Map Embed Code</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Google Map Link"
            name="googleMapLink"
            value={formData.googleMapLink}
            onChange={handleChange}
          />
        </div>

        {/* Event Address */}
        <div className="form-group">
          <label>
            Event Address <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            placeholder="Enter Event Address"
            name="eventAddress"
            value={formData.eventAddress}
            onChange={handleChange}
            rows="4"
            required
          />
          {renderError("eventAddress")}
        </div>

        {/* Event Start Date and Time */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Event Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="eventStartDate"
                value={formData.eventStartDate}
                onChange={handleChange}
                min={minStartDate}
                required
              />
              {renderError("eventStartDate")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Event Start Time <span className="required">*</span>
              </label>
              <input
                type="time"
                className="form-control"
                name="eventStartTime"
                value={formData.eventStartTime}
                onChange={handleChange}
                required
              />
              {renderError("eventStartTime")}
            </div>
          </div>
        </div>

        {/* Event End Date and Time */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Event End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="eventEndDate"
                value={formData.eventEndDate}
                onChange={handleChange}
                min={formData.eventStartDate || minStartDate}
                required
              />
              {renderError("eventEndDate")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Event End Time <span className="required">*</span>
              </label>
              <input
                type="time"
                className="form-control"
                name="eventEndTime"
                value={formData.eventEndTime}
                onChange={handleChange}
                required
              />
              {renderError("eventEndTime")}
            </div>
          </div>
        </div>

        {/* Registration Start Date and Time */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Registration Start Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="registrationStartDate"
                value={formData.registrationStartDate}
                onChange={handleChange}
                min={formData.eventStartDate || minStartDate}
                required
              />
              {renderError("registrationStartDate")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Registration Start Time <span className="required">*</span>
              </label>
              <input
                type="time"
                className="form-control"
                name="registrationStartTime"
                value={formData.registrationStartTime}
                onChange={handleChange}
                required
              />
              {renderError("registrationStartTime")}
            </div>
          </div>
        </div>

        {/* Registration End Date and Time */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Registration End Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="registrationEndDate"
                value={formData.registrationEndDate}
                onChange={handleChange}
                min={
                  formData.eventStartDate ||
                  formData.registrationStartDate ||
                  minStartDate
                }
                required
              />
              {renderError("registrationEndDate")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                Registration End Time <span className="required">*</span>
              </label>
              <input
                type="time"
                className="form-control"
                name="registrationEndTime"
                value={formData.registrationEndTime}
                onChange={handleChange}
                required
              />
              {renderError("registrationEndTime")}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="form-navigation-buttons">
          <button
            type="button"
            className="btn-back"
            style={{
              minWidth: 100,
              fontWeight: 600,
              background: "#fff",
              color: "#da251c",
              border: "2px solid #da251c",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: "1.1rem",
              height: 42,
              marginLeft: 8,
              marginTop: "22px",
            }}
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="submit"
            className="btn-save-continue"
            style={{
              minWidth: 120,
              fontWeight: 600,
              background: "#da251c",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "10px 32px",
              fontSize: "1.1rem",
              height: 44,
            }}
          >
            Save & Next (3/11)
          </button>
        </div>
      </form>
    </div>
  );
}
