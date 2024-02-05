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
  
} from '../helpers/functions';



export const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const DOWNLOAD = async data => {
  // await AsyncStorage.removeItem("@doctors");
  // await AsyncStorage.removeItem("@ambulances");
  const {jwt, items, userId, per_page} = data;
  axios.defaults.baseURL = API_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
  axios.defaults.headers.post['Content-Type'] =
    'application/json; charset=UTF-8';
  axios.defaults.headers.post['Accept'] = 'application/json';
  const DATA_CATEGORY = ['diagnosis', 'chats'];
  for (let i = 0; i < items.length; i++) {
    try {
      const {
        data: {total},
      } = await axios.get(`/${items[i]}`);

      let pages = Math.round(total / per_page);
      pages = pages < 1 ? 1 : pages;
      let _downloaded = 0;
      for (let page = 1; page <= pages; page++) {
        const response = await axios.get(`/${items[i]}?page=${page}`);
        const _items = response.data[items[i]];

        let itemsOnDevice = await AsyncStorage.getItem(`@${items[i]}`);
        itemsOnDevice = JSON.parse(itemsOnDevice) || [];
        const all = uniqWith([..._items, ...itemsOnDevice], isEqual);
        AsyncStorage.setItem(`@${items[i]}`, JSON.stringify(all));
      }
    } catch (error) {
      console.log('Downlod', error);
    }

    if (i >= items.length) {
      return true;
    }
  }
};

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
      let response = await fetch(`${API_URL}/api/auth/local?populate=*`, {
        method: 'POST',
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application/json',
        },
      });

      let json_data = await response.json();

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Response JSON:', json_data);

      if (response.status === 200) {
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
          style={{width: 80, height: 80}}
          source={require('../imgs/logo.png')}
        />
        <Text style={styles.title}>Sign in</Text>
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
            placeholder="Enter Phone Number"
          />
        </View>

        <View style={styles.labeled}>
          <TextInput
            style={styles.input}
            password={true}
            secureTextEntry={true}
            autoCorrect={false}
            placeholderTextColor="grey"
            selectionColor={COLORS.SECONDARY}
            onChangeText={text => setUser({...user, password: text})}
            value={user.password}
            placeholder="Password"
          />
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
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkItem}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('signUp')}>
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
  title: {
    color: COLORS.ACCENT_1,
    fontSize: 20,
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
