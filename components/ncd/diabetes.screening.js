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

const DiabetesScreening = ({navigation, route}) => {
  const {patientId, firstName, lastName} = route.params;
  const {userLog} = useContext(DataResultsContext);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Collapsible sections state
  const [showHistory, setShowHistory] = useState(true);
  const [showRiskFactors, setShowRiskFactors] = useState(true);
  const [showComplications, setShowComplications] = useState(true);
  const [showClinicalData, setShowClinicalData] = useState(true);

  // A. History & Symptoms
  const [toldHaveDiabetes, setToldHaveDiabetes] = useState('');
  const [howLongHadIt, setHowLongHadIt] = useState('');
  const [takingMedication, setTakingMedication] = useState('');
  const [medicationNames, setMedicationNames] = useState('');
  const [symptoms, setSymptoms] = useState({
    frequentUrination: false,
    excessiveThirst: false,
    increasedHunger: false,
    weightLoss: false,
    blurredVision: false,
    numbness: false,
    slowHealingWounds: false,
    tiredness: false,
    none: false,
  });

  // B. Risk Factors
  const [familyMemberDiabetes, setFamilyMemberDiabetes] = useState('');
  const [highBloodSugarPregnancy, setHighBloodSugarPregnancy] = useState('');
  const [eatSugaryFood, setEatSugaryFood] = useState('');
  const [haveHighBP, setHaveHighBP] = useState('');
  const [checkBloodSugar, setCheckBloodSugar] = useState('');
  const [usualRange, setUsualRange] = useState('');

  // C. Complications
  const [footWounds, setFootWounds] = useState('');
  const [visionProblems, setVisionProblems] = useState('');
  const [chestPainBreath, setChestPainBreath] = useState('');

  // D. Clinical Data
  const [bloodSugar, setBloodSugar] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSymptomChange = (symptom) => {
    if (symptom === 'none') {
      setSymptoms({
        frequentUrination: false,
        excessiveThirst: false,
        increasedHunger: false,
        weightLoss: false,
        blurredVision: false,
        numbness: false,
        slowHealingWounds: false,
        tiredness: false,
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

  const handleSubmit = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      if (!bloodSugar) {
        Alert.alert('Error', 'Please enter blood sugar test reading');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/api/diabetes-screenings`, {
        data: {
          patient: patientId,
          toldHaveDiabetes,
          howLongHadIt,
          takingMedication,
          medicationNames,
          symptoms: Object.keys(symptoms).filter(key => symptoms[key]).join(', '),
          familyMemberDiabetes,
          highBloodSugarPregnancy,
          eatSugaryFood,
          haveHighBP,
          checkBloodSugar,
          usualRange,
          footWounds,
          visionProblems,
          chestPainBreath,
          bloodSugar,
          bloodPressure,
          weight,
          temperature,
          pulseRate,
          notes,
          users_permissions_user: userLog,
        },
      });

      if (response.status === 200) {
        Alert.alert(
          'Success', 
          'Diabetes screening saved successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving diabetes screening:', error);
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
      title={<Text style={styles.headerTitle}>DIABETES SCREENING</Text>}
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
              1. Have you ever been told you have diabetes or high blood sugar?
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={toldHaveDiabetes}
                onValueChange={setToldHaveDiabetes}
                style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>

            <Text style={styles.question}>
              2. If yes, how long have you had it?
            </Text>
            <TextInput
              style={styles.input}
              value={howLongHadIt}
              onChangeText={setHowLongHadIt}
              placeholder="e.g., 2 years"
              placeholderTextColor={COLORS.GREY}
            />

            <Text style={styles.question}>
              3. Are you currently taking any diabetes medicines? Which one(s)?
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
              4. Any of these symptoms recently (last 4 weeks)? (Tick all that apply)
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
          </View>
        )}

        {/* B. Risk Factors */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowRiskFactors(!showRiskFactors)}>
          <Text style={styles.sectionTitle}>B. Risk Factors</Text>
          <Icon
            name={showRiskFactors ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.BLACK}
          />
        </TouchableOpacity>

        {showRiskFactors && (
          <View style={styles.section}>
            <Text style={styles.question}>5. Any family member with diabetes?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFamilyMemberDiabetes('Yes')}>
                <Icon
                  name={familyMemberDiabetes === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFamilyMemberDiabetes('No')}>
                <Icon
                  name={familyMemberDiabetes === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>
              6. Ever had high blood sugar during pregnancy? (for women)
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setHighBloodSugarPregnancy('Yes')}>
                <Icon
                  name={highBloodSugarPregnancy === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setHighBloodSugarPregnancy('No')}>
                <Icon
                  name={highBloodSugarPregnancy === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>7. Do you eat sugary or processed foods often?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setEatSugaryFood('Yes')}>
                <Icon
                  name={eatSugaryFood === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setEatSugaryFood('No')}>
                <Icon
                  name={eatSugaryFood === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>8. Do you also have high blood pressure?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setHaveHighBP('Yes')}>
                <Icon
                  name={haveHighBP === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setHaveHighBP('No')}>
                <Icon
                  name={haveHighBP === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>9. Do you check your blood sugar regularly?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setCheckBloodSugar('Yes')}>
                <Icon
                  name={checkBloodSugar === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setCheckBloodSugar('No')}>
                <Icon
                  name={checkBloodSugar === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            {checkBloodSugar === 'Yes' && (
              <>
                <Text style={styles.question}>If yes, what is the usual range?</Text>
                <TextInput
                  style={styles.input}
                  value={usualRange}
                  onChangeText={setUsualRange}
                  placeholder="e.g., 90-120 mg/dL"
                  placeholderTextColor={COLORS.GREY}
                />
              </>
            )}
          </View>
        )}

        {/* C. Complications */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowComplications(!showComplications)}>
          <Text style={styles.sectionTitle}>C. Complications</Text>
          <Icon
            name={showComplications ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.BLACK}
          />
        </TouchableOpacity>

        {showComplications && (
          <View style={styles.section}>
            <Text style={styles.question}>10. Any foot wounds, ulcers, or numbness?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFootWounds('Yes')}>
                <Icon
                  name={footWounds === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setFootWounds('No')}>
                <Icon
                  name={footWounds === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>11. Any vision problems?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setVisionProblems('Yes')}>
                <Icon
                  name={visionProblems === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setVisionProblems('No')}>
                <Icon
                  name={visionProblems === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.question}>12. Any chest pain or shortness of breath?</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setChestPainBreath('Yes')}>
                <Icon
                  name={chestPainBreath === 'Yes' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setChestPainBreath('No')}>
                <Icon
                  name={chestPainBreath === 'No' ? 'check-circle' : 'circle'}
                  size={20}
                  color={COLORS.BLACK}
                />
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* D. Clinical Data */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowClinicalData(!showClinicalData)}>
          <Text style={styles.sectionTitle}>D. Clinical Data</Text>
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
              <Text style={styles.tableCell}>Blood Sugar test (RBS/FBS)</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={bloodSugar}
                onChangeText={setBloodSugar}
                placeholder="mg/dL"
                keyboardType="numeric"
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
              <Text style={styles.tableCell}>Blood Pressure test (BP)</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={bloodPressure}
                onChangeText={setBloodPressure}
                placeholder="e.g., 120/80"
                placeholderTextColor={COLORS.GREY}
              />
              <View style={styles.tableInput} />
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Weight</Text>
              <TextInput
                style={[styles.input, styles.tableInput]}
                value={weight}
                onChangeText={setWeight}
                placeholder="kg"
                keyboardType="numeric"
                placeholderTextColor={COLORS.GREY}
              />
              <View style={styles.tableInput} />
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

export default DiabetesScreening;
