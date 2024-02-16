import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
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

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/all-patients/${userLog}`)
      .then(response => response.json())
      .then(data => {
        setPatients(data.patients);
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
          <Text style={styles.dateText}>
            {item.firstName} {item.lastName}
          </Text>
          <FlatList
            data={item.vaccinations}
            renderItem={({item: vaccine}) => (
              <View style={styles.vaccinationItem}>
                <Text style={styles.dateText}>Dose: {vaccine.dose}</Text>
                <Text>Vaccine Name: {vaccine.vaccineName}</Text>
                <Text>Date of Vaccination: {vaccine.dateOfVaccination}</Text>
                <Text>Site Administered: {vaccine.siteAdministered}</Text>
                <Text>Vaccination Facility: {vaccine.facility}</Text>
                <Text>Date For Next Dose: {vaccine.dateForNextDose}</Text>
              </View>
            )}
            keyExtractor={(vaccine, index) => index.toString()}
          />
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
  },
});

export default Appointments;
