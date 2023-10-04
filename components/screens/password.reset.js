// ResetPasswordScreen.js

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
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';

const ResetPassword = ({navigation, route}) => {
  const [password, setPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      await axios.post(`${URLS.BASE}/auth/reset-password`, {
        token: route.params.token,
        password,
      });
      Alert.alert('Password Reset', 'Your password has been reset.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password.');
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
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {_header()}
        <View style={styles.logoContainer}>
          <Image
            style={{width: 80, height: 80}}
            source={require('../imgs/logo.png')}
          />
          <Text style={styles.title}>Reset Password</Text>
        </View>
        <Text>Enter your new password</Text>
        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
        />
        <Button title="Reset Password" onPress={handleResetPassword} />
      </View>
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
