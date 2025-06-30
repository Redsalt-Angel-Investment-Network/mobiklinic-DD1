import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, DIMENS } from '../constants/styles';
import { CustomStatusBar } from '../ui/custom.status.bar';
import CustomHeader from '../parts/custom-header';
import CopyRight from '../copyright';
import ChatService from '../services/ChatService';
import SocketService from '../services/SocketService';
import { AuthContext } from '../contexts/auth';

const DoctorDashboard = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  useEffect(() => {
    initializeDoctor();
    loadChatRooms();
    
    // Setup socket connection
    const socket = SocketService.connect();
    
    // Listen for new messages
    SocketService.onNewMessage((message) => {
      // Update chat room list when new message arrives
      loadChatRooms();
    });

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const initializeDoctor = () => {
    // Set doctor as online when dashboard loads
    updateDoctorStatus(true);
  };

  const updateDoctorStatus = async (isOnline) => {
    try {
      // You'll need to implement this API endpoint
      // await ChatService.updateDoctorStatus(user.phoneNumber, isOnline);
      setOnlineStatus(isOnline);
    } catch (error) {
      console.error('Error updating doctor status:', error);
    }
  };

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await ChatService.getDoctorChatRooms(user.phoneNumber);
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      Alert.alert('Error', 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const openChat = (chatRoom) => {
    navigation.navigate('DoctorChatScreen', {
      patientPhone: chatRoom.patientPhone,
      patientName: chatRoom.patientName,
      chatRoomId: chatRoom.chatRoomId,
    });
  };

  const toggleOnlineStatus = () => {
    const newStatus = !onlineStatus;
    updateDoctorStatus(newStatus);
  };

  const renderChatRoom = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRoomCard}
      onPress={() => openChat(item)}
    >
      <View style={styles.patientInfo}>
        <View style={styles.avatarContainer}>
          <Icon name="user" size={24} color={COLORS.WHITE} />
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.lastMessageTime).toLocaleTimeString()}
          </Text>
        </View>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Icon name="message-circle" size={24} color={COLORS.PRIMARY} />
        <Text style={styles.statNumber}>{chatRooms.length}</Text>
        <Text style={styles.statLabel}>Total Chats</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="users" size={24} color={COLORS.PRIMARY} />
        <Text style={styles.statNumber}>
          {chatRooms.filter(room => room.unreadCount > 0).length}
        </Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
      <View style={styles.statCard}>
        <Icon name="clock" size={24} color={COLORS.PRIMARY} />
        <Text style={styles.statNumber}>
          {chatRooms.reduce((total, room) => total + room.unreadCount, 0)}
        </Text>
        <Text style={styles.statLabel}>Unread</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="menu" size={25} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Dashboard</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: onlineStatus ? COLORS.SUCCESS : COLORS.DANGER }]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.statusText}>
            {onlineStatus ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome, Dr. {user?.firstName || 'Doctor'}!
        </Text>
        <Text style={styles.welcomeSubtext}>
          Manage your patient conversations and consultations
        </Text>
      </View>

      {/* Stats */}
      {renderStats()}

      {/* Chat Rooms List */}
      <View style={styles.chatSection}>
        <Text style={styles.sectionTitle}>Patient Conversations</Text>
        {chatRooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="message-circle" size={48} color={COLORS.GRAY} />
            <Text style={styles.emptyText}>No patient conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Patients will appear here when they start a conversation with you
            </Text>
          </View>
        ) : (
          <FlatList
            data={chatRooms}
            keyExtractor={(item) => item.chatRoomId}
            renderItem={renderChatRoom}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <CopyRight />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: COLORS.GRAY,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.WHITE,
    padding: 20,
    marginBottom: 10,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  chatSection: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
  },
  chatRoomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  chatInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.LIGHT_GRAY,
  },
  unreadBadge: {
    backgroundColor: COLORS.DANGER,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.GRAY,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.LIGHT_GRAY,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default DoctorDashboard;
