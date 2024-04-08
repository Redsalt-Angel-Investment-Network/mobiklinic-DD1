import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {URLS} from '../constants/API';
import CopyRight from '../copyright';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';
import {Picker} from '@react-native-picker/picker';
import {API_URL} from '@env';

const areaCodes = [
  {label: '+256', value: '+256'},
  {label: '+1', value: '+1'},
  {label: '+254', value: '+254'},
  {label: '+255', value: '+255'},
];

const ForgotPassword = ({navigation}) => {
  const [selectedAreaCode, setSelectedAreaCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleResetPassword = async () => {
    try {
      const formattedPhoneNumber = selectedAreaCode + phoneNumber;
      // Log the correctly formatted phone number before sending the request
      console.log('Phone Number Sent to Database:', formattedPhoneNumber);
      await axios.post(`${API_URL}/auth/forgot-password`, {
        phone: formattedPhoneNumber,
      });

      Alert.alert(
        'Password Reset Requested',
        'Please check your phone number for instructions to reset your password.',
      );
      navigation.navigate('ResetPassword');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset password request.');
      console.log(error);
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
      title={<Text style={[styles.centerHeader]}>Back</Text>}
    />
  );

  return (
    <View style={styles.container}>
      {_header()}
      <View style={styles.wrapper}>
        <View style={styles.logoContainer}>
          <Image
            style={{width: 80, height: 80}}
            source={require('../imgs/logo.png')}
          />
          <Text style={styles.title}>Forgot Password</Text>
        </View>
        <Text style={styles.label}>
          Select your area code and enter your phone number
        </Text>
        <View style={styles.inputContainer}>
          <Picker
            selectedValue={selectedAreaCode}
            style={[styles.picker, {color: COLORS.BLACK}]}
            placeholderTextColor={COLORS.BLACK}
            onValueChange={itemValue => setSelectedAreaCode(itemValue)}
            dropdownIconColor={COLORS.GREY_LIGHTER}>
            {areaCodes.map(areaCode => (
              <Picker.Item
                placeholderTextColor={COLORS.BLACK}
                key={areaCode.value}
                label={areaCode.label}
                value={areaCode.value}
              />
            ))}
          </Picker>
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor={COLORS.GREY}
            value={phoneNumber}
            style={[styles.input, {paddingHorizontal: 30}]}
            onChangeText={text => setPhoneNumber(text)}
            keyboardType="phone-pad"
          />
        </View>
        <TouchableOpacity style={styles.submit} onPress={handleResetPassword}>
          <Text style={styles.submitText}>Reset Password</Text>
        </TouchableOpacity>
      </View>

      <CopyRight />
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  wrapper: {flex: 2, paddingHorizontal: 30, marginTop: 30},
  title: {
    color: COLORS.ACCENT_1,
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingTop: 30,
    fontFamily: 'Roboto',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GREY,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 15,
  },
  picker: {
    flex: 1,
    height: 50,
    width: 50,
    paddingHorizontal: 20,
  },
  input: {
    flex: 2,
    color: COLORS.BLACK,
    fontWeight: 'medium',
    fontSize: 15,
    paddingVertical: 15,
  },
  label: {
    fontWeight: 'medium',
    marginLeft: 5,
    marginRight: 5,
    color: COLORS.BLACK,
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 15,
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
});
