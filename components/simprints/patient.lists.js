import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {COLORS, DIMENS} from '../constants/styles';
import {API_URL} from '@env';
import Loader from '../ui/loader';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import CustomHeader from '../ui/custom-header';
import {useNavigation} from '@react-navigation/native';
import Emoji from 'react-native-emoji';
import DataResultsContext from '../contexts/DataResultsContext';
import {ScrollView} from 'react-native-gesture-handler';
import CopyRight from '../copyright';

const LabelValuePair = ({ label, value }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.labelText}>{label}:</Text>
    <Text style={styles.valueText}>{value || 'Not specified'}</Text>
  </View>
);

const DiagnosisCard = ({ diagnosis }) => {
  // Format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // If already in dd/mm/yyyy format, convert to dd-mm-yyyy
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }
    
    // If in ISO format (yyyy-mm-dd), convert to dd-mm-yyyy
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return dateString;
  };

  return (
    <View style={styles.diagnosisItem}>
      <Text style={[styles.accordionLabel, styles.diagnosisDate]}>
        Diagnosis Date: <Text style={styles.accordionValue}>{formatDate(diagnosis.dateOfDiagnosis)}</Text>
      </Text>
      
      <Text style={styles.accordionLabel}>
        Condition: <Text style={styles.accordionValue}>{diagnosis.condition}</Text>
      </Text>
      
      <Text style={styles.accordionLabel}>
        Signs and Symptoms: <Text style={styles.accordionValue}>{diagnosis.impression}</Text>
      </Text>
      
      <Text style={styles.accordionLabel}>
        Lab Tests: <Text style={styles.accordionValue}>{diagnosis.labTests || 'None'}</Text>
      </Text>
      
      <Text style={styles.accordionLabel}>
        Follow-up Date: <Text style={styles.accordionValue}>{formatDate(diagnosis.followUpDate)}</Text>
      </Text>
      
      <Text style={styles.accordionLabel}>
        Pregnancy Status: <Text style={styles.accordionValue}>{diagnosis.isPregnant ? 'Yes' : 'No'}</Text>
      </Text>
      
      {diagnosis.medicines && diagnosis.medicines.length > 0 && (
        <View style={styles.medicineList}>
          <Text style={[styles.accordionLabel, { marginTop: 10 }]}>Prescribed Medicines:</Text>
          {diagnosis.medicines.map((medicine, index) => (
            <View key={index} style={styles.medicineItem}>
              <Text style={styles.accordionLabel}>
                Medicine Name: <Text style={styles.accordionValue}>{medicine.name}</Text>
              </Text>
              <Text style={styles.accordionLabel}>
                Dosage: <Text style={styles.accordionValue}>{medicine.dosage}</Text>
              </Text>
              <Text style={styles.accordionLabel}>
                Frequency: <Text style={styles.accordionValue}>{medicine.frequency}</Text>
              </Text>
              <Text style={styles.accordionLabel}>
                Duration: <Text style={styles.accordionValue}>{medicine.duration} days</Text>
              </Text>
              {medicine.description && (
                <Text style={styles.accordionLabel}>
                  Notes: <Text style={styles.accordionValue}>{medicine.description}</Text>
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const PatientCard = ({ patient }) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [screeningExpanded, setScreeningExpanded] = useState(false);
  const [monitoringExpanded, setMonitoringExpanded] = useState(false);
  const [vaccinationExpanded, setVaccinationExpanded] = useState(false);
  const [rftExpanded, setRFTExpanded] = useState(false);
  const [antenantalExpanded, setAntenantalExpanded] = useState(false);
  const [diagnosisExpanded, setDiagnosisExpanded] = useState(false);
  const [drugsExpanded, setDrugsExpanded] = useState(false);
  const [hypertensionExpanded, setHypertensionExpanded] = useState(false);
  const [diabetesExpanded, setDiabetesExpanded] = useState(false);
  const [monitoringVisitsExpanded, setMonitoringVisitsExpanded] = useState(false);
  const [medicalAssessmentExpanded, setMedicalAssessmentExpanded] = useState(false);

  const toggleAccordion = () => {
    setExpanded(!expanded);
  };
  const toggleScreening = () => {
    setScreeningExpanded(!screeningExpanded);
  };
  const toggleMonitoing = () => {
    setMonitoringExpanded(!monitoringExpanded);
  };
  const toggleRFT = () => {
    setRFTExpanded(!rftExpanded);
  };
  const toggleVaccination = () => {
    setVaccinationExpanded(!vaccinationExpanded);
  };
  const toggleAntennal = () => {
    setAntenantalExpanded(!antenantalExpanded);
  };
  const toggleDiagnosis = () => {
    setDiagnosisExpanded(!diagnosisExpanded);
  };
  const toggleDrugs = () => {
    setDrugsExpanded(!drugsExpanded);
  };
  const toggleHypertension = () => {
    setHypertensionExpanded(!hypertensionExpanded);
  };
  const toggleDiabetes = () => {
    setDiabetesExpanded(!diabetesExpanded);
  };
  const toggleMonitoringVisits = () => {
    setMonitoringVisitsExpanded(!monitoringVisitsExpanded);
  };
  const toggleMedicalAssessment = () => {
    setMedicalAssessmentExpanded(!medicalAssessmentExpanded);
  };
  const handleRedirect = () => {
    console.log('Patient ID:', patient.id);
    const age = calculateAge(patient.dateOfBirth);
    navigation.navigate('SelectActivity', {
      patientId: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: age,
      sex: patient.sex,
    });
  };

  const calculateAge = dateOfBirth => {
    if (!dateOfBirth) return 'Invalid Date';

    const [day, month, year] = dateOfBirth.split('/');

    const dob = new Date(year, month - 1, day);

    // Check if the parsed date is a valid date
    if (isNaN(dob.getTime())) return 'Invalid Date';

    // Get today's date
    const today = new Date();

    // Calculate the age
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Adjust the age if the birth month hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  // Format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // If already in dd/mm/yyyy format, convert to dd-mm-yyyy
    if (dateString.includes('/')) {
      return dateString.replace(/\//g, '-');
    }
    
    // If in ISO format (yyyy-mm-dd), convert to dd-mm-yyyy
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return dateString;
  };

  const MedicalRecordSection = ({ title, isExpanded, onToggle, children }) => (
    <>
      <Text style={styles.sectionHeader}>{title}</Text>
      <TouchableOpacity onPress={onToggle} style={styles.vaccinationHeader}>
        <Text style={styles.accordionHeaderText}>View Details</Text>
        <FontAwesomeIcon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={15}
          style={styles.icon}
        />
      </TouchableOpacity>
      {!isExpanded && (
        <View style={styles.vaccinationContainer}>
          {children}
        </View>
      )}
    </>
  );

  return (
    <View style={styles.patientContainer}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.patientName}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text style={styles.patientInfo}>
          📱 {patient.phoneNumber}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <LabelValuePair label="Sex" value={patient.sex} />
          <LabelValuePair label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
          <LabelValuePair label="Age" value={`${calculateAge(patient.dateOfBirth)} years`} />
          <LabelValuePair label="Village" value={patient.village || 'Not specified'} />
          <LabelValuePair label="Occupation" value={patient.occuptation || 'Not specified'} />
          <LabelValuePair label="Marital Status" value={patient.maritalStatus || 'Not specified'} />
          <LabelValuePair label="Primary Language" value={patient.primaryLanguage || 'Not specified'} />
          <LabelValuePair label="Height" value={patient.height ? `${patient.height} cm` : 'Not specified'} />
          <LabelValuePair label="Weight" value={patient.weight ? `${patient.weight} kg` : 'Not specified'} />
          <LabelValuePair label="Ethnicity" value={patient.ethinicity || 'Not specified'} />
          <LabelValuePair label="Known Health Condition" value={patient.knownHealthCondition || 'None'} />
          {patient.otherHealthCondition && (
            <LabelValuePair label="Other Health Condition" value={patient.otherHealthCondition} />
          )}
          
          <Text style={styles.sectionHeader}>Emergency Contact</Text>
          <LabelValuePair label="Next of Kin" value={patient.nextOfKin || 'Not specified'} />
          <LabelValuePair label="Next of Kin Contact" value={patient.nextOfKinContact || 'Not specified'} />

          {/* Screening Section */}
          {patient.renal_histories && patient.renal_histories.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Renal Health Screening</Text>
              <TouchableOpacity onPress={toggleScreening} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>Screening History</Text>
                <FontAwesomeIcon
                  name={screeningExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!screeningExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.renal_histories.map(screening => (
                    <View key={screening.id} style={styles.vaccinationItem}>
                      {/* Urine Macroscopy */}
                      <Text style={styles.sectionSubHeader}>Urine Macroscopy:</Text>
                      <Text style={styles.accordionLabel}>
                        Color: <Text style={styles.accordionValue}>{screening.appearance.color}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Clarity: <Text style={styles.accordionValue}>{screening.appearance.clarity}</Text>
                      </Text>

                      {/* Chemistry */}
                      <Text style={styles.sectionSubHeader}>Chemistry:</Text>
                      <Text style={styles.accordionLabel}>
                        pH: <Text style={styles.accordionValue}>{screening.chemistry.ph || 'N/A'}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Ketone: <Text style={styles.accordionValue}>{screening.chemistry.ketone}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Glucose: <Text style={styles.accordionValue}>{screening.chemistry.glucose}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Nitrite: <Text style={styles.accordionValue}>{screening.chemistry.nitrite}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Protein: <Text style={styles.accordionValue}>{screening.chemistry.protein}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Bilirubin: <Text style={styles.accordionValue}>{screening.chemistry.bilirubin}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Leukocytes: <Text style={styles.accordionValue}>{screening.chemistry.leokcytes}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Specific Gravity: <Text style={styles.accordionValue}>{screening.chemistry.specificGravity}</Text>
                      </Text>

                      {/* Patient History */}
                      {screening.historyData && (
                        <>
                          <Text style={styles.sectionSubHeader}>Patient History:</Text>
                          {Object.entries(screening.historyData).map(([key, value]) => (
                            <Text key={key} style={styles.accordionLabel}>
                              {key}: <Text style={styles.accordionValue}>{value}</Text>
                            </Text>
                          ))}
                        </>
                      )}

                      {/* Inspection Data */}
                      {screening.inspectionData && (
                        <>
                          <Text style={styles.sectionSubHeader}>Inspection Data:</Text>
                          {Object.entries(screening.inspectionData).map(([key, value]) => (
                            <View key={key}>
                              {key === 'bloodPressure' ? (
                                <>
                                  <Text style={styles.accordionLabel}>
                                    Heart Pulse: <Text style={styles.accordionValue}>{value.heartPulse}</Text>
                                  </Text>
                                  <Text style={styles.accordionLabel}>
                                    Systolic Pressure: <Text style={styles.accordionValue}>{value.systolicPressure}</Text>
                                  </Text>
                                  <Text style={styles.accordionLabel}>
                                    Diastolic Pressure: <Text style={styles.accordionValue}>{value.diastolicPressure}</Text>
                                  </Text>
                                </>
                              ) : (
                                <Text style={styles.accordionLabel}>
                                  {key}: <Text style={styles.accordionValue}>{value}</Text>
                                </Text>
                              )}
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* rfts */}
          <View>
            <TouchableOpacity
              onPress={toggleRFT}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>
                Renal Functional Tests
              </Text>
              <FontAwesomeIcon
                name={monitoringExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {!rftExpanded && patient.rfts.length > 0 && (
              <View style={styles.vaccinationContainer}>
                {patient.rfts.map(screening => (
                  <View key={screening.id} style={styles.vaccinationItem}>
                    {screening.inspectionData && (
                      <View style={styles.vaccinationItem}>
                        {Object.entries(screening.inspectionData).map(
                          ([key, value]) => (
                            <View key={key} style={styles.inspectionItem}>
                              {key === 'bloodPressure' ? (
                                <>
                                  <Text style={styles.accordionLabel}>
                                    Heart Pulse: {value.heartPulse}
                                  </Text>
                                  <Text style={styles.accordionLabel}>
                                    Systolic Pressure: {value.systolicPressure}
                                  </Text>
                                  <Text style={styles.accordionLabel}>
                                    Diastolic Pressure:{' '}
                                    {value.diastolicPressure}
                                  </Text>
                                </>
                              ) : (
                                <Text style={styles.accordionLabel}>
                                  {key}: {value}
                                </Text>
                              )}
                            </View>
                          ),
                        )}
                      </View>
                    )}

                    {screening.rftData && (
                      <View style={styles.vaccinationItem}>
                        {Object.entries(screening.rftData).map(
                          ([key, value]) => (
                            <View key={key} style={styles.inspectionItem}>
                              <Text style={styles.accordionLabel}>
                                {key}: {value}
                              </Text>
                            </View>
                          ),
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* Monitorings */}
          <View>
            <TouchableOpacity
              onPress={toggleMonitoing}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>
                Renal Health Monitoring
              </Text>
              <FontAwesomeIcon
                name={monitoringExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {patient &&
              !monitoringExpanded &&
              patient.monitorings &&
              patient.monitorings.map(monitoring => (
                <View key={monitoring.id} style={styles.vaccinationItem}>
                  {monitoring.monitoringData &&
                    monitoring.monitoringData.length > 0 && (
                      <View style={styles.monitoringItem}>
                        {/* Chemistry */}
                        <Text style={styles.inspectionItem}>Chemistry:</Text>
                        <View>
                          {monitoring.monitoringData[0].chemistry &&
                            Object.entries(
                              monitoring.monitoringData[0].chemistry,
                            ).map(([key, value]) => (
                              <Text key={key} style={styles.accordionLabel}>
                                {key}: {value}
                              </Text>
                            ))}
                        </View>

                        {/* Appearance */}
                        <Text style={styles.inspectionItem}>Appearance:</Text>
                        <View>
                          {monitoring.monitoringData[0].appearance &&
                            Object.entries(
                              monitoring.monitoringData[0].appearance,
                            ).map(([key, value]) => (
                              <Text key={key} style={styles.accordionLabel}>
                                {key}: {value}
                              </Text>
                            ))}
                        </View>

                        {/* Inspection Data */}
                        <Text style={styles.inspectionItem}>
                          Inspection Data:
                        </Text>
                        <View>
                          {monitoring.monitoringData[0].inspectionData &&
                            Object.entries(
                              monitoring.monitoringData[0].inspectionData,
                            ).map(([key, value]) => (
                              <View key={key}>
                                {typeof value === 'object' ? (
                                  Object.entries(value).map(
                                    ([subKey, subValue]) => (
                                      <Text
                                        key={subKey}
                                        style={styles.accordionLabel}>
                                        {subKey}: {subValue}
                                      </Text>
                                    ),
                                  )
                                ) : (
                                  <Text style={styles.accordionLabel}>
                                    {key}: {value}
                                  </Text>
                                )}
                              </View>
                            ))}
                        </View>
                      </View>
                    )}
                </View>
              ))}
          </View>

          {/* drugs for rft */}
          {/* Drugs */}
          <View>
            <TouchableOpacity
              onPress={toggleDrugs}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>Drugs</Text>
              <FontAwesomeIcon
                name={drugsExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {patient &&
              !drugsExpanded &&
              patient.drugs &&
              patient.drugs.map(drugGroup => (
                <View key={drugGroup.id} style={styles.vaccinationItem}>
                  {drugGroup.drugs &&
                    drugGroup.drugs.map((drug, index) => (
                      <View key={index} style={styles.monitoringItem}>
                        <Text style={styles.inspectionItem}>{drug.name}</Text>
                        <Text style={styles.accordionLabel}>
                          Dosage: {drug.dosage} X {drug.frequency}
                        </Text>
                        <Text style={styles.accordionLabel}>
                          Duration: {drug.duration} days
                        </Text>

                        {drug.description && (
                          <Text style={styles.accordionLabel}>
                            Description: {drug.description}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              ))}
          </View>

          {/* vaccinations */}
          {patient.vaccinations && patient.vaccinations.length > 0 && (
            <MedicalRecordSection 
              title="Vaccination History" 
              isExpanded={vaccinationExpanded}
              onToggle={toggleVaccination}
            >
              {patient.vaccinations.map(vaccine => (
                <View key={vaccine.id} style={styles.vaccinationItem}>
                  <LabelValuePair label="Vaccine Name" value={vaccine.vaccineName} />
                  <LabelValuePair label="Facility" value={vaccine.facility} />
                  <LabelValuePair label="Dose" value={vaccine.dose} />
                  <LabelValuePair label="Site Administered" value={vaccine.siteAdministered} />
                  <LabelValuePair label="Vaccinated By" value={vaccine.vaccinatedBy} />
                  <LabelValuePair label="Date of Vaccination" value={formatDate(vaccine.dateOfVaccination)} />
                  <LabelValuePair label="Next Dose Date" value={formatDate(vaccine.dateForNextDose)} />
                  <LabelValuePair label="Card Number" value={vaccine.cardNumber} />
                </View>
              ))}
            </MedicalRecordSection>
          )}

          {/* Antenatals */}
          <View>
            <TouchableOpacity
              onPress={toggleAntennal}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>Antenatals </Text>
              <FontAwesomeIcon
                name={monitoringExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {!antenantalExpanded && patient.antenantals.length > 0 && (
              <View style={styles.vaccinationContainer}>
                {patient.antenantals.map(antenantal => (
                  <View key={antenantal.id} style={styles.vaccinationItem}>
                    <Text style={styles.accordionLabel}>
                      Blood Group: {antenantal.bloodGroup}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Drug Notes: {antenantal.drugNotes}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Expected Date of Delivery:{' '}
                      {formatDate(antenantal.expectedDateOfDelivery)}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Next of Kin: {antenantal.nextOfKin}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Next of Kin Contact: {antenantal.nextOfKinContact}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Pregnancy Status: {antenantal.pregnancyStatus}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Routine Visit Date: {formatDate(antenantal.routineVisitDate)}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Weight: {antenantal.weight}
                    </Text>

                    {antenantal.medicines &&
                      antenantal.medicines.map((medicine, index) => (
                        <View key={index} style={styles.medicineItem}>
                          <Text style={styles.accordionLabel}>
                            Name: {medicine.name}
                          </Text>
                          <Text style={styles.accordionLabel}>
                            Dosage: {medicine.dosage}
                          </Text>
                          <Text style={styles.accordionLabel}>
                            Duration: {medicine.duration}
                          </Text>
                          <Text style={styles.accordionLabel}>
                            Frequency: {medicine.frequency}
                          </Text>
                          <Text style={styles.accordionLabel}>
                            Description: {medicine.description}
                          </Text>
                        </View>
                      ))}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Diagnoses Section */}
          {patient.diagnoses && patient.diagnoses.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Medical History</Text>
              <TouchableOpacity onPress={toggleDiagnosis} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>
                  Diagnoses ({patient.diagnoses.length})
                </Text>
                <FontAwesomeIcon
                  name={diagnosisExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!diagnosisExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.diagnoses.map(diagnosis => (
                    <DiagnosisCard key={diagnosis.id} diagnosis={diagnosis} />
                  ))}
                </View>
              )}
            </>
          )}

          {/* NCD - Hypertension Screening */}
          {patient.hypertension_screenings && patient.hypertension_screenings.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Non Communicable Diseases</Text>
              <TouchableOpacity onPress={toggleHypertension} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>
                  Hypertension Screening ({patient.hypertension_screenings.length})
                </Text>
                <FontAwesomeIcon
                  name={hypertensionExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!hypertensionExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.hypertension_screenings.map(screening => (
                    <View key={screening.id} style={styles.vaccinationItem}>
                      <Text style={styles.sectionSubHeader}>History & Symptoms</Text>
                      <Text style={styles.accordionLabel}>
                        Had BP Measured: <Text style={styles.accordionValue}>{screening.hadBPMeasured}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Known High BP: <Text style={styles.accordionValue}>{screening.knownHighBP}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Taking Medication: <Text style={styles.accordionValue}>{screening.takingMedication}</Text>
                      </Text>
                      {screening.medicationNames && (
                        <Text style={styles.accordionLabel}>
                          Medications: <Text style={styles.accordionValue}>{screening.medicationNames}</Text>
                        </Text>
                      )}
                      
                      {screening.symptoms && (
                        <>
                          <Text style={styles.sectionSubHeader}>Symptoms</Text>
                          <Text style={styles.accordionValue}>{screening.symptoms}</Text>
                        </>
                      )}
                      
                      <Text style={styles.sectionSubHeader}>Clinical Data</Text>
                      {screening.bloodPressure && (
                        <Text style={styles.accordionLabel}>
                          Blood Pressure: <Text style={styles.accordionValue}>{screening.bloodPressure}</Text>
                        </Text>
                      )}
                      {screening.temperature && (
                        <Text style={styles.accordionLabel}>
                          Temperature: <Text style={styles.accordionValue}>{screening.temperature}</Text>
                        </Text>
                      )}
                      {screening.pulseRate && (
                        <Text style={styles.accordionLabel}>
                          Pulse Rate: <Text style={styles.accordionValue}>{screening.pulseRate}</Text>
                        </Text>
                      )}
                      {screening.notes && (
                        <Text style={styles.accordionLabel}>
                          Notes: <Text style={styles.accordionValue}>{screening.notes}</Text>
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* NCD - Diabetes Screening */}
          {patient.diabetes_screenings && patient.diabetes_screenings.length > 0 && (
            <>
              {(!patient.hypertension_screenings || patient.hypertension_screenings.length === 0) && (
                <Text style={styles.sectionHeader}>Non Communicable Diseases</Text>
              )}
              <TouchableOpacity onPress={toggleDiabetes} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>
                  Diabetes Screening ({patient.diabetes_screenings.length})
                </Text>
                <FontAwesomeIcon
                  name={diabetesExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!diabetesExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.diabetes_screenings.map(screening => (
                    <View key={screening.id} style={styles.vaccinationItem}>
                      <Text style={styles.sectionSubHeader}>History & Symptoms</Text>
                      <Text style={styles.accordionLabel}>
                        Told Have Diabetes: <Text style={styles.accordionValue}>{screening.toldHaveDiabetes}</Text>
                      </Text>
                      {screening.howLongHadIt && (
                        <Text style={styles.accordionLabel}>
                          Duration: <Text style={styles.accordionValue}>{screening.howLongHadIt}</Text>
                        </Text>
                      )}
                      <Text style={styles.accordionLabel}>
                        Taking Medication: <Text style={styles.accordionValue}>{screening.takingMedication}</Text>
                      </Text>
                      {screening.medicationNames && (
                        <Text style={styles.accordionLabel}>
                          Medications: <Text style={styles.accordionValue}>{screening.medicationNames}</Text>
                        </Text>
                      )}
                      
                      {screening.symptoms && (
                        <>
                          <Text style={styles.sectionSubHeader}>Symptoms</Text>
                          <Text style={styles.accordionValue}>{screening.symptoms}</Text>
                        </>
                      )}
                      
                      <Text style={styles.sectionSubHeader}>Clinical Data</Text>
                      {screening.bloodSugar && (
                        <Text style={styles.accordionLabel}>
                          Blood Sugar: <Text style={styles.accordionValue}>{screening.bloodSugar}</Text>
                        </Text>
                      )}
                      {screening.bloodPressure && (
                        <Text style={styles.accordionLabel}>
                          Blood Pressure: <Text style={styles.accordionValue}>{screening.bloodPressure}</Text>
                        </Text>
                      )}
                      {screening.weight && (
                        <Text style={styles.accordionLabel}>
                          Weight: <Text style={styles.accordionValue}>{screening.weight}</Text>
                        </Text>
                      )}
                      {screening.temperature && (
                        <Text style={styles.accordionLabel}>
                          Temperature: <Text style={styles.accordionValue}>{screening.temperature}</Text>
                        </Text>
                      )}
                      {screening.pulseRate && (
                        <Text style={styles.accordionLabel}>
                          Pulse Rate: <Text style={styles.accordionValue}>{screening.pulseRate}</Text>
                        </Text>
                      )}
                      {screening.notes && (
                        <Text style={styles.accordionLabel}>
                          Notes: <Text style={styles.accordionValue}>{screening.notes}</Text>
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* NCD - Monitoring Visits */}
          {patient.monitoring_visits && patient.monitoring_visits.length > 0 && (
            <>
              {(!patient.hypertension_screenings || patient.hypertension_screenings.length === 0) && 
               (!patient.diabetes_screenings || patient.diabetes_screenings.length === 0) && (
                <Text style={styles.sectionHeader}>Non Communicable Diseases</Text>
              )}
              <TouchableOpacity onPress={toggleMonitoringVisits} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>
                  Monitoring Visits ({patient.monitoring_visits.length})
                </Text>
                <FontAwesomeIcon
                  name={monitoringVisitsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!monitoringVisitsExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.monitoring_visits.map(visit => (
                    <View key={visit.id} style={styles.vaccinationItem}>
                      <Text style={styles.accordionLabel}>
                        Visit Date: <Text style={styles.accordionValue}>{formatDate(visit.visitDate)}</Text>
                      </Text>
                      
                      <Text style={styles.sectionSubHeader}>Patient Feedback</Text>
                      <Text style={styles.accordionLabel}>
                        Feeling Since Last Visit: <Text style={styles.accordionValue}>{visit.feelingSinceLastVisit}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Taking Medication as Prescribed: <Text style={styles.accordionValue}>{visit.takingMedicationPrescribed}</Text>
                      </Text>
                      <Text style={styles.accordionLabel}>
                        Experienced Side Effects: <Text style={styles.accordionValue}>{visit.experiencedSideEffects}</Text>
                      </Text>
                      {visit.sideEffectsDescription && (
                        <Text style={styles.accordionLabel}>
                          Side Effects: <Text style={styles.accordionValue}>{visit.sideEffectsDescription}</Text>
                        </Text>
                      )}
                      <Text style={styles.accordionLabel}>
                        Checked BP/Blood Sugar: <Text style={styles.accordionValue}>{visit.checkedBPOrBloodSugar}</Text>
                      </Text>
                      {visit.readings && (
                        <Text style={styles.accordionLabel}>
                          Readings: <Text style={styles.accordionValue}>{visit.readings}</Text>
                        </Text>
                      )}
                      <Text style={styles.accordionLabel}>
                        New Symptoms: <Text style={styles.accordionValue}>{visit.newSymptoms}</Text>
                      </Text>
                      {visit.symptomsDescription && (
                        <Text style={styles.accordionLabel}>
                          Symptoms: <Text style={styles.accordionValue}>{visit.symptomsDescription}</Text>
                        </Text>
                      )}
                      <Text style={styles.accordionLabel}>
                        Following Lifestyle Advice: <Text style={styles.accordionValue}>{visit.followingLifestyleAdvice}</Text>
                      </Text>
                      {visit.lifestyleComment && (
                        <Text style={styles.accordionLabel}>
                          Comment: <Text style={styles.accordionValue}>{visit.lifestyleComment}</Text>
                        </Text>
                      )}
                      <Text style={styles.accordionLabel}>
                        Needs Health Education: <Text style={styles.accordionValue}>{visit.needHealthEducation}</Text>
                      </Text>
                      {visit.educationTopics && (
                        <Text style={styles.accordionLabel}>
                          Topics: <Text style={styles.accordionValue}>{visit.educationTopics}</Text>
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* NCD - Medical Assessment */}
          {patient.medical_assessments && patient.medical_assessments.length > 0 && (
            <>
              {(!patient.hypertension_screenings || patient.hypertension_screenings.length === 0) && 
               (!patient.diabetes_screenings || patient.diabetes_screenings.length === 0) &&
               (!patient.monitoring_visits || patient.monitoring_visits.length === 0) && (
                <Text style={styles.sectionHeader}>Non Communicable Diseases</Text>
              )}
              <TouchableOpacity onPress={toggleMedicalAssessment} style={styles.vaccinationHeader}>
                <Text style={styles.accordionHeaderText}>
                  Medical Assessments ({patient.medical_assessments.length})
                </Text>
                <FontAwesomeIcon
                  name={medicalAssessmentExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  style={styles.icon}
                />
              </TouchableOpacity>
              {!medicalAssessmentExpanded && (
                <View style={styles.vaccinationContainer}>
                  {patient.medical_assessments.map(assessment => (
                    <View key={assessment.id} style={styles.vaccinationItem}>
                      <Text style={styles.accordionLabel}>
                        Assessment Date: <Text style={styles.accordionValue}>{formatDate(assessment.assessmentDate)}</Text>
                      </Text>
                      
                      <Text style={styles.sectionSubHeader}>Diagnosis</Text>
                      <Text style={styles.accordionValue}>{assessment.diagnosis}</Text>
                      
                      {assessment.drugs && assessment.drugs.length > 0 && (
                        <>
                          <Text style={styles.sectionSubHeader}>Drugs Given</Text>
                          {assessment.drugs.map((drug, index) => (
                            <View key={index} style={styles.medicineItem}>
                              <Text style={styles.accordionLabel}>
                                Name: <Text style={styles.accordionValue}>{drug.name}</Text>
                              </Text>
                              <Text style={styles.accordionLabel}>
                                Dose: <Text style={styles.accordionValue}>{drug.dose}</Text>
                              </Text>
                              <Text style={styles.accordionLabel}>
                                Duration: <Text style={styles.accordionValue}>{drug.duration}</Text>
                              </Text>
                            </View>
                          ))}
                        </>
                      )}
                      
                      {assessment.sideEffects && (
                        <>
                          <Text style={styles.sectionSubHeader}>Side Effects</Text>
                          <Text style={styles.accordionValue}>{assessment.sideEffects}</Text>
                        </>
                      )}
                      
                      {assessment.nextFollowUpDate && (
                        <Text style={styles.accordionLabel}>
                          Next Follow-Up: <Text style={styles.accordionValue}>{formatDate(assessment.nextFollowUpDate)}</Text>
                        </Text>
                      )}
                      
                      <Text style={styles.accordionLabel}>
                        Referred to Facility: <Text style={styles.accordionValue}>{assessment.referredToFacility}</Text>
                      </Text>
                      {assessment.facilityName && (
                        <Text style={styles.accordionLabel}>
                          Facility: <Text style={styles.accordionValue}>{assessment.facilityName}</Text>
                        </Text>
                      )}
                      
                      {assessment.chwComments && (
                        <>
                          <Text style={styles.sectionSubHeader}>CHW Comments</Text>
                          <Text style={styles.accordionValue}>{assessment.chwComments}</Text>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <TouchableOpacity onPress={handleRedirect} style={styles.buttonSec}>
            <Text style={styles.buttonText}>Follow Up Patient</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const PatientLists = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const {userLog} = useContext(DataResultsContext);
  const navigation = useNavigation();

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      console.log('Fetching beneficiaries with userLog:', userLog);
      const url = `${API_URL}/api/all-patients/${userLog}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        console.error('Response status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response data:', JSON.stringify(data, null, 2));

      if (!data || !data.patients) {
        console.error('Invalid data format received:', data);
        Alert.alert(
          'Error',
          'The server returned an unexpected data format. Please try again.'
        );
        setLoading(false);
        return;
      }

      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error.message);
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to load beneficiaries. Please try again later.'
        );
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to handle search query
  const handleSearch = text => {
    setSearchQuery(text);
  };

  const filteredPatients =
    userData && userData.patients
      ? userData.patients.filter(patient => {
          const fullName = `${patient.firstName} ${patient.lastName}`;
          return fullName.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : [];

  const reversedPatients = filteredPatients.slice().reverse();
  const handleRedirect = () => {
    navigation.navigate('PatientData');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader
        left={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
          </TouchableOpacity>
        }
        title={<Text style={styles.centerHeader}>Back</Text>}
      />
      <ScrollView 
        style={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.PRIMARY]} // Android
            tintColor={COLORS.PRIMARY} // iOS
          />
        }>
        <Text style={styles.header}>Beneficiary List</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by first or last name..."
          placeholderTextColor={COLORS.GREY}
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {loading ? (
          <Loader />
        ) : !userData || !userData.patients ? (
          <View>
            <Text style={styles.buttonText}>
              Unable to load patients. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.buttonSec} onPress={fetchData}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : reversedPatients.length === 0 ? (
          <View>
            <Text style={styles.buttonText}>
              No patients registered yet <Emoji name="disappointed" />
            </Text>
            <TouchableOpacity style={styles.buttonSec} onPress={handleRedirect}>
              <Text style={styles.buttonText}>Register Patient </Text>
            </TouchableOpacity>
          </View>
        ) : (
          reversedPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        )}
      </ScrollView>
      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: COLORS.WHITE_LOW,
  },
  body: {padding: 12, marginBottom: 40},
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: COLORS.BLACK,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: COLORS.WHITE,
    elevation: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
    marginVertical: 20,
    textDecorationLine: 'underline',
  },
  centerHeader: {
    flex: 1,
    alignItems: 'center',
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
  patientContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: COLORS.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  patientInfo: {
    fontSize: 16,
    color: COLORS.BLACK,
    marginBottom: 5,
  },
  accordionContent: {
    marginTop: 10,
  },
  accordionLabel: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  accordionValue: {
    fontSize: 15,
    color: COLORS.BLACK,
    fontWeight: 'normal',
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.PRIMARY,
    paddingBottom: 5,
  },
  details: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  accordionHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    flex: 1,
  },
  vaccinationItem: {
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  buttonSec: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    color: COLORS.PRIMARY,
  },
  medicineItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.SUCCESS,
  },
  diagnosisItem: {
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  diagnosisHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  medicineList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  valueText: {
    fontSize: 15,
    color: COLORS.BLACK,
    flex: 2,
    textAlign: 'right',
  },
  diagnosisDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  sectionSubHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  }
});

export default PatientLists;
