import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomHeader from '../ui/custom-header';
import {COLORS} from '../constants/styles';
import {Picker} from '@react-native-picker/picker';
import {API_URL} from '@env';

const RenalFunctionTest = ({navigation, route}) => {
  const {inspectionData, patientId, age} = route.params;
  console.log('====================================');
  console.log('Inspection Data', inspectionData);
  console.log('====================================');

  const [state, setState] = useState({
    chemistry: {
      sodium: '',
      potassium: '',
      urea: '',
      creatinine: '',
      eGFR: '',
    },
    sodiumValidateMessage: '',
    potassiumValidateMessage: '',
    ureaValidateMessage: '',
    creatinineValidateMessage: '',
  });

  console.log('====================================');
  console.log(inspectionData.weight);
  console.log(age);

  console.log('====================================');
  const handleSubmit = async () => {
    try {
      setState({...state, isLoading: true});

      const response = await fetch(`${API_URL}/api/renals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            historyData: historyData,
            inspectionData: inspectionData,
            appearance: state.appearance,
            chemistry: state.chemistry,
            patient: patientId,
          },
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        Alert.alert('Success', 'Renal data posted successfully.');
        navigation.navigate('Dashboard');
        console.log('Vaccination data posted successfully.');
        console.log(data);
      } else {
        const error = await response.text();
        console.log(response.status);
        console.error('Error posting renal data:', error);
        Alert.alert('Error', 'Failed to renal vaccination data.');
      }
    } catch (error) {
      console.error('Error posting renal data:', error);
      Alert.alert('Error', 'Failed to post renal data.');
    } finally {
      setState({...state, isLoading: false});
    }
  };

  // validate values to make sure they are in range else flag them
  const checkSodium = sodium => {
    const sodiumValue = parseFloat(sodium);
    if (isNaN(sodiumValue)) {
      setState(prevState => ({
        ...prevState,
        sodiumValidateMessage: 'Please enter a valid number',
      }));
      return;
    }
    if (sodiumValue < 135 || sodiumValue > 145) {
      setState(prevState => ({
        ...prevState,
        sodiumValidateMessage:
          'Sodium values are abnormal. The Doctor will be notified',
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        sodiumValidateMessage: '',
      }));
    }
  };

  const checkPotassium = potassium => {
    const potassiumValue = parseInt(potassium);
    if (isNaN(potassiumValue)) {
      setState(prevState => ({
        ...prevState,
        potassiumValidateMessage: 'Please enter a valid number',
      }));
      return;
    }

    if (potassiumValue < 3.5 || potassiumValue > 5.1) {
      setState(prevState => ({
        ...prevState,
        potassiumValidateMessage:
          'Potassium values are abnormal. The Doctor will be notified. Levels are in range 3.5 to 5.1',
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        potassiumValidateMessage: '',
      }));
    }
  };

  const checkUrea = urea => {
    const ureaValue = parseInt(urea);
    if (isNaN(ureaValue)) {
      setState(prevState => ({
        ...prevState,
        ureaValidateMessage: 'Enter Urea Value',
      }));
    }

    if (ureaValue < 2.1 || ureaValue > 7.1) {
      setState(prevState => ({
        ...prevState,
        ureaValidateMessage:
          'Urea values are abnormal. The Doctor will be notified. Levels are in range 2.1 to 7.1',
      }));
    } else {
      setState(prevState => ({
        ...prevState,
        ureaValidateMessage: '',
      }));
    }
  };

  const calculateGFR = creatinine => {
    const ageNumber = parseFloat(age); // Parse age as a float

    // Check if ageNumber is a valid number
    if (isNaN(ageNumber)) {
      console.error('Invalid age:', age);
      setState(prevState => ({
        ...prevState,
        chemistry: {...prevState.chemistry, eGFR: 'Invalid Age'},
      }));
      return;
    }

    const creatinineValue = parseFloat(creatinine);
    if (isNaN(creatinineValue)) {
      console.error('Invalid creatinine value:', creatinine);
      setState(prevState => ({
        ...prevState,
        chemistry: {...prevState.chemistry, eGFR: 'Invalid Creatinine'},
      }));
      return;
    }

    // Calculate e-GFR using MDRD equation
    const eGFR =
      186 *
      Math.pow(creatinineValue / 88.4, -1.154) *
      Math.pow(ageNumber, -0.203);
    return eGFR.toFixed(2); // Return the calculated eGFR value
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
        <Text style={STYLES.title}> Renal Functional Test</Text>

        {/* sodium Level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Enter Sodium Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.sodium}
            onChangeText={text => {
              checkSodium(text);
              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  sodium: text,
                },
              });
            }}
            placeholder="Enter sodium level"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            onBlur={() => checkSodium(state.chemistry.sodium)}
          />
        </View>
        {state.sodiumValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.sodiumValidateMessage}</Text>
        )}

        {/* potassium level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Enter Potassium Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.potassium}
            onChangeText={text => {
              checkPotassium(text);
              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  potassium: text,
                },
              });
            }}
            placeholder="Enter potassium level"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            onBlur={() => checkPotassium(state.chemistry.potassium)}
          />
        </View>
        {state.potassiumValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.potassiumValidateMessage}
          </Text>
        )}

        {/* urea */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Enter Urea Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.urea}
            onChangeText={text => {
              checkUrea(text);
              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  urea: text,
                },
              });
            }}
            placeholder="Enter urea level"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            onBlur={() => checkUrea(state.chemistry.urea)}
          />
        </View>
        {state.ureaValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.ureaValidateMessage}</Text>
        )}

        {/* Creatinine Level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Enter Creatinine Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.creatinine}
            onChangeText={text => {
              const eGFR = calculateGFR(text); // Calculate eGFR
              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  creatinine: text,
                  eGFR: eGFR, // Update eGFR in the state
                },
              });
            }}
            placeholder="Enter creatinine level"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
          />
        </View>

        {/* Display e-GFR */}
        {state.chemistry.creatinine && ( // Only render if creatinine level is inputted
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Estimated GFR (e-GFR):</Text>
            <TextInput
              style={STYLES.field}
              value={state.chemistry.eGFR}
              placeholderTextColor={COLORS.GREY}
              placeholder="Enter creatinine level"
            />
          </View>
        )}

        <TouchableOpacity style={STYLES.submit} onPress={handleSubmit}>
          <Text style={STYLES.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RenalFunctionTest;

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
    width: 175,
    height: 50,
    textAlign: 'left',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
    borderRadius: 10,
    borderColor: COLORS.GREY,
    borderWidth: 1,
    fontSize: 14,
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
});
