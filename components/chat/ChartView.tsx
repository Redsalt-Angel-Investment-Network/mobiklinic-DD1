import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS, DIMENS} from '../constants/styles';
import CopyRight from '../copyright';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import CustomHeader from '../ui/custom-header';
import {useNavigation} from '@react-navigation/native';

// API function to send message to backend
const sendMessageToAPI = async (doctorName: string, message: string, userName: string) => {
  try {
    const response = await fetch('https://mk-be-strapi-production.up.railway.app/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          doctorName,
          patientName: userName,
          message,
          timestamp: new Date().toISOString(),
        }
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Message sent successfully:', result);
      return result;
    } else {
      console.error('Failed to send message:', response.status);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
  doctorName?: string;
}

// Local storage functions for messages
const saveMessagesToStorage = async (doctorName: string, messages: Message[]) => {
  try {
    const key = `chat_messages_${doctorName}`;
    await AsyncStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to storage:', error);
  }
};

const getMessagesFromStorage = async (doctorName: string): Promise<Message[]> => {
  try {
    const key = `chat_messages_${doctorName}`;
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading messages from storage:', error);
    return [];
  }
};

export function ChatScreen(): JSX.Element {
  const {userLog, userNames} = useContext(DataResultsContext);
  const [activeChat, setActiveChat] = useState<{doctorName: string; doctorId: string} | null>(null);

  const handleChatSelection = (doctorName: string) => {
    setActiveChat({doctorName, doctorId: doctorName});
  };

  return (
    <View style={styles.container}>
      {activeChat ? (
        <ChatRoom
          doctorName={activeChat.doctorName}
          onCloseChat={() => setActiveChat(null)}
        />
      ) : (
        <DoctorList onSelectChat={handleChatSelection} />
      )}
    </View>
  );
}

// Add this additional export for backward compatibility
export const ChatView = ChatScreen;

export function DoctorList({
  onSelectChat,
}: {
  onSelectChat: (doctorName: string) => void;
}) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/doctors',
      );
      const data = await response.json();
      const doctorInfo = data.data.map((doctor: any) => ({
        name: doctor.attributes.name,
        contact: doctor.attributes.contact,
        email: doctor.attributes.email,
      }));
      setDoctors(doctorInfo);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleCallDoctor = (contact: string) => {
    Linking.openURL(`tel:${contact}`);
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
      title={<Text style={styles.title}>Back</Text>}
    />
  );

  return (
    <View style={styles.wrapper}>
      {/* {_header()} */}

      <Text style={styles.userListHeader}>
        Mobiklinic Doctors
      </Text>
      {loading ? (
        <Loader size="large" backgroundColor={COLORS.WHITE} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {doctors.map((doctor, index) => (
            <View key={index}>
              <View style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{doctor.name}</Text>
                  <TouchableOpacity onPress={() => onSelectChat(doctor.name)}>
                    <Icon name="message-circle" size={25} color={'green'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCallDoctor(doctor.contact)}>
                    <Icon name="phone" size={25} color="rgba(0,0,0,.3)" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.contactInfo}>
                  Contact: {doctor.contact}
                </Text>
                <Text style={styles.contactInfo}>Email: {doctor.email}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <CopyRight />
    </View>
  );
}

function ChatRoom({
  doctorName,
  onCloseChat,
}: {
  doctorName: string;
  onCloseChat: () => void;
}) {
  const {userNames} = useContext(DataResultsContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load messages from storage when component mounts
  useEffect(() => {
    loadMessages();
  }, [doctorName]);

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const storedMessages = await getMessagesFromStorage(doctorName);
      
      if (storedMessages.length === 0) {
        // Add initial welcome message if no messages exist
        const welcomeMessage: Message = {
          id: 'welcome_' + Date.now(),
          text: `Hello ${userNames || 'there'}, how can I help you today?`,
          sender: 'doctor',
          timestamp: new Date(),
          doctorName,
        };
        setMessages([welcomeMessage]);
        await saveMessagesToStorage(doctorName, [welcomeMessage]);
      } else {
        setMessages(storedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({animated: true});
        } catch (error) {
          console.log('Scroll error (non-critical):', error);
        }
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const userMessage: Message = {
        id: 'user_' + Date.now(),
        text: newMessage.trim(),
        sender: 'user',
        timestamp: new Date(),
        doctorName,
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      const messageText = newMessage.trim();
      setNewMessage('');
      
      // Save to local storage immediately
      await saveMessagesToStorage(doctorName, updatedMessages);
      
      // Send message to API
      try {
        await sendMessageToAPI(doctorName, messageText, userNames || 'Anonymous');
      } catch (error) {
        console.error('Failed to send message to server:', error);
      }
      
      // Mock doctor response (remove this in production when you have real chat)
      setTimeout(async () => {
        const doctorResponse: Message = {
          id: 'doctor_' + Date.now(),
          text: "Thank you for your message. I'll get back to you shortly.",
          sender: 'doctor',
          timestamp: new Date(),
          doctorName,
        };
        const finalMessages = [...updatedMessages, doctorResponse];
        setMessages(finalMessages);
        await saveMessagesToStorage(doctorName, finalMessages);
      }, 2000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (item: Message, index: number) => {
    if (!item || !item.id || !item.text) return null;
    
    try {
      return (
        <View
          key={`${item.id}_${index}`}
          style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.doctorMessage
          ]}
        >
          <Text style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.doctorMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            item.sender === 'user' ? {color: 'rgba(255,255,255,0.7)'} : {color: 'rgba(0,0,0,0.7)'}
          ]}>
            {item.timestamp ? item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </Text>
        </View>
      );
    } catch (error) {
      console.error('Error rendering message:', error);
      return null;
    }
  };

  if (isLoadingMessages) {
    return (
      <View style={styles.chatRoomContainer}>
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={onCloseChat}>
            <Icon name="arrow-left" size={20} color={COLORS.BLACK} />
          </TouchableOpacity>
          <View>
            <Image
              source={require('../../assets/adaptive-icon.png')} 
              style={styles.avatarIcon}
            />
          </View>
          <Text style={styles.chatRoomTitle}>Dr. {doctorName}</Text>
          <TouchableOpacity>
            <Icon name="phone" size={20} color={COLORS.BLACK} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Loader size="large" backgroundColor={COLORS.WHITE} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.chatRoomContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={onCloseChat}>
          <Icon name="arrow-left" size={20} color={COLORS.BLACK} />
        </TouchableOpacity>
        <View>
          <Image
            source={require('../../assets/adaptive-icon.png')} 
            style={styles.avatarIcon}
          />
        </View>
        <Text style={styles.chatRoomTitle}>Drs. {doctorName}</Text>
        <TouchableOpacity>
          <Icon name="phone" size={20} color={COLORS.BLACK} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
      >
        {messages.map((message, index) => {
          if (!message) return null;
          return renderMessage(message, index);
        })}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Sending...</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message..."
          placeholderTextColor={COLORS.GREY}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (newMessage.trim() && !isLoading) ? styles.sendButtonActive : styles.sendButtonInactive
          ]} 
          onPress={sendMessage}
          disabled={!newMessage.trim() || isLoading}
        >
          <Icon 
            name={isLoading ? "clock" : "send"} 
            size={20} 
            color={newMessage.trim() && !isLoading ? COLORS.WHITE : COLORS.GREY} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  userListHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    color: COLORS.PRIMARY,
    textDecorationLine: 'underline',
  },
  scrollViewContent: {
    paddingHorizontal: 10,
  },
  userItem: {
    marginBottom: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    color: COLORS.BLACK,
    opacity: 0.8,
    fontWeight: 'bold',
  },
  chatRoomContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatRoomTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.BLACK,
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'bold',
    opacity: 0.5,
    alignContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    color: COLORS.BLACK,
    fontSize: 14,
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.WHITE,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    alignItems: 'center',
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    justifyContent: 'space-between',
  },
  avatarIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginHorizontal: 18,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.BLACK,
    opacity: 0.6,
    marginTop: 10,
  },
  
  // Chat message styles
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 5,
  },
  doctorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.WHITE,
  },
  doctorMessageText: {
    color: COLORS.BLACK,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  
  // Typing indicator
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  typingText: {
    fontSize: 14,
    color: COLORS.BLACK,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  
  // Input container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: COLORS.WHITE,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  sendButtonInactive: {
    backgroundColor: '#f0f0f0',
  },
});

export default ChatScreen; // Default export for backward compatibility

