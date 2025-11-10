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
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import {COLORS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Loader from '../ui/loader';
import DataResultsContext from '../contexts/DataResultsContext';
import {API_URL} from '@env';

const MedicalAssessment = ({navigation, route}) => {
  const {patientId, firstName, lastName} = route.params;
  const {userLog} = useContext(DataResultsContext);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Date
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);

  // Diagnosis / Impression
  const [diagnosis, setDiagnosis] = useState('');

  // Drugs Given
  const [drugs, setDrugs] = useState([
    { name: '', dose: '', duration: '' }
  ]);

  // Side Effects Noted
  const [sideEffects, setSideEffects] = useState('');

  // Next Follow-Up Date
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Referred to Facility
  const [referredToFacility, setReferredToFacility] = useState('');
  const [facilityName, setFacilityName] = useState('');

  // CHW Comments
  const [chwComments, setChwComments] = useState('');

  const addDrug = () => {
    setDrugs([...drugs, { name: '', dose: '', duration: '' }]);
  };

  const removeDrug = (index) => {
    const newDrugs = drugs.filter((_, i) => i !== index);
    setDrugs(newDrugs);
  };

  const updateDrug = (index, field, value) => {
    const newDrugs = [...drugs];
    newDrugs[index][field] = value;
    setDrugs(newDrugs);
  };

  const handleSubmit = async () => {
    // Validation
    if (!assessmentDate) {
      Alert.alert('Error', 'Please enter assessment date');
      return;
    }
    if (!diagnosis.trim()) {
      Alert.alert('Error', 'Please enter diagnosis/impression');
      return;
    }

    // Validate drugs - at least one drug should have a name
    const validDrugs = drugs.filter(drug => drug.name.trim() !== '');
    if (validDrugs.length === 0) {
      Alert.alert('Error', 'Please add at least one drug');
      return;
    }

    // Check that all drugs with names have dose and duration
    const incompleteDrugs = validDrugs.filter(drug => !drug.dose.trim() || !drug.duration.trim());
    if (incompleteDrugs.length > 0) {
      Alert.alert('Error', 'Please fill in dose and duration for all drugs');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/medical-assessments`, {
        data: {
          patient: patientId,
          assessmentDate,
          diagnosis,
          drugs: validDrugs,
          sideEffects,
          nextFollowUpDate,
          referredToFacility,
          facilityName,
          chwComments,
          users_permissions_user: userLog,
        },
      });

      if (response.status === 200) {
        Alert.alert(
          'Success', 
          'Medical assessment saved successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving medical assessment:', error);
      Alert.alert('Error', 'Failed to save medical assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={styles.headerTitle}>MEDICAL ASSESSMENT</Text>}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      {renderHeader()}

      <View style={styles.patientInfoBanner}>
        <Text style={styles.patientInfoText}>
          {`Medical Assessment: ${firstName} ${lastName}`}
        </Text>
      </View>
      
      {isLoading && <Loader />}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Assessment Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assessment Date</Text>
            <TextInput
              style={styles.input}
              value={assessmentDate}
              onChangeText={setAssessmentDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.GRAY}
              editable={false}
            />
          </View>

          {/* Diagnosis / Impression */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnosis / Impression</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Enter diagnosis or impression..."
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Drugs Given */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Drugs Given (Name, Dose, Duration)</Text>
              <TouchableOpacity style={styles.addButton} onPress={addDrug}>
                <Icon name="plus-circle" size={24} color={COLORS.PRIMARY} />
                <Text style={styles.addButtonText}>Add Drug</Text>
              </TouchableOpacity>
            </View>

            {drugs.map((drug, index) => (
              <View key={index} style={styles.drugContainer}>
                <View style={styles.drugHeader}>
                  <Text style={styles.drugNumber}>Drug {index + 1}</Text>
                  {drugs.length > 1 && (
                    <TouchableOpacity onPress={() => removeDrug(index)}>
                      <Icon name="trash-2" size={20} color={COLORS.ERRORS} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={styles.input}
                  value={drug.name}
                  onChangeText={(value) => updateDrug(index, 'name', value)}
                  placeholder="Drug Name"
                  placeholderTextColor={COLORS.GRAY}
                />
                
                <TextInput
                  style={[styles.input, styles.drugFieldSpacing]}
                  value={drug.dose}
                  onChangeText={(value) => updateDrug(index, 'dose', value)}
                  placeholder="Dose (e.g., 500mg)"
                  placeholderTextColor={COLORS.GRAY}
                />
                
                <TextInput
                  style={[styles.input, styles.drugFieldSpacing]}
                  value={drug.duration}
                  onChangeText={(value) => updateDrug(index, 'duration', value)}
                  placeholder="Duration (e.g., 7 days)"
                  placeholderTextColor={COLORS.GRAY}
                />
              </View>
            ))}
          </View>

          {/* Side Effects Noted */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Side Effects Noted</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={sideEffects}
              onChangeText={setSideEffects}
              placeholder="Enter any side effects noted..."
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Next Follow-Up Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Follow-Up Date</Text>
            <TextInput
              style={styles.input}
              value={nextFollowUpDate}
              onChangeText={setNextFollowUpDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.GRAY}
            />
          </View>

          {/* Referred to Facility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referred to Facility</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setReferredToFacility('Yes');
                }}>
                <View style={styles.radioCircle}>
                  {referredToFacility === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setReferredToFacility('No');
                  setFacilityName('');
                }}>
                <View style={styles.radioCircle}>
                  {referredToFacility === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {referredToFacility === 'Yes' && (
              <TextInput
                style={[styles.input, styles.conditionalInput]}
                value={facilityName}
                onChangeText={setFacilityName}
                placeholder="If Yes, where?"
                placeholderTextColor={COLORS.GRAY}
              />
            )}
          </View>

          {/* CHW Comments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHW Comments</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={chwComments}
              onChangeText={setChwComments}
              placeholder="Enter any additional comments..."
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Medical Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  conditionalInput: {
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 5,
  },
  drugContainer: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  drugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  drugNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  drugFieldSpacing: {
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
  },
  radioLabel: {
    fontSize: 15,
    color: COLORS.BLACK,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  patientInfoBanner: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.ACCENT_1,
  },
  patientInfoText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: '600',
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
});

export default MedicalAssessment;
