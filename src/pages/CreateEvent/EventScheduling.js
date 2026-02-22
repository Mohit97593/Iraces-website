import React, { useState, useEffect } from "react";
import { authAPI } from "../../services/authAPI";
import "./CreateEvent.css";
import Toast from "../../components/Toast/Toast";

export default function EventScheduling({ onBack, onNext, initialFormData, showToast, onChange }) {
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
  const getPrevDayStr = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(`${dateStr}T00:00`);
      d.setDate(d.getDate() - 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return "";
    }
  };
  const [timezones, setTimezones] = useState([]);
  const [tzSearch, setTzSearch] = useState("");
  const [showTzDropdown, setShowTzDropdown] = useState(false);
  const [filteredTimezones, setFilteredTimezones] = useState([]);

  const [countries, setCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState([]);

  const [states, setStates] = useState([]);
  const [stateSearch, setStateSearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);

  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [localToast, setLocalToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setLocalToast({ message, type });
  };
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
      let updated = { ...prev, [name]: value };

      // If event start date was changed and existing event end is before new start,
      // clear the event end date/time so user must pick a new valid end.
      if (name === "eventStartDate" && updated.eventEndDate) {
        try {
          const start = new Date(`${value}T00:00`);
          const end = new Date(`${updated.eventEndDate}T00:00`);
          if (end < start) {
            updated.eventEndDate = "";
            updated.eventEndTime = "";
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      // If registration start date changed and registration end is before new start,
      // clear registration end date/time.
      if (name === "registrationStartDate" && updated.registrationEndDate) {
        try {
          const rstart = new Date(`${value}T00:00`);
          const rend = new Date(`${updated.registrationEndDate}T00:00`);
          if (rend < rstart) {
            updated.registrationEndDate = "";
            updated.registrationEndTime = "";
          }
        } catch (e) { }
      }

      // If user directly selected an end date that is before the start, clear it as well.
      if (name === "eventEndDate" && updated.eventStartDate) {
        try {
          const start = new Date(`${updated.eventStartDate}T00:00`);
          const end = new Date(`${value}T00:00`);
          if (end < start) {
            updated.eventEndDate = "";
            updated.eventEndTime = "";
          }
        } catch (e) { }
      }

      if (name === "registrationEndDate" && updated.registrationStartDate) {
        try {
          const rstart = new Date(`${updated.registrationStartDate}T00:00`);
          const rend = new Date(`${value}T00:00`);
          if (rend < rstart) {
            updated.registrationEndDate = "";
            updated.registrationEndTime = "";
          }
        } catch (e) { }
      }

      sessionStorage.setItem(
        "eventSchedulingFormData",
        JSON.stringify(updated)
      );
      // clear error for this field when user updates it
      setErrors((prevErr) => ({ ...prevErr, [name]: "" }));

      // Auto-close native date/time picker by blurring the input after selection
      if (e.target.type === "date" || e.target.type === "time") {
        e.target.blur();
      }

      if (onChange) {
        onChange(updated);
      }

      return updated;
    });
  };

  const dropdownListStyle = {
    position: "absolute",
    zIndex: 100,
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    maxHeight: 200,
    overflowY: "auto",
    borderRadius: 8,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    marginTop: 4,
  };

  const dropdownItemStyle = {
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: "1px solid #f2f2f2",
    fontSize: "0.95rem",
    transition: "background 0.2s",
  };

  const handlePincodeChange = async (e) => {
    const { value } = e.target;
    // Update pincode in formData
    setFormData((prev) => {
      const updated = { ...prev, pincode: value };
      sessionStorage.setItem(
        "eventSchedulingFormData",
        JSON.stringify(updated)
      );
      return updated;
    });
    // Clear error for pincode field
    setErrors((prevErr) => ({ ...prevErr, pincode: "" }));

    // If pincode is less than 6 digits or empty, clear state and city
    if (value.length < 6) {
      setFormData((prev) => {
        const updated = {
          ...prev,
          state: "",
          city: "",
        };
        sessionStorage.setItem(
          "eventSchedulingFormData",
          JSON.stringify(updated)
        );
        return updated;
      });
      return; // Exit early, don't make API call
    }

    // If pincode is 6 digits, fetch location data
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${value}`
        );
        const data = await response.json();

        if (
          data &&
          data[0] &&
          data[0].Status === "Success" &&
          data[0].PostOffice &&
          data[0].PostOffice.length > 0
        ) {
          const postOffice = data[0].PostOffice[0];
          const stateName = postOffice.State;
          const countryName = postOffice.Country;
          const cityName = postOffice.District || postOffice.Name;

          // Find matching country in the countries list (exact match only)
          const matchedCountry = countries.find(
            (c) => c.name.toLowerCase() === countryName.toLowerCase()
          );

          // Update formData with country, state, and city
          setFormData((prev) => {
            const updated = {
              ...prev,
              country: matchedCountry ? matchedCountry.name : countryName,
              state: stateName,
              city: cityName,
            };

            // Sync search inputs
            setCountrySearch(updated.country);
            setStateSearch(updated.state);
            setCitySearch(updated.city);

            sessionStorage.setItem(
              "eventSchedulingFormData",
              JSON.stringify(updated)
            );
            if (onChange) {
              onChange(updated);
            }
            return updated;
          });
        }
      } catch (error) {
        console.error("Error fetching pincode data:", error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const renderError = (field) => {
    if (!errors || !errors[field]) return null;
    return (
      <div style={{ color: "#d9534f", marginTop: 6, fontSize: "0.9rem" }}>
        {errors[field]}
      </div>
    );
  };

  // Timezone search effect
  useEffect(() => {
    if (!tzSearch || !Array.isArray(timezones) || timezones.length === 0) {
      setFilteredTimezones(timezones || []);
    } else {
      const q = String(tzSearch).toLowerCase();
      setFilteredTimezones(
        (timezones || []).filter(
          (tz) =>
            String(tz.area || "")
              .toLowerCase()
              .indexOf(q) !== -1
        )
      );
    }
  }, [tzSearch, timezones]);

  // Country search effect
  useEffect(() => {
    if (!countrySearch || !Array.isArray(countries) || countries.length === 0) {
      setFilteredCountries(countries || []);
    } else {
      const q = String(countrySearch).toLowerCase();
      setFilteredCountries(
        (countries || []).filter(
          (c) =>
            String(c.name || "")
              .toLowerCase()
              .includes(q)
        )
      );
    }
  }, [countrySearch, countries]);

  // State search effect
  useEffect(() => {
    if (!stateSearch || !Array.isArray(states) || states.length === 0) {
      setFilteredStates(states || []);
    } else {
      const q = String(stateSearch).toLowerCase();
      setFilteredStates(
        (states || []).filter(
          (s) =>
            String(s.name || "")
              .toLowerCase()
              .includes(q)
        )
      );
    }
  }, [stateSearch, states]);

  // City search effect
  useEffect(() => {
    if (!citySearch || !Array.isArray(cities) || cities.length === 0) {
      setFilteredCities(cities || []);
    } else {
      const q = String(citySearch).toLowerCase();
      setFilteredCities(
        (cities || []).filter(
          (c) =>
            String(c.name || "")
              .toLowerCase()
              .includes(q)
        )
      );
    }
  }, [citySearch, cities]);

  // initialize search terms from formData when available
  useEffect(() => {
    if ((!tzSearch || tzSearch === "") && formData.timeZone) {
      setTzSearch(formData.timeZone);
    }
  }, [formData.timeZone]);

  useEffect(() => {
    if ((!countrySearch || countrySearch === "") && formData.country) {
      setCountrySearch(formData.country);
    }
  }, [formData.country]);

  useEffect(() => {
    if ((!stateSearch || stateSearch === "") && formData.state) {
      setStateSearch(formData.state);
    }
  }, [formData.state]);

  useEffect(() => {
    if ((!citySearch || citySearch === "") && formData.city) {
      setCitySearch(formData.city);
    }
  }, [formData.city]);

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
                registrationStartDate:
                  details.diplay_registration_start_date ||
                  details.registration_start_date ||
                  details.display_registration_start_date ||
                  "",
                registrationStartTime:
                  details.diplay_registration_start_time ||
                  details.registration_start_time ||
                  details.display_registration_start_time ||
                  "",
                registrationEndDate:
                  details.diplay_registration_end_date ||
                  details.registration_end_date ||
                  details.display_registration_end_date ||
                  "",
                registrationEndTime:
                  details.diplay_registration_end_time ||
                  details.registration_end_time ||
                  details.display_registration_end_time ||
                  "",
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

  // Re-read sessionStorage when parent finishes prefill (covers race where child mounted early)
  useEffect(() => {
    const onPrefill = () => {
      const saved = sessionStorage.getItem("eventSchedulingFormData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          // ignore parse errors
        }
      }
    };
    window.addEventListener("createEventPrefillDone", onPrefill);
    return () =>
      window.removeEventListener("createEventPrefillDone", onPrefill);
  }, []);

  // If parent provides scheduling data (initialFormData) after async fetch in parent,
  // apply it to local form state so the UI reflects saved values when editing.
  useEffect(() => {
    if (
      initialFormData &&
      Object.keys(initialFormData).length > 0 &&
      JSON.stringify(initialFormData) !== JSON.stringify(getInitialFormData())
    ) {
      setFormData((prev) => ({ ...prev, ...initialFormData }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFormData]);

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

  // Reconcile saved scheduling values to option names when options are available
  useEffect(() => {
    // Only attempt when we have options
    if (!timezones || !countries) return;
    let updated = false;
    const savedRaw = sessionStorage.getItem("eventSchedulingFormData");
    if (!savedRaw) return;
    try {
      const saved = JSON.parse(savedRaw);
      const next = { ...formData };

      // Timezone: saved may be numeric id or area string
      if (saved.timeZone && timezones.length > 0) {
        const byArea = timezones.find((tz) => tz.area === saved.timeZone);
        const byId = timezones.find(
          (tz) => String(tz.id) === String(saved.timeZone)
        );
        if (byArea) {
          next.timeZone = byArea.area;
          updated = true;
        } else if (byId) {
          next.timeZone = byId.area;
          updated = true;
        }
      }

      // Country: saved may be id or name
      if (saved.country && countries.length > 0) {
        const byName = countries.find(
          (c) =>
            c.name === saved.country ||
            String(c.name).toLowerCase() === String(saved.country).toLowerCase()
        );
        const byId = countries.find(
          (c) => String(c.id) === String(saved.country)
        );
        if (byName) {
          next.country = byName.name;
          updated = true;
        } else if (byId) {
          next.country = byId.name;
          updated = true;
        }
      }

      // State: find by name or id within states list
      if (saved.state && states.length > 0) {
        const byName = states.find(
          (s) =>
            s.name === saved.state ||
            String(s.name).toLowerCase() === String(saved.state).toLowerCase()
        );
        const byId = states.find((s) => String(s.id) === String(saved.state));
        if (byName) {
          next.state = byName.name;
          updated = true;
        } else if (byId) {
          next.state = byId.name;
          updated = true;
        }
      }

      // City: find by name or id within cities list
      if (saved.city && cities.length > 0) {
        const byName = cities.find(
          (c) =>
            c.name === saved.city ||
            String(c.name).toLowerCase() === String(saved.city).toLowerCase()
        );
        const byId = cities.find((c) => String(c.id) === String(saved.city));
        if (byName) {
          next.city = byName.name;
          updated = true;
        } else if (byId) {
          next.city = byId.name;
          updated = true;
        }
      }

      if (updated) setFormData((prev) => ({ ...prev, ...next }));
    } catch (e) {
      // ignore JSON parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezones, countries, states, cities]);

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
    const registrationEnabled = !!(
      formData.eventStartDate && formData.eventEndDate
    );

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

    // Only require registration fields when event start / end are set
    if (registrationEnabled) {
      requiredFields.push(
        "registrationStartDate",
        "registrationStartTime",
        "registrationEndDate",
        "registrationEndTime"
      );
    }
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
      // Compare dates only (ignore times) so same-day events are allowed
      const startDateOnly = new Date(`${formData.eventStartDate}T00:00`);
      const endDateOnly = new Date(`${formData.eventEndDate}T00:00`);
      if (endDateOnly < startDateOnly) {
        newErrors.eventEndDate = "Event end must be on or after start";
      }
      // If start and end are the same date, enforce time-level ordering
      if (
        formData.eventStartDate === formData.eventEndDate &&
        formData.eventStartTime &&
        formData.eventEndTime
      ) {
        const [sh, sm] = String(formData.eventStartTime).split(":").map(Number);
        const [eh, em] = String(formData.eventEndTime).split(":").map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        if (endMinutes <= startMinutes) {
          newErrors.eventEndTime =
            "Event end time must be after start time for same-day events";
        }
      }
    }
    if (formData.registrationStartDate && formData.registrationEndDate) {
      const rstart = new Date(
        `${formData.registrationStartDate}T${formData.registrationStartTime || "00:00"
        }`
      );
      // If user did not provide an end time, assume end-of-day so same-date registration
      // is allowed while still enforcing that the end is strictly after the start.
      const rend = new Date(
        `${formData.registrationEndDate}T${formData.registrationEndTime || "23:59"
        }`
      );
      if (rstart >= rend) {
        // If the registration start and end dates are the same, set a time-specific error
        if (formData.registrationStartDate === formData.registrationEndDate) {
          newErrors.registrationEndTime =
            "Registration end time must be after start time for same-day registrations";
        } else {
          newErrors.registrationEndDate =
            "Registration end must be after start";
        }
      }
    }

    // (Allow registration to start before event start date.)
    // registration dates must fall on or before the event end date (if set)
    if (formData.eventEndDate && formData.registrationStartDate) {
      const eventEndOnly = new Date(`${formData.eventEndDate}T23:59`);
      const regStartOnly = new Date(`${formData.registrationStartDate}T00:00`);
      if (regStartOnly > eventEndOnly) {
        newErrors.registrationStartDate =
          "Registration start cannot be after the event end date";
      }
    }
    if (formData.eventEndDate && formData.registrationEndDate) {
      const eventEndOnly = new Date(`${formData.eventEndDate}T23:59`);
      const regEndOnly = new Date(`${formData.registrationEndDate}T00:00`);
      if (regEndOnly > eventEndOnly) {
        newErrors.registrationEndDate =
          "Registration end cannot be after the event end date";
      }
      // If registration end date equals event end date, registration end time must be before event end time
      if (
        formData.registrationEndDate === formData.eventEndDate &&
        formData.registrationEndTime &&
        formData.eventEndTime
      ) {
        const [reh, rem] = String(formData.registrationEndTime)
          .split(":")
          .map(Number);
        const [eeh, eem] = String(formData.eventEndTime).split(":").map(Number);
        const regEndMinutes = reh * 60 + rem;
        const eventEndMinutes = eeh * 60 + eem;
        if (regEndMinutes >= eventEndMinutes) {
          newErrors.registrationEndTime =
            "Registration end time must be before event end time when dates are the same";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerToast("Please fill all required fields correctly", 'error');
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
      // Include registration fields only if enabled; otherwise send empty values
      registration_start_date: registrationEnabled
        ? formData.registrationStartDate
        : "",
      registration_start_time: registrationEnabled
        ? formData.registrationStartTime
        : "",
      registration_end_date: registrationEnabled
        ? formData.registrationEndDate
        : "",
      registration_end_time: registrationEnabled
        ? formData.registrationEndTime
        : "",
      google_map_link: formData.googleMapLink,
    };
    authAPI
      .addEventDuration(payload)
      .then((res) => {
        const isSuccess = res.success === 200 || res.success === "200" || res.status === 200;
        if (isSuccess) {
          triggerToast(res.message || "Event Scheduling saved successfully!");
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
          // Delay navigation so toast is visible
          setTimeout(() => onNext(formData), 1500);
        } else {
          triggerToast(res.message || "Failed to update event duration", 'error');
        }
      })
      .catch((err) => {
        triggerToast("Failed to update event duration", 'error');
      });
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Event Scheduling</h3>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Time Zone - searchable combobox */}
        <div className="form-group" style={{ position: "relative" }}>
          <label>
            Time Zone <span className="required">*</span>
          </label>
          <input
            type="text"
            name="timeZoneInput"
            className="form-controll"
            placeholder="Search or select time zone"
            value={tzSearch}
            onChange={(e) => {
              const v = e.target.value;
              setTzSearch(v);
              setShowTzDropdown(true);
              // clear previous timezone error when user types
              setErrors((prev) => ({ ...prev, timeZone: "" }));
              // if user cleared the input, also clear selected timezone in formData so they can search again
              if (v === "") {
                setFormData((prev) => {
                  const updated = { ...prev, timeZone: "" };
                  sessionStorage.setItem(
                    "eventSchedulingFormData",
                    JSON.stringify(updated)
                  );
                  return updated;
                });
              }
            }}
            onFocus={() => setShowTzDropdown(true)}
            onBlur={() => {
              // small timeout to allow click on dropdown item
              setTimeout(() => setShowTzDropdown(false), 150);
            }}
          />

          {showTzDropdown && (
            <div
              style={{
                position: "absolute",
                zIndex: 60,
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #ddd",
                maxHeight: 220,
                overflow: "auto",
                borderRadius: 6,
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                marginTop: 6,
              }}
            >
              {Array.isArray(filteredTimezones) &&
                filteredTimezones.length > 0 ? (
                filteredTimezones.map((tz) => (
                  <div
                    key={tz.id}
                    role="button"
                    tabIndex={0}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => {
                      // select timezone
                      setFormData((prev) => {
                        const updated = { ...prev, timeZone: tz.area };
                        sessionStorage.setItem(
                          "eventSchedulingFormData",
                          JSON.stringify(updated)
                        );
                        return updated;
                      });
                      setTzSearch(tz.area);
                      setShowTzDropdown(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f2f2f2",
                    }}
                  >
                    {tz.area}
                  </div>
                ))
              ) : (
                <div style={{ padding: 12, color: "#666" }}>
                  {Array.isArray(timezones) && timezones.length === 0
                    ? "Loading timezones..."
                    : "No matches"}
                </div>
              )}
            </div>
          )}

          {renderError("timeZone")}
        </div>

        {/* Country and Pincode */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group" style={{ position: "relative" }}>
              <label>
                Country <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-controll"
                placeholder="Search country"
                value={countrySearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setCountrySearch(v);
                  setShowCountryDropdown(true);
                  if (v === "") {
                    setFormData(prev => ({ ...prev, country: "", state: "", city: "" }));
                  }
                }}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
              />
              {showCountryDropdown && (
                <div style={dropdownListStyle}>
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <div
                        key={c.id}
                        role="button"
                        className="dropdown-item-search"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, country: c.name, state: "", city: "" }));
                          setCountrySearch(c.name);
                          setShowCountryDropdown(false);
                          setErrors(prev => ({ ...prev, country: "" }));
                        }}
                        style={dropdownItemStyle}
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, color: "#999" }}>No countries found</div>
                  )
                  }
                </div>
              )}
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
                className="form-controll"
                placeholder="Enter 6-digit Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handlePincodeChange}
                maxLength="6"
                required
              />
              {pincodeLoading && (
                <div style={{ color: "#666", marginTop: 6, fontSize: "0.9rem" }}>
                  Fetching location details...
                </div>
              )}
              {renderError("pincode")}
            </div>
          </div>
        </div>

        {/* State and City */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group" style={{ position: "relative" }}>
              <label>
                State <span className="required">*</span>
                <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "normal" }}>
                  {" "}(Auto-filled from Pincode)
                </span>
              </label>
              <input
                type="text"
                className="form-controll"
                placeholder="Search state"
                value={stateSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setStateSearch(v);
                  setShowStateDropdown(true);
                  if (v === "") {
                    setFormData(prev => ({ ...prev, state: "", city: "" }));
                  }
                }}
                onFocus={() => setShowStateDropdown(true)}
                onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
                disabled={!formData.country}
              />
              {showStateDropdown && (
                <div style={dropdownListStyle}>
                  {filteredStates.length > 0 ? (
                    filteredStates.map((s) => (
                      <div
                        key={s.id}
                        className="dropdown-item-search"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, state: s.name, city: "" }));
                          setStateSearch(s.name);
                          setShowStateDropdown(false);
                          setErrors(prev => ({ ...prev, state: "" }));
                        }}
                        style={dropdownItemStyle}
                      >
                        {s.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, color: "#999" }}>{formData.country ? "No states found" : "Select country first"}</div>
                  )}
                </div>
              )}
              {renderError("state")}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group" style={{ position: "relative" }}>
              <label>
                City <span className="required">*</span>
                <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "normal" }}>
                  {" "}(Auto-filled from Pincode)
                </span>
              </label>
              <input
                type="text"
                className="form-controll"
                placeholder="Search city"
                value={citySearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setCitySearch(v);
                  setShowCityDropdown(true);
                  if (v === "") {
                    setFormData(prev => ({ ...prev, city: "" }));
                  }
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                disabled={!formData.state}
              />
              {showCityDropdown && (
                <div style={dropdownListStyle}>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((c) => (
                      <div
                        key={c.id}
                        className="dropdown-item-search"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, city: c.name }));
                          setCitySearch(c.name);
                          setShowCityDropdown(false);
                          setErrors(prev => ({ ...prev, city: "" }));
                        }}
                        style={dropdownItemStyle}
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, color: "#999" }}>{formData.state ? "No cities found" : "Select state first"}</div>
                  )}
                </div>
              )}
              {renderError("city")}
            </div>
          </div>
        </div>

        {/* Google Map Embed Code */}
        <div className="form-group">
          <label>Google Map Embed Code</label>
          <input
            type="text"
            className="form-controll"
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
            className="form-controll"
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
                className="form-controll"
                name="eventStartDate"
                value={formData.eventStartDate}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
                className="form-controll"
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
                className="form-controll"
                name="eventEndDate"
                value={formData.eventEndDate}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
                className="form-controll"
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
                className="form-controll"
                name="registrationStartDate"
                value={formData.registrationStartDate}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                min={minStartDate}
                max={formData.eventEndDate ? formData.eventEndDate : ""}
                required={!!(formData.eventStartDate && formData.eventEndDate)}
                disabled={!(formData.eventStartDate && formData.eventEndDate)}
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
                className="form-controll"
                name="registrationStartTime"
                value={formData.registrationStartTime}
                onChange={handleChange}
                required={!!(formData.eventStartDate && formData.eventEndDate)}
                disabled={!(formData.eventStartDate && formData.eventEndDate)}
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
                className="form-controll"
                name="registrationEndDate"
                value={formData.registrationEndDate}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                min={formData.registrationStartDate || minStartDate}
                max={formData.eventEndDate ? formData.eventEndDate : ""}
                required={!!(formData.eventStartDate && formData.eventEndDate)}
                disabled={!(formData.eventStartDate && formData.eventEndDate)}
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
                className="form-controll"
                name="registrationEndTime"
                value={formData.registrationEndTime}
                onChange={handleChange}
                max={
                  formData.registrationEndDate === formData.eventEndDate &&
                    formData.eventEndTime
                    ? formData.eventEndTime
                    : ""
                }
                required={!!(formData.eventStartDate && formData.eventEndDate)}
                disabled={!(formData.eventStartDate && formData.eventEndDate)}
              />
              {renderError("registrationEndTime")}
            </div>
          </div>
        </div>
        {/* Show helper text when registration dates are disabled */}
        {!(formData.eventStartDate && formData.eventEndDate) && (
          <div style={{ color: "#666", marginTop: 6 }}>
            Enter Event Start Date and Event End Date to enable registration
            dates.
          </div>
        )}

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

      {/* Local Toast Notification */}
      {localToast && (
        <Toast
          message={localToast.message}
          type={localToast.type}
          onClose={() => setLocalToast(null)}
        />
      )}
    </div>
  );
}
