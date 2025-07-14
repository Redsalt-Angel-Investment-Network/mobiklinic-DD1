import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
  StatusBar,
  Keyboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import {COLORS} from '../constants/styles';
import ChatService from '../services/ChatService';
import SocketService from '../services/SocketService';
import FlashMessage, {showMessage} from 'react-native-flash-message';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {doctorPhone, doctorName, userPhone, userName} = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [doctorTyping, setDoctorTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const chatRoomId = ChatService.generateChatRoomId(userPhone, doctorPhone);

  useEffect(() => {
    fetchMessages();
    setupSocketListeners();
    
    // Join the chat room
    SocketService.joinRoom(chatRoomId);
    
    // Keyboard listeners - Simple approach
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollToBottom(), 200);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    // Screen dimension listener
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setScreenHeight(window.height);
    });
    
    return () => {
      SocketService.leaveRoom(chatRoomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      subscription?.remove();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesData = await ChatService.getMessages(userPhone, doctorPhone);
      // Add null check before sorting
      const sortedMessages = (messagesData || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sortedMessages);
      
      // Mark messages as read
      await ChatService.markAsRead(chatRoomId, userPhone);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to load messages',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    SocketService.onNewMessage((newMessage) => {
      if (newMessage && newMessage.chatRoomId === chatRoomId) {
        setMessages(prevMessages => [...(prevMessages || []), newMessage]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    SocketService.onTyping((data) => {
      if (data && data.roomId === chatRoomId && data.userPhone === doctorPhone) {
        setDoctorTyping(true);
      }
    });

    SocketService.onStopTyping((data) => {
      if (data && data.roomId === chatRoomId && data.userPhone === doctorPhone) {
        setDoctorTyping(false);
      }
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageData = {
      message: inputText.trim(),
      senderPhone: userPhone,
      receiverPhone: doctorPhone,
      senderType: 'user',
      chatRoomId,
    };

    // Optimistically add message to UI
    const tempMessage = {
      ...messageData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      sending: true,
    };

    setMessages(prevMessages => [...(prevMessages || []), tempMessage]);
    setInputText('');
    scrollToBottom();

    try {
      // Send message to server
      const sentMessage = await ChatService.sendMessage(messageData);
      
      // Update the temp message with server response
      setMessages(prevMessages =>
        (prevMessages || []).map(msg =>
          msg.id === tempMessage.id ? {...sentMessage, sending: false, sent: true} : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark message as failed
      setMessages(prevMessages =>
        (prevMessages || []).map(msg =>
          msg.id === tempMessage.id ? {...msg, sending: false, failed: true} : msg
        )
      );
      
      // Store message locally for retry
      await ChatService.storeMessageLocally(messageData);
      
      showMessage({
        message: 'Message not sent',
        description: 'Message saved locally. Will retry when online.',
        type: 'warning',
      });
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      try {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      } catch (error) {
        console.log('Scroll error (non-critical):', error);
      }
    }, 100);
  };

  const handleInputChange = (text) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      SocketService.emitTyping(chatRoomId, userPhone);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      SocketService.emitStopTyping(chatRoomId, userPhone);
    }, 1000);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({item, index}) => {
    if (!item || !item.message) {
      return null;
    }
    
    const isFromUser = item.senderPhone === userPhone;
    const showDate = index === 0 || formatDate(item.createdAt) !== formatDate(messages[index - 1]?.createdAt);
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isFromUser ? styles.userMessage : styles.doctorMessage
        ]}>
          <View style={[
            styles.messageBubble,
            isFromUser ? styles.userBubble : styles.doctorBubble
          ]}>
            <Text style={[
              styles.messageText,
              isFromUser ? styles.userMessageText : styles.doctorMessageText
            ]}>
              {item.message}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[
                styles.timeText,
                isFromUser ? styles.userTimeText : styles.doctorTimeText
              ]}>
                {formatTime(item.createdAt)}
              </Text>
              
              {isFromUser && (
                <View style={styles.messageStatus}>
                  {item.sending && (
                    <Icon name="clock" size={12} color="rgba(255,255,255,0.7)" />
                  )}
                  {item.sent && !item.sending && (
                    <Icon name="check" size={12} color="rgba(255,255,255,0.7)" />
                  )}
                  {item.failed && (
                    <Icon name="alert-circle" size={12} color="#FF5252" />
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!doctorTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.doctorMessage]}>
        <View style={[styles.messageBubble, styles.doctorBubble, styles.typingBubble]}>
          <Text style={styles.typingText}>Dr. {doctorName} is typing...</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.PRIMARY} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.doctorNameHeader}>Dr. {doctorName}</Text>
          <Text style={styles.doctorStatus}>Online</Text>
        </View>
        
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${doctorPhone}`)}>
          <Icon name="phone" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <View style={styles.messagesWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages || []}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContentContainer}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator()}
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
      </View>

      {/* Bottom Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <View style={styles.textInputWrapper}>
            <TextInput
              ref={input => { this.textInput = input; }}
              style={styles.textInput}
              value={inputText}
              onChangeText={handleInputChange}
              placeholder="Type a message"
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
              onFocus={() => {
                setTimeout(() => scrollToBottom(), 100);
              }}
              textAlignVertical="center"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              {backgroundColor: inputText.trim() ? COLORS.PRIMARY : '#BDC3C7'}
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}>
            <Icon name="send" size={18} color={COLORS.WHITE} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <FlashMessage position="top" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', // WhatsApp chat background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  doctorNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  doctorStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  callButton: {
    marginLeft: 16,
    padding: 4,
  },
  messagesWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContentContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateText: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    color: '#666',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageContainer: {
    marginVertical: 1,
    marginHorizontal: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  doctorMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#DCF8C6', // WhatsApp green
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000',
  },
  userMessageText: {
    color: '#000',
  },
  doctorMessageText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    marginRight: 4,
  },
  userTimeText: {
    color: 'rgba(0,0,0,0.5)',
  },
  doctorTimeText: {
    color: 'rgba(0,0,0,0.4)',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  inputWrapper: {
    backgroundColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    maxHeight: 100,
    minHeight: 24,
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default ChatScreen;
