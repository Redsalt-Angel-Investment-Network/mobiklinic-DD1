import * as React from 'react';
import {
  Alert,
  View,
  Linking,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ListItem} from 'react-native-elements';
import {CustomStatusBar} from '../ui/custom.status.bar';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../constants/styles';
import Login from './login';
import {AuthContext} from '../contexts/auth';
import {DoctorsContext} from '../providers/Doctors';
import {UserContext} from '../providers/User';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';

export const dummyData = [
  {
    _id: '1',
    name: 'Dr. Miiro Chraish',
    specialisation: 'Pharmacist',
    hospital: 'Mobiklinic',
    status: 1,
    phone: '256708422142',
  },
  {
    _id: '2',
    name: 'Dr Faraday Kidandi ',
    specialisation: 'General practitioner',
    hospital: 'Nsambya Hospital ',
    status: 1,
    phone: '256789561800',
  },
  {
    _id: '3',
    name: 'Fred Okori ',
    specialisation: 'Clinician',
    hospital: 'Mobiklinic ',
    status: 1,
    phone: '256784704143',
  },

  {
    _id: '4',
    name: 'Ibrahim Mutyaba ',
    specialisation: 'Clinician',
    hospital: 'Mobiklinic',
    status: 1,
    phone: '256701630936',
  },

  {
    _id: '6',
    name: ' Rogers Ndayisaba',
    specialisation: 'Clinician ',
    hospital: 'Makonge health center ',
    status: 1,
    phone: '256774226171',
  },
  {
    _id: '7',
    name: 'Alimah Komuhangi ',
    specialisation: 'Clinician ',

    status: 1,
    phone: '256782245238',
  },
  {
    _id: '8',
    name: 'Daphne  Pearl',
    specialisation: 'Developer ',
    status: 1,
    phone: '256754769769',
  },
];
const Doctors = ({navigation}) => {
  const [state, setState] = React.useState({
    isLoading: true,
    doctors: [],
    login: false,
  });

  const {signOut} = React.useContext(AuthContext);

  const doctorsContext = React.useContext(DoctorsContext);

  const userContext = React.useContext(UserContext);

  React.useEffect(() => {
    _getDoctors();

    return () => {};
  }, []);
  // const _getDoctors = async () => {
  //   let doctorsOnDevice = await AsyncStorage.getItem('@doctors');
  //   doctorsOnDevice = JSON.parse(doctorsOnDevice);
  //   setState({doctors: doctorsOnDevice});
  // };

  const _getDoctors = async () => {
    if (dummyData && dummyData.length > 0) {
      setState({doctors: dummyData, isLoading: false});
    } else {
      setState({doctors: [], isLoading: false});
    }

    // Rest of your code for fetching doctors

    // ...
  };

  const _getUser = async () => {
    try {
      return await AsyncStorage.getItem('@user');
    } catch (e) {
      console.log(e);
    }
  };

  const handlePhoneNumberPress = phoneNumber => {
    navigation.navigate('Chat', {phoneNumber});
  };

  const _keyExtractor = item => item._id;

  const _renderItem = ({item}) => {
    return (
      <View style={STYLES.wrapper}>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title style={STYLES.listTitle}>
              {item.name}
            </ListItem.Title>
            <ListItem.Subtitle style={STYLES.subtitle}>
              <View style={STYLES.wrapper}>
                <View style={STYLES.subtitle}>
                  <Text style={STYLES.label}>Specilisation:</Text>
                  <Text style={STYLES.label}>{item.specialisation}</Text>
                </View>
                <View style={STYLES.subtitle}>
                  <Text style={STYLES.label}>Hospital:</Text>
                  <Text style={STYLES.label}>{item.hospital}</Text>
                </View>
                <View style={STYLES.subtitle}>
                  <Text style={STYLES.label}>Phone Number:</Text>
                  <Text style={STYLES.label}>{item.phone}</Text>
                </View>
                {/* <View style={STYLES.subtitle}>
                  <Text style={STYLES.label}>District</Text>
                  <Text style={STYLES.label}>{item.district}</Text>
                </View> */}
                {/* <View style={STYLES.subtitle}>
                  <Text style={STYLES.label}>Languages</Text>
                  <Text style={STYLES.label}>{item.languages}</Text>
                </View> */}
              </View>
            </ListItem.Subtitle>
          </ListItem.Content>
          <TouchableOpacity>
            <Icon
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
              name="phone"
              size={25}
              color="rgba(0,0,0,.3)"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePhoneNumberPress(item.phone)}>
            <Icon name="message-circle" size={25} color={'green'} />
          </TouchableOpacity>
        </ListItem>
      </View>
    );
  };

  let {doctors, isLoading, login} = state;

  if (login) return <Login />;

  if (isLoading) return <Loader />;

  if (doctors?.length == 0)
    return (
      <View style={STYLES.container}>
        <CustomHeader navigation={navigation} title={'Doctors'} />
        <View>
          <CustomStatusBar />
          <Text style={STYLES.textColor}>No Doctors available</Text>
        </View>
      </View>
    );

  return (
    <View style={STYLES.wrapper}>
      <CustomStatusBar />
      <FlatList
        data={doctors}
        renderItem={_renderItem}
        keyExtractor={_keyExtractor}
      />
    </View>
  );
};

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    flex: 1,
  },
  body: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },

  alert: {
    color: COLORS.GREY,
    textAlign: 'center',
    marginTop: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color:COLORS.BLACK

  },
  subtitle: {
    flexDirection: 'row',
    fontSize: 10,
    opacity: 0.5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    color:COLORS.BLACK
  },
  leftHeader: {
    flex: 1,
    paddingLeft: 10,
  },
  centerHeader: {
    flex: 2,
    flexDirection: 'row',
  },
  rightHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    
  },
  textColor: {
    color: COLORS.BLACK,
  },
});

export default Doctors;
