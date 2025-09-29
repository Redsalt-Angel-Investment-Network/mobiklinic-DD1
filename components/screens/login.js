import React, {useCallback, useEffect, useState, useContext} from 'react';
import {
  View,
  Image,
  Alert,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import {COLORS, DIMENS} from '../constants/styles';
import {API_URL} from '@env';
import {AuthContext} from '../contexts/auth';
import {CustomStatusBar} from '../ui/custom.status.bar';
import Loader from '../ui/loader';
import DataResultsContext from '../contexts/DataResultsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {URLS} from '../constants/API';
import PhoneInput from 'react-native-phone-number-input';
import {
  clearStorage,
  _removeStorageItem,
  RETRIEVE_LOCAL_USER,
  SAVE_LOCAL_USER,
  DOWNLOAD,
  cyrb53,
} from '../helpers/functions';

const Login = ({navigation}) => {
  const {
    setUser: setMyUser,
    isLoading,
    setIsLoading,
    tokens,
    setTokens,
  } = React.useContext(AuthContext);
  const [user, setUser] = React.useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const {updateUserLog} = useContext(DataResultsContext);
  const {updateUserNames, setSenderPhoneNumber} =
    useContext(DataResultsContext);

  const signIn = async () => {
    clearStorage();
    let {identifier, password} = user;

    if (identifier === '' || password === '') {
      Alert.alert('Error', 'Provide your phone number and password');
      return;
    }

    let hash = cyrb53(password);

    let theUser = null;

    try {
      theUser = await RETRIEVE_LOCAL_USER();
    } catch (err) {
      console.log(err);
    }

    if (theUser !== null) {
      let myUser =
        theUser.username === username && theUser.hash === hash ? theUser : null;

      if (myUser) {
        setMyUser({
          id: myUser.id,
          username: myUser.username,
          tokens: myUser.tokens,
          offline: true,
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      console.log('Starting network request');
      let response = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        body: JSON.stringify({
          identifier: user.identifier,
          password: user.password,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': '*'
        },
      });

      const responseText = await response.text();
      let json_data;
      try {
        json_data = JSON.parse(responseText);
      } catch (error) {
        console.error('Response:', responseText);
        Alert.alert('Login Failed', 'Invalid server response. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorMessage = json_data.error?.message || json_data.message || 'Invalid credentials. Please try again.';
        Alert.alert('Login Failed', errorMessage);
        setIsLoading(false);
        return;
      }

      if (json_data.jwt) {
        updateUserLog(json_data.user.id);
        const name = json_data.user.firstName + ' ' + json_data.user.lastName;
        updateUserNames(name);
        console.log(json_data.user.id);
        console.log(name);

        await AsyncStorage.setItem('jwtToken', json_data.jwt);
        navigation.navigate('DrawerLogged');

        await SAVE_LOCAL_USER({
          id: json_data.user.id,
          username: json_data.user.username,
          password: password,
          tokens: {jwt: json_data.jwt},
        });

        const resources = ['ambulances', 'doctors', 'diagnosis'];

        if (
          DOWNLOAD({
            jwt: json_data.jwt,
            items: resources,
            per_page: 10,
          })
        ) {
          setMyUser({
            id: json_data.user.id,
            username: json_data.user.username,
            tokens: {jwt: json_data.jwt},
            offline: false,
          });
          setSenderPhoneNumber(json_data.user.username);
          setIsLoading(false);
        }
      } else {
        Alert.alert(
          'Failed to login',
          'Check your login details',
          [
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
            },
          ],
          {
            cancelable: true,
            onDismiss: () => {
              setIsLoading(false);
            },
          },
        );
      }
    } catch (err) {
      err?.message == 'Network request failed' &&
        Alert.alert(
          'Oops!',
          'Check your internet connection',
          [
            {
              text: 'Cancel',
              onPress: () => setIsLoading(false),
            },
          ],
          {
            cancelable: true,
            onDismiss: () => {
              setIsLoading(false);
            },
          },
        );
      setIsLoading(false);
      console.log(err);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <View style={styles.container}>
      <CustomStatusBar />

      <View style={styles.logoContainer}>
        <Image
          style={{width: 70, height: 70}}
          source={require('../imgs/logo.png')}
        />
        <Text style={styles.title}>WELCOME TO MOBIKLINIC CHP TOOL</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.labeled}>
          <TextInput
            style={styles.input}
            autoCorrect={false}
            placeholderTextColor="grey"
            selectionColor={COLORS.SECONDARY}
            onChangeText={text => setUser({...user, identifier: text})}
            value={user.identifier}
            keyboardType="phone-pad"
            placeholder="Enter Your Phone Number"
          />
        </View>

        <View style={styles.labeled}>
          <TextInput
            style={styles.input}
            password={true}
            secureTextEntry={!showPassword}
            autoCorrect={false}
            placeholderTextColor="grey"
            selectionColor={COLORS.SECONDARY}
            onChangeText={text => setUser({...user, password: text})}
            value={user.password}
            placeholder="Enter Password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={25}
              style={styles.icon}
              color={COLORS.BLACK}
            />
          </TouchableOpacity>
        </View>

        {user.username != '' && user.password != '' ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => {
              setIsLoading(true);
              signIn();
            }}>
            <Text style={styles.whiteText}>SIGN IN</Text>
            <Icon
              name="arrow-right"
              size={20}
              strokeSize={3}
              color={COLORS.WHITE}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnInfo]}>
            <Text style={styles.muteText}>SIGN IN</Text>
            <Icon
              name="arrow-right"
              size={23}
              strokeSize={5}
              color={COLORS.BLACK}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.linkContainer}>
          <Text style={styles.linkItem}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('signUp')}
          style={styles.linkContainer}>
          <Text style={styles.linkItem}>Don't have an Account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  logoContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: DIMENS.FORM.PADDING,
  },
  icon: {
    paddingVertical: 10,
  },
  title: {
    color: COLORS.PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingVertical: DIMENS.PADDING,
    fontFamily: 'Roboto',
  },
  subTitle: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  textColor: {
    color: COLORS.WHITE_LOW,
  },
  linkItem: {
    paddingTop: DIMENS.PADDING,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  linkContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  formContainer: {
    flexGrow: 1,
    padding: DIMENS.FORM.PADDING,
    justifyContent: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.PRIMARY,
  },

  labeled: {
    flexDirection: 'row',
    // marginTop: 10,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_LOW,
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontFamily: 'Roboto',
    fontSize: 15,
    color: COLORS.BLACK,
    // marginHorizontal: 15,
  },
  input: {
    // borderColor: COLORS.WHITE_LOW,
    flex: 1,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    paddingLeft: 10,
    fontSize: 15,
  },
  btn: {
    padding: DIMENS.PADDING,
  },
  errorMsg: {
    color: COLORS.ERRORS,
  },
  btn: {
    padding: DIMENS.PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  btnInfo: {
    backgroundColor: COLORS.WHITE_LOW,
  },
  btnPrimary: {
    backgroundColor: COLORS.ACCENT_1,
  },
  submitText: {
    color: COLORS.ACCENT_1,
    fontWeight: 'bold',
  },
  muteText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  whiteText: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  phoneInput: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    paddingLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    fontSize: 15,
    borderTopEndRadius: 18,
    borderBottomEndRadius: 18,
    borderColor: COLORS.GREY,
    height: 55,
  },
  dropdownImage: {
    alignSelf: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GREY,
    color: COLORS.BLACK,
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_LOW, // Background color for the phone input container
    borderRadius: 18, // Add border radius
    marginBottom: 15,
    // marginHorizontal: 15,
    height: 55,
    width: 365,
  },
});
