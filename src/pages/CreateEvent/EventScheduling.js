import React, { useState } from "react";
import "./CreateEvent.css";

export default function EventScheduling({ onBack, onNext }) {
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Event Scheduling Data:", formData);
    onNext(formData);
  };

  return (
    <div className="event-form-section">
      <div className="section-header">
        <h3>Event Scheduling</h3>
      </div>

      <form onSubmit={handleSubmit}>
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
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
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
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
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
            </div>
          </div>
        </div>

        {/* State and City */}
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>
                State <span className="required">*</span>
              </label>
              <select
                className="form-control"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                City <span className="required">*</span>
              </label>
              <select
                className="form-control"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
              </select>
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
                required
              />
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
                required
              />
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
                required
              />
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
                required
              />
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
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="form-navigation-buttons">
          <button type="button" className="btn-back" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="btn-save-continue">
            Save & Next (2/11)
          </button>
        </div>
      </form>
    </div>
  );
}
