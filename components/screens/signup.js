import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {CustomStatusBar} from '../ui/custom.status.bar';
import Loader from '../ui/loader';

import {COLORS, DIMENS} from '../constants/styles';
import {API_URL} from '@env';
import axios from 'axios';
import DataResultsContext from '../contexts/DataResultsContext';

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setRegistered] = useState(false);
  const [process, setProcess] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const {setUserNames} = useContext(DataResultsContext);

  const handleSubmit = async () => {
    setProcess('Registering, please wait!');

    setIsLoading(true);

    try {
      const username = `${firstName}${lastName}`;
      const response = await axios.post(`${API_URL}/api/auth/local/register`, {
        email,
        username,
        password,
        phone,
      });

      if (response && response.data && response.data.status === 200) {
        setUserNames(username);
        console.log(setUserNames);
        setRegistered(true);
      } else {
        Alert.alert('Sign up failure', [
          {
            text: 'OK',
            onPress: () => setIsLoading(false),
          },
        ]);
      }
    } catch (error) {
      console.error(error.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Loader>
        <Text>{process}</Text>
      </Loader>
    );
  }

  if (hasRegistered) {
    return (
      <Loader loader={false}>
        <Text style={[styles.subTitle]}>Registration successful!</Text>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => navigation.navigate('Login')}>
          <Text>Login now</Text>
        </TouchableOpacity>
      </Loader>
    );
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      <View style={styles.logoContainer}>
        <Image
          style={{width: 80, height: 80}}
          source={require('../imgs/logo.png')}
        />
        <Text style={styles.title}>Sign up to become a Mobiklinic CHP.</Text>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.formContainer}>
          <View style={styles.labeled}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.labeled}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.labeled}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              placeholder="Enter phone number"
              value={phone}
              style={styles.input}
              onChangeText={setPhone}
              keyboardType="numeric"
              placeholderTextColor="grey"
            />
          </View>
          <View style={styles.labeled}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>

          <View style={styles.labeled}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="grey"
              style={styles.input}
              secureTextEntry={true}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleSubmit}>
            <Text style={styles.whiteText}>Sign Up</Text>
            <Icon
              name="arrow-right"
              size={20}
              strokeSize={3}
              color={COLORS.BLACK}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkItem}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  body: {
    paddingTop: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GREY,
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_LOW,
    borderRadius: 18,
    paddingHorizontal: 20,
    // marginBottom: 15,
    // width: 35,
    // height: 20,
    flex: 1, // Allow the input to expand and fill the available space
    // height: 50,
  },
  picker: {
    flex: 1,
    height: 50,
    width: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexGrow: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: DIMENS.FORM.PADDING,
  },
  title: {
    color: COLORS.PRIMARY,
    fontSize: 17,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: DIMENS.PADDING,
  },
  subTitle: {
    color: COLORS.SECONDARY,
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  textColor: {
    color: COLORS.WHITE_LOW,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  labeled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_LOW,
    borderRadius: 18,
    paddingHorizontal: 15,
    marginBottom: 15,
    // fontFamily: 'Roboto',
    color: COLORS.BLACK,
    // marginHorizontal: 15,
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
  input: {
    flex: 2,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    paddingLeft: 10,
    fontSize: 16,
  },
  btn: {
    padding: DIMENS.PADDING,
  },
  errorMsg: {
    color: COLORS.ERRORS,
  },
  alignError: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  btn: {
    padding: DIMENS.PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 12,
    // marginHorizontal: 15,
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
    // fontWeight: 'bold',
    paddingHorizontal: 15,
    fontSize: 18,
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
    marginHorizontal: 15,
    height: 55,
    width: 338,
  },
});
