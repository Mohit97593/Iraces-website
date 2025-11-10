import React, { useState } from "react";
import TopNav from "../../components/Navbar/TopNav";
import "./OrganiserProfile.css";

export default function OrganiserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [hasGST, setHasGST] = useState(false);
  const [profileData, setProfileData] = useState({
    organisationName: "sht",
    email: "trr@gmail.com",
    mobile: "4353453449",
    about: "tetr",
    contactPerson: "NA",
    contactNumber: "NA",
    logoImage: null,
    bannerImage: null,
    pancard: null,
    gstCertificate: null,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = ""; // Clear the input
      return;
    }

    // Validate image formats for image fields
    const imageFields = ["logoImage", "bannerImage"];
    if (imageFields.includes(fieldName) && file) {
      const validFormats = ["image/jpeg", "image/jpg", "image/png"];
      if (!validFormats.includes(file.type)) {
        alert("Please upload only jpg, jpeg, or png formats");
        e.target.value = ""; // Clear the input
        return;
      }
    }

    setProfileData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleSave = () => {
    // Add save logic here
    setIsEditing(false);
    console.log("Profile data saved:", profileData);
  };

  return (
    <>
      <TopNav />
      {/* Hero Section - same as My Events */}
      <section className="organiser-hero">
        <div className="organiser-hero-overlay"></div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="organiser-hero-title">Organiser Profile</h1>
              <nav className="organiser-breadcrumb">
                <span>Home</span>
                <span className="breadcrumb-separator">–</span>
                <span>Organiser Profile</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <div className="organiser-profile-container">
        <div className="organiser-profile-content">
          {!isEditing && (
            <div className="edit-button-container">
              <button className="edit-btn" onClick={handleEdit}>
                ✏️ Edit
              </button>
            </div>
          )}

          {isEditing ? (
            /* Edit Form Layout - Like Screenshot */
            <div className="edit-form-layout">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">
                    Organisation Name<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="organisationName"
                    value={profileData.organisationName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Organisation Name"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Email ID<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Email ID"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label className="form-label">
                    Mobile <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Mobile"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label className="form-label">
                    About<span className="required">*</span>
                  </label>
                  <textarea
                    name="about"
                    value={profileData.about}
                    onChange={handleChange}
                    className="form-textarea-simple"
                    rows="6"
                    placeholder="About"
                  />
                </div>
              </div>

              <div className="gst-toggle-row">
                <label className="gst-toggle">
                  <input
                    type="checkbox"
                    checked={hasGST}
                    onChange={(e) => setHasGST(e.target.checked)}
                    className="gst-checkbox"
                  />
                  <span className="gst-label">GST</span>
                </label>
              </div>

              {hasGST && (
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      GST Number <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={profileData.gstNumber || ""}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="GST Number"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">
                      GST Percentage <span className="required">*</span>
                    </label>
                    <div className="gst-percentage-box">18</div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={profileData.contactPerson}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Contact Person"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Contact Number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">
                    Organiser Logo Image <span className="required">*</span>
                  </label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logoImage")}
                      className="file-input-hidden"
                      id="logoImage"
                    />
                    <label htmlFor="logoImage" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.logoImage?.name || "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Banner Image</label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "bannerImage")}
                      className="file-input-hidden"
                      id="bannerImage"
                    />
                    <label htmlFor="bannerImage" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.bannerImage?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Registered Pancard</label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "pancard")}
                      className="file-input-hidden"
                      id="pancard"
                    />
                    <label htmlFor="pancard" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.pancard?.name || "No file chosen"}
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Registered GST Certificate
                  </label>
                  <div className="file-info-text">
                    (In jpg, jpeg, png formats. Max upto 5MB. Dimensions- 1920
                    px x 744 px)
                  </div>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "gstCertificate")}
                      className="file-input-hidden"
                      id="gstCertificate"
                    />
                    <label htmlFor="gstCertificate" className="file-choose-btn">
                      Choose File
                    </label>
                    <span className="file-name">
                      {profileData.gstCertificate?.name || "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="save-btn-form" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            /* Profile Grid - Screenshot Style */
            <div className="profile-grid screenshot-style">
              {/* Organisation Name */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Organisation Name</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="organisationName"
                    value={profileData.organisationName}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.organisationName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Email</div>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">{profileData.email}</div>
                )}
              </div>

              {/* Mobile */}
              <div className="profile-field screenshot-box full-width">
                <div className="screenshot-label">Mobile</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">{profileData.mobile}</div>
                )}
              </div>

              {/* About */}
              <div className="profile-field screenshot-box full-width">
                <div className="screenshot-label">About</div>
                {isEditing ? (
                  <textarea
                    name="about"
                    value={profileData.about}
                    onChange={handleChange}
                    className="field-textarea"
                    rows="4"
                  />
                ) : (
                  <div className="screenshot-value">{profileData.about}</div>
                )}
              </div>
              {/* Contact Person */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Contact Person</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactPerson"
                    value={profileData.contactPerson}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.contactPerson}
                  </div>
                )}
              </div>

              {/* Contact Number */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Contact Number</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleChange}
                    className="field-input"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.contactNumber}
                  </div>
                )}
              </div>

              {/* Organiser Logo Image */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Organiser Logo Image</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logoImage")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.logoImage ? (
                      <div className="file-preview">
                        {profileData.logoImage.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Banner Image */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Banner Image</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "bannerImage")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.bannerImage ? (
                      <div className="file-preview">
                        {profileData.bannerImage.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Registered Pancard */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">Registered Pancard</div>
                {isEditing ? (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "pancard")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.pancard ? (
                      <div className="file-preview">
                        {profileData.pancard.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>

              {/* Registered GST Certificate */}
              <div className="profile-field screenshot-box">
                <div className="screenshot-label">
                  Registered GST Certificate
                </div>
                {isEditing ? (
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "gstCertificate")}
                    className="field-input-file"
                  />
                ) : (
                  <div className="screenshot-value">
                    {profileData.gstCertificate ? (
                      <div className="file-preview">
                        {profileData.gstCertificate.name || "Uploaded"}
                      </div>
                    ) : (
                      <div className="no-file">No file uploaded</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
