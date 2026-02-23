import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../constants/styles';
import API_CONFIG from '../config/api';
import {CustomStatusBar} from '../ui/custom.status.bar';

const EmergencyReport = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    fetchEmergencyContact();
  }, []);

  const fetchEmergencyContact = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/emergency-contact`);
      const data = await response.json();
      if (data && data.data) {
        setEmergencyData(data.data.attributes);
      } else {
        // Fallback or handle null case
        setEmergencyData({
            phoneNumber: '+256000000000',
            message: 'In case of an emergency, please tap the toll free number below for immediate assistance.',
            helpTitle: 'Emergency Support'
        });
      }
    } catch (error) {
      console.error('Error fetching emergency contact:', error);
      Alert.alert('Error', 'Unable to fetch emergency contact details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number) => {
    if (!number) return;
    const url = `tel:${number}`;
    Linking.openURL(url).catch((err) => {
      console.error('An error occurred', err);
      Alert.alert(
        'Error',
        'Could not initiate a phone call. Please dial ' + number + ' manually.'
      );
    });
  };

  if (loading) {
    return (
      <View style={STYLES.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={STYLES.wrapper}>
      <CustomStatusBar />
      <View style={STYLES.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={STYLES.headerTitle}>Report Emergency</Text>
      </View>

      <View style={STYLES.content}>
        <View style={STYLES.iconContainer}>
          <MIcon name="alert-circle-outline" size={80} color={COLORS.ERRORS || '#FF0000'} />
        </View>

        <Text style={STYLES.title}>{emergencyData?.helpTitle || 'Emergency Support'}</Text>
        
        <Text style={STYLES.message}>
          {emergencyData?.message || 'In case of an emergency, please tap the toll-free number below to contact our doctors immediately for help.'}
        </Text>

        <TouchableOpacity 
          style={STYLES.callButton}
          onPress={() => handleCall(emergencyData?.phoneNumber)}
        >
          <View style={STYLES.callIconContainer}>
            <Icon name="phone" size={24} color={COLORS.WHITE} />
          </View>
          <Text style={STYLES.phoneNumberText}>{emergencyData?.phoneNumber || 'No number available'}</Text>
        </TouchableOpacity>

        <Text style={STYLES.footerText}>Help is available 24/7</Text>
      </View>
    </View>
  );
};

const STYLES = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.WHITE,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    color: COLORS.BLACK,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  callIconContainer: {
    marginRight: 15,
  },
  phoneNumberText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  footerText: {
    marginTop: 40,
    fontSize: 16,
    color: '#B71C1C',
    fontWeight: 'bold',
    fontStyle: 'italic',
  }
});

export default EmergencyReport;
