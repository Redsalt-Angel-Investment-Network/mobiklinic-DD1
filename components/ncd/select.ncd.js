import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {COLORS, DIMENS} from '../constants/styles';
import Icon from 'react-native-vector-icons/Feather';
import CopyRight from '../copyright';

const SelectNCDActivity = ({navigation, route}) => {
  const {patientId, firstName, lastName} = route.params;
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
              navigation.navigate('HypertensionScreening', {
                patientId: patientId,
                firstName: firstName,
                lastName: lastName,
              })
            }>
            <View style={styles.cardIcon}>
              <MIcon name="heart-pulse" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Hypertension Screening</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('DiabetesScreening', {
                patientId: patientId,
                firstName: firstName,
                lastName: lastName,
              })
            }>
            <View style={styles.cardIcon}>
              <MIcon name="water" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Diabetes Screening</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.btnContainer}>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('MonitoringVisits', {
                patientId: patientId,
                firstName: firstName,
                lastName: lastName,
              })
            }>
            <View style={styles.cardIcon}>
              <MIcon name="clipboard-pulse" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Monitoring Visits</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.column}>
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('MedicalAssessment', {
                patientId: patientId,
                firstName: firstName,
                lastName: lastName,
              })
            }>
            <View style={styles.cardIcon}>
              <FontAwesomeIcon name="stethoscope" size={40} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.cardTitle}>Medical Assessment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.buttonText}>
            Home Page
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  card: {
    backgroundColor: COLORS.WHITE,
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
  buttonText: {
    color: COLORS.PRIMARY,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 13,
  },
  column: {
    flex: 1,
    padding: 15,
    fontSize: 12,
    width: 30,
  },
});

export default SelectNCDActivity;
