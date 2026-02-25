import React, {useContext} from 'react';

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FoIcon from 'react-native-vector-icons/Fontisto';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {COLORS, DIMENS} from '../constants/styles';
import Emoji from 'react-native-emoji';
import CustomHeader from '../parts/custom-header';
import {CustomStatusBar} from '../ui/custom.status.bar';
import {signOut} from '../helpers/functions';
import {AuthContext} from '../contexts/auth';
import DataResultsContext from '../contexts/DataResultsContext';
import CopyRight from '../copyright';
const Dashboard = ({navigation}) => {
  const {setTokens, setUser, setLoginTime} = React.useContext(AuthContext);
  const {userNames} = useContext(DataResultsContext);

  return (
    <View style={STYLES.wrapper}>
      <CustomStatusBar />
      <View style={STYLES.menuColumn}>
        <TouchableOpacity onPress={() => navigation.navigate('DrawerLogged')}>
          <Icon name="menu" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={STYLES.menuHeading}>Dashboard</Text>
      </View>
      <View style={STYLES.hero}>
        <View yle={STYLES.heroTextContainer}>
          <Text style={STYLES.heroHeading}>
            Hey{' '}
            <Text style={{color: COLORS.WHITE}}>
              {userNames} <Emoji name="wave" />
            </Text>
            ,
          </Text>
          <Text style={STYLES.heroParagraph}>Welcome back!</Text>
          <Text style={STYLES.heroParagraph}>
            Choose an option below to continue.
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{flex: 1}} 
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
      >
        <View style={STYLES.emergencyContainer}>
          <TouchableOpacity
            style={STYLES.emergencyCard}
            onPress={() => navigation.navigate('EmergencyReport')}>
            <View style={STYLES.emergencyIconBox}>
              <MIcon name="alert-decagram" size={40} color={COLORS.WHITE} />
            </View>
            <View style={STYLES.emergencyTextContainer}>
              <Text style={STYLES.emergencyTitle}>TOLL FREE LINE</Text>
              <Text style={STYLES.emergencySubtitle}>Tap to access number</Text>
            </View>
            <Icon name="chevron-right" size={25} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>

        <View style={STYLES.container}>
        <View style={STYLES.column}>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('SelectAction')}>
            <View style={STYLES.cardIcon}>
              <Icon name="activity" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Enrol Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Payment')}>
            <View style={STYLES.cardIcon}>
              <MIcon name="credit-card" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Chats')}>
            <View style={STYLES.cardIcon}>
              <Icon name="message-circle" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Ask Moby</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Ambulances')}>
            <View style={STYLES.cardIcon}>
              <MIcon name="ambulance" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Find Ambulances</Text>
          </TouchableOpacity>
        </View>

        <View style={STYLES.column}>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('PatientLists')}>
            <View style={STYLES.cardIcon}>
              <Icon name="users" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Search Patient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('DoctorListScreen')}>
            <View style={STYLES.cardIcon}>
              <FoIcon name="doctor" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Contact Our Doctors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Appointments')}>
            <View style={STYLES.cardIcon}>
              <MIcon name="calendar" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Hospital')}>
            <View style={STYLES.cardIcon}>
              <FAIcon name="building" size={35} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Find Facilities</Text>
          </TouchableOpacity>
        </View>
      </View>

        <View style={STYLES.logoutContainer}>
          <TouchableOpacity
            style={STYLES.logoutCard}
            onPress={() => {
              setTokens(null);
              setLoginTime(null);
              signOut(setUser);
            }}>
            <View style={STYLES.cardIcon}>
              <MIcon
                name="logout"
                size={35}
                strokeSize={3}
                color={COLORS.PRIMARY}
              />
            </View>
            <Text style={STYLES.cardTitle}>Logout</Text>
          </TouchableOpacity>
        </View>
        <CopyRight />
      </ScrollView>
    </View>
  );
};

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  hero: {
    padding: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  heroParagraph: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  menuColumn: {
    marginRight: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuHeading: {
    // marginTop: 5,
    fontSize: 18,
    color: COLORS.BLACK,
    marginHorizontal: 50,
  },
  heroTextContainer: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    minHeight: 400,
  },
  emergencyContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  emergencyCard: {
    backgroundColor: '#D32F2F',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  emergencyIconBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  emergencyTitle: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  emergencySubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  column: {
    flex: 1,
    padding: 10,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 25,
    alignItems: 'center',
  },
  logoutCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    minHeight: 80,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop: 8,
    minHeight: 90,
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  cardIcon: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    marginTop: 5,
    textAlign: 'center',
    color: COLORS.BLACK,
    fontSize: 11,
    lineHeight: 14,
  },
});

export default Dashboard;
