import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomHeader from '../ui/custom-header';
import {COLORS} from '../constants/styles';
import {Picker} from '@react-native-picker/picker';

const InsepectionRFT = ({navigation, route}) => {
  const {patientId, age, sex} = route.params;

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
    systolicValidationMessage: '',
    diastolicValidationMessage: '',
    pluseValidationMessage: '',
    weightValidationMessage: '',
  });

  useEffect(() => {
    Alert.alert(
      'Instructions',
      'Has the doctor recommended the Renal Functional Test?\n\nClick "YES" it was. ',
      [
        {
          text: 'YES',
          onPress: () => console.log('YES Pressed'),
        },
        {
          text: 'No',
          onPress: () => navigation.navigate('Dashboard'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }, []);

  const calculateBMI = (weight, height) => {
    const weightInKg = parseFloat(weight);
    const heightInM = parseFloat(height) / 100; // Convert height to meters
    if (isNaN(weightInKg) || isNaN(heightInM) || heightInM === 0) {
      return '';
    }
    const bmi = weightInKg / (heightInM * heightInM);
    return bmi.toFixed(2);
  };

  // Function to check systolic blood pressure range
  const checkSystolicBP = systolicPressure => {
    const systolic = parseFloat(systolicPressure);
    if (isNaN(systolic)) {
      setState({
        ...state,
        systolicValidationMessage: 'Please enter a valid number.', // Handle invalid input
      });
      return;
    }

    if (systolic < 100 || systolic > 139) {
      setState({
        ...state,
        systolicValidationMessage:
          'Systolic blood pressure is outside the normal range. Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        systolicValidationMessage: '',
      });
    }
  };

  const checkDiastolicBP = diastolicPressure => {
    const diastolic = parseFloat(diastolicPressure);
    if (isNaN(diastolic)) {
      setState({
        ...state,
        diastolicValidationMessage: 'Please enter a valid number.',
      });
      return;
    }

    if (diastolic < 60 || diastolic > 89) {
      setState({
        ...state,
        diastolicValidationMessage:
          'Diastolic blood pressure is outside the normal range. Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        diastolicValidationMessage: '',
      });
    }
  };

  const checkWeight = weight => {
    const weightInKg = parseFloat(weight);
    if (weightInKg === '') {
      setState({
        ...state,
        weightValidationMessage: 'Please enter a valid number.',
      });
      return;
    }
  };

  const checkPluseBP = heartPulse => {
    const pluse = parseFloat(heartPulse);
    if (isNaN(pluse)) {
      setState({
        ...state,
        pluseValidationMessage: 'Please enter a valid number.',
      });
      return;
    }

    if (pluse < 60 || pluse > 100) {
      setState({
        ...state,
        pluseValidationMessage:
          'Heart pulse is outside the normal range. Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        pluseValidationMessage: '',
      });
    }
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
        <Text style={STYLES.title}>RFT Inspection</Text>

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
          <Text style={STYLES.label}>Weight <Text style={STYLES.pointer}>*</Text>:</Text>
          <TextInput
            style={STYLES.field}
            value={state.weight}
            onChangeText={text => {
              checkWeight(text);
              const bmi = calculateBMI(text, state.height);
              setState({...state, weight: text, bmi});
            }}
            placeholder="Enter Weight in kgs"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            onBlur={() => checkWeight(state.weight)}
          />
        </View>
        {state.weightValidationMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.weightValidationMessage}
          </Text>
        )}

        {/* Height */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Height <Text style={STYLES.pointer}>*</Text>:</Text>
          <TextInput
            style={STYLES.field}
            value={state.height}
            onChangeText={text => {
              const bmi = calculateBMI(state.weight, text);
              setState({...state, height: text, bmi});
            }}
            placeholder="Enter Height in cm"
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
              onChangeText={text => {
                checkSystolicBP(text);
                setState({
                  ...state,
                  bloodPressure: {
                    ...state.bloodPressure,
                    systolicPressure: text,
                  },
                });
              }}
              placeholder="Systolic"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
              onBlur={() =>
                checkSystolicBP(state.bloodPressure.systolicPressure)
              }
            />
          </View>
          {/* Display validation message in red below the text input */}
          {state.systolicValidationMessage !== '' && (
            <Text style={STYLES.errorMessage}>
              {state.systolicValidationMessage}
            </Text>
          )}

          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Diastolic Blood Pressure:</Text>
            <TextInput
              style={STYLES.field}
              value={state.bloodPressure.diastolicPressure}
              onChangeText={text => {
                checkDiastolicBP(text);
                setState({
                  ...state,
                  bloodPressure: {
                    ...state.bloodPressure,
                    diastolicPressure: text,
                  },
                });
              }}
              placeholder="Diastolic"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
              onBlur={() =>
                checkDiastolicBP(state.bloodPressure.diastolicPressure)
              }
            />
          </View>
          {/* Display validation message in red below the text input */}
          {state.diastolicValidationMessage !== '' && (
            <Text style={STYLES.errorMessage}>
              {state.diastolicValidationMessage}
            </Text>
          )}

          {/* blood pressure */}
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Heart Pluse:</Text>

            <TextInput
              style={STYLES.field}
              value={state.bloodPressure.heartPulse}
              onChangeText={text => {
                checkPluseBP(text);
                setState({
                  ...state,
                  bloodPressure: {
                    ...state.bloodPressure,
                    heartPulse: text,
                  },
                });
              }}
              placeholder="Heart Pulse"
              placeholderTextColor={COLORS.GREY}
              keyboardType="numeric"
              onBlur={() => checkPluseBP(state.bloodPressure.heartPulse)}
            />
          </View>
        </View>
        {/* Display validation message in red below the text input */}
        {state.pluseValidationMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.pluseValidationMessage}
          </Text>
        )}
        <TouchableOpacity
          style={STYLES.submit}
          onPress={() =>
            navigation.navigate('RenalFunctionTest', {
              inspectionData: state,
              patientId: patientId,
              age: age,
              sex: sex,
            })
          }>
          <Text style={STYLES.submitText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default InsepectionRFT;

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
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
  },
  submitText: {
    color: COLORS.BLACK,
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
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
  pointer: {
    color: 'red',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
