import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/styles';
import { CustomStatusBar } from '../ui/custom.status.bar';

const RoleSelection = ({ navigation }) => {
  const handlePatientLogin = () => {
    navigation.navigate('Login');
  };

  const handleDoctorLogin = () => {
    navigation.navigate('DoctorLogin');
  };

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MobiKlinic</Text>
          <Text style={styles.subtitle}>Choose your role to continue</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {/* Patient Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={handlePatientLogin}
            activeOpacity={0.7}
          >
            <View style={[styles.roleIcon, { backgroundColor: COLORS.PRIMARY }]}>
              <Icon name="user" size={40} color={COLORS.WHITE} />
            </View>
            <Text style={styles.roleTitle}>Patient</Text>
            <Text style={styles.roleDescription}>
              Access your health records, book appointments, and chat with doctors
            </Text>
            <View style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Continue as Patient</Text>
              <Icon name="arrow-right" size={16} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>

          {/* Doctor Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={handleDoctorLogin}
            activeOpacity={0.7}
          >
            <View style={[styles.roleIcon, { backgroundColor: COLORS.SUCCESS }]}>
              <MIcon name="doctor" size={40} color={COLORS.WHITE} />
            </View>
            <Text style={styles.roleTitle}>Doctor</Text>
            <Text style={styles.roleDescription}>
              Manage patient conversations, consultations, and medical records
            </Text>
            <View style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Continue as Doctor</Text>
              <Icon name="arrow-right" size={16} color={COLORS.SUCCESS} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact support at support@mobiklinic.com
          </Text>
        </View>
      </View>
    </View>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  roleCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginRight: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.LIGHT_GRAY,
    textAlign: 'center',
  },
});

export default RoleSelection;
