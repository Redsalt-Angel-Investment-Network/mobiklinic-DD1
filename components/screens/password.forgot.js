import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import {URLS} from '../constants/API';
import CopyRight from '../simprints/copyright';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';


const ForgotPassword = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const handleResetPassword = async () => {
    try {
      await axios.post(`${URLS.BASE}/auth/login`, {phoneNumber});
      Alert.alert(
        'Password Reset Requested',
        'Please check your phobe number for instructions to reset your password.',
      );
      navigation.navigate('ResetPassword'); // Navigate to the login screen
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset password request.');
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
      <View style={styles.logoContainer}>
        <Image
          style={{width: 80, height: 80}}
          source={require('../imgs/logo.png')}
        />
        <Text style={styles.title}>Forgot Password</Text>
      </View>
      <Text>Enter your phone number to reset your password</Text>
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={text => setPhoneNumber(text)}
      />
      <Button title="Reset Password" onPress={handleResetPassword} />
      <CopyRight />
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 30,
  },
  title: {
    color: COLORS.ACCENT_1,
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingVertical: DIMENS.PADDING,
    fontFamily: 'Roboto',
  },
  logoContainer: {
    // flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: DIMENS.FORM.PADDING,
  },
  input: {
    // borderColor: COLORS.WHITE_LOW,
    // flex: 1,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    paddingLeft: 30,
    fontSize: 15,
    borderColor: COLORS.GREY,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 15,
  },
});
