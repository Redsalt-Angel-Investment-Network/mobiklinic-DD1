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
      bilubine: '',
      urobilinogen: '',
      ph: '',
    },
  });

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
            onValueChange={value =>
              setState({
                ...state,
                appearance: {...state.appearance, color: value},
              })
            }
            style={[STYLES.smallInput, {color: COLORS.BLACK}]}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Color" value="Color" />
            <Picker.Item label="clear" value="clear" />
            <Picker.Item label="cloudy" value="cloudy" />
          </Picker>

          <Picker
            placeholder="Any Past Cases of UTIS?"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.appearance.clarity}
            onValueChange={value =>
              setState({
                ...state,
                appearance: {...state.appearance, clarity: value},
              })
            }
            style={[STYLES.smallInput, {color: COLORS.BLACK}]}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="Clarity" value="Clarity" />
            <Picker.Item label="odour" value="colourless" />
            <Picker.Item label="Pale yellow" value="Pale yellow" />
            <Picker.Item label="brown" value="brown" />
          </Picker>
        </View>
        <View style={STYLES.wrap}>
          {/* Specific Gravity */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.specificGravity}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, specificGravity: text},
              })
            }
            placeholder="Specific gravity"
            placeholderTextColor={COLORS.BLACK}
          />

          {/* Glucose */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.glucose}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, glucose: text},
              })
            }
            placeholder="Glucose"
            placeholderTextColor={COLORS.BLACK}
          />
        </View>

        <View style={STYLES.wrap}>
          {/* Protein */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.protein}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, protein: text},
              })
            }
            placeholder="Protein"
            placeholderTextColor={COLORS.BLACK}
          />

          {/* Leukocytes */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.leokcytes}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, leokcytes: text},
              })
            }
            placeholder="Leukocytes"
            placeholderTextColor={COLORS.BLACK}
          />
        </View>

        <View style={STYLES.wrap}>
          {/* Nitrite */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.nitrite}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, nitrite: text},
              })
            }
            placeholder="Nitrite"
            placeholderTextColor={COLORS.BLACK}
          />

          {/* Ketone */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.ketone}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, ketone: text},
              })
            }
            placeholder="Enter Ketone"
            placeholderTextColor={COLORS.BLACK}
          />
        </View>

        <View style={STYLES.wrap}>
          {/* Bilirubine */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.bilubine}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, bilubine: text},
              })
            }
            placeholder="Bilirubine"
            placeholderTextColor={COLORS.BLACK}
          />

          {/* Urobilinogen */}
          <TextInput
            style={STYLES.smallInput}
            value={state.chemistry.urobilinogen}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, urobilinogen: text},
              })
            }
            placeholder="Urobilinogen"
            placeholderTextColor={COLORS.BLACK}
          />
        </View>

        {/* pH Level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>PH Level:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.ph}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, ph: text},
              })
            }
            placeholder="Enter pH level"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

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
    width: 180,
    height: 40,
    textAlign: 'left',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
    borderRadius: 10,
    borderColor: COLORS.GREY,
    borderWidth: 1,
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
