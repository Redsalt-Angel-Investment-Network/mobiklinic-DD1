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
import CopyRight from '../simprints/copyright';

const Profile = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {userNames} = useContext(DataResultsContext);
  const [patientsEnrolledCount, setPatientsEnrolledCount] = useState(0);
  const [dailyEnrollmentsCount, setDailyEnrollmentsCount] = useState(0);
  const [monthlyEnrollmentsCount, setMonthlyEnrollmentsCount] = useState(0);
  const [weeklyEnrollmentsCount, setWeeklyEnrollmentsCount] = useState(0);
  const {patientId} = useContext(DataResultsContext);

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

  // Function to get the week number of a date for the last seven days
  const getWeekNumber = () => {
    const currentDate = new Date();
    const target = new Date(currentDate.valueOf());
    target.setDate(target.getDate() - 7); // Subtract seven days from the current date
    const dayNr = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://mobi-be-production.up.railway.app/${userLog}/patients`,
      );

      if (response.status === 200) {
        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setPatientsEnrolledCount(sortedData.length);

        // Calculate the daily enrollments count
        const currentDate = new Date();
        const startDate = new Date('2023-07-19'); // Start counting from 19/07/2023
        const dailyEnrollments = sortedData.filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate >= startDate &&
            itemDate <= currentDate &&
            itemDate.getDate() === currentDate.getDate() &&
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          );
        });
        setDailyEnrollmentsCount(dailyEnrollments.length);

        // Calculate the monthly enrollments count
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthlyEnrollments = sortedData.filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate >= startDate &&
            itemDate <= currentDate &&
            itemDate.getMonth() === currentMonth &&
            itemDate.getFullYear() === currentYear
          );
        });
        setMonthlyEnrollmentsCount(monthlyEnrollments.length);

        // Calculate the weekly enrollments count
        const currentWeek = getWeekNumber();
        const weeklyEnrollments = sortedData.filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate >= startDate &&
            itemDate <= currentDate &&
            getWeekNumber(itemDate) === currentWeek
          );
        });
        setWeeklyEnrollmentsCount(weeklyEnrollments.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.wrapper}>
      {_header()}
      <View style={styles.container}>
        <Text style={styles.header}>
          Profile Name:{'\t'}
          {userNames}
        </Text>
        <View style={styles.column}>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{patientsEnrolledCount}</Text>
              <Text style={styles.cardTitle}>Total Patients </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardIcon}>{dailyEnrollmentsCount}</Text>
              <Text style={styles.cardTitle}>Daily Enrollments </Text>
            </View>
          </View>
        </View>

        <View style={styles.column}>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardIcon}>{weeklyEnrollmentsCount}</Text>
              <Text style={styles.cardTitle}>Weekly Enrollments </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardIcon}>{monthlyEnrollmentsCount}</Text>
              <Text style={styles.cardTitle}>Month Enrollments </Text>
            </View>
          </View>
        </View>
      </View>
      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // height: 400,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
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
  // column: {marginVertical: 8},
  cardTitle: {
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.BLACK,
    fontSize: 16,
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
  },
});

export default Profile;
