import axios from 'axios';
import React, {useContext, useState, useEffect} from 'react';
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
import {format} from 'date-fns';
import {countryData} from './country.selector';
import {API_URL} from '@env';

const PatientData = ({navigation}) => {
  const diagnosisContext = React.useContext(DiagnosisContext);
  const {diagnoses} = diagnosisContext;
  const {dataResults} = useContext(DataResultsContext);
  const {userLog} = useContext(DataResultsContext);
  const {patientId, setPatientId} = useContext(DataResultsContext);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedEthnicity, setSelectedEthnicity] = useState('');
  const [age, setAge] = useState(0);

  useEffect(() => {
    Alert.alert(
      'Instructions',
      'Have searched for this patient?\n\nClick "YES" it was. ',
      [
        {
          text: 'YES',
        },
        {
          text: 'No',
          onPress: () => navigation.navigate('PatientLists'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }, []);
  const handleCountryChange = country => {
    setSelectedCountry(country);
    setSelectedLanguage('');
    setSelectedDistrict('');
  };

  const handleLanguageChange = language => {
    setSelectedLanguage(language);
  };

  const handleDistrictChange = district => {
    setSelectedDistrict(district);
  };

  const handleEthinicityChange = ethnicities => {
    setSelectedEthnicity(ethnicities);
  };
  // date
  const currentDate = new Date();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    if (showDatePicker === 'patient') {
      setDateOfBirth(currentDate);
      setState({...state, dateOfBirth: currentDate});
    }
  };
  useEffect(() => {
    calculateAge();
  }, [dateOfBirth]);

  const calculateAge = () => {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    setAge(age);
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
    firstName: '',
    sex: '',
    dateOfBirth: '',
    phoneNumber: '',
    lastName: '',
    weight: '',
    height: '',
    district: '',
    country: '',
    primaryLanguage: '',
    maritalStatus: '',
    nextOfKin: '',
    nextOfKinContact: '',
    ethinicity: '',
    occupation: '',
    ethinicity: '',
  });

  const handleSubmit = async () => {
    try {
      if (state.isLoading) {
        return;
      }
      setState({...state, isLoading: true});

      if (
        state.firstName === '' ||
        state.lastName === '' ||
        state.sex === '' ||
        dateOfBirth === ''
      ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      const formattedDateOfBirth = formatDate(dateOfBirth);

      const response = await axios.post(`${API_URL}/api/patients`, {
        data: {
          firstName: state.firstName,
          lastName: state.lastName,
          sex: state.sex,
          dateOfBirth: formattedDateOfBirth,
          phoneNumber: state.phoneNumber,
          weight: state.weight,
          height: state.height,
          district: selectedDistrict,
          country: selectedCountry,
          primaryLanguage: selectedLanguage,
          maritalStatus: state.maritalStatus,
          nextOfKin: state.nextOfKin,
          nextOfKinContact: state.nextOfKinContact,
          ethinicity: selectedEthnicity,
          occuptation: state.occupation,
          users_permissions_user: {
            id: userLog,
          },
        },
      });

      if (response.status === 200) {
        const data = response.data.data;
        const patientId = data.id;
        setPatientId(patientId);

        Alert.alert('Beneficiary Registered Successfully');
        navigation.navigate('SelectActivity', {
          firstName: state.firstName,
          lastName: state.lastName,
          patientId: patientId,
          age: age,
        });
      } else {
        console.error('Error posting data:', response.status);
        Alert.alert(
          'Error',
          'Failed to register Beneficiary. Please try again later.',
        );
      }
    } catch (error) {
      console.error('Error posting data:', error);
      Alert.alert(
        'Error',
        'Failed to register Beneficiary. Please try again later.',
      );
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

  if (state.isLoading) return <Loader />;

  return (
    <View style={STYLES.wrapper}>
      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      {_header()}

      <ScrollView style={STYLES.body}>
        <Text style={STYLES.title}>Beneficiary Profile</Text>

        {/* First Name */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>
            First Name<Text style={STYLES.pointer}>*</Text>:
          </Text>
          <TextInput
            style={[
              STYLES.field,
              {color: COLORS.BLACK, placeholderTextColor: COLORS.GRAY},
            ]} // Add color and placeholderTextColor styles
            placeholderTextColor={COLORS.GREY} //
            value={state.firstName}
            onChangeText={text => setState({...state, firstName: text})}
            placeholder="Enter first name"
          />
        </View>

        {/* Last Name */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>
            Last Name<Text style={STYLES.pointer}>*</Text>:
          </Text>
          <TextInput
            style={[
              STYLES.field,
              {color: COLORS.BLACK, placeholderTextColor: COLORS.GRAY},
            ]} // Add color and placeholderTextColor styles
            placeholderTextColor={COLORS.GREY}
            value={state.lastName}
            onChangeText={text => setState({...state, lastName: text})}
            placeholder="Enter last name"
          />
        </View>

        {/* Phone Number */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>
            Phone Number<Text style={STYLES.pointer}>*</Text>:
          </Text>
          <TextInput
            style={[
              STYLES.field,
              {color: COLORS.BLACK, placeholderTextColor: COLORS.GRAY},
            ]} // Add color and placeholderTextColor styles
            placeholderTextColor={COLORS.GREY} // Set the placeholder text color
            value={state.phoneNumber}
            onChangeText={text => setState({...state, phoneNumber: text})}
            keyboardType="numeric"
            placeholder='eg:"0772700900'
          />
        </View>

        {/* Gender */}
        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>
            Sex<Text style={STYLES.pointer}>*</Text>:
          </Text>

          <Picker
            placeholder="Sex"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.sex}
            onValueChange={(value, index) => setState({...state, sex: value})}
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        {/* occupation */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Occupation:</Text>
          <Picker
            placeholder="Sex"
            placeholderTextColor={COLORS.GREY}
            selectedValue={state.occupation}
            onValueChange={(value, index) =>
              setState({...state, occupation: value})
            }
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Employed" value="Employed" />
            <Picker.Item label="Self-employed" value="Self-employed" />
            <Picker.Item label="Unemployed" value="Unemployed" />
          </Picker>
        </View>

        {/* Date for birth */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Date of Birth:</Text>
          <TouchableOpacity
            style={STYLES.datePickerInput}
            onPress={() => setShowDatePicker('patient')}>
            <Text style={STYLES.datePickerText}>{formatDate(dateOfBirth)}</Text>
          </TouchableOpacity>
          {showDatePicker === 'patient' && (
            <DateTimePicker
              value={dateOfBirth || new Date()} // Use null or fallback to current date
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Marital Status */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Marital Status:</Text>
          <Picker
            selectedValue={state.maritalStatus}
            onValueChange={(value, index) =>
              setState({...state, maritalStatus: value})
            }
            style={[STYLES.field, {color: COLORS.BLACK}]}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            <Picker.Item label="" value="" />
            <Picker.Item label="Single" value="Single" />
            <Picker.Item label="Married" value="Married" />
            <Picker.Item label="Divorced" value="Divorced" />
            <Picker.Item label="Widowed" value="Widowed" />
          </Picker>
        </View>
        <View style={STYLES.wrap}>
          {/* Weight */}
          <View style={STYLES.detail}>
            {/* <Text style={STYLES.label}>Weight:</Text> */}
            <TextInput
              keyboardType="numeric"
              value={state.weight}
              placeholderTextColor={COLORS.GREY}
              onChangeText={text => setState({...state, weight: text})}
              placeholder="Weight (Kgs)"
              style={STYLES.field}
            />
          </View>

          {/* Height */}
          <View style={STYLES.detail}>
            <TextInput
              keyboardType="numeric"
              placeholderTextColor={COLORS.GREY}
              value={state.height}
              style={STYLES.field}
              onChangeText={text => setState({...state, height: text})}
              placeholder="Height (cm)"
            />
          </View>
        </View>

        {/* Next of Kin */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Next of Kin:</Text>
          <TextInput
            style={[
              STYLES.field,
              {color: COLORS.BLACK, placeholderTextColor: COLORS.GRAY},
            ]}
            placeholderTextColor={COLORS.GREY}
            value={state.nextOfKin}
            onChangeText={text => setState({...state, nextOfKin: text})}
            placeholder="Enter next of kin"
          />
        </View>

        {/* Next of Kin Contact */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Next of Kin Contact:</Text>
          <TextInput
            style={[
              STYLES.field,
              {color: COLORS.BLACK, placeholderTextColor: COLORS.GRAY},
            ]}
            placeholderTextColor={COLORS.GREY}
            value={state.nextOfKinContact}
            onChangeText={text => setState({...state, nextOfKinContact: text})}
            keyboardType="numeric"
            placeholder='eg:"0772700900'
          />
        </View>

        {/* Country */}
        <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
          <Text style={STYLES.label}>
            Country<Text style={STYLES.pointer}>*</Text>:
          </Text>
          <Picker
            style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
            selectedValue={selectedCountry}
            onValueChange={handleCountryChange}>
            <Picker.Item value="" />
            {countryData.map(country => (
              <Picker.Item
                key={country.name}
                label={country.name}
                value={country.name}
              />
            ))}
          </Picker>
        </View>

        {selectedCountry && (
          <>
            {/* district */}
            <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
              <Text style={STYLES.label}>District:</Text>
              <Picker
                selectedValue={selectedDistrict}
                style={[STYLES.field, {color: COLORS.BLACK}]} // Add color style
                onValueChange={handleDistrictChange}>
                <Picker.Item label="Select a district" value="" />
                {countryData
                  .find(country => country.name === selectedCountry)
                  .districts.map(district => (
                    <Picker.Item
                      key={district}
                      label={district}
                      value={district}
                    />
                  ))}
              </Picker>
            </View>

            {/* primary language */}
            <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
              <Text style={STYLES.label}>Primary Language:</Text>
              <Picker
                selectedValue={selectedLanguage}
                style={[STYLES.field, {color: COLORS.BLACK}]}
                onValueChange={handleLanguageChange}>
                <Picker.Item label="Select a language" value="" />
                {countryData
                  .find(country => country.name === selectedCountry)
                  .languages.map(language => (
                    <Picker.Item
                      key={language}
                      label={language}
                      value={language}
                    />
                  ))}
              </Picker>
            </View>

            {/* ethinicity */}
            <View style={STYLES.labeled} placeholderTextColor="rgba(0,0,0,0.7)">
              <Text style={STYLES.label}>Ethinicity:</Text>
              <Picker
                selectedValue={selectedEthnicity}
                style={[STYLES.field, {color: COLORS.BLACK}]}
                onValueChange={handleEthinicityChange}>
                <Picker.Item label="Select a Ethnicity" value="" />
                {countryData
                  .find(country => country.name === selectedCountry)
                  .ethnicities.map(ethinicity => (
                    <Picker.Item
                      key={ethinicity}
                      label={ethinicity}
                      value={ethinicity}
                    />
                  ))}
              </Picker>
            </View>
          </>
        )}

        <TouchableOpacity style={STYLES.submit} onPress={handleSubmit}>
          <Text style={STYLES.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PatientData;

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
  pointer: {
    color: 'red',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
