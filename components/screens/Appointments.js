import React, { useEffect, useState, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, DIMENS } from '../constants/styles';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import CustomHeader from '../ui/custom-header';
import DataResultsContext from '../contexts/DataResultsContext';
import { URLS } from '../constants/API';
// Make sure the path matches the actual location of the file
// Remove the import for fetchVaccinationAppointments since we'll directly use axios

function Appointments({ navigation }) {
  const { userLog, userNames } = useContext(DataResultsContext);
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNoAppointmentsFound, setIsNoAppointmentsFound] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  const formatDate = date => {
    if (date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString('en-GB', options);
    }
    return 'No date available';
  };

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={{
            marginHorizontal: 4,
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={[styles.centerHeader]}>Vaccination Appointments</Text>}
    />
  );

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Use the same API pattern as in display.patients.js
      const response = await axios.get(`${URLS.BASE}/api/all-patients/${userLog}`);

      if (response.status === 200) {
        const patientsData = response.data.patients || [];
        
        // Extract vaccination data with next dose dates from all patients
        const vaccinationAppointments = [];
        
        // Process each patient to extract their vaccination records
        patientsData.forEach(patient => {
          if (patient.vaccinations && Array.isArray(patient.vaccinations) && patient.vaccinations.length > 0) {
            // Add only vaccinations with a future next dose date
            patient.vaccinations.forEach(vaccination => {
              if (vaccination.dateForNextDose) {
                const nextDoseDate = new Date(vaccination.dateForNextDose);
                const currentDate = new Date();
                
                if (nextDoseDate >= currentDate) {
                  // Add patient details to the vaccination record
                  vaccinationAppointments.push({
                    id: vaccination.id,
                    dateOfVaccination: vaccination.dateOfVaccination,
                    dateForNextDose: vaccination.dateForNextDose,
                    vaccineName: vaccination.vaccineName,
                    dose: vaccination.dose,
                    siteAdministered: vaccination.siteAdministered,
                    facility: vaccination.facility,
                    patient: {
                      id: patient.id,
                      firstName: patient.firstName,
                      lastName: patient.lastName,
                      phoneNumber: patient.phoneNumber,
                      sex: patient.sex,
                      dateOfBirth: patient.dateOfBirth
                    }
                  });
                }
              }
            });
          }
        });
        
        // Sort by next dose date (soonest first)
        const sortedAppointments = vaccinationAppointments.sort(
          (a, b) => new Date(a.dateForNextDose) - new Date(b.dateForNextDose)
        );
        
        setAllAppointments(sortedAppointments);
        setAppointments(sortedAppointments);
        
        // Cache the appointments for offline access
        await AsyncStorage.setItem('appointmentsList', JSON.stringify(sortedAppointments));
        
        setIsNoAppointmentsFound(sortedAppointments.length === 0);
        setAppointmentsCount(sortedAppointments.length);
      } else {
        // Fallback to cached data if API call fails
        const storedData = await AsyncStorage.getItem('appointmentsList');

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAllAppointments(parsedData);
          setAppointments(parsedData);
          setAppointmentsCount(parsedData.length);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error.response?.data || error.message);
      
      // Fallback to cached data if API fails
      const storedData = await AsyncStorage.getItem('appointmentsList');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setAllAppointments(parsedData);
        setAppointments(parsedData);
        setAppointmentsCount(parsedData.length);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAppointments();
    };

    fetchData();
    
    // Add focus listener to refresh data when returning to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAppointments();
    });

    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleSearch = query => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search query is empty, show all appointments
      setAppointments(allAppointments);
      setIsNoAppointmentsFound(allAppointments.length === 0);
    } else {
      // Filter appointments based on patient name or vaccine name
      const filteredAppointments = allAppointments.filter(appointment => {
        const patientFirstName = appointment.patient?.firstName?.toLowerCase() || '';
        const patientLastName = appointment.patient?.lastName?.toLowerCase() || '';
        const vaccineName = appointment.vaccineName?.toLowerCase() || '';
        const searchLower = query.toLowerCase();
        
        // Match by starting letters like in display.patients.js
        return patientFirstName.startsWith(searchLower) || 
               patientLastName.startsWith(searchLower) || 
               vaccineName.includes(searchLower);
      });
      
      setAppointments(filteredAppointments);
      setIsNoAppointmentsFound(filteredAppointments.length === 0);
    }
  };

  const handleCallPatient = phoneNumber => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'No phone number available for this patient');
    }
  };

  const renderAppointmentCard = ({ item }) => {
    const isExpanded = item.id === expandedAppointmentId;

    const toggleExpansion = () => {
      if (isExpanded) {
        setExpandedAppointmentId(null);
      } else {
        setExpandedAppointmentId(item.id);
      }
    };

    // Calculate days remaining until next dose
    const getDaysRemaining = () => {
      if (!item.dateForNextDose) return 'No date set';
      
      const today = new Date();
      const nextDoseDate = new Date(item.dateForNextDose);
      const diffTime = nextDoseDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today!';
      if (diffDays === 1) return 'Tomorrow';
      return `In ${diffDays} days`;
    };

    // Create patient full name
    const patientName = `${item.patient?.firstName || ''} ${item.patient?.lastName || ''}`.trim() || 'Unknown Patient';
    
    // Calculate patient age if date of birth is available
    const getPatientAge = () => {
      if (!item.patient?.dateOfBirth) return '';
      
      const birthDate = new Date(item.patient.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // Adjust age if birthday hasn't occurred yet this year
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} years`;
    };

    // Format next dose date in DD/MM/YYYY format
    const formatNextDoseDate = () => {
      if (!item.dateForNextDose) return 'No date set';
      const date = new Date(item.dateForNextDose);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return (
      <View style={styles.appointmentCard}>
        <TouchableOpacity onPress={toggleExpansion} style={styles.cardHeader}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.daysRemaining}>{getDaysRemaining()}</Text>
            <Text style={styles.nextDoseDate}>Next Dose: {formatNextDoseDate()}</Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={25}
            color={COLORS.PRIMARY}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardDetails}>
            <Text style={styles.dataLabel}>
              Vaccine: <Text style={styles.dataValue}>{item.vaccineName}</Text>
            </Text>

            <Text style={styles.dataLabel}>
              Dose: <Text style={styles.dataValue}>{item.dose}</Text>
            </Text>

            <Text style={styles.dataLabel}>
              Next Dose Date: <Text style={styles.dataValue}>{formatDate(item.dateForNextDose)}</Text>
            </Text>
            
            <Text style={styles.dataLabel}>
              Vaccination Date: <Text style={styles.dataValue}>{formatDate(item.dateOfVaccination)}</Text>
            </Text>
            
            {item.patient?.dateOfBirth && (
              <Text style={styles.dataLabel}>
                Patient Age: <Text style={styles.dataValue}>{getPatientAge()}</Text>
              </Text>
            )}
            
            {item.patient?.sex && (
              <Text style={styles.dataLabel}>
                Gender: <Text style={styles.dataValue}>{item.patient.sex}</Text>
              </Text>
            )}

            <Text style={styles.dataLabel}>
              Patient Phone: <Text style={styles.dataValue}>{item.patient?.phoneNumber || 'N/A'}</Text>
            </Text>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallPatient(item.patient?.phoneNumber)}>
              <Icon name="phone" size={20} color={COLORS.WHITE} />
              <Text style={styles.callButtonText}>Call Patient</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {_header()}
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.GRAY_DARK} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient name or vaccine"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="x" size={20} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Upcoming Appointments: <Text style={styles.statsCount}>{appointmentsCount}</Text>
        </Text>
      </View>

      {isLoading ? (
        <Loader />
      ) : isNoAppointmentsFound ? (
        <View style={styles.noDataContainer}>
          <Icon name="calendar" size={50} color={COLORS.GRAY_MEDIUM} />
          <Text style={styles.noDataText}>No upcoming appointments found</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centerHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  statsCount: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderContent: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  daysRemaining: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginTop: 2,
  },
  nextDoseDate: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
  },
  cardDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  dataLabel: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  dataValue: {
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  callButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
});

export default Appointments;
