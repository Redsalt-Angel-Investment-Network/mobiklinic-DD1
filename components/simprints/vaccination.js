import React, {useContext, useState, useEffect, startTransition} from 'react';
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
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import {_removeStorageItem} from '../helpers/functions';
import {DiagnosisContext} from '../providers/Diagnosis';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS, DIMENS} from '../constants/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import CopyRight from '../copyright';
import {API_URL} from '@env';

const Vaccinations = ({navigation, route}) => {
  const diagnosisContext = React.useContext(DiagnosisContext);
  const {patientId, firstName, lastName} = route.params;
  const {userNames} = useContext(DataResultsContext);
  const {userLog} = useContext(DataResultsContext);
  const [dateOfVaccination, setDateOfVaccination] = useState('');
  const [dateForNextDose, setDateForNextDose] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide the date picker

    // Update the respective state based on the selected date
    if (selectedDate !== undefined) {
      if (showDatePicker === 'vaccination') {
        setDateOfVaccination(selectedDate);
        setState({...state, dateOfVaccination: selectedDate}); // Update state for date of vaccination
        console.log('Date for Vaccination:', selectedDate);
      } else if (showDatePicker === 'nextDose') {
        setDateForNextDose(selectedDate);
        setState({...state, dateForNextDose: selectedDate}); // Update state for date for next dose
        console.log('Date for Next Dose:', selectedDate);
      }
    }
  };

  const formatDate = date => {
    if (date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day.toString().padStart(2, '0')}/${month
        .toString()
        .padStart(2, '0')}/${year}`;
    }
    return 'Click to add date';
  };

  const [state, setState] = React.useState({
    vaccineName: '',
    dose: '',
    units: '',
    dateOfVaccination: '',
    dateForNextDose: '',
    siteAdministered: '',
    facility: '',
    vaccinatedBy: userNames,
    isLoading: false,
    patientId: patientId,
  });

  const handleSubmit = async () => {
    console.log(patientId);
    try {
      setState({...state, isLoading: true});

      const response = await fetch(`${API_URL}/api/vaccinations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            dateOfVaccination: state.dateOfVaccination,
            dateForNextDose: state.dateForNextDose,
            vaccineName: state.vaccineName,
            dose: state.dose,
            siteAdministered: state.siteAdministered,
            facility: state.facility,
            vaccinatedBy: state.vaccinatedBy,
            cardNumber: state.cardNumber,
          },
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        Alert.alert('Success', 'Vaccination data posted successfully.');
        navigation.navigate('Dashboard');
        console.log('Vaccination data posted successfully.');
        console.log(data);
      } else {
        const error = await response.text();
        console.log(response.status);
        console.error('Error posting vaccination data:', error);
        Alert.alert('Error', 'Failed to post vaccination data.');
      }
    } catch (error) {
      console.error('Error posting vaccination data:', error);
      Alert.alert('Error', 'Failed to post vaccination data.');
    } finally {
      setState({...state, isLoading: false});
    }
  };

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
      title={
        <Text style={[STYLES.centerHeader, STYLES.title]}>
          VACCINATION DATA
        </Text>
      }
    />
  );

  if (state.isLoading) return <Loader />;

  return (
    <View style={STYLES.wrapper}>
      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      {_header()}
      <ScrollView style={STYLES.body}>
        {/* Vaccine Name */}
        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>Vaccine Name:</Text>

          <Picker
            placeholderTextColor={COLORS.BLACK}
            selectedValue={state.vaccineName}
            onValueChange={(value, index) =>
              setState({...state, vaccineName: value})
            }
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Pfizer-BioNTech" value="Pfizer-BioNTech" />
            <Picker.Item label="Moderna" value="moderna" />
            <Picker.Item label="Johnson & Johnson" value="Johnson & Johnson" />
            <Picker.Item label="AstraZeneca" value="astrazeneca" />
            <Picker.Item label="Sinovac" value="sinovac" />
            <Picker.Item label="Sinopharm" value="sinopharm" />
            <Picker.Item label="Covishield" value="covishield" />
            <Picker.Item label="Sputnik V" value="sputnik" />

            <Picker.Item label="Hepatitis B Vaccine" value="hepatitisB" />
            <Picker.Item label="Polio Vaccine" value="polio" />
            <Picker.Item
              label="Tetanus, Diphtheria, and Pertussis Vaccine"
              value="tdap"
            />
            <Picker.Item label="Pneumococcal Vaccine" value="pneumococcal" />
            <Picker.Item label="Rotavirus Vaccine" value="rotavirus" />
            <Picker.Item label="Influenza Vaccine" value="influenza" />

            {/* Additional immunization vaccines */}
            <Picker.Item
              label="Measles, Mumps, and Rubella Vaccine"
              value="mmr"
            />
            <Picker.Item label="Varicella Vaccine" value="varicella" />
            <Picker.Item label="Hepatitis A Vaccine" value="hepatitisA" />
            <Picker.Item label="Meningococcal Vaccine" value="meningococcal" />
            <Picker.Item label="HPV Vaccine" value="hpv" />
          </Picker>
        </View>

        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Card number:</Text>
          <TextInput
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color and placeholderTextColor styles
            placeholderTextColor={COLORS.GREY}
            value={state.cardNumber}
            onChangeText={text => setState({...state, cardNumber: text})}
            placeholder="Enter vaccine card number"
          />
        </View>

        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Date for Vaccination:</Text>
          <TouchableOpacity
            style={STYLES.datePickerInput}
            onPress={() => setShowDatePicker('vaccination')}>
            <Text style={STYLES.datePickerText}>
              {formatDate(dateOfVaccination)}
            </Text>
          </TouchableOpacity>
          {showDatePicker === 'vaccination' && (
            <DateTimePicker
              value={dateOfVaccination || new Date()} // Use null or fallback to current date
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>Dose:</Text>

          <Picker
            placeholderTextColor={COLORS.BLACK}
            selectedValue={state.dose}
            onValueChange={(value, index) => setState({...state, dose: value})}
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="1st" value="1st" />
            <Picker.Item label="2nd" value="2nd" />
            <Picker.Item label="3rd" value="3rd" />
            <Picker.Item label="4th" value="4th" />
          </Picker>
        </View>

        {/* Site adminstered */}
        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>Site Administered:</Text>

          <Picker
            placeholderTextColor={COLORS.BLACK}
            selectedValue={state.siteAdministered}
            onValueChange={(value, index) =>
              setState({...state, siteAdministered: value})
            }
            style={STYLES.field}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Left Upper Arm" value="Left Upper Arm" />
            <Picker.Item label="Right Upper Arm" value="Right Upper Arm" />
            <Picker.Item
              label="Left Upper Thigh"
              value="Ventrogluteal Muscle (Hip)"
            />
            <Picker.Item label="Mouth" value="Mouth" />
            <Picker.Item label="Buttocks" value="Buttocks" />

            <Picker.Item
              label="Right Upper Thigh"
              value="Anterolateral Thigh (Front of the Thigh)"
            />
          </Picker>
        </View>
        {/* Facility */}
        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>Facility:</Text>

          <Picker
            placeholderTextColor={COLORS.BLACK}
            selectedValue={state.facility}
            onValueChange={(value, index) =>
              setState({...state, facility: value})
            }
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Buikwe Hospital" value="Buikwe Hospital" />
            <Picker.Item label="Mulago Hospital" value="Mulago Hospital" />
            <Picker.Item
              label="Makonge Health Center III"
              value="Makonge Health Center III"
            />

            <Picker.Item
              label="Makindu Health Center III"
              value="Makindu Health Center III"
            />
            <Picker.Item
              label="Kisungu Health Center III"
              value="Kisungu Health Center III"
            />
            <Picker.Item
              label="Najjembe Health Center III"
              value="Najjemebe Health Center III"
            />
            <Picker.Item label="Kawolo Hospital" value="Kawolo Hospital" />
          </Picker>
        </View>

        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Date for Next Dose:</Text>
          <TouchableOpacity
            style={STYLES.datePickerInput}
            onPress={() => setShowDatePicker('nextDose')}>
            <Text style={STYLES.datePickerText}>
              {formatDate(dateForNextDose)}
            </Text>
          </TouchableOpacity>
          {showDatePicker === 'nextDose' && (
            <DateTimePicker
              value={dateForNextDose || new Date()} // Use null or fallback to current date
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>
        <TouchableOpacity style={STYLES.submit} onPress={handleSubmit}>
          <Text style={STYLES.submitText}>Submit</Text>
        </TouchableOpacity>
        <CopyRight />
      </ScrollView>
    </View>
  );
};

export default Vaccinations;

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
    padding: 30,
  },
  alert: {
    color: COLORS.GREY,
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    flexDirection: 'row',
    fontSize: 10,
    color: COLORS.GREY,
  },
  label: {
    fontWeight: 'medium',
    marginLeft: 5,
    marginRight: 5,
    color: COLORS.BLACK,
    fontSize: 14,
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
    // paddingVertical: 10,
    color: COLORS.BLACK,
    marginTop: 10,
    marginBottom: 10,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
  },
  field: {
    flex: 1,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    fontSize: 13,
  },
  guid: {
    textAlign: 'left',
    color: COLORS.BLACK,
    fontSize: 11,
    fontWeight: 'bold ',
  },
  submit: {
    backgroundColor: COLORS.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
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
    width: 80,
    height: 40,
    textAlign: 'right',
    color: COLORS.BLACK,
    borderRadius: 20,
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
  datePickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: COLORS.GREY,
    // borderStyle: 'solid',
    // borderWidth: 1,
    // borderRadius: 10,
  },
  datePickerText: {
    marginLeft: 5,
    color: COLORS.BLACK,
    fontSize: 14,
    paddingVertical: 12,
  },
});
