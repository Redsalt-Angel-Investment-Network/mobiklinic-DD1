import * as React from 'react';
import {
  View,
  Alert,
  Switch,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Button,
  Image,
} from 'react-native';

import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
// import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS, DIMENS} from '../constants/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  _removeStorageItem,
  generateRandomCode,
  MyDate,
} from '../helpers/functions';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FoIcon from 'react-native-vector-icons/Fontisto';
import FAIcon from 'react-native-vector-icons/FontAwesome';

import {DiagnosisContext} from '../providers/Diagnosis';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';
import CopyRight from './copyright';

const SelectAction = ({navigation, route}) => {
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
      title={<Text style={[STYLES.centerHeader]}>Enrol Patient</Text>}
    />
  );
  return (
    <View style={STYLES.wrapper}>
      {_header()}

      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      <View style={STYLES.wrap}>
        <Image
          style={{width: 70, height: 70}}
          source={require('../imgs/logo.png')}
        />
        <Text style={STYLES.title}>Mobiklinic</Text>

        <View style={STYLES.btnContainer}>
          <View style={[STYLES.column, STYLES.rightPad]}>
            <TouchableOpacity
              style={STYLES.card}
              onPress={() => navigation.navigate('PatientLists')}>
              <Text style={STYLES.cardTitle}>Search Patient</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={STYLES.card}
              onPress={() => navigation.navigate('PatientData')}>
              <Text style={STYLES.cardTitle}>Enrol New Patient</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CopyRight />
      </View>
    </View>
  );
};

export default SelectAction;

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE_LOW,
    // paddingTop: 50,
  },
  header: {
    flex: 1,
  },
  body: {
    flex: 2,
    paddingHorizontal: 20,
  },

  alert: {
    color: COLORS.GREY,
    textAlign: 'center',
    marginTop: 15,
  },

  title: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    alignItems: 'center',
    flexGrow: 1,
  },
  leftHeader: {
    marginLeft: 10,
    flex: 1,
  },
  centerHeader: {
    flex: 2,
    alignItems: 'center',
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: 16,
  },
  rightHeader: {
    paddingRight: 10,
  },
  tip: {
    color: 'rgba(0,0,0,0.4)',
    paddingTop: 15,
    paddingBottom: 15,
  },

  field: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  submit: {
    flexDirection: 'row',
    padding: DIMENS.PADDING,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 50,
  },
  submitText: {
    color: COLORS.BLACK,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  wrap: {
    flex: 2,
    alignItems: 'center',
    padding: 20,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    padding: 15,
    marginVertical: 100,
  },
  column: {
    flex: 1,
  },
  rightPad: {
    paddingRight: 10,
  },
  row: {
    flex: 1,
  },

  btn: {
    backgroundColor: COLORS.BLACK,
    padding: DIMENS.PADDING,
    // padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: COLORS.BLACK,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    color: COLORS.ACCENT_1,
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: DIMENS.PADDING,
  },
  text: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',

    // flexGrow: 1,
    fontSize: 18,
  },
  card: {
    backgroundColor: COLORS.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },

  cardTitle: {
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    padding: 8,
  },
});
