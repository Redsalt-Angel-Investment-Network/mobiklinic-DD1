import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomHeader from '../ui/custom-header';
import {COLORS} from '../constants/styles';
import {Picker} from '@react-native-picker/picker';
import {API_URL} from '@env';

const RenalDrugs = ({route, navigation}) => {
  const {patientId} = route.params;

  const [medicines, setMedicines] = useState([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      description: '',
    },
  ]);

  const handleAddMedicine = () => {
    setMedicines([
      ...medicines,
      {name: '', dosage: '', frequency: '', duration: '', description: ''},
    ]);
  };

  const handleRemoveMedicine = index => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleSubmit = async () => {
    try {
      // Set isLoading to true to show loading indicator
      // setState({ ...state, isLoading: true });

      const response = await fetch(`${API_URL}/api/drugs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            drugs: medicines,
            patient: patientId,
          },
        }),
      });

      if (response.ok) {
        setMedicines([
          {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            description: '',
          },
        ]);
        navigation.navigate('Dashboard');
        Alert.alert('Success', 'Medicine data posted successfully.');
      } else {
        // Handle error response
        const error = await response.text();
        console.error('Error posting medicine data:', error);
        Alert.alert('Error', 'Failed to post medicine data.');
      }
    } catch (error) {
      // Handle network errors
      console.error('Error posting medicine data:', error);
      Alert.alert('Error', 'Failed to post medicine data.');
    } finally {
      // Set isLoading to false to hide loading indicator
      // setState({ ...state, isLoading: false });
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
      {_header()}

      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      <ScrollView style={STYLES.body}>
        <Text style={STYLES.title}>Renal Drugs</Text>
        {medicines.map((medicine, index) => (
          <View key={index}>
            <Text style={STYLES.medicineAddButton}>
              Drug Details for Medicine {index + 1}:
            </Text>

            <View style={STYLES.labeled}>
              <Text style={STYLES.label}>Medicine Name:</Text>
              <TextInput
                style={STYLES.field}
                placeholder="e.g Paracetamol"
                placeholderTextColor={COLORS.GREY}
                value={medicine.name}
                onChangeText={text => handleMedicineChange(index, 'name', text)}
              />
            </View>

            <View style={STYLES.wrap}>
              <View>
                <Text style={STYLES.label}>Dosage:</Text>
                <TextInput
                  style={STYLES.medicineInput}
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChangeText={text =>
                    handleMedicineChange(index, 'dosage', text)
                  }
                  keyboardType="numeric"
                />
              </View>
              <Text style={STYLES.textLabel}>X</Text>

              <View>
                <Text style={STYLES.label}>Frequency:</Text>
                <TextInput
                  style={STYLES.medicineInput}
                  placeholder="Frequency"
                  value={medicine.frequency}
                  keyboardType="numeric"
                  onChangeText={text =>
                    handleMedicineChange(index, 'frequency', text)
                  }
                />
              </View>
            </View>

            <View style={STYLES.labeled}>
              <Text style={STYLES.label}>Duration:</Text>
              <TextInput
                style={STYLES.field}
                placeholder="Number of days"
                placeholderTextColor={COLORS.GREY}
                keyboardType="numeric"
                value={medicine.duration}
                onChangeText={text =>
                  handleMedicineChange(index, 'duration', text)
                }
              />
            </View>

            <View style={STYLES.labeled}>
              <Text style={STYLES.label}>Description:</Text>
              <TextInput
                style={STYLES.field}
                placeholder="e.g Take after eating"
                value={medicine.description}
                placeholderTextColor={COLORS.GREY}
                onChangeText={text =>
                  handleMedicineChange(index, 'description', text)
                }
              />
            </View>

            <TouchableOpacity onPress={() => handleRemoveMedicine(index)}>
              <Text style={STYLES.medicineRemoveButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={handleAddMedicine}>
          <Text style={STYLES.medicineAddButton}>Add Medicine</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={STYLES.submit}>
          <Text style={STYLES.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RenalDrugs;

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
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: COLORS.BLACK,
  },
  submitText: {
    color: COLORS.WHITE,
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
  medicineRemoveButton: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'right',
  },
  medicineAddButton: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
    textDecorationLine: 'underline',
  },
  medicineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: COLORS.GREY_LIGHTER,
    borderRadius: 10,
    borderColor: COLORS.GREY,
    borderWidth: 1,
    width: 150,
    color:COLORS.BLACK,
  },
  textLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginVertical: 12,
    paddingVertical: 10,
  },
});
