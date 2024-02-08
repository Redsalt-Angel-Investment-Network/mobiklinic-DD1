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

const PatientCard = ({patient}) => {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const toggleAccordion = () => {
    setExpanded(!expanded);
  };
  const handleRedirect = () => {
    console.log('Patient ID:', patient.id);
    navigation.navigate('SelectActivity', {
      patientId: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
    });
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
            {patient.vaccinations &&
              patient.vaccinations.data &&
              patient.vaccinations.data.map(vaccination => (
                <View key={vaccination.id} style={styles.vaccinationItem}>
                  <Text style={styles.accordionLabel}>
                    Date of Vaccination:{' '}
                    {vaccination.dateOfVaccination}
                  </Text>
                  <Text>
                    Date for Next Dose: {vaccination.dateForNextDose}
                  </Text>
                  <Text>
                    Vaccine Name: {vaccination.vaccineName}
                  </Text>
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

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={{
            marginHorizontal: 4,
            width: 35,
            height: 35,
            justifyContent: 'center',
            // alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={[styles.centerHeader]}>Back</Text>}
    />
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/users/${userLog}?populate=*`,
        );
        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPatients = userData
    ? userData.patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`;
        return fullName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  return (
    <View style={styles.container}>
      {_header()}
      <View style={styles.body}>
        <Text style={styles.header}>Beneficiary List</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by first or last name..."
          placeholderTextColor={COLORS.GREY}
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        {loading ? (
          <Loader size="large" />
        ) : (
          <FlatList
            data={filteredPatients}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => <PatientCard patient={item} />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
