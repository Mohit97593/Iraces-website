import React, { useState, useMemo, useEffect } from "react";
import "./MedicalProfile.css";
import { authAPI } from "../../services/authAPI";

const MedicalProfile = ({ onUpdate }) => {
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get userData from sessionStorage
  const userData = useMemo(() => {
    const data = sessionStorage.getItem("userData");
    return data ? JSON.parse(data) : {};
  }, [refreshTrigger]);

  // Physical Attributes States
  const [bloodGroup, setBloodGroup] = useState(userData?.blood_group || "");
  const [height, setHeight] = useState(userData?.height || "");
  const [weight, setWeight] = useState(userData?.weight || "");

  // Medical Conditions States
  const [medicalConditions, setMedicalConditions] = useState(
    userData?.medical_conditions || ""
  );
  const [hasDiabetes, setHasDiabetes] = useState(userData?.has_diabetes || "");
  const [hasChestPain, setHasChestPain] = useState(
    userData?.has_chest_pain || ""
  );
  const [hasAngina, setHasAngina] = useState(userData?.has_angina || "");
  const [hasAbnormalHeartRhythms, setHasAbnormalHeartRhythms] = useState(
    userData?.has_abnormal_heart_rhythms || ""
  );
  const [hasPacemaker, setHasPacemaker] = useState(
    userData?.has_pacemaker || ""
  );
  const [hasSevereDehydration, setHasSevereDehydration] = useState(
    userData?.has_severe_dehydration || ""
  );
  const [hasMuscleCramps, setHasMuscleCramps] = useState(
    userData?.has_muscle_cramps || ""
  );
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(
    userData?.has_high_blood_pressure || ""
  );
  const [hasLowBloodSugar, setHasLowBloodSugar] = useState(
    userData?.has_low_blood_sugar || ""
  );
  const [hasEpilepsy, setHasEpilepsy] = useState(userData?.has_epilepsy || "");
  const [hasBleedingDisorders, setHasBleedingDisorders] = useState(
    userData?.has_bleeding_disorders || ""
  );
  const [hasAsthma, setHasAsthma] = useState(userData?.has_asthma || "");
  const [hasAnemia, setHasAnemia] = useState(userData?.has_anemia || "");
  const [hasHospitalized, setHasHospitalized] = useState(
    userData?.has_hospitalized || ""
  );
  const [hospitalizationDetails, setHospitalizationDetails] = useState(
    userData?.hospitalization_details || ""
  );
  const [hasInfections, setHasInfections] = useState(
    userData?.has_infections || ""
  );
  const [isPregnant, setIsPregnant] = useState(userData?.is_pregnant || "");
  const [stagePregnancy, setStagePregnancy] = useState(
    userData?.stage_pregnancy || ""
  );
  const [hasCovid, setHasCovid] = useState(userData?.has_covid || "");

  // Medication and Allergies States
  const [underMedication, setUnderMedication] = useState(
    userData?.under_medication || ""
  );
  const [medicationDetails, setMedicationDetails] = useState(
    userData?.medication_details || ""
  );
  const [currentMedications, setCurrentMedications] = useState(
    userData?.current_medications || ""
  );
  const [medicationsName, setMedicationsName] = useState(
    userData?.medications_name || ""
  );
  const [hasAllergies, setHasAllergies] = useState(
    userData?.has_allergies || ""
  );
  const [hasDrugAllergies, setHasDrugAllergies] = useState(
    userData?.has_drug_allergies || ""
  );
  const [drugAllergyDetails, setDrugAllergyDetails] = useState(
    userData?.drug_allergy_details || ""
  );

  // Healthcare Providers States
  const [familyDoctorName, setFamilyDoctorName] = useState(
    userData?.family_doctor_name || ""
  );
  const [familyDoctorContact, setFamilyDoctorContact] = useState(
    userData?.family_doctor_contact || ""
  );
  const [familyDoctorContactError, setFamilyDoctorContactError] = useState("");

  // Helper function to convert 1/0 to Yes/No
  const formatYesNo = (value) => {
    if (value === 1 || value === "1" || value === "Yes") {
      return "Yes";
    } else if (value === 0 || value === "0" || value === "No") {
      return "No";
    }
    return value || "null";
  };

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response?.data?.userData) {
          const data = response.data.userData[0];
          sessionStorage.setItem("userData", JSON.stringify(data));

          // Update all states with fresh data
          setBloodGroup(data?.blood_group || "");
          setHeight(data?.height || "");
          setWeight(data?.weight || "");
          setMedicalConditions(data?.medical_conditions || "");
          setHasDiabetes(formatYesNo(data?.diabetes));
          setHasChestPain(formatYesNo(data?.chestpain));
          setHasAngina(formatYesNo(data?.angina));
          setHasAbnormalHeartRhythms(formatYesNo(data?.abnormalheartrhythm));
          setHasPacemaker(formatYesNo(data?.pacemaker));
          setHasSevereDehydration(formatYesNo(data?.dehydrationseverity));
          setHasMuscleCramps(formatYesNo(data?.musclecramps));
          setHasHighBloodPressure(formatYesNo(data?.highbloodpressure));
          setHasLowBloodSugar(formatYesNo(data?.lowbloodsugar));
          setHasEpilepsy(formatYesNo(data?.epilepsy));
          setHasBleedingDisorders(formatYesNo(data?.bleedingdisorders));
          setHasAsthma(formatYesNo(data?.asthma));
          setHasAnemia(formatYesNo(data?.anemia));
          setHasHospitalized(formatYesNo(data?.hospitalized));
          setHospitalizationDetails(data?.hospitalization_details || "");
          setHasInfections(formatYesNo(data?.infections));
          setIsPregnant(formatYesNo(data?.pregnant));
          setStagePregnancy(data?.stage_pregnancy || "");
          setHasCovid(formatYesNo(data?.covidstatus));
          setUnderMedication(formatYesNo(data?.undermedication));
          setMedicationDetails(data?.meditaion_details || "");
          setCurrentMedications(formatYesNo(data?.currentmedications));
          setMedicationsName(data?.current_medication_names || "");
          setHasAllergies(data?.allergies || "");
          setHasDrugAllergies(formatYesNo(data?.drugallergy));
          setDrugAllergyDetails(data?.drug_allergy_details || "");
          setFamilyDoctorName(data?.familydoctorname || "");
          setFamilyDoctorContact(data?.familydoctorcontactno || "");

          // Trigger refresh to update userData
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = async () => {
    // Fetch fresh profile data when edit is clicked
    try {
      const response = await authAPI.getProfile();
      if (response?.data?.userData) {
        const data = response.data.userData[0];
        sessionStorage.setItem("userData", JSON.stringify(data));

        // Update all states with fresh data
        setBloodGroup(data?.blood_group || "");
        setHeight(data?.height || "");
        setWeight(data?.weight || "");
        setMedicalConditions(data?.medical_conditions || "");
        setHasDiabetes(formatYesNo(data?.diabetes));
        setHasChestPain(formatYesNo(data?.chestpain));
        setHasAngina(formatYesNo(data?.angina));
        setHasAbnormalHeartRhythms(formatYesNo(data?.abnormalheartrhythm));
        setHasPacemaker(formatYesNo(data?.pacemaker));
        setHasSevereDehydration(formatYesNo(data?.dehydrationseverity));
        setHasMuscleCramps(formatYesNo(data?.musclecramps));
        setHasHighBloodPressure(formatYesNo(data?.highbloodpressure));
        setHasLowBloodSugar(formatYesNo(data?.lowbloodsugar));
        setHasEpilepsy(formatYesNo(data?.epilepsy));
        setHasBleedingDisorders(formatYesNo(data?.bleedingdisorders));
        setHasAsthma(formatYesNo(data?.asthma));
        setHasAnemia(formatYesNo(data?.anemia));
        setHasHospitalized(formatYesNo(data?.hospitalized));
        setHospitalizationDetails(data?.hospitalization_details || "");
        setHasInfections(formatYesNo(data?.infections));
        setIsPregnant(formatYesNo(data?.pregnant));
        setStagePregnancy(data?.stage_pregnancy || "");
        setHasCovid(formatYesNo(data?.covidstatus));
        setUnderMedication(formatYesNo(data?.undermedication));
        setMedicationDetails(data?.meditaion_details || "");
        setCurrentMedications(formatYesNo(data?.currentmedications));
        setMedicationsName(data?.current_medication_names || "");
        setHasAllergies(data?.allergies || "");
        setHasDrugAllergies(formatYesNo(data?.drugallergy));
        setDrugAllergyDetails(data?.drug_allergy_details || "");
        setFamilyDoctorName(data?.familydoctorname || "");
        setFamilyDoctorContact(data?.familydoctorcontactno || "");

        // Trigger refresh to update userData
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }

    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      // Validate Height
      if (!height || height.trim() === "") {
        setHeightError("Height is required");
        return;
      }
      if (Number(height) <= 0) {
        setHeightError("Height must be a positive number");
        return;
      }

      // Validate Weight
      if (!weight || weight.trim() === "") {
        setWeightError("Weight is required");
        return;
      }
      if (Number(weight) <= 0) {
        setWeightError("Weight must be a positive number");
        return;
      }

      // Validate Family Doctor Contact Number
      if (!familyDoctorContact || familyDoctorContact.length !== 10) {
        setFamilyDoctorContactError(
          "Please enter a valid 10-digit contact number"
        );
        return;
      }
      // Prepare medical data according to API requirements
      const medicalData = {
        // Physical Attributes (users table)
        blood_group: bloodGroup || "",
        height: height || "",
        weight: weight || "",
        allergies: hasAllergies || "",
        medical_conditions: medicalConditions || "",

        // Medical Conditions (user_details table)
        diabetes: hasDiabetes === "Yes" || hasDiabetes === "1" ? 1 : 0,
        chestpain: hasChestPain === "Yes" || hasChestPain === "1" ? 1 : 0,
        angina: hasAngina === "Yes" || hasAngina === "1" ? 1 : 0,
        abnormalheartrhythm:
          hasAbnormalHeartRhythms === "Yes" || hasAbnormalHeartRhythms === "1"
            ? 1
            : 0,
        pacemaker: hasPacemaker === "Yes" || hasPacemaker === "1" ? 1 : 0,
        dehydrationseverity:
          hasSevereDehydration === "Yes" || hasSevereDehydration === "1"
            ? 1
            : 0,
        musclecramps:
          hasMuscleCramps === "Yes" || hasMuscleCramps === "1" ? 1 : 0,
        highbloodpressure:
          hasHighBloodPressure === "Yes" || hasHighBloodPressure === "1"
            ? 1
            : 0,
        lowbloodsugar:
          hasLowBloodSugar === "Yes" || hasLowBloodSugar === "1" ? 1 : 0,
        epilepsy: hasEpilepsy === "Yes" || hasEpilepsy === "1" ? 1 : 0,
        bleedingdisorders:
          hasBleedingDisorders === "Yes" || hasBleedingDisorders === "1"
            ? 1
            : 0,
        asthma: hasAsthma === "Yes" || hasAsthma === "1" ? 1 : 0,
        anemia: hasAnemia === "Yes" || hasAnemia === "1" ? 1 : 0,
        hospitalized:
          hasHospitalized === "Yes" || hasHospitalized === "1" ? 1 : 0,
        hospitalization_details: hospitalizationDetails || "",
        infections: hasInfections === "Yes" || hasInfections === "1" ? 1 : 0,
        pregnant: isPregnant === "Yes" || isPregnant === "1" ? 1 : 0,
        stage_pregnancy: stagePregnancy || "",
        covidstatus: hasCovid === "Yes" || hasCovid === "1" ? 1 : 0,

        // Medication and Allergies
        undermedication:
          underMedication === "Yes" || underMedication === "1" ? 1 : 0,
        meditaion_details: medicationDetails || "",
        currentmedications:
          currentMedications === "Yes" || currentMedications === "1" ? 1 : 0,
        current_medication_names: medicationsName || "",
        drugallergy:
          hasDrugAllergies === "Yes" || hasDrugAllergies === "1" ? 1 : 0,
        drug_allergy_details: drugAllergyDetails || "",

        // Healthcare Providers
        familydoctorname: familyDoctorName || "",
        familydoctorcontactno: familyDoctorContact || "",
      };

      // Call API
      const response = await authAPI.editUserMedical(medicalData);

      if (response) {
        // Refresh profile data
        const profileResponse = await authAPI.getProfile();
        if (profileResponse?.data?.userData) {
          const data = profileResponse.data.userData[0];
          sessionStorage.setItem("userData", JSON.stringify(data));

          // Update all states with fresh data
          setBloodGroup(data?.blood_group || "");
          setHeight(data?.height || "");
          setWeight(data?.weight || "");
          setMedicalConditions(data?.medical_conditions || "");
          setHasDiabetes(formatYesNo(data?.diabetes));
          setHasChestPain(formatYesNo(data?.chestpain));
          setHasAngina(formatYesNo(data?.angina));
          setHasAbnormalHeartRhythms(formatYesNo(data?.abnormalheartrhythm));
          setHasPacemaker(formatYesNo(data?.pacemaker));
          setHasSevereDehydration(formatYesNo(data?.dehydrationseverity));
          setHasMuscleCramps(formatYesNo(data?.musclecramps));
          setHasHighBloodPressure(formatYesNo(data?.highbloodpressure));
          setHasLowBloodSugar(formatYesNo(data?.lowbloodsugar));
          setHasEpilepsy(formatYesNo(data?.epilepsy));
          setHasBleedingDisorders(formatYesNo(data?.bleedingdisorders));
          setHasAsthma(formatYesNo(data?.asthma));
          setHasAnemia(formatYesNo(data?.anemia));
          setHasHospitalized(formatYesNo(data?.hospitalized));
          setHospitalizationDetails(data?.hospitalization_details || "");
          setHasInfections(formatYesNo(data?.infections));
          setIsPregnant(formatYesNo(data?.pregnant));
          setStagePregnancy(data?.stage_pregnancy || "");
          setHasCovid(formatYesNo(data?.covidstatus));
          setUnderMedication(formatYesNo(data?.undermedication));
          setMedicationDetails(data?.meditaion_details || "");
          setCurrentMedications(formatYesNo(data?.currentmedications));
          setMedicationsName(data?.current_medication_names || "");
          setHasAllergies(data?.allergies || "");
          setHasDrugAllergies(formatYesNo(data?.drugallergy));
          setDrugAllergyDetails(data?.drug_allergy_details || "");
          setFamilyDoctorName(data?.familydoctorname || "");
          setFamilyDoctorContact(data?.familydoctorcontactno || "");

          // Trigger refresh to update userData
          setRefreshTrigger((prev) => prev + 1);

          // Trigger parent Profile.js refresh for profile progress update
          if (onUpdate) {
            onUpdate();
          }
        }

        setEditMode(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save medical profile:", error);
      alert("Failed to save medical profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#22c55e",
            color: "#fff",
            padding: "18px 32px",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            fontWeight: 600,
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "260px",
            maxWidth: "350px",
            border: "2px solid #22c55e",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>✔️</span>
          Medical profile updated successfully
          <span
            style={{ marginLeft: "auto", cursor: "pointer" }}
            onClick={() => setShowSuccess(false)}
          >
            ✖️
          </span>
        </div>
      )}
      <div className="medical-profile-section">
        <div className="medical-profile-header">
          <div className="header-left">
            <h2>Medical Profile</h2>
            <p className="last-updated">Last Updated At : 0</p>
          </div>
          {!editMode && (
            <button className="edit-btn" onClick={handleEditClick}>
              <span>✏️</span>Edit
            </button>
          )}
        </div>

        {!editMode ? (
          // View Mode
          <div className="medical-profile-view">
            {/* Physical Attributes */}
            <div className="section-header">Physical Attributes</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">What is your blood group?</div>
                <div className="info-value">{bloodGroup || "null"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">What is your height</div>
                <div className="info-value">
                  {height ? `${height} cm` : "null"}
                </div>
              </div>
              <div className="info-card full-width">
                <div className="info-label">What is your current weight</div>
                <div className="info-value">
                  {weight ? `${weight} Kg` : "null"}
                </div>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="section-header">Medical Conditions</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Medical Conditions</div>
                <div className="info-value">{medicalConditions || "null"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Do you have diabetes?</div>
                <div className="info-value">{formatYesNo(hasDiabetes)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you experienced chest pain in the last 6 weeks?
                </div>
                <div className="info-value">{formatYesNo(hasChestPain)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you ever been diagnosed with angina?
                </div>
                <div className="info-value">{formatYesNo(hasAngina)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you experienced abnormal heart rhythms?
                </div>
                <div className="info-value">
                  {formatYesNo(hasAbnormalHeartRhythms)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Do you have a pacemaker?</div>
                <div className="info-value">{formatYesNo(hasPacemaker)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you suffered from severe dehydration in the last 4 weeks?
                </div>
                <div className="info-value">
                  {formatYesNo(hasSevereDehydration)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you experienced severe muscle cramps in the last 4 weeks?
                </div>
                <div className="info-value">{formatYesNo(hasMuscleCramps)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you been diagnosed with high blood pressure?
                </div>
                <div className="info-value">
                  {formatYesNo(hasHighBloodPressure)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you had episodes of low blood sugar in the last 4 weeks?
                </div>
                <div className="info-value">
                  {formatYesNo(hasLowBloodSugar)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you been diagnosed with epilepsy?
                </div>
                <div className="info-value">{formatYesNo(hasEpilepsy)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Do you have any bleeding disorders?
                </div>
                <div className="info-value">
                  {formatYesNo(hasBleedingDisorders)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Do you suffer from asthma?</div>
                <div className="info-value">{formatYesNo(hasAsthma)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you been diagnosed with anemia?
                </div>
                <div className="info-value">{formatYesNo(hasAnemia)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you been hospitalized recently?
                </div>
                <div className="info-value">{formatYesNo(hasHospitalized)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Hospitalization Details</div>
                <div className="info-value">
                  {hospitalizationDetails || "null"}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Are you currently experiencing any infections?
                </div>
                <div className="info-value">{formatYesNo(hasInfections)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Are you pregnant?</div>
                <div className="info-value">{formatYesNo(isPregnant)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Stage Pregnancy</div>
                <div className="info-value">{stagePregnancy || "NA"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Have you suffered from Covid-19?
                </div>
                <div className="info-value">{formatYesNo(hasCovid)}</div>
              </div>
            </div>

            {/* Medication and Allergies */}
            <div className="section-header">Medication and Allergies</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">
                  Are you currently under any medication?
                </div>
                <div className="info-value">{formatYesNo(underMedication)}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Medication Details</div>
                <div className="info-value">{medicationDetails || "NA"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Current Medications</div>
                <div className="info-value">
                  {formatYesNo(currentMedications)}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Medications Name</div>
                <div className="info-value">{medicationsName || "NA"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Do you have any known allergies?
                </div>
                <div className="info-value">{hasAllergies || "NA"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">
                  Do you have any known drug allergies?
                </div>
                <div className="info-value">
                  {formatYesNo(hasDrugAllergies)}
                </div>
              </div>
              <div className="info-card full-width">
                <div className="info-label">Drug Allergy Details</div>
                <div className="info-value">{drugAllergyDetails || "null"}</div>
              </div>
            </div>

            {/* Healthcare Providers */}
            <div className="section-header">Healthcare Providers</div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Family Doctor Name</div>
                <div className="info-value">{familyDoctorName || "null"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Family Doctor Contact Number</div>
                <div className="info-value">
                  {familyDoctorContact || "null"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="medical-profile-edit">
            {/* Physical Attributes */}
            <div className="section-header">Physical Attributes</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>What is your blood group?</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="edit-input"
                >
                  <option value="">-- Blood Group --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="edit-field">
                <label>
                  What is your height(Cm)?
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Height(Cm)*"
                  value={height}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) > 0) {
                      setHeight(val);
                      setHeightError("");
                    } else {
                      setHeightError("Height must be a positive number");
                    }
                  }}
                  className="edit-input"
                />
                {heightError && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {heightError}
                  </div>
                )}
              </div>
              <div className="edit-field full-width">
                <label>
                  What is your current weight(Kg)
                  <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="Weight(Kg)*"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) > 0) {
                      setWeight(val);
                      setWeightError("");
                    } else {
                      setWeightError("Weight must be a positive number");
                    }
                  }}
                  className="edit-input"
                />
                {weightError && (
                  <div
                    style={{ color: "red", fontSize: "12px", marginTop: "4px" }}
                  >
                    {weightError}
                  </div>
                )}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="section-header">Medical Conditions</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>Medical Conditions</label>
                <input
                  type="text"
                  placeholder="Medical Conditions"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="edit-field toggle-field">
                <label>Do you have diabetes?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasDiabetes === "Yes" || hasDiabetes === "1"}
                    onChange={(e) =>
                      setHasDiabetes(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>
                  Have you experienced chest pain in the last 6 weeks?
                </label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasChestPain === "Yes" || hasChestPain === "1"}
                    onChange={(e) =>
                      setHasChestPain(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you ever been diagnosed with angina?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasAngina === "Yes" || hasAngina === "1"}
                    onChange={(e) =>
                      setHasAngina(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you experienced abnormal heart rhythms?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasAbnormalHeartRhythms === "Yes" ||
                      hasAbnormalHeartRhythms === "1"
                    }
                    onChange={(e) =>
                      setHasAbnormalHeartRhythms(
                        e.target.checked ? "Yes" : "No"
                      )
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Do you have a pacemaker?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasPacemaker === "Yes" || hasPacemaker === "1"}
                    onChange={(e) =>
                      setHasPacemaker(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>
                  Have you suffered from severe dehydration in the last 4 weeks?
                </label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasSevereDehydration === "Yes" ||
                      hasSevereDehydration === "1"
                    }
                    onChange={(e) =>
                      setHasSevereDehydration(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>
                  Have you experienced severe muscle cramps in the last 4 weeks?
                </label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasMuscleCramps === "Yes" || hasMuscleCramps === "1"
                    }
                    onChange={(e) =>
                      setHasMuscleCramps(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you been diagnosed with high blood pressure?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasHighBloodPressure === "Yes" ||
                      hasHighBloodPressure === "1"
                    }
                    onChange={(e) =>
                      setHasHighBloodPressure(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>
                  Have you had episodes of low blood sugar in the last 4 weeks?
                </label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasLowBloodSugar === "Yes" || hasLowBloodSugar === "1"
                    }
                    onChange={(e) =>
                      setHasLowBloodSugar(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you been diagnosed with epilepsy?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasEpilepsy === "Yes" || hasEpilepsy === "1"}
                    onChange={(e) =>
                      setHasEpilepsy(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Do you have any bleeding disorders?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasBleedingDisorders === "Yes" ||
                      hasBleedingDisorders === "1"
                    }
                    onChange={(e) =>
                      setHasBleedingDisorders(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Do you suffer from asthma?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasAsthma === "Yes" || hasAsthma === "1"}
                    onChange={(e) =>
                      setHasAsthma(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you been diagnosed with anemia?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasAnemia === "Yes" || hasAnemia === "1"}
                    onChange={(e) =>
                      setHasAnemia(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Have you been hospitalized recently?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasHospitalized === "Yes" || hasHospitalized === "1"
                    }
                    onChange={(e) =>
                      setHasHospitalized(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {(hasHospitalized === "Yes" || hasHospitalized === "1") && (
                <div className="edit-field">
                  <label>Hospitalization Details</label>
                  <input
                    type="text"
                    placeholder="If Yes details of Hospital"
                    value={hospitalizationDetails}
                    onChange={(e) => setHospitalizationDetails(e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
              <div className="edit-field toggle-field">
                <label>Are you currently experiencing any infections?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasInfections === "Yes" || hasInfections === "1"}
                    onChange={(e) =>
                      setHasInfections(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="edit-field toggle-field">
                <label>Are you pregnant?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={isPregnant === "Yes" || isPregnant === "1"}
                    onChange={(e) =>
                      setIsPregnant(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {(isPregnant === "Yes" || isPregnant === "1") && (
                <div className="edit-field">
                  <label>Stage of Pregnancy</label>
                  <input
                    type="text"
                    placeholder="If Yes Stage of Pregnancy"
                    value={stagePregnancy}
                    onChange={(e) => setStagePregnancy(e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
              <div className="edit-field toggle-field">
                <label>Have you suffered from Covid-19?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={hasCovid === "Yes" || hasCovid === "1"}
                    onChange={(e) =>
                      setHasCovid(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>


            {/* Medication and Allergies */}
            <div className="section-header">Medication and Allergies</div>
            <div className="edit-grid">
              <div className="edit-field toggle-field">
                <label>Are you currently under any medication?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      underMedication === "Yes" || underMedication === "1"
                    }
                    onChange={(e) =>
                      setUnderMedication(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {(underMedication === "Yes" || underMedication === "1") && (
                <div className="edit-field">
                  <label>Details of Medication</label>
                  <input
                    type="text"
                    placeholder="If Yes details of Medication"
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
              <div className="edit-field toggle-field">
                <label>Current Medications</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      currentMedications === "Yes" || currentMedications === "1"
                    }
                    onChange={(e) =>
                      setCurrentMedications(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {(currentMedications === "Yes" || currentMedications === "1") && (
                <div className="edit-field">
                  <label>Details of Medication</label>
                  <input
                    type="text"
                    placeholder="Mention Names"
                    value={medicationsName}
                    onChange={(e) => setMedicationsName(e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
              <div className="edit-field">
                <label>Do you have any known allergies?</label>
                <input
                  type="text"
                  placeholder="Allergies"
                  value={hasAllergies}
                  onChange={(e) => setHasAllergies(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="edit-field toggle-field">
                <label>Do you have any known drug allergies?</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={
                      hasDrugAllergies === "Yes" || hasDrugAllergies === "1"
                    }
                    onChange={(e) =>
                      setHasDrugAllergies(e.target.checked ? "Yes" : "No")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {(hasDrugAllergies === "Yes" || hasDrugAllergies === "1") && (
                <div className="edit-field full-width">
                  <label>Details of Drug Allergy</label>
                  <input
                    type="text"
                    placeholder="If Yes details of Drug Allergy"
                    value={drugAllergyDetails}
                    onChange={(e) => setDrugAllergyDetails(e.target.value)}
                    className="edit-input"
                  />
                </div>
              )}
            </div>

            {/* Healthcare Providers */}
            <div className="section-header">Healthcare Providers</div>
            <div className="edit-grid">
              <div className="edit-field">
                <label>Please provide the name of your family doctor:</label>
                <input
                  type="text"
                  placeholder="Family Doctor Name"
                  value={familyDoctorName}
                  onChange={(e) => setFamilyDoctorName(e.target.value)}
                  className="edit-input"
                />
              </div>
              <div className="edit-field">
                <label>
                  Please provide the contact number of your family doctor:
                  <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Family Doctor Contact Number"
                  value={familyDoctorContact}
                  onChange={(e) => {
                    // Only allow numbers
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setFamilyDoctorContact(val);
                    setFamilyDoctorContactError("");
                  }}
                  className="edit-input"
                />
                {familyDoctorContactError && (
                  <div
                    style={{ color: "red", fontSize: "13px", marginTop: "4px" }}
                  >
                    {familyDoctorContactError}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MedicalProfile;
