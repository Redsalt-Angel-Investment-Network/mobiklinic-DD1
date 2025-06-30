import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/styles';
import { CustomStatusBar } from '../ui/custom.status.bar';
import ChatService from '../services/ChatService';
import { AuthContext } from '../contexts/auth';
import Loader from '../ui/loader';

const DoctorLogin = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const doctor = await ChatService.loginDoctor(cleanPhone);
      
      if (doctor) {
        // Set doctor as user with role
        const doctorUser = {
          ...doctor,
          role: 'doctor',
          phoneNumber: cleanPhone,
        };
        
        setUser(doctorUser);
        setTokens({ access: 'doctor_token' }); // Simple token for demo
        
        // Navigate to doctor dashboard
        navigation.replace('DoctorDashboard');
      } else {
        Alert.alert('Error', 'Doctor not found. Please check your phone number.');
      }
    } catch (error) {
      console.error('Doctor login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as needed (adjust based on your phone number format)
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    
    return formatted;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Icon name="user-check" size={48} color={COLORS.WHITE} />
          </View>
          <Text style={styles.title}>Doctor Login</Text>
          <Text style={styles.subtitle}>
            Enter your registered phone number to access your dashboard
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color={COLORS.GRAY} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.GRAY}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={15}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader size="small" color={COLORS.WHITE} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Login as Doctor</Text>
                <Icon name="arrow-right" size={20} color={COLORS.WHITE} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have access? Contact your administrator
          </Text>
          <TouchableOpacity
            style={styles.patientLoginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.patientLoginText}>Login as Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
    paddingVertical: 15,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 15,
  },
  patientLoginButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  patientLoginText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default DoctorLogin;
