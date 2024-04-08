import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
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

const PatientCard = ({patient}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [screeningExpanded, setScreeningExpanded] = useState(false);
  const [monitoringExpanded, setMonitoringExpanded] = useState(false);
  const [vaccinationExpanded, setVaccinationExpanded] = useState(false);
  const [rftExpanded, setRFTExpanded] = useState(false);
  const [antenantalExpanded, setAntenantalExpanded] = useState(false);
  const [diagnosisExpanded, setDiagnosisExpanded] = useState(false);
  const [drugsExpanded, setDrugsExpanded] = useState(false);

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

  return (
    <View style={styles.patientContainer}>
      <TouchableOpacity onPress={toggleAccordion}>
        <Text style={styles.patientName}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text style={styles.patientInfo}>
          Phone Number: {patient.phoneNumber}
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.details}>
          <Text style={styles.accordionLabel}>Sex: {patient.sex}</Text>
          <Text style={styles.accordionLabel}>
            Date of Birth: {patient.dateOfBirth}
          </Text>
          <Text style={styles.accordionLabel}>
            Age: {calculateAge(patient.dateOfBirth)} years old
          </Text>
          <Text style={styles.accordionLabel}>
            Occupation: {patient.occuptation}
          </Text>
          <Text style={styles.accordionLabel}>
            Marital Status: {patient.maritalStatus}
          </Text>
          <Text style={styles.accordionLabel}>
            Primary Language: {patient.primaryLanguage}
          </Text>

          <Text style={styles.accordionLabel}>
            Next of Kin: {patient.nextOfKin}
          </Text>
          <Text style={styles.accordionLabel}>
            Next of Kin Contact: {patient.nextOfKinContact}
          </Text>
          <Text style={styles.accordionLabel}>
            Ethnicity: {patient.ethinicity}
          </Text>

          <Text style={styles.accordionLabel}>Height: {patient.height} cm</Text>
          <Text style={styles.accordionLabel}>
            Weight: {patient.weight} kgs
          </Text>
          {/* Screening */}
          <View>
            <TouchableOpacity
              onPress={toggleScreening}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>
                Renal Health Screening
              </Text>
              <FontAwesomeIcon
                name={screeningExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {!screeningExpanded && patient.renal_histories.length > 0 ? (
              <View style={styles.vaccinationContainer}>
                {patient.renal_histories.map(screening => (
                  <View key={screening.id} style={styles.vaccinationItem}>
                    <Text style={styles.sectionHeader}>Urine Macrosopy:</Text>
                    <Text style={styles.accordionLabel}>
                      Urine Appearance: {screening.appearance.color}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Clarity: {screening.appearance.clarity}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine pH: {screening.chemistry.ph || 'N/A'}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Ketone: {screening.chemistry.ketone}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Glucose: {screening.chemistry.glucose}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Nitrite: {screening.chemistry.nitrite}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Protein: {screening.chemistry.protein}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Bilirubin: {screening.chemistry.bilirubin}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Leokcytes: {screening.chemistry.leokcytes}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Urine Specific Gravity:{' '}
                      {screening.chemistry.specificGravity}
                    </Text>

                    <Text style={styles.vaccinationHeader}>
                      Patient History:
                    </Text>
                    {screening.historyData && (
                      <View style={styles.vaccinationItem}>
                        {Object.entries(screening.historyData).map(
                          ([key, value]) => (
                            <Text key={key} style={styles.accordionLabel}>
                              {key}: {value}
                            </Text>
                          ),
                        )}
                      </View>
                    )}

                    <Text style={styles.vaccinationHeader}>
                      Inspection Data:
                    </Text>
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
                  </View>
                ))}
              </View>
            ) : null}
          </View>

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
          <View>
            <TouchableOpacity
              onPress={toggleVaccination}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>Vaccinations </Text>
              <FontAwesomeIcon
                name={monitoringExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {!vaccinationExpanded && patient.vaccinations.length > 0 && (
              <View style={styles.vaccinationContainer}>
                {patient.vaccinations.map(vaccine => (
                  <View key={vaccine.id} style={styles.vaccinationItem}>
                    <Text style={styles.accordionLabel}>
                      Vaccine Name: {vaccine.vaccineName}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Vaccine Facility: {vaccine.facility}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Dose: {vaccine.dose}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Site Administered: {vaccine.siteAdministered}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Vaccinated By: {vaccine.vaccinatedBy}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Date of Vaccination: {vaccine.dateOfVaccination}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Date For Next Dose: {vaccine.dateForNextDose}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Card Number: {vaccine.cardNumber}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

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
                      {antenantal.expectedDateOfDelivery}
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
                      Routine Visit Date: {antenantal.routineVisitDate}
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

          <View>
            <TouchableOpacity
              onPress={toggleDiagnosis}
              style={styles.vaccinationHeader}>
              <Text style={styles.accordionHeaderText}>Diagnoses </Text>
              <FontAwesomeIcon
                name={monitoringExpanded ? 'chevron-up' : 'chevron-down'}
                size={15}
                style={styles.icon}
              />
            </TouchableOpacity>
            {!diagnosisExpanded && patient.diagnoses.length > 0 && (
              <View style={styles.vaccinationContainer}>
                {patient.diagnoses.map(diagnosis => (
                  <View key={diagnosis.id} style={styles.vaccinationItem}>
                    <Text style={styles.accordionLabel}>
                      Condition: {diagnosis.condition}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Date of Diagnosis: {diagnosis.dateOfDiagnosis}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Follow-Up Date: {diagnosis.followUpDate}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Impression: {diagnosis.impression}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Is Pregnant: {diagnosis.isPregnant ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.accordionLabel}>
                      Lab Tests: {diagnosis.labTests}
                    </Text>
                    {diagnosis.medicines &&
                      diagnosis.medicines.map((medicine, index) => (
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
  const {userLog} = useContext(DataResultsContext);
  const navigation = useNavigation();

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/all-patients/${userLog}`);
      const data = await response.json();
      setUserData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      <ScrollView style={styles.body}>
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
        ) : reversedPatients.length === 0 ? (
          <View>
            <Text style={styles.buttonText}>
              Patient Not Yet Registered <Emoji name="disappointed" />
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
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.GRAY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  patientInfo: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 3,
  },
  accordionContent: {
    marginTop: 10,
  },
  accordionLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
  },
  buttonSec: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
    // paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  vaccinationContainer: {
    marginTop: 10,
  },
  vaccinationHeader: {
    // fontSize: 16,
    // fontWeight: 'bold',
    // marginBottom: 5,
    // textTransform: 'uppercase',
    // borderColor: COLORS.GREY,
    // borderWidth: 1,
    // paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaccinationItem: {
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    // borderLeftWidth: 1,
    fontSize: 16,
  },
  details: {
    padding: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 16,
    marginBottom: 5,
    textDecorationLine: 'underline',
    color: COLORS.BLACK,
  },
  accordionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    color: COLORS.BLACK,
  },
  icon: {
    marginLeft: 'auto',
    color: COLORS.BLACK,
  },
  inspectionItem: {
    fontSize: 15,
    marginRight: 10,
    color: COLORS.BLACK,
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
});

export default PatientLists;
