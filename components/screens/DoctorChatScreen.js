import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../constants/styles';
import { CustomStatusBar } from '../ui/custom.status.bar';
import ChatService from '../services/ChatService';
import SocketService from '../services/SocketService';
import { AuthContext } from '../contexts/auth';

const DoctorChatScreen = ({ route, navigation }) => {
  const { patientPhone, patientName, chatRoomId } = route.params;
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [patientTyping, setPatientTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    // Join the chat room
    SocketService.joinRoom(chatRoomId);
    
    // Mark messages as read when doctor opens the chat
    markMessagesAsRead();

    return () => {
      SocketService.leaveRoom(chatRoomId);
    };
  }, []);

  const setupSocketListeners = () => {
    // Listen for new messages
    SocketService.onNewMessage((message) => {
      if (message.chatRoomId === chatRoomId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    SocketService.onTyping((data) => {
      if (data.roomId === chatRoomId && data.userPhone === patientPhone) {
        setPatientTyping(true);
      }
    });

    SocketService.onStopTyping((data) => {
      if (data.roomId === chatRoomId && data.userPhone === patientPhone) {
        setPatientTyping(false);
      }
    });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await ChatService.getMessages(user.phoneNumber, patientPhone);
      setMessages(messagesData);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await ChatService.markAsRead(chatRoomId, user.phoneNumber);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderPhone: user.phoneNumber,
      receiverPhone: patientPhone,
      message: newMessage.trim(),
      chatRoomId: chatRoomId,
      senderType: 'doctor',
      timestamp: new Date().toISOString(),
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    scrollToBottom();

    try {
      // Send to server
      await ChatService.sendMessage(messageData);
      
      // Send via socket for real-time delivery
      SocketService.sendMessage(messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (text.length > 0 && !typing) {
      setTyping(true);
      SocketService.emitTyping(chatRoomId, user.phoneNumber);
    } else if (text.length === 0 && typing) {
      setTyping(false);
      SocketService.emitStopTyping(chatRoomId, user.phoneNumber);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item, index }) => {
    const isFromDoctor = item.senderPhone === user.phoneNumber;
    const isLastMessage = index === messages.length - 1;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isFromDoctor ? styles.doctorMessage : styles.patientMessage,
          isLastMessage && styles.lastMessage
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isFromDoctor ? styles.doctorBubble : styles.patientBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isFromDoctor ? styles.doctorMessageText : styles.patientMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isFromDoctor ? styles.doctorMessageTime : styles.patientMessageTime,
            ]}
          >
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!patientTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>{patientName} is typing...</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <CustomStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Icon name="user" size={20} color={COLORS.WHITE} />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientStatus}>Patient</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Icon name="phone" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <View style={styles.messagesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => `${item.id || index}`}
            renderItem={renderMessage}
            style={styles.messagesList}
            onContentSizeChange={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {renderTypingIndicator()}
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.GRAY}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Icon 
              name="send" 
              size={20} 
              color={newMessage.trim() ? COLORS.WHITE : COLORS.GRAY} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  callButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.GRAY,
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 2,
  },
  doctorMessage: {
    alignItems: 'flex-end',
  },
  patientMessage: {
    alignItems: 'flex-start',
  },
  lastMessage: {
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doctorBubble: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 5,
  },
  patientBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  doctorMessageText: {
    color: COLORS.WHITE,
  },
  patientMessageText: {
    color: COLORS.BLACK,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  doctorMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  patientMessageTime: {
    color: COLORS.GRAY,
    textAlign: 'left',
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  typingText: {
    color: COLORS.GRAY,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
  },
  sendButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
});

export default DoctorChatScreen;
