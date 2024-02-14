import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { API_URL } from '@env';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS} from '../constants/styles';

const Appointments = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLog } = useContext(DataResultsContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vaccinations?${userLog}populate`);
        const json = await response.json();
        setData(json.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.dateItem}>
      <Text style={styles.dateText}>Date of Vaccination: {item.attributes.dateOfVaccination}</Text>
      <Text style={styles.dateText}>Date for Next Dose: {item.attributes.dateForNextDose}</Text>
      <Text style={styles.dateText}>Vaccine Name: {item.attributes.vaccineName}</Text>
      <Text style={styles.dateText}>Dose: {item.attributes.dose}</Text>
      <Text style={styles.dateText}>Site Administered: {item.attributes.siteAdministered}</Text>
      <Text style={styles.dateText}>Facility: {item.attributes.facility}</Text>
      <Text style={styles.dateText}>Vaccinated By: {item.attributes.vaccinatedBy}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appointments</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
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
