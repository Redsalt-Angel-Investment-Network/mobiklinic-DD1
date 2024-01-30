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

const Urinalysis = ({navigation}) => {
  const [state, setState] = useState({
    appearance: {
      color: '',
      clarity: '',
    },
    chemistry: {
      specificGravity: '',
      glucose: '',
      protein: '',
      leokcytes: '',
      nitrite: '',
      ketone: '',
      bilirubin: '',
      ph: '',
    },
    glucoseValidateMessage: '',
    specificGravityValidateMessage: '',
    phValidateMessage: '',
    proteinValidateMessage: '',
    leukocytesValidateMessage: '',
    nitriteValidateMessage: '',
    ketoneValidateMessage: '',
    bilirubinValidateMessage: '',
    colorValidateMessage: '',
    clarityValidateMessage: '',
  });

  // validate values to make sure they are in range else flag them
  const checkPH = ph => {
    const phValue = parseFloat(ph);
    if (isNaN(phValue)) {
      setState({
        ...state,
        phValidateMessage: 'Please enter a valid number',
      });
      return false;
    }
    if (phValue < 7.0 || phValue > 7.1) {
      setState({
        ...state,
        phValidateMessage:
          'PH values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        phValidateMessage: '',
      });
    }
  };
  const checkGlucose = glucose => {
    const validGlucoseValues = ['negative', 'trace'];

    if (glucose !== 'negative' && glucose !== 'trace') {
      setState({
        ...state,
        glucoseValidateMessage:
          'Glucose values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        glucoseValidateMessage: '',
      });
    }
    return validGlucoseValues.includes(glucose.toLowerCase());
  };

  const checkSpecificGravity = specificGravity => {
    const sgValue = parseFloat(specificGravity);
    if (isNaN(sgValue)) {
      setState({
        ...state,
        specificGravityValidateMessage: 'Please enter a valid number',
      });
      return false;
    }
    if (sgValue < 1.005 || sgValue > 1.025) {
      setState({
        ...state,
        specificGravityValidateMessage:
          'Specific gravity values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        specificGravityValidateMessage: '',
      });
    }
  };

  const checkProtein = protein => {
    const proteinValues = ['negative', 'trace'];
    if (protein !== 'negative' && protein !== 'trace') {
      setState({
        ...state,
        proteinValidateMessage:
          'Protein values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        proteinValidateMessage: '',
      });
    }
    return proteinValues.includes(protein.toLowerCase());
  };

  const checkLeukocytes = leukocytes => {
    const leukocytesValues = ['negative'];
    if (leukocytes !== 'negative') {
      setState({
        ...state,
        leukocytesValidateMessage:
          'Leukocytes values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        leukocytesValidateMessage: '',
      });
    }
    return leukocytesValues.includes(leukocytes.toLowerCase());
  };

  const checkNitrite = nitrite => {
    const nitriteValues = ['negative'];
    if (nitrite !== 'negative') {
      setState({
        ...state,
        nitriteValidateMessage:
          'Nitrite values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        nitriteValidateMessage: '',
      });
    }
    return nitriteValues.includes(nitrite.toLowerCase());
  };

  const checkKetone = ketone => {
    const ketoneValues = ['negative'];
    if (ketone !== 'negative') {
      setState({
        ...state,
        ketoneValidateMessage:
          'Ketone values are abnormal. The Doctor will be notified. There should never be ketone in urine',
      });
    } else {
      setState({
        ...state,
        ketoneValidateMessage: '',
      });
    }
    return ketoneValues.includes(ketone.toLowerCase());
  };

  const checkColor = color => {
    const colorValues = ['clear'];
    if (color !== 'clear') {
      setState({
        ...state,
        colorValidateMessage:
          'Color values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        colorValidateMessage: '',
      });
    }
    return colorValues.includes(color.toLowerCase());
  };

  const checkClarity = clarity => {
    const clarityValues = ['colourless'];
    if (clarity !== 'colourless') {
      setState({
        ...state,
        clarityValidateMessage:
          'Clarity values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        clarityValidateMessage: '',
      });
    }
    return clarityValues.includes(clarity.toLowerCase());
  };

  const checkBilirubin = bilirubin => {
    const bilirubinValues = ['negative'];
    if (bilirubin !== 'negative') {
      setState({
        ...state,
        bilirubinValidateMessage:
          'Bilirubin values are abnormal. The Doctor will be notified',
      });
    } else {
      setState({
        ...state,
        bilirubinValidateMessage: '',
      });
    }
    return bilirubinValues.includes(bilirubin.toLowerCase());
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
        <Text style={STYLES.title}>Urinalysis Tests - Macroscopy</Text>

        {/* Urine Appearance */}
        <Text style={STYLES.label}>Urine Appearance:</Text>
        <View style={STYLES.wrap}>
          <Picker
            placeholder="Any Past Cases of UTIS?"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.appearance.color}
            onValueChange={value => {
              const isValid = checkColor(value);

              setState({
                ...state,
                appearance: {
                  ...state.appearance,
                  color: value,
                },
                colorValidateMessage: isValid ? '' : 'Put what you see',
              });
            }}
            style={[STYLES.smallInput, {color: COLORS.BLACK}]}
            onBlur={() => checkColor(state.appearance.color)}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Color" value="Color" />
            <Picker.Item label="clear" value="clear" />
            <Picker.Item label="cloudy" value="cloudy" />
          </Picker>

          <Picker
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.appearance.clarity}
            onValueChange={value => {
              const isValid = checkClarity(value);

              setState({
                ...state,
                appearance: {
                  ...state.appearance,
                  clarity: value,
                },
                clarityValidateMessage: isValid ? '' : 'Put what you see',
              });
            }}
            style={[STYLES.smallInput, {color: COLORS.BLACK}]}
            onBlur={() => checkClarity(state.appearance.clarity)}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Clarity" value="Clarity" />
            <Picker.Item label="colourless" value="colourless" />
            <Picker.Item label="Pale yellow" value="Pale yellow" />
            <Picker.Item label="brown" value="brown" />
          </Picker>
        </View>
        {state.clarityValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.clarityValidateMessage}
          </Text>
        )}
        {state.colorValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.colorValidateMessage}</Text>
        )}

        {/* Chemistry */}
        <Text style={STYLES.label}>Urine Chemistry:</Text>

        {/* specific Gravity */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Specific Gravity:</Text>
          <Picker
            placeholder="Select Specific Gravity"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.specificGravity}
            onValueChange={value => {
              const isValid = checkSpecificGravity(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  specificGravity: value,
                },
                specificGravityValidateMessage: isValid
                  ? ''
                  : 'Put Specific Gravity values',
              });
            }}
            style={STYLES.field}
            onBlur={() => checkSpecificGravity(state.chemistry.specificGravity)}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Select Specific Gravity" value="" />
            <Picker.Item label="1.005" value="1.005" />
            <Picker.Item label="1.010" value="1.010" />
            <Picker.Item label="1.015" value="1.015" />
            <Picker.Item label="1.025" value="1.025" />
            <Picker.Item label="1.030" value="1.030" />
          </Picker>
        </View>

        {state.specificGravityValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.specificGravityValidateMessage}
          </Text>
        )}

        {/* Glucose */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Glucose:</Text>
          <Picker
            placeholder="Enter glucose"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.glucose}
            onValueChange={value => {
              const isValid = checkGlucose(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  glucose: value,
                },
                glucoseValidateMessage: isValid ? '' : 'Put Glucose values',
              });
            }}
            onBlur={() => checkGlucose(state.chemistry.glucose)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Glucose value" value=" " />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="trace" value="trace" />
            <Picker.Item label="15mmol" value="15mmol" />
            <Picker.Item label="30mmol" value="30mmol" />
            <Picker.Item label="60mmol" value="60mmol" />
            <Picker.Item label="110mmol" value="110mmol" />
          </Picker>
        </View>
        {state.glucoseValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.glucoseValidateMessage}
          </Text>
        )}
        {/* Protein */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Protein:</Text>

          <Picker
            placeholder="Enter Protein"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.protein}
            onValueChange={value => {
              const isValid = checkProtein(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  protein: value,
                },
                proteinValidateMessage: isValid ? '' : 'Put Protein values',
              });
            }}
            onBlur={() => checkProtein(state.chemistry.protein)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Protein Value" value="" />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="trace" value="trace" />
            <Picker.Item label="0.3g/l" value="0.3g/l" />
            <Picker.Item label="1.0g/l" value="1.0g/l" />
            <Picker.Item label="3.0g/l" value="3.0g/l" />
            <Picker.Item label=">20g/l" value=">20g/l" />
          </Picker>
        </View>
        {state.proteinValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.proteinValidateMessage}
          </Text>
        )}

        {/* Leukocytes */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Leukocytes:</Text>

          <Picker
            placeholder="Enter Leukocytes"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.leokcytes}
            onValueChange={value => {
              const isValid = checkLeukocytes(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  leokcytes: value,
                },
                leukocytesValidateMessage: isValid
                  ? ''
                  : 'Put Leukocytes values',
              });
            }}
            onBlur={() => checkLeukocytes(state.chemistry.leokcytes)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Leokcytes Value" value="" />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="postive" value="positive" />
          </Picker>
        </View>
        {state.leukocytesValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.leukocytesValidateMessage}
          </Text>
        )}

        {/* Nitrites */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Nitrites:</Text>

          <Picker
            placeholder="Enter Nitrites"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.nitrite}
            onValueChange={value => {
              const isValid = checkNitrite(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  nitrite: value,
                },
                nitriteValidateMessage: isValid ? '' : 'Put Nitrite values',
              });
            }}
            onBlur={() => checkNitrite(state.chemistry.nitrite)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Nitrite Value" value="" />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="postive" value="positive" />
          </Picker>
        </View>
        {state.nitriteValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.nitriteValidateMessage}
          </Text>
        )}

        {/* Ketones */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Ketones:</Text>

          <Picker
            placeholder="Enter Ketone Values"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.ketone}
            onValueChange={value => {
              const isValid = checkKetone(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  ketone: value,
                },
                ketoneValidateMessage: isValid ? '' : 'Put Ketone values',
              });
            }}
            onBlur={() => checkKetone(state.chemistry.ketone)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Ketone Value" value="" />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="trace(0.5mmol)" value="trace(0.5mmol)" />
            <Picker.Item label="1.5mmol(small)" value="1.5mmol(small)" />
            <Picker.Item label="4.0mmol(moderate)" value="4.0mmol(moderate)" />
            <Picker.Item label="8.0mmol(large)" value="8.0mmol(large)" />
            <Picker.Item label="16mmol(large) " value="16mmol(large) " />
          </Picker>
        </View>
        {state.ketoneValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.ketoneValidateMessage}</Text>
        )}

        {/* bilirubin */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Bilirubin:</Text>

          <Picker
            placeholder="Enter Bilirubin Values"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.chemistry.bilirubin}
            onValueChange={value => {
              const isValid = checkBilirubin(value);

              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  bilirubin: value,
                },
                bilirubinValidateMessage: isValid ? '' : 'Put bilirubin values',
              });
            }}
            onBlur={() => checkBilirubin(state.chemistry.bilirubin)}
            style={STYLES.field}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Enter Bilirubin Value" value="" />
            <Picker.Item label="negative" value="negative" />
            <Picker.Item label="positive" value="postive" />
          </Picker>
        </View>
        {state.bilirubinValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>
            {state.bilirubinValidateMessage}
          </Text>
        )}

        {/* pH Level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>PH Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.ph}
            onChangeText={text => {
              checkPH(text);
              setState({
                ...state,
                chemistry: {
                  ...state.chemistry,
                  ph: text,
                },
              });
            }}
            placeholder="Enter pH level"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            onBlur={() => checkPH(state.chemistry.ph)}
          />
        </View>
        {state.phValidateMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.phValidateMessage}</Text>
        )}

        <TouchableOpacity
          style={STYLES.submit}
          onPress={() => navigation.navigate('SelectRenalActivity')}>
          <Text style={STYLES.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Urinalysis;

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
