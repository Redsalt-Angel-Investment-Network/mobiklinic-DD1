import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomHeader from '../ui/custom-header';
import {COLORS} from '../constants/styles';
import {Picker} from '@react-native-picker/picker';

const Inspection = ({navigation}) => {
  const [state, setState] = useState({
    signsAndSymptoms: '',
    weight: '',
    height: '',
    bmi: '',
    bloodPressure: {
      systolicPressure: '',
      diastolicPressure: '',
      heartPulse: '',
    },
    bloodSugar: {
      fastBloodSugar: '',
      randomBloodSugar: '',
    },
  });

  const calculateBMI = (weight, height) => {
    const weightInKg = parseFloat(weight);
    const heightInM = parseFloat(height) / 100; // Convert height to meters
    if (isNaN(weightInKg) || isNaN(heightInM) || heightInM === 0) {
      return '';
    }
    const bmi = weightInKg / (heightInM * heightInM);
    return bmi.toFixed(2);
  };

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={{
            marginHorizontal: 4,
            width: 25,
            height: 25,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={[STYLES.centerHeader, STYLES.subtitle]}>BACK </Text>}
    />
  );

  return (
    <View style={STYLES.wrapper}>
      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      {_header()}

      <ScrollView style={STYLES.body}>
        <Text style={STYLES.title}>Beneficiary Inspection</Text>

        {/* Signs and Symptoms */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Signs and Symptoms:</Text>
          <TextInput
            style={STYLES.field}
            value={state.signsAndSymptoms}
            onChangeText={text => setState({...state, signsAndSymptoms: text})}
            placeholder="Enter Signs and Symptoms"
            placeholderTextColor={COLORS.GREY}
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Weight */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Weight:</Text>
          <TextInput
            style={STYLES.field}
            value={state.weight}
            onChangeText={text => {
              const bmi = calculateBMI(text, state.height);
              setState({...state, weight: text, bmi});
            }}
            placeholder="Enter Weight"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
          />
        </View>

        {/* Height */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Height:</Text>
          <TextInput
            style={STYLES.field}
            value={state.height}
            onChangeText={text => {
              const bmi = calculateBMI(state.weight, text);
              setState({...state, height: text, bmi});
            }}
            placeholder="Enter Height"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
          />
        </View>

        {/* Display BMI */}
        {state.bmi !== '' && (
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>BMI:</Text>
            <Text style={STYLES.field}>{state.bmi}</Text>
          </View>
        )}

        {/* Blood Pressure */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Systolic Blood Pressure:</Text>
            <TextInput
              style={STYLES.field}
              value={state.bloodPressure.systolicPressure}
              onChangeText={text =>
                setState({
                  ...state,
                  bloodPressure: {
                    ...state.bloodPressure,
                    systolicPressure: text,
                  },
                })
              }
              placeholder="Systolic"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
            />
          </View>

          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Diastolic Blood Pressure:</Text>

            <TextInput
              style={STYLES.field}
              value={state.bloodPressure.diastolicPressure}
              onChangeText={text =>
                setState({
                  ...state,
                  bloodPressure: {
                    ...state.bloodPressure,
                    diastolicPressure: text,
                  },
                })
              }
              placeholder="Diastolic"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
            />
          </View>

          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Heart Pluse:</Text>

            <TextInput
              style={STYLES.field}
              value={state.bloodPressure.heartPulse}
              onChangeText={text =>
                setState({
                  ...state,
                  bloodPressure: {...state.bloodPressure, heartPulse: text},
                })
              }
              placeholder="Heart Pulse"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Blood Sugar */}
        <View>
          <Text style={STYLES.label}>Blood Sugar:</Text>
          <View style={STYLES.wrap}>
            <TextInput
              style={STYLES.smallInput}
              value={state.bloodSugar.fastBloodSugar}
              onChangeText={text =>
                setState({
                  ...state,
                  bloodSugar: {...state.bloodSugar, fastBloodSugar: text},
                })
              }
              placeholder="Fast Blood Sugar"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
            />
            <TextInput
              style={STYLES.smallInput}
              value={state.bloodSugar.randomBloodSugar}
              onChangeText={text =>
                setState({
                  ...state,
                  bloodSugar: {...state.bloodSugar, randomBloodSugar: text},
                })
              }
              placeholder="Random Blood Sugar"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={STYLES.submit}
          onPress={() => navigation.navigate('Urinalysis')}>
          <Text style={STYLES.submitText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Inspection;

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE_LOW,
  },
  header: {
    flex: 1,
  },
  body: {
    flex: 2,
    paddingHorizontal: 20,
    // paddingVertical: 30,
    marginBottom: 30,
  },
  alert: {
    color: COLORS.GREY,
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    flexDirection: 'row',
    fontSize: 14,
    color: COLORS.BLACK,
    marginVertical: 12,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 5,
    color: COLORS.BLACK,
    fontSize: 14,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    textAlign: 'center',
    flexGrow: 1,
    fontSize: 18,
    paddingVertical: 10,
    textDecorationLine: 'underline',
  },
  leftHeader: {
    marginLeft: 10,
    flex: 1,
  },
  centerHeader: {
    flex: 2,
    // alignItems: 'center',
    color: COLORS.SECONDARY,
  },
  rightHeader: {
    paddingRight: 10,
  },
  tip: {
    color: 'rgba(0,0,0,0.4)',
    paddingTop: 15,
    paddingBottom: 15,
  },
  input: {
    color: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
  },
  textarea: {
    color: 'rgba(0,0,0,0.7)',
    minHeight: 70,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 20,
  },
  terms: {
    paddingVertical: 10,
    textAlign: 'center',
    color: 'grey',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  pickers: {
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    // backgroundColor: COLORS.GREY,
  },
  pickerItemStyle: {
    color: 'rgba(0,0,0,0.7)',
  },
  labeled: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
    borderRadius: 10,
    borderColor: COLORS.GREY,
    borderWidth: 1,
  },
  field: {
    flex: 1,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
  },
  guid: {
    textAlign: 'left',
    color: COLORS.BLACK,
    fontSize: 11,
    fontWeight: 'bold',
    display: 'none',
  },
  submit: {
    alignItems: 'center',
    backgroundColor: COLORS.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  wrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 70,
    borderRadius: 20,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
  },
  pickerWrap: {
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
  },
  smallInput: {
    width: 180,
    height: 40,
    textAlign: 'left',
    color: COLORS.BLACK,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
  },
  wrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 70,
  },
  detail: {
    flex: 1,
    paddingHorizontal: 15,
    // paddingVertical: 10,
    color: COLORS.BLACK,
    marginTop: 10,
    marginBottom: 10,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginHorizontal: 5,
  },
  pickerStyle: {
    flex: 1,
    paddingHorizontal: 15,
    // paddingVertical: 10,
    color: COLORS.BLACK,
    marginTop: 10,
    marginBottom: 10,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginHorizontal: 5,
  },
  datePickerText: {
    paddingVertical: 10,
    paddingLeft: 12,
    fontSize: 15,
    color: COLORS.BLACK,
  },
});
