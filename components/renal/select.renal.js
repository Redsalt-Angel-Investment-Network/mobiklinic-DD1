import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FoIcon from 'react-native-vector-icons/Fontisto';
import {COLORS, DIMENS} from '../constants/styles';
import Icon from 'react-native-vector-icons/Feather';
import CopyRight from '../copyright';

const SelectRenalActivity = ({navigation, route}) => {
  const {patientId} = route.params;
  console.log('====================================');
  console.log('patientId', patientId);
  console.log('====================================');
  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />

      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../imgs/logo.png')} />
        <Text style={styles.title}>Mobiklinic</Text>
      </View>

      <View style={styles.btnContainer}>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('History', {
                patientId: patientId,
              })
            }>
            <View style={styles.cardIcon}>
              <FoIcon name="doctor" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Screening</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('InspectionMonitoring', {
                patientId: patientId,
              })
            }>
            <View style={styles.cardIcon}>
              <FontAwesomeIcon name="medkit" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Monitoring</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.btnContainer}>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('History', {
                patientId: patientId,
              })
            }>
            <View style={styles.cardIcon}>
              <FoIcon name="doctor" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Renal Function Test</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Dashboard', {
                patientId: patientId,
              })
            }>
            <View style={styles.cardIcon}>
              <FontAwesomeIcon name="home" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* <View>
        <TouchableOpacity
          style={styles.buttonSec}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.buttonText}>
            <Icon name="arrow-left" size={18} color={COLORS.PRIMARY} />
            Home Page
          </Text>
        </TouchableOpacity>
      </View> */}
      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE_LOW,
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 10,
    fontSize: 18,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // height: 300,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    // flex: 1,
    borderRadius: 10,
    height: 120,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginTop: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: 10,
    textAlign: 'center',
    color: COLORS.BLACK,
    fontSize: 16,
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
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  column: {
    flex: 1,
    padding: 15,
    fontSize: 12,
    width: 30,
    // marginVertical: 20,
  },
});

export default SelectRenalActivity;
