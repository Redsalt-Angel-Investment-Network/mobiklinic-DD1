import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {CustomStatusBar} from '../ui/custom.status.bar';
import Loader from '../ui/loader';
import {COLORS, DIMENS} from '../constants/styles';
import {Picker} from '@react-native-picker/picker';
import {validateUgandaPhoneNumber} from '../helpers/validation';
import {URLS} from '../constants/API';
import PhoneInput from 'react-native-phone-number-input';
import {API_URL} from '@env';

const areaCodes = [
  {label: '+256', value: '+256'},
  {label: '+257', value: '+257'},
  {label: '+254', value: '+254'},
  {label: '+255', value: '+255'},
];

const SignUp = ({navigation}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    eMail: '',
    password: '',
    cPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setRegistered] = useState(false);
  const [process, setProcess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const signUp = async () => {
    setProcess('Registering, please wait!');
    const formattedPhoneNumber = formData.phoneNumber;

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.password ||
      !formData.cPassword
    ) {
      Alert.alert('Error', 'Please fill in the required fields correctly!', [
        {
          text: 'OK',
          onPress: () => setIsLoading(false),
        },
      ]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
          phone: formattedPhoneNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.eMail,
          password: formData.password,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          Accept: 'application.json',
        },
      });

      const data = await response.json();

      if (data.message === 'Signup successful') {
        setRegistered(true);
      } else if (data.message === 'Phone number already exists') {
        // Display a specific error message when the phone number already exists
        Alert.alert(
          'Sign up failure',
          'Phone number already exists. Please use a different phone number.',
          [
            {
              text: 'OK',
              onPress: () => setIsLoading(false),
            },
          ],
        );
      } else {
        Alert.alert('Sign up failure', 'Phone number already exists', [
          {
            text: 'OK',
            onPress: () => setIsLoading(false),
          },
        ]);
      }
    } catch (err) {
      console.log(err.message);
      Alert.alert(
        'Failure',
        'Something went wrong. Check your internet and try again!',
        [
          {
            text: 'OK',
            onPress: () => setIsLoading(false),
          },
        ],
      );
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
          <View>
            <Text style={styles.errorMsg}>{phoneError}</Text>
          </View>
          <View style={styles.labeled}>
            <Text style={styles.label}>First Name:</Text>
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholderTextColor="grey"
              selectionColor={COLORS.SECONDARY}
              onChangeText={firstName => setFormData({...formData, firstName})}
              value={formData.firstName}
              placeholder="Enter First name"
            />
          </View>
          <View style={styles.labeled}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholderTextColor="grey"
              selectionColor={COLORS.SECONDARY}
              onChangeText={lastName => setFormData({...formData, lastName})}
              value={formData.lastName}
              placeholder="Enter Last name"
            />
          </View>
          <View style={styles.labeled}>
            <Text style={styles.label}>Email Address:</Text>
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholderTextColor="grey"
              selectionColor={COLORS.SECONDARY}
              onChangeText={eMail => setFormData({...formData, eMail})}
              value={formData.eMail}
              keyboardType="email-address"
              placeholder="Enter Email"
            />
          </View>
          <View>
            <PhoneInput
              placeholder="Phone Number"
              defaultCode="UG"
              layout="first"
              containerStyle={[
                styles.phoneInputContainer,
                {backgroundColor: COLORS.WHITE_LOW},
              ]}
              textInputStyle={{color: 'black', paddingVertical: 10}}
              placeholderTextColor="grey"
              style={styles.phoneInput}
              textContainerStyle={styles.phoneInput}
              textInputProps={{
                style: styles.phoneInput,
                placeholderTextColor: 'grey',
                height: 40,
                backgroundColor: 'rgba(255, 255, 255, 0)',

                // placeholderTextColor: 'grey',
              }}
              dropdownImageStyle={styles.dropdownImage}
              onChangeText={text =>
                setFormData({...formData, phoneNumber: text})
              }
            />
          </View>
          {phoneError !== '' && (
            <Text style={[styles.alignError, styles.errorMsg]}>
              {phoneError}
            </Text>
          )}
          <View style={styles.labeled}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              style={styles.input}
              password={true}
              secureTextEntry={true}
              autoCorrect={false}
              placeholderTextColor="grey"
              selectionColor={COLORS.SECONDARY}
              onChangeText={password => setFormData({...formData, password})}
              value={formData.password}
              placeholder="Enter Password"
            />
          </View>
          <View style={styles.labeled}>
            <Text style={styles.label}>Confirm :</Text>
            <TextInput
              style={styles.input}
              password={true}
              secureTextEntry={true}
              autoCorrect={false}
              placeholderTextColor="grey"
              selectionColor={COLORS.SECONDARY}
              onChangeText={cPassword => {
                setFormData({...formData, cPassword});
                if (formData.password !== cPassword) {
                  setPasswordError('Make sure passwords match.');
                } else {
                  setPasswordError('');
                }
              }}
              value={formData.cPassword}
              placeholder="Enter Password again"
            />
          </View>
          {passwordError !== '' && (
            <Text style={[styles.alignError, styles.errorMsg]}>
              {passwordError}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => signUp()}>
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

const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: COLORS.WHITE,
  },
  body: {
    // flex: 1,
    paddingTop: 50,
    // paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.GREY,
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_LOW,
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginHorizontal: 15,
    width: 35,
    height: 20,
    flex: 1, // Allow the input to expand and fill the available space
    height: 50,
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
    color: COLORS.BLACK,
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.BLACK,
  },
  labeled: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: 15,
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
    marginVertical: 10,
    marginHorizontal: 15,
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
    marginHorizontal: 15,
    height: 55,
    width: 338,
  },
});

export default SignUp;
