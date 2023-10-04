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
import CopyRight from '../simprints/copyright';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';

const ResetPassword = ({navigation}) => {
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      // Define the request body with the reset token and new password
      const requestBody = {
        resetToken,
        newPassword,
      };

      await axios.post(`${URLS.BASE}/auth/reset-password`, requestBody);

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully.',
      );

      // You can navigate to the login or home screen after a successful password reset
      navigation.navigate('Login'); // Change 'Login' to your desired screen
    } catch (error) {
      Alert.alert('Error', 'Failed to reset the password.');
      console.error(error); // Log the error for debugging
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
          <Text style={styles.title}>Reset Password</Text>
        </View>
        <Text style={styles.label}>
          Enter your reset token and new password
        </Text>
        <TextInput
          placeholder="Reset Token"
          value={resetToken}
          placeholderTextColor={COLORS.GREY}
          style={[styles.input, {paddingHorizontal: 30}]}
          onChangeText={text => setResetToken(text)}
        />
        <TextInput
          placeholder="New Password"
          placeholderTextColor={COLORS.GREY}
          value={newPassword}
          style={[styles.input, {paddingHorizontal: 30}]}
          onChangeText={text => setNewPassword(text)}
          // secureTextEntry // Display asterisks for password
        />
        <TouchableOpacity style={styles.submit} onPress={handleResetPassword}>
          <Text style={styles.submitText}>Reset Password</Text>
        </TouchableOpacity>
      </View>

      <CopyRight />
    </View>
  );
};

export default ResetPassword;

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
  input: {
    borderColor: COLORS.GREY,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 15,
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
  centerHeader: {
    color: COLORS.BLACK,
  },
});
