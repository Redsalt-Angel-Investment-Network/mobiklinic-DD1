import {useFormik} from 'formik';
import * as Yup from 'yup';
import React, {useState, useContext, useEffect} from 'react';
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
import {Picker} from '@react-native-picker/picker';
import {CustomStatusBar} from '../ui/custom.status.bar';
import Loader from '../ui/loader';

import {COLORS, DIMENS} from '../constants/styles';
import {API_URL} from '@env';
import axios from 'axios';
import DataResultsContext from '../contexts/DataResultsContext';
import {countryData} from '../simprints/country.selector';

const SignUp = ({navigation}) => {
  const {setUserNames} = useContext(DataResultsContext);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRegistered, setRegistered] = useState(false);
  const [process, setProcess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Generate random email if user doesn't provide one
  const generateRandomEmail = () => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    return `user${randomId}${timestamp}@mobiklinic.temp`;
  };

  const SignUpSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    username: Yup.string()
      .required('Start with Area Code e.g 2567XXXXXX'),
    email: Yup.string()
      .email('Invalid email address'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    country: Yup.string().required('Country is required'),
  });
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: 'Uganda',
    },
    validationSchema: SignUpSchema,

    onSubmit: async values => {
      setIsLoading(true);
      if (isLoading) {
        return;
      }
      try {
        // Use provided email or generate a random one
        const emailToUse = values.email.trim() || generateRandomEmail();
        
        const response = await axios.post(
          `${API_URL}/api/auth/local/register`,
          {
            email: emailToUse,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
            username: values.username,
            country: values.country,
          },
        );

        if (response.status === 200) {
          setRegistered(true);
          navigation.navigate('Login');
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
        const errorMessage =
          error.response.data && error.response.data.message
            ? error.response.data.message.join(', ')
            : 'Registration failed. Please try again.';

        Alert.alert('Sign up failure', errorMessage, [
          {
            text: 'OK',
            onPress: () => setIsLoading(false),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
  });
  const {values, touched, errors, handleChange, handleBlur, handleSubmit} =
    formik;

  if (isLoading) return <Loader />;

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
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>
          {touched.firstName && errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}

          <View style={styles.labeled}>
            <Text style={styles.label}>Last Name:</Text>
            <TextInput
              placeholder="Enter your last name"
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>
          {touched.lastName && errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}

          <View style={styles.labeled}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              placeholder="eg 256785XXXXXX"
              value={values.username}
              style={styles.input}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              keyboardType="phone-pad"
              placeholderTextColor="grey"
            />
          </View>
          {touched.username && errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}
          <View style={styles.labeled}>
            <Text style={styles.label}>Email (Optional):</Text>
            <TextInput
              placeholder="Enter your email address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              style={styles.input}
              placeholderTextColor="grey"
            />
          </View>
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={styles.labeled}>
            <Text style={styles.label}>Country:</Text>
            <Picker
              selectedValue={values.country}
              onValueChange={handleChange('country')}
              style={[styles.input, {color: COLORS.BLACK}]}
              dropdownIconColor={COLORS.GREY}>
              {countryData.map(country => (
                <Picker.Item
                  key={country.name}
                  label={country.name}
                  value={country.name}
                />
              ))}
            </Picker>
          </View>
          {touched.country && errors.country && (
            <Text style={styles.errorText}>{errors.country}</Text>
          )}

          <View style={styles.labeled}>
            <Text style={styles.label}>Password:</Text>
            <TextInput
              placeholder="Enter Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              placeholderTextColor="grey"
              style={styles.input}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.BLACK}
              />
            </TouchableOpacity>
          </View>
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <View style={styles.labeled}>
            <Text style={styles.label}>Confirm Password:</Text>
            <TextInput
              placeholder="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              placeholderTextColor="grey"
              style={styles.input}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.BLACK}
              />
            </TouchableOpacity>
          </View>
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

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
  errorText: {
    color: 'red',
    paddingBottom: 5,
  },
});
