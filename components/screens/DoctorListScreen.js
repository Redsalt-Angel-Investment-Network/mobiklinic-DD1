import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {COLORS, DIMENS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import DataResultsContext from '../contexts/DataResultsContext';
import ChatService from '../services/ChatService';
import SocketService from '../services/SocketService';
import FlashMessage, {showMessage} from 'react-native-flash-message';

const DoctorListScreen = () => {
  const navigation = useNavigation();
  const {userLog, userNames} = useContext(DataResultsContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
    
    // Initialize socket connection
    SocketService.connect();
    
    // Listen for doctor status updates
    SocketService.onDoctorStatusUpdate((statusUpdate) => {
      setDoctors(prevDoctors => 
        prevDoctors.map(doctor => 
          doctor.phoneNumber === statusUpdate.phoneNumber
            ? {...doctor, isOnline: statusUpdate.isOnline}
            : doctor
        )
      );
    });

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsData = await ChatService.getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Failed to load doctors',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor) => {
    navigation.navigate('ChatScreen', {
      doctorPhone: doctor.phoneNumber || doctor.contact,
      doctorName: doctor.name,
      userPhone: userLog,
      userName: userNames,
    });
  };

  const handleCallDoctor = (contact) => {
    Linking.openURL(`tel:${contact}`);
  };

  const renderDoctorItem = ({item}) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorInfo}>
        <View style={styles.doctorHeader}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E'},
              ]}
            />
            <Text style={styles.statusText}>
              {item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.doctorSpecialization}>
          {item.specialization || 'General Practitioner'}
        </Text>
        <Text style={styles.doctorHospital}>
          {item.hospital || 'MobiKlinic'}
        </Text>
        <Text style={styles.doctorContact}>
          Contact: {item.contact || item.phoneNumber}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleSelectDoctor(item)}>
          <Icon name="message-circle" size={24} color={COLORS.WHITE} />
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallDoctor(item.contact || item.phoneNumber)}>
          <Icon name="phone" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.buttonText, {color: COLORS.PRIMARY}]}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={styles.headerTitle}>Our Doctors</Text>}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {_header()}
      
      <View style={styles.headerInfo}>
        <Text style={styles.headerInfoText}>
          Choose a doctor to start a conversation
        </Text>
      </View>

      <FlatList
        data={doctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  headerButton: {
    marginHorizontal: 4,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  headerInfo: {
    padding: 15,
    backgroundColor: COLORS.PRIMARY,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
  },
  headerInfoText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: COLORS.WHITE,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfo: {
    marginBottom: 15,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.GREY,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    marginBottom: 4,
  },
  doctorHospital: {
    fontSize: 14,
    color: COLORS.GREY,
    marginBottom: 4,
  },
  doctorContact: {
    fontSize: 12,
    color: COLORS.GREY,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default DoctorListScreen;
