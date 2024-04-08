import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {API_URL} from '@env';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS} from '../constants/styles';
import CopyRight from '../copyright';
import Loader from '../ui/loader';

const Appointments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {userLog} = useContext(DataResultsContext);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/all-patients/${userLog}`)
      .then(response => response.json())
      .then(data => {
        // Sort patient data by appointment date (ascending)
        if (Array.isArray(data) && data.length > 0) {
          data.sort((a, b) => {
            const dateA =
              a.vaccinations && a.vaccinations.length > 0
                ? new Date(a.vaccinations[0].dateForNextDose)
                : null;
            const dateB =
              b.vaccinations && b.vaccinations.length > 0
                ? new Date(b.vaccinations[0].dateForNextDose)
                : null;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA - dateB;
          });
        }
        setPatients(data && data.patients ? data.patients : []); // Ensure data.patients is an array
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, [userLog]);

  const renderVaccinationDetails = ({item}) => {
    // Filter out patients with no vaccinations
    const patientsWithVaccinations =
      item.vaccinations && item.vaccinations.length > 0;

    // Render vaccination details only if the patient has vaccinations
    if (patientsWithVaccinations) {
      return (
        <View style={styles.dateItem}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}>
            <Text style={styles.dateText}>
              Beneficary Name: {item.firstName} {item.lastName}
            </Text>
            <FlatList
              data={item.vaccinations}
              renderItem={({item: vaccine}) => (
                <View>
                  <Text style={styles.vaccinationItem}>
                    Dose: {vaccine.dose}
                  </Text>
                  <Text style={styles.vaccinationItem}>
                    Vaccine Name: {vaccine.vaccineName}
                  </Text>
                  <Text style={styles.vaccinationItem}>
                    Date of Vaccination: {vaccine.dateOfVaccination}
                  </Text>
                  <Text style={styles.vaccinationItem}>
                    Site Administered: {vaccine.siteAdministered}
                  </Text>
                  <Text style={styles.vaccinationItem}>
                    Vaccination Facility: {vaccine.facility}
                  </Text>
                  <Text style={styles.vaccinationItem}>
                    Date For Next Dose: {vaccine.dateForNextDose}
                  </Text>
                </View>
              )}
              keyExtractor={(vaccine, index) => index.toString()}
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      return null; // Render nothing if the patient has no vaccinations
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appointments</Text>
      {isLoading ? (
        <Loader size="large" />
      ) : (
        <FlatList
          data={patients}
          renderItem={renderVaccinationDetails}
          keyExtractor={(patient, index) => index.toString()}
        />
      )}
      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    // marginBottom: 20,
    textAlign: 'center',
    paddingVertical: 20,
    textDecorationLine: 'underline',
    backgroundColor: COLORS.WHITE,
  },
  dateItem: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    textDecorationLine: 'underline',
  },
  vaccinationItem: {
    fontSize: 16,
    color: 'black',
  },
});

export default Appointments;
