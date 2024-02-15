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

import CustomHeader from '../ui/custom-header';
import {useNavigation} from '@react-navigation/native';

import DataResultsContext from '../contexts/DataResultsContext';
import {ScrollView} from 'react-native-gesture-handler';

const PatientCard = ({patient}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);

  const toggleAccordion = () => {
    setExpanded(!expanded);
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
        <View style={styles.accordionContent}>
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
            Country Of Residence: {patient.country}
          </Text>
          <Text style={styles.accordionLabel}>
            District: {patient.district}
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
          <View style={styles.vaccinationContainer}>
            <Text style={styles.vaccinationHeader}>Vaccinations:</Text>
            {patient.vaccinations.map(vaccine => (
              <View key={vaccine.id} style={styles.vaccinationItem}>
                <Text>Vaccine Name: {vaccine.vaccineName}</Text>
                <Text>Vaccine Name: {vaccine.facility}</Text>
                <Text>Vaccine Name: {vaccine.dose}</Text>
                <Text>Vaccine Name: {vaccine.siteAdministered}</Text>
                <Text>Vaccine Name: {vaccine.vaccinatedBy}</Text>
                <Text>Vaccine Name: {vaccine.dateOfVaccination}</Text>
                <Text>Vaccine Name: {vaccine.dateForNextDose}</Text>
                <Text>Vaccine Name: {vaccine.cardNumber}</Text>
              </View>
            ))}
          </View>
          <View style={styles.vaccinationContainer}>
            <Text style={styles.vaccinationHeader}>Antenantal:</Text>
            {patient.antenantals.map(antenantal => (
              <View key={antenantal.id} style={styles.vaccinationItem}>
                <Text>Vaccine Name: {antenantal.bloodGroup}</Text>
                <Text>Vaccine Name: {antenantal.drugNotes}</Text>
                <Text>Vaccine Name: {antenantal.expectedDateOfDelivery}</Text>
                <Text>Vaccine Name: {antenantal.nextOfKin}</Text>
                <Text>Vaccine Name: {antenantal.nextOfKinContact}</Text>
                <Text>Vaccine Name: {antenantal.pregnancyStatus}</Text>
                <Text>Vaccine Name: {antenantal.routineVisitDate}</Text>
                <Text>Vaccine Name: {antenantal.weight}</Text>

                {antenantal.medicines &&
                  antenantal.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Text>Name: {medicine.name}</Text>
                      <Text>Dosage: {medicine.dosage}</Text>
                      <Text>Duration: {medicine.duration}</Text>
                      <Text>Frequency: {medicine.frequency}</Text>
                      <Text>Description: {medicine.description}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>
          <View style={styles.vaccinationContainer}>
            <Text style={styles.vaccinationHeader}>Diagnoses:</Text>
            {patient.diagnoses.map(diagnosis => (
              <View key={diagnosis.id} style={styles.vaccinationItem}>
                <Text>Condition: {diagnosis.condition}</Text>
                <Text>Date of Diagnosis: {diagnosis.dateOfDiagnosis}</Text>
                <Text>Follow-Up Date: {diagnosis.followUpDate}</Text>
                <Text>Impression: {diagnosis.impression}</Text>
                <Text>Is Pregnant: {diagnosis.isPregnant ? 'Yes' : 'No'}</Text>
                <Text>Lab Tests: {diagnosis.labTests}</Text>
                {diagnosis.medicines &&
                  diagnosis.medicines.map((medicine, index) => (
                    <View key={index} style={styles.medicineItem}>
                      <Text>Name: {medicine.name}</Text>
                      <Text>Dosage: {medicine.dosage}</Text>
                      <Text>Duration: {medicine.duration}</Text>
                      <Text>Frequency: {medicine.frequency}</Text>
                      <Text>Description: {medicine.description}</Text>
                    </View>
                  ))}
              </View>
            ))}
          </View>

          <View style={styles.vaccinationContainer}>
            <Text style={styles.vaccinationHeader}>
              Renal Health Screening:
            </Text>
            {patient.renal_histories.map(screening => (
              <View key={screening.id} style={styles.vaccinationItem}>
                <Text style={styles.vaccinationHeader}>Urine Macrosopy:</Text>
                <Text>Urine Appearance: {screening.appearance.color}</Text>
                <Text>Urine Clarity: {screening.appearance.clarity}</Text>
                <Text>Urine pH: {screening.chemistry.ph || 'N/A'}</Text>
                <Text>Urine Ketone: {screening.chemistry.ketone}</Text>
                <Text>Urine Glucose: {screening.chemistry.glucose}</Text>
                <Text>Urine Nitrite: {screening.chemistry.nitrite}</Text>
                <Text>Urine Protein: {screening.chemistry.protein}</Text>
                <Text>Urine Bilirubin: {screening.chemistry.bilirubin}</Text>
                <Text>Urine Leokcytes: {screening.chemistry.leokcytes}</Text>
                <Text>
                  Urine Specific Gravity: {screening.chemistry.specificGravity}
                </Text>

                <Text style={styles.vaccinationHeader}>Patient History:</Text>
                {screening.historyData && (
                  <View style={styles.vaccinationItem}>
                    {Object.entries(screening.historyData).map(
                      ([key, value]) => (
                        <Text key={key}>
                          {key}: {value}
                        </Text>
                      ),
                    )}
                  </View>
                )}

                <Text style={styles.vaccinationHeader}>Inspection Data:</Text>
                {screening.inspectionData && (
                  <View style={styles.vaccinationItem}>
                    {Object.entries(screening.inspectionData).map(
                      ([key, value]) => (
                        <View key={key} style={styles.inspectionItem}>
                          {key === 'bloodPressure' ? (
                            <>
                              <Text>Heart Pulse: {value.heartPulse}</Text>
                              <Text>
                                Systolic Pressure: {value.systolicPressure}
                              </Text>
                              <Text>
                                Diastolic Pressure: {value.diastolicPressure}
                              </Text>
                            </>
                          ) : (
                            <Text>
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

          <View style={styles.vaccinationContainer}>
            <Text style={styles.vaccinationHeader}>
              Renal Functional Tests:
            </Text>
            {patient.rfts.map(screening => (
              <View key={screening.id} style={styles.vaccinationItem}>
                {screening.inspectionData && (
                  <View style={styles.vaccinationItem}>
                    {Object.entries(screening.inspectionData).map(
                      ([key, value]) => (
                        <View key={key} style={styles.inspectionItem}>
                          {key === 'bloodPressure' ? (
                            <>
                              <Text>Heart Pulse: {value.heartPulse}</Text>
                              <Text>
                                Systolic Pressure: {value.systolicPressure}
                              </Text>
                              <Text>
                                Diastolic Pressure: {value.diastolicPressure}
                              </Text>
                            </>
                          ) : (
                            <Text>
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
                    {Object.entries(screening.rftData).map(([key, value]) => (
                      <View key={key} style={styles.inspectionItem}>
                        <Text>
                          {key}: {value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          <View>
            {patient &&
              patient.monitorings &&
              patient.monitorings.map(monitoring => (
                <View key={monitoring.id} style={styles.vaccinationItem}>
                  <Text style={styles.vaccinationHeader}>Monitoring Data:</Text>
                  {monitoring.monitoringData && (
                    <View style={styles.monitoringItem}>
                      {/* Chemistry */}
                      <Text style={styles.inspectionItem}>Chemistry:</Text>
                      <View style={styles.dataContainer}>
                        {monitoring.monitoringData.chemistry &&
                          Object.entries(
                            monitoring.monitoringData.chemistry,
                          ).map(([key, value]) => (
                            <Text key={key}>
                              {key}: {value}
                            </Text>
                          ))}
                      </View>

                      {/* Appearance */}
                      <Text style={styles.subheader}>Appearance:</Text>
                      <View style={styles.dataContainer}>
                        {monitoring.monitoringData.appearance &&
                          Object.entries(
                            monitoring.monitoringData.appearance,
                          ).map(([key, value]) => (
                            <Text key={key}>
                              {key}: {value}
                            </Text>
                          ))}
                      </View>

                      {/* Inspection Data */}
                      <Text style={styles.subheader}>Inspection Data:</Text>
                      <View style={styles.dataContainer}>
                        {monitoring.monitoringData.inspectionData &&
                          Object.entries(
                            monitoring.monitoringData.inspectionData,
                          ).map(([key, value]) => (
                            <View key={key}>
                              {typeof value === 'object' ? (
                                // If the value is an object (like blood pressure), render its nested values
                                Object.entries(value).map(
                                  ([subKey, subValue]) => (
                                    <Text key={subKey}>
                                      {subKey}: {subValue}
                                    </Text>
                                  ),
                                )
                              ) : (
                                // Otherwise, render the key-value pair
                                <Text>
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
          <Loader /> // Replace this with your loader component
        ) : (
          filteredPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        )}
      </ScrollView>
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
    borderRadius: 10,
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
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  vaccinationItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default PatientLists;
