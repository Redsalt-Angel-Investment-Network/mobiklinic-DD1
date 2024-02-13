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

const History = ({navigation, route}) => {
  const {patientId} = route.params;
  console.log(patientId);

  const [state, setState] = useState({
    uti: '',
    utiTabs: '',
    herbsQuestion: '',
    utiHerbs: '',
    smoke: '',
    smokeFrequency: '',
    heartProblem: '',
    heartProblemDisese: '',
    alchoholConsumption: '',
    alcoholType: '',
    kidneyDiseaseHistory: '',
    kidneyDisease: '',
    urineFrequence: '',
    longTimeDiseaseHistory: '',
    longTimeDisease: '',
    alcoholLocalBrew: '',
    alcoholBeer: '',
    alcoholSpirits: '',
    waterMessage: '',
    waterFrequency: '',

  });

  const checkWater = waterFrequency => {
    const water = parseFloat(waterFrequency);
    setState(prevState => {
      if (water <= 1) {
        return {
          ...prevState,
          waterMessage:
            'It is recommended to drink more than 1 liter of water per day. Please consider increasing your water intake.',
        };
      } else {
        return {
          ...prevState,
          waterMessage: '',
        };
      }
    });
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
        <Text style={STYLES.title}>Beneficiary History</Text>
        {/* UTI History */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Past cases of UTIs?</Text>
            <Picker
              placeholder="Any Past Cases of UTIS?"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.uti}
              onValueChange={value => setState({...state, uti: value})}
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.uti === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>Which tabs did you take?</Text>
                <TextInput
                  style={STYLES.field}
                  value={state.utiTabs}
                  onChangeText={text => setState({...state, utiTabs: text})}
                  placeholder="Enter UTI tabs"
                  placeholderTextColor={COLORS.GREY}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>Did you take herbs for it ?:</Text>
                <Picker
                  placeholder="Any Past Cases of Take Herbs?"
                  placeholderTextColor={COLORS.GREY}
                  selectedValue={state.herbsQuestion}
                  onValueChange={value =>
                    setState({...state, herbsQuestion: value})
                  }
                  style={[STYLES.field, {color: COLORS.BLACK}]}
                  dropdownIconColor={COLORS.GREY_LIGHTER}>
                  <Picker.Item label="" value="" />
                  <Picker.Item label="YES" value="YES" />
                  <Picker.Item label="NO" value="NO" />
                  <Picker.Item
                    label="PREFER NOT TO SAY"
                    value="PREFER NOT TO SAY"
                  />
                </Picker>
              </View>

              {state.herbsQuestion === 'YES' && (
                // Render additional fields when 'YES' is selected
                <View style={STYLES.labeled}>
                  <Text style={STYLES.label}>Which herbs did you take?</Text>
                  <TextInput
                    style={STYLES.field}
                    value={state.utiHerbs}
                    onChangeText={text => setState({...state, utiHerbs: text})}
                    placeholder="Enter UTI herbs"
                    placeholderTextColor={COLORS.GREY}
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>
              )}
            </>
          )}
        </View>
        {/* Urine Frequency */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Urination Frequecy </Text>
          <TextInput
            style={STYLES.field}
            value={state.urineFrequence}
            onChangeText={text => {
              setState({...state, urineFrequence: text});
            }}
            placeholder="How many times do you urine in a day?"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            multiline={true}
            numberOfLines={2}
          />
        </View>
        {/* Water Frequency */}
        <View style={STYLES.labeled}>
          <Text style={STYLES.label}>Litres of water per day?</Text>
          <TextInput
            style={STYLES.field}
            value={state.waterFrequency}
            onChangeText={text => {
              checkWater(text);
              setState({...state, waterFrequency: text});
            }}
            placeholder="Enter liters of water"
            placeholderTextColor={COLORS.GREY}
            keyboardType="numeric"
            multiline={true}
            numberOfLines={2}
            onBlur={() =>
              checkWater(state.waterFrequency)
            }
          />
        </View>
        {console.log('Water Message:', state.waterMessage)}
        {state.waterMessage !== '' && (
          <Text style={STYLES.errorMessage}>{state.waterMessage}</Text>
        )}

        {/* heart problem */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Do you Have a Heart Disease?:</Text>
            <Picker
              placeholder="Do you Smoke?"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.heartProblem}
              onValueChange={value => setState({...state, heartProblem: value})}
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.heartProblem === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>Heart Disease</Text>
                <TextInput
                  style={STYLES.field}
                  value={state.heartProblemDisese}
                  onChangeText={text =>
                    setState({...state, heartProblemDisese: text})
                  }
                  placeholder="Which heart disease do you have?"
                  placeholderTextColor={COLORS.GREY}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </>
          )}
        </View>
        {/* Kidney Disease History */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Ever had a Kidney Disease:</Text>
            <Picker
              placeholder="Ever had a kidney disease?"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.kidneyDiseaseHistory}
              onValueChange={value =>
                setState({...state, kidneyDiseaseHistory: value})
              }
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.kidneyDiseaseHistory === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>Kidney Disease</Text>
                <TextInput
                  style={STYLES.field}
                  value={state.kidneyDisease}
                  onChangeText={text =>
                    setState({...state, kidneyDisease: text})
                  }
                  placeholder="Kidney Disease"
                  placeholderTextColor={COLORS.GREY}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </>
          )}
        </View>
        {/* Long time Disease */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Persistent Long time Disease:</Text>
            <Picker
              placeholder="Do you have a persistent disease"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.longTimeDiseaseHistory}
              onValueChange={value =>
                setState({...state, longTimeDiseaseHistory: value})
              }
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.longTimeDiseaseHistory === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}> What is the Disease</Text>
                <TextInput
                  style={STYLES.field}
                  value={state.longTimeDisease}
                  onChangeText={text =>
                    setState({...state, longTimeDisease: text})
                  }
                  placeholder="Disease"
                  placeholderTextColor={COLORS.GREY}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </>
          )}
        </View>
        {/* smoke */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Do you Smoke?</Text>
            <Picker
              placeholder="Do you Smoke?"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.smoke}
              onValueChange={value => setState({...state, smoke: value})}
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.smoke === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>How Often do you smoke?</Text>
                <TextInput
                  style={STYLES.field}
                  value={state.smokeFrequency}
                  onChangeText={text =>
                    setState({...state, smokeFrequency: text})
                  }
                  placeholder="How Often do you smoke?"
                  placeholderTextColor={COLORS.GREY}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            </>
          )}
        </View>
        {/* Alcholol Consumption */}
        <View>
          <View style={STYLES.labeled}>
            <Text style={STYLES.label}>Do you drink Alcohol?:</Text>
            <Picker
              placeholder="Do you Smoke?"
              placeholderTextColor={COLORS.GREY}
              selectedValue={state.alcoholConsumption}
              onValueChange={value =>
                setState({...state, alcoholConsumption: value})
              }
              style={[STYLES.field, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY_LIGHTER}>
              <Picker.Item label="" value="" />
              <Picker.Item label="YES" value="YES" />
              <Picker.Item label="NO" value="NO" />
              <Picker.Item
                label="PREFER NOT TO SAY"
                value="PREFER NOT TO SAY"
              />
            </Picker>
          </View>

          {state.alchoholConsumption === 'YES' && (
            <>
              <View style={STYLES.labeled}>
                <Text style={STYLES.label}>Type of Alcohol taken?</Text>
                <Picker
                  placeholderTextColor={COLORS.GREY}
                  selectedValue={state.alcoholType}
                  onValueChange={value =>
                    setState({...state, alcoholType: value})
                  }
                  style={[STYLES.field, {color: COLORS.BLACK}]}
                  dropdownIconColor={COLORS.GREY_LIGHTER}>
                  <Picker.Item label="" value="" />
                  {['Beer', 'Spirits', 'Local Brew'].map(option => (
                    <Picker.Item label={option} value={option} key={option} />
                  ))}
                  <Picker.Item
                    label="PREFER NOT TO SAY"
                    value="PREFER NOT TO SAY"
                  />
                </Picker>
              </View>

              {(state.alcoholType === 'Local Brew' ||
                state.alcoholType === 'Beer' ||
                state.alcoholType === 'Spirits') && (
                <View style={STYLES.labeled}>
                  <Text style={STYLES.label}>Quantity consumed:</Text>
                  <TextInput
                    style={STYLES.field}
                    value={
                      state.alcoholType === 'Local Brew'
                        ? state.alcoholLocalBrew
                        : state.alcoholType === 'Beer'
                        ? state.alcoholBeer
                        : state.alcoholSpirits
                    }
                    onChangeText={text => {
                      setState(prevState => ({
                        ...prevState,
                        alcoholLocalBrew:
                          state.alcoholType === 'Local Brew'
                            ? text
                            : state.alcoholLocalBrew,
                        alcoholBeer:
                          state.alcoholType === 'Beer'
                            ? text
                            : state.alcoholBeer,
                        alcoholSpirits:
                          state.alcoholType === 'Spirits'
                            ? text
                            : state.alcoholSpirits,
                      }));
                    }}
                    placeholder={`How many ${
                      state.alcoholType === 'Local Brew'
                        ? 'cups'
                        : state.alcoholType === 'Beer'
                        ? 'bottles'
                        : 'sackets'
                    } do you consume?`}
                    placeholderTextColor={COLORS.GREY}
                    keyboardType="numeric"
                    multiline={true}
                    numberOfLines={2}
                  />
                </View>
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={STYLES.submit}
          onPress={() =>
            navigation.navigate('Inspection', {
              historyData: state,
              patientId: patientId,
            })
          }>
          <Text style={STYLES.submitText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default History;

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
    backgroundColor: COLORS.WHITE,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
    borderWidth:2, 
    borderColor:COLORS.BLACK,
  },
  submitText: {
    color: COLORS.BLACK,
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
  errorMessage: {
    color: COLORS.PRIMARY,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 5,
  },
});
