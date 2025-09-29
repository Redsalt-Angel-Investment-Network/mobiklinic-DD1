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
  Linking,
} from 'react-native';
import axios from 'axios';
import {URLS} from '../constants/API';
import CopyRight from '../copyright';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';
import {API_URL} from '@env';

const ForgotPassword = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleResetPassword = async () => {
    try {
      // Log the phone number before sending the request
      console.log('Phone Number Sent to Database:', phoneNumber);
      await axios.post(`${API_URL}/auth/forgot-password`, {
        phone: phoneNumber,
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

  const openWhatsApp = () => {
    const phoneNumber = '256784528444'; // Remove + and leading zeros
    const message = 'Hello, I need help changing my MobiKlinic password.';
    
    // Try multiple URL formats for better compatibility
    const urls = [
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
    ];
    
    const tryOpenURL = async (urlIndex = 0) => {
      if (urlIndex >= urls.length) {
        Alert.alert(
          'Unable to open WhatsApp', 
          'Please make sure WhatsApp is installed and try again, or contact support directly at +256784528444'
        );
        return;
      }
      
      try {
        const canOpen = await Linking.canOpenURL(urls[urlIndex]);
        if (canOpen) {
          await Linking.openURL(urls[urlIndex]);
        } else {
          // Try next URL format
          tryOpenURL(urlIndex + 1);
        }
      } catch (error) {
        console.error(`Error with URL ${urls[urlIndex]}:`, error);
        // Try next URL format
        tryOpenURL(urlIndex + 1);
      }
    };
    
    tryOpenURL();
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
          Enter your phone number
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor={COLORS.GREY}
            value={phoneNumber}
            style={styles.fullInput}
            onChangeText={text => setPhoneNumber(text)}
            keyboardType="phone-pad"
          />
        </View>
        <TouchableOpacity style={styles.submit} onPress={handleResetPassword}>
          <Text style={styles.submitText}>Reset Password</Text>
        </TouchableOpacity>
        
        <View style={styles.contactContainer}>
          <Text style={styles.orText}>Or</Text>
          <Text style={styles.contactText}>
            Contact Mobiklinic Tech team on WhatsApp
          </Text>
          <TouchableOpacity onPress={openWhatsApp} style={styles.whatsappButton}>
            <Text style={styles.phoneNumber}>+256784528444</Text>
          </TouchableOpacity>
          <Text style={styles.contactSubText}>to change your password</Text>
        </View>
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
  contactContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  orText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.BLACK,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  contactSubText: {
    fontSize: 14,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginTop: 10,
  },
  whatsappButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#25D366',
    borderRadius: 8,
    marginVertical: 5,
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  fullInput: {
    flex: 1,
    color: COLORS.BLACK,
    fontWeight: 'medium',
    fontSize: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});
