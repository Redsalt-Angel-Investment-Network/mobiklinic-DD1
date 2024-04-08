import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, DIMENS} from '../constants/styles';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import CustomHeader from '../ui/custom-header';
import DataResultsContext from '../contexts/DataResultsContext';
import {AuthContext} from '../contexts/auth';
import CopyRight from '../copyright';
import {API_URL} from '@env';

const Profile = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {userNames} = useContext(DataResultsContext);
  const [patientsEnrolledCount, setPatientsEnrolledCount] = useState(0);
  const [patientsEnrolledCountt, setPatientsEnrolledCountt] = useState(0);
  const [dailyEnrollmentsCount, setDailyEnrollmentsCount] = useState(0);
  const [monthlyEnrollmentsCount, setMonthlyEnrollmentsCount] = useState(0);
  const [weeklyEnrollmentsCount, setWeeklyEnrollmentsCount] = useState(0);
  const {patientId} = useContext(DataResultsContext);
  const [vaccinationCount, setVaccinationCount] = useState(null);
  const [diagnosisCount, setDiagnosisCount] = useState(0);
  const [antenatalCount, setAntenatalCount] = useState(0);
  const [screeningCount, setScreeningCount] = useState(0);
  const [monitoringCount, setMonitoringCount] = useState(0);
  const [rftCount, setRftCount] = useState(0);

  const {user} = React.useContext(AuthContext);
  React.useEffect(() => {
    console.log(user);
  });
  // user context
  const {userLog} = useContext(DataResultsContext);

  // header
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
      title={<Text style={[styles.centerHeader, styles.title]}>Profile</Text>}
    />
  );

  useEffect(() => {
    // Fetch data from the API endpoint
    fetch(`${API_URL}/api/all-patients/${userLog}`)
      .then(response => response.json())
      .then(data => {
        const patients = data.patients;

        setPatientsEnrolledCount(patients.length);
        let totalVaccinations = 0;
        let totalDiagnosis = 0;
        let totalAntenatal = 0;
        let totalScreening = 0;
        let totalMonitoring = 0;
        let totalRft = 0;

        patients.forEach(patient => {
          totalVaccinations += patient.vaccinations.length;
          totalDiagnosis += patient.diagnoses.length;
          totalAntenatal += patient.antenantals.length;
          totalScreening += patient.renal_histories.length;
          totalMonitoring += patient.monitorings.length;
          totalRft += patient.rfts.length;
        });

        setVaccinationCount(totalVaccinations);
        setDiagnosisCount(totalDiagnosis);
        setAntenatalCount(totalAntenatal);
        setScreeningCount(totalScreening);
        setMonitoringCount(totalMonitoring);
        setRftCount(totalRft);

        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <View style={styles.wrapper}>
      {_header()}
      {isLoading ? (
        <Loader />
      ) : (
        <View style={styles.content}>
          <Text style={styles.header}>General Report</Text>
          <View style={styles.row}>
            <View style={styles.full}>
              <Text style={styles.cardIcon}>{patientsEnrolledCount}</Text>
              <Text style={styles.cardTitle}>Total Beneficiaries</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{screeningCount}</Text>
              <Text style={styles.cardTitle}>Renal Health Screening</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{monitoringCount}</Text>
              <Text style={styles.cardTitle}>Renal Health Monitoring</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{rftCount}</Text>
              <Text style={styles.cardTitle}>Renal Functional Test</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{vaccinationCount}</Text>
              <Text style={styles.cardTitle}>Total Vaccinations</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{diagnosisCount}</Text>
              <Text style={styles.cardTitle}>Total Diagnosis</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{antenatalCount}</Text>
              <Text style={styles.cardTitle}>Total Antenatal</Text>
            </View>
          </View>
        </View>
      )}

      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.LIGHT,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  card: {
    width: 180,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    paddingVertical: 30,
    marginVertical: 10,
    // shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  full: {
    width: 375,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    paddingVertical: 30,
    marginVertical: 10,
    // shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // column: {marginVertical: 8},
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
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
  cardIcon: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: 'black',
    fontWeight: 'bold',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    color: COLORS.PRIMARY,
  },
});

export default Profile;
