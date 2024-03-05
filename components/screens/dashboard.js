import React, {useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
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
  const {setTokens, setUser} = React.useContext(AuthContext);
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

      <View style={STYLES.container}>
        <View style={STYLES.column}>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('SelectAction')}>
            <View style={STYLES.cardIcon}>
              <Icon name="activity" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Enrol Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Doctors')}>
            <View style={STYLES.cardIcon}>
              <FoIcon name="phone" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Call Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Ambulances')}>
            <View style={STYLES.cardIcon}>
            <MIcon name="ambulance" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Find Ambulance </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Appointments')}>
            <View style={STYLES.cardIcon}>
              <MIcon name="calendar" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Appointments</Text>
          </TouchableOpacity>
        </View>

        <View style={STYLES.column}>
          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('PatientLists')}>
            <View style={STYLES.cardIcon}>
            <Icon name="users" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Search Patient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Chat')}>
            <View style={STYLES.cardIcon}>
              <FoIcon name="doctor" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Doctor Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => navigation.navigate('Chats')}>
            <View style={STYLES.cardIcon}>
              <Icon name="message-circle" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={STYLES.cardTitle}>Ask Moby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={STYLES.card}
            onPress={() => {
              setTokens(null);
              signOut(setUser);
            }}>
            <View style={STYLES.cardIcon}>
              <MIcon
                name="logout"
                size={40}
                strokeSize={3}
                color={COLORS.PRIMARY}
              />
            </View>
            <Text style={STYLES.cardTitle}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CopyRight />
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
    marginHorizontal:50
  },
  heroTextContainer: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop: 10,
    minHeight: 120, 
    paddingVertical: 20, 
    paddingHorizontal: 15,
  },
  cardIcon: {
    aspectRatio: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, 

  },
  cardTitle: {
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.BLACK,
    fontSize: 12,
  },
});

export default Dashboard;
