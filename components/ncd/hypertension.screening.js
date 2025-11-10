import React, {useState, useContext} from 'react';
import {
  View,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';
import DataResultsContext from '../contexts/DataResultsContext';
import {API_URL} from '@env';

const HypertensionScreening = ({navigation, route}) => {
  const {patientId, firstName, lastName} = route.params;
  const {userLog} = useContext(DataResultsContext);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Collapsible sections state
  const [showHistory, setShowHistory] = useState(true);
  const [showRiskFactors, setShowRiskFactors] = useState(true);
  const [showClinicalData, setShowClinicalData] = useState(true);

  // History & Symptoms
  const [hadBPMeasured, setHadBPMeasured] = useState('');
  const [knownHighBP, setKnownHighBP] = useState('');
  const [takingMedication, setTakingMedication] = useState('');
  const [medicationNames, setMedicationNames] = useState('');
  const [symptoms, setSymptoms] = useState({
    headache: false,
    dizziness: false,
    palpitations: false,
    chestPain: false,
    blurredVision: false,
    weakness: false,
    swellingOfFeet: false,
    none: false,
  });
  const [sideEffects, setSideEffects] = useState({
    dizziness: false,
    cough: false,
    swelling: false,
    fastHeartbeat: false,
    headache: false,
    none: false,
  });

  // Risk Factors & Lifestyle
  const [smokeOrTobacco, setSmokeOrTobacco] = useState('');
  const [drinkAlcohol, setDrinkAlcohol] = useState('');
  const [addSalt, setAddSalt] = useState('');
  const [eatFruitsVegetables, setEatFruitsVegetables] = useState('');
  const [regularPhysicalActivity, setRegularPhysicalActivity] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Clinical Data
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSymptomChange = (symptom) => {
    if (symptom === 'none') {
      setSymptoms({
        headache: false,
        dizziness: false,
        palpitations: false,
        chestPain: false,
        blurredVision: false,
        weakness: false,
        swellingOfFeet: false,
        none: true,
      });
    } else {
      setSymptoms({
        ...symptoms,
        [symptom]: !symptoms[symptom],
        none: false,
      });
    }
  };

  const handleSideEffectChange = (effect) => {
    if (effect === 'none') {
      setSideEffects({
        dizziness: false,
        cough: false,
        swelling: false,
        fastHeartbeat: false,
        headache: false,
        none: true,
      });
    } else {
      setSideEffects({
        ...sideEffects,
        [effect]: !sideEffects[effect],
        none: false,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      if (!bloodPressure) {
        Alert.alert('Error', 'Please enter blood pressure reading');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/api/hypertension-screenings`, {
        data: {
          patient: patientId,
          hadBPMeasured,
          knownHighBP,
          takingMedication,
          medicationNames,
          symptoms: Object.keys(symptoms).filter(key => symptoms[key]).join(', '),
          sideEffects: Object.keys(sideEffects).filter(key => sideEffects[key]).join(', '),
          smokeOrTobacco,
          drinkAlcohol,
          addSalt,
          eatFruitsVegetables,
          regularPhysicalActivity,
          familyHistory,
          bloodPressure,
          temperature,
          pulseRate,
          notes,
          users_permissions_user: userLog,
        },
      });

      if (response.status === 200) {
        Alert.alert(
          'Success', 
          'Hypertension screening saved successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving hypertension screening:', error);
      Alert.alert('Error', 'Failed to save screening. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={styles.headerTitle}>HYPERTENSION SCREENING</Text>}
    />
  );

  if (isLoading) return <Loader />;

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor={COLORS.WHITE_LOW} barStyle="dark-content" />
      {_header()}

      <ScrollView style={styles.body}>
        <Text style={styles.patientName}>
          Patient: {firstName} {lastName}
        </Text>

        {/* A. History & Symptoms */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowHistory(!showHistory)}>
          <Text style={styles.sectionTitle}>A. History & Symptoms</Text>
          <Icon
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.BLACK}
          />
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.section}>
            <Text style={styles.question}>
              1. Have you ever had your blood pressure measured before today?
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={hadBPMeasured}
                onValueChange={setHadBPMeasured}
                style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.question}>
              2. If yes, have you ever been known you have high blood pressure?
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={knownHighBP}
                onValueChange={setKnownHighBP}
                style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.question}>
              3. Are you currently taking medication for blood pressure? Which one(s)?
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={takingMedication}
                onValueChange={setTakingMedication}
                style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>
            {takingMedication === 'Yes' && (
              <TextInput
                style={styles.input}
                value={medicationNames}
                onChangeText={setMedicationNames}
                placeholder="Medication names"
                placeholderTextColor={COLORS.GREY}
              />
            )}

            <Text style={styles.question}>
              4. Any of these symptoms in the past 2 weeks? (Tick all that apply)
            </Text>
            {Object.keys(symptoms).map(symptom => (
              <TouchableOpacity
                key={symptom}
                style={styles.checkbox}
                onPress={() => handleSymptomChange(symptom)}>
                <Icon
                  name={symptoms[symptom] ? 'check-square' : 'square'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.checkboxLabel}>
                  {symptom.charAt(0).toUpperCase() + symptom.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.question}>
              5. Do you experience any side effects from your medication?
            </Text>
            {Object.keys(sideEffects).map(effect => (
              <TouchableOpacity
                key={effect}
                style={styles.checkbox}
                onPress={() => handleSideEffectChange(effect)}>
                <Icon
                  name={sideEffects[effect] ? 'check-square' : 'square'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.checkboxLabel}>
                  {effect.charAt(0).toUpperCase() + effect.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* B. Risk Factors & Lifestyle */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowRiskFactors(!showRiskFactors)}>
          <Text style={styles.sectionTitle}>B. Risk Factors & Lifestyle</Text>
          <Icon
            name={showRiskFactors ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.BLACK}
          />
        </TouchableOpacity>

        {showRiskFactors && (
          <View style={styles.section}>
            <Text style={styles.question}>6. Do you smoke or use tobacco?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSmokeOrTobacco('Yes')}>
                <Icon
                  name={smokeOrTobacco === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setSmokeOrTobacco('No')}>
                <Icon
                  name={smokeOrTobacco === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>7. Do you drink alcohol?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setDrinkAlcohol('No')}>
                <Icon
                  name={drinkAlcohol === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setDrinkAlcohol('Occasionally')}>
                <Icon
                  name={drinkAlcohol === 'Occasionally' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Occasionally</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setDrinkAlcohol('Regularly')}>
                <Icon
                  name={drinkAlcohol === 'Regularly' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Regularly</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>8. How often do you add salt to your food?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAddSalt('Always')}>
                <Icon
                  name={addSalt === 'Always' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Always</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAddSalt('Often')}>
                <Icon
                  name={addSalt === 'Often' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Often</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAddSalt('Sometimes')}>
                <Icon
                  name={addSalt === 'Sometimes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Sometimes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setAddSalt('Never')}>
                <Icon
                  name={addSalt === 'Never' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Never</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>9. Do you eat fruits/vegetables daily?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setEatFruitsVegetables('Yes')}>
                <Icon
                  name={eatFruitsVegetables === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setEatFruitsVegetables('No')}>
                <Icon
                  name={eatFruitsVegetables === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>
              10. Do you do regular physical activity (e.g., walking, farming)?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setRegularPhysicalActivity('Yes')}>
                <Icon
                  name={regularPhysicalActivity === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setRegularPhysicalActivity('No')}>
                <Icon
                  name={regularPhysicalActivity === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>
              11. Any family member with high blood pressure or stroke?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFamilyHistory('Yes')}>
                <Icon
                  name={familyHistory === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFamilyHistory('No')}>
                <Icon
                  name={familyHistory === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* C. Clinical Data */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowClinicalData(!showClinicalData)}>
          <Text style={styles.sectionTitle}>C. Clinical Data</Text>
          <Icon
            name={showClinicalData ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.BLACK}
          />
        </TouchableOpacity>

        {showClinicalData && (
          <View style={styles.section}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Parameter</Text>
              <Text style={styles.tableHeader}>Reading</Text>
              <Text style={styles.tableHeader}>Notes</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Blood Pressure or BP Reading (mmHg)</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={bloodPressure}
                onChangeText={setBloodPressure}
                placeholder="e.g., 120/80"
                placeholderTextColor={COLORS.GREY}
              />
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder=""
                placeholderTextColor={COLORS.GREY}
              />
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Temperature</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={temperature}
                onChangeText={setTemperature}
                placeholder=""
                keyboardType="numeric"
                placeholderTextColor={COLORS.GREY}
              />
              <View style={styles.tableInput} />
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Pulse Rate</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={pulseRate}
                onChangeText={setPulseRate}
                placeholder=""
                keyboardType="numeric"
                placeholderTextColor={COLORS.GREY}
              />
              <View style={styles.tableInput} />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Screening</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE_LOW,
  },
  headerButton: {
    marginHorizontal: 4,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_1,
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  question: {
    fontSize: 14,
    color: COLORS.BLACK,
    marginTop: 10,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.GREY,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    color: COLORS.BLACK,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GREY,
    borderRadius: 5,
    padding: 10,
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 10,
    color: COLORS.BLACK,
    fontSize: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginVertical: 5,
  },
  radioLabel: {
    marginLeft: 8,
    color: COLORS.BLACK,
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY,
    paddingVertical: 8,
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    fontSize: 14,
  },
  tableCell: {
    flex: 1,
    color: COLORS.BLACK,
    fontSize: 14,
  },
  tableInput: {
    flex: 1,
    marginBottom: 0,
    marginHorizontal: 5,
  },
  submit: {
    backgroundColor: COLORS.BLACK,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HypertensionScreening;
