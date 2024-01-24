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

        {/* Specific Gravity */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Specific Gravity:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.specificGravity}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, specificGravity: text},
              })
            }
            placeholder="Enter specific gravity"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Glucose */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Glucose:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.glucose}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, glucose: text},
              })
            }
            placeholder="Enter glucose"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Protein */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Protein:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.protein}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, protein: text},
              })
            }
            placeholder="Enter protein"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Leukocytes */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Leukocytes:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.leokcytes}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, leokcytes: text},
              })
            }
            placeholder="Enter leukocytes"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Nitrite */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Nitrite:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.nitrite}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, nitrite: text},
              })
            }
            placeholder="Enter nitrite"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Ketone */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Ketone:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.ketone}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, ketone: text},
              })
            }
            placeholder="Enter ketone"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Bilirubine */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Bilirubine:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.bilubine}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, bilubine: text},
              })
            }
            placeholder="Enter bilirubine"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* Urobilinogen */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Urobilinogen:</Text>
          <TextInput
            style={STYLES.field}
            value={state.chemistry.urobilinogen}
            onChangeText={text =>
              setState({
                ...state,
                chemistry: {...state.chemistry, urobilinogen: text},
              })
            }
            placeholder="Enter urobilinogen"
            placeholderTextColor={COLORS.GREY}
          />
        </View>

        {/* pH Level */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>pH Level:</Text>
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
