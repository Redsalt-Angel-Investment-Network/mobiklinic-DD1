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
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // searching users by name
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isNoUserFound, setIsNoUserFound] = useState(false);
  const {patientId, setPatientId} = useContext(DataResultsContext);
  const [patientsEnrolledCount, setPatientsEnrolledCount] = useState(0);
  const {userNames} = useContext(DataResultsContext);

  const [dailyEnrollmentsCount, setDailyEnrollmentsCount] = useState(0);
  const [monthlyEnrollmentsCount, setMonthlyEnrollmentsCount] = useState(0);
  const [weeklyEnrollmentsCount, setWeeklyEnrollmentsCount] = useState(0);

  const {user} = React.useContext(AuthContext);
  React.useEffect(() => {
    console.log(user);
  });
  // user context
  const {userLog} = useContext(DataResultsContext);

  // formate date
  const formatDate = date => {
    if (date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day.toString().padStart(2, '0')}/${month
        .toString()
        .padStart(2, '0')}/${year}`;
    }
    return 'Click to add date';
  };
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
      title={<Text style={[styles.centerHeader]}>Back</Text>}
    />
  );

  // fetch users from api

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://mobi-be-production.up.railway.app/patients`,
      );

      if (response.status === 200) {
        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        const filteredData = sortedData.filter(item => {
          const fullName = `${item.firstName} ${item.lastName}`;
          const fullNameLower = fullName.toLowerCase();
          const searchQueryLower = searchQuery.toLowerCase();

          for (let i = 0; i < searchQueryLower.length; i++) {
            const letter = searchQueryLower[i];
            if (!fullNameLower.includes(letter)) {
              return false;
            }
          }

          return true;
        });

        setUsers(filteredData);
        await AsyncStorage.setItem('patientList', JSON.stringify(filteredData));
        setIsNoUserFound(filteredData.length === 0);
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
        const currentWeek = getWeekNumber(currentDate);
        const weeklyEnrollments = sortedData.filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate >= startDate &&
            itemDate <= currentDate &&
            getWeekNumber(itemDate) === currentWeek
          );
        });
        setWeeklyEnrollmentsCount(weeklyEnrollments.length);
      } else {
        const storedData = await AsyncStorage.getItem('patientList');

        if (storedData) {
          setUsers(JSON.parse(storedData));
          // Update the patientsEnrolledCount state with the length of the items
          setPatientsEnrolledCount(JSON.parse(storedData).length);

          // Calculate the daily enrollments count
          const currentDate = new Date();
          const dailyEnrollments = JSON.parse(storedData).filter(item => {
            const itemDate = new Date(item.createdAt);
            return (
              itemDate.getDate() === currentDate.getDate() &&
              itemDate.getMonth() === currentDate.getMonth() &&
              itemDate.getFullYear() === currentDate.getFullYear()
            );
          });
          setDailyEnrollmentsCount(dailyEnrollments.length);

          // Calculate the monthly enrollments count
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          const monthlyEnrollments = JSON.parse(storedData).filter(item => {
            const itemDate = new Date(item.createdAt);
            return (
              itemDate.getMonth() === currentMonth &&
              itemDate.getFullYear() === currentYear
            );
          });
          setMonthlyEnrollmentsCount(monthlyEnrollments.length);

          // Calculate the weekly enrollments count
          const currentWeek = getWeekNumber(currentDate);
          const weeklyEnrollments = JSON.parse(storedData).filter(item => {
            const itemDate = new Date(item.createdAt);
            return getWeekNumber(itemDate) === currentWeek;
          });
          setWeeklyEnrollmentsCount(weeklyEnrollments.length);
        }
      }
    } catch (error) {
      console.error(error);

      const storedData = await AsyncStorage.getItem('patientList');

      if (storedData) {
        setUsers(JSON.parse(storedData));
        // Update the patientsEnrolledCount state with the length of the items
        setPatientsEnrolledCount(JSON.parse(storedData).length);

        // Calculate the daily enrollments count
        const currentDate = new Date();
        const dailyEnrollments = JSON.parse(storedData).filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate.getDate() === currentDate.getDate() &&
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          );
        });
        setDailyEnrollmentsCount(dailyEnrollments.length);

        // Calculate the monthly enrollments count
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const monthlyEnrollments = JSON.parse(storedData).filter(item => {
          const itemDate = new Date(item.createdAt);
          return (
            itemDate.getMonth() === currentMonth &&
            itemDate.getFullYear() === currentYear
          );
        });
        setMonthlyEnrollmentsCount(monthlyEnrollments.length);

        // Calculate the weekly enrollments count
        const currentWeek = getWeekNumber(currentDate);
        const weeklyEnrollments = JSON.parse(storedData).filter(item => {
          const itemDate = new Date(item.createdAt);
          return getWeekNumber(itemDate) === currentWeek;
        });
        setWeeklyEnrollmentsCount(weeklyEnrollments.length);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
    };

    fetchData();
  }, [userLog]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
    };

    fetchData();
  }, [userLog]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };
  // handle search results
  const handleSearch = async query => {
    setSearchQuery(query);
    try {
      const response = await axios.get(
        `https://mobi-be-production.up.railway.app/search?query=${query}`,
      );
      setSearchSuggestions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const [expandedUserId, setExpandedUserId] = useState(null);

  const renderUserCard = ({item}) => {
    const isExpanded = item.id === expandedUserId;

    const toggleExpansion = () => {
      if (isExpanded) {
        setExpandedUserId(null);
      } else {
        setExpandedUserId(item.id);
      }
    };

    const fullName = `${item.firstName} ${item.lastName}`;
    const fullNameChars = fullName.split('');

    // ADD DATA
    const addData = () => {
      setPatientId(item.id); // Set the patientId using setPatientId
      console.log('Adding data for patient ID:', patientId.id);

      navigation.navigate('SelectActivity', {
        patientId: patientId,
        paramKey: {firstName: item.firstName, lastName: item.lastName},
      });
    };

    return <View style={styles.wrapper}>{_header()}</View>;
  };

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
    height: 400,
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
    // marginVertical: 50,
    // shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  column: {marginVertical: 8},
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
