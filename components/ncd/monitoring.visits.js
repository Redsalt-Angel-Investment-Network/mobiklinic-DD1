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

const MonitoringVisits = ({navigation, route}) => {
  const {patientId, firstName, lastName} = route.params;
  const {userLog} = useContext(DataResultsContext);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Date
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);

  // 1. How have you been feeling since the last visit?
  const [feelingSinceLastVisit, setFeelingSinceLastVisit] = useState('');

  // 2. Are you taking your medication as prescribed?
  const [takingMedicationPrescribed, setTakingMedicationPrescribed] = useState('');

  // 3. Have you experienced any side effects from their medication?
  const [experiencedSideEffects, setExperiencedSideEffects] = useState('');
  const [sideEffectsDescription, setSideEffectsDescription] = useState('');

  // 4. Have you checked again your blood pressure or blood sugar since the last visit?
  const [checkedBPOrBloodSugar, setCheckedBPOrBloodSugar] = useState('');
  const [readings, setReadings] = useState('');

  // 5. Are there any new symptoms or complaints?
  const [newSymptoms, setNewSymptoms] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');

  // 6. Have you been following lifestyle advice?
  const [followingLifestyleAdvice, setFollowingLifestyleAdvice] = useState('');
  const [lifestyleComment, setLifestyleComment] = useState('');

  // 8. Did you need any new health education or counselling during this visit?
  const [needHealthEducation, setNeedHealthEducation] = useState('');
  const [educationTopics, setEducationTopics] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!visitDate) {
      Alert.alert('Error', 'Please enter visit date');
      return;
    }
    if (!feelingSinceLastVisit.trim()) {
      Alert.alert('Error', 'Please describe how the patient has been feeling');
      return;
    }
    if (!takingMedicationPrescribed) {
      Alert.alert('Error', 'Please indicate if medication is taken as prescribed');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/monitoring-visits`, {
        data: {
          patient: patientId,
          visitDate,
          feelingSinceLastVisit,
          takingMedicationPrescribed,
          experiencedSideEffects,
          sideEffectsDescription,
          checkedBPOrBloodSugar,
          readings,
          newSymptoms,
          symptomsDescription,
          followingLifestyleAdvice,
          lifestyleComment,
          needHealthEducation,
          educationTopics,
          users_permissions_user: userLog,
        },
      });

      if (response.status === 200) {
        Alert.alert(
          'Success', 
          'Monitoring visit saved successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving monitoring visit:', error);
      Alert.alert('Error', 'Failed to save monitoring visit. Please try again.');
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
      title={<Text style={styles.headerTitle}>MONITORING VISIT</Text>}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      {renderHeader()}

      <View style={styles.patientInfoBanner}>
        <Text style={styles.patientInfoText}>
          {`Monitoring Visit: ${firstName} ${lastName}`}
        </Text>
      </View>
      
      {isLoading && <Loader />}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Visit Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Date</Text>
            <TextInput
              style={styles.input}
              value={visitDate}
              onChangeText={setVisitDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.GRAY}
              editable={false}
            />
          </View>

          {/* Question 1 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              1. How have you been feeling since the last visit?
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={feelingSinceLastVisit}
              onChangeText={setFeelingSinceLastVisit}
              placeholder="Describe..."
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Question 2 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              2. Are you taking your medication as prescribed?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTakingMedicationPrescribed('Yes')}>
                <View style={styles.radioCircle}>
                  {takingMedicationPrescribed === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTakingMedicationPrescribed('No')}>
                <View style={styles.radioCircle}>
                  {takingMedicationPrescribed === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setTakingMedicationPrescribed('Sometimes')}>
                <View style={styles.radioCircle}>
                  {takingMedicationPrescribed === 'Sometimes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Sometimes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Question 3 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              3. Have you experienced any side effects from their medication?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setExperiencedSideEffects('Yes');
                }}>
                <View style={styles.radioCircle}>
                  {experiencedSideEffects === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setExperiencedSideEffects('No');
                  setSideEffectsDescription('');
                }}>
                <View style={styles.radioCircle}>
                  {experiencedSideEffects === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {experiencedSideEffects === 'Yes' && (
              <TextInput
                style={[styles.input, styles.textArea, styles.conditionalInput]}
                value={sideEffectsDescription}
                onChangeText={setSideEffectsDescription}
                placeholder="If yes, describe:"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={2}
              />
            )}
          </View>

          {/* Question 4 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              4. Have you checked again your blood pressure or blood sugar since the last visit?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setCheckedBPOrBloodSugar('Yes');
                }}>
                <View style={styles.radioCircle}>
                  {checkedBPOrBloodSugar === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setCheckedBPOrBloodSugar('No');
                  setReadings('');
                }}>
                <View style={styles.radioCircle}>
                  {checkedBPOrBloodSugar === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {checkedBPOrBloodSugar === 'Yes' && (
              <TextInput
                style={[styles.input, styles.conditionalInput]}
                value={readings}
                onChangeText={setReadings}
                placeholder="If yes, record the readings:"
                placeholderTextColor={COLORS.GRAY}
              />
            )}
          </View>

          {/* Question 5 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              5. Are there any new symptoms or complaints?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setNewSymptoms('Yes');
                }}>
                <View style={styles.radioCircle}>
                  {newSymptoms === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setNewSymptoms('No');
                  setSymptomsDescription('');
                }}>
                <View style={styles.radioCircle}>
                  {newSymptoms === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {newSymptoms === 'Yes' && (
              <TextInput
                style={[styles.input, styles.textArea, styles.conditionalInput]}
                value={symptomsDescription}
                onChangeText={setSymptomsDescription}
                placeholder="If yes, list them:"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={2}
              />
            )}
          </View>

          {/* Question 6 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              6. Have you been following lifestyle advice (diet, exercise, no smoking/alcohol)?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setFollowingLifestyleAdvice('Yes')}>
                <View style={styles.radioCircle}>
                  {followingLifestyleAdvice === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setFollowingLifestyleAdvice('No')}>
                <View style={styles.radioCircle}>
                  {followingLifestyleAdvice === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, styles.conditionalInput]}
              value={lifestyleComment}
              onChangeText={setLifestyleComment}
              placeholder="Comment:"
              placeholderTextColor={COLORS.GRAY}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Question 8 */}
          <View style={styles.section}>
            <Text style={styles.questionText}>
              8. Did you need any new health education or counselling during this visit?
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setNeedHealthEducation('Yes');
                }}>
                <View style={styles.radioCircle}>
                  {needHealthEducation === 'Yes' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                  setNeedHealthEducation('No');
                  setEducationTopics('');
                }}>
                <View style={styles.radioCircle}>
                  {needHealthEducation === 'No' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>No</Text>
              </TouchableOpacity>
            </View>
            {needHealthEducation === 'Yes' && (
              <TextInput
                style={[styles.input, styles.textArea, styles.conditionalInput]}
                value={educationTopics}
                onChangeText={setEducationTopics}
                placeholder="Topic(s):"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={2}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Monitoring Visit</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 15,
    color: COLORS.BLACK,
    marginBottom: 10,
    lineHeight: 22,
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

export default MonitoringVisits;

