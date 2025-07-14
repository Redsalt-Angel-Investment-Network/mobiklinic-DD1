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
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const chatRoomId = ChatService.generateChatRoomId(userPhone, doctorPhone);

  useEffect(() => {
    fetchMessages();
    setupSocketListeners();
    
    // Join the chat room
    SocketService.joinRoom(chatRoomId);
    
    return () => {
      SocketService.leaveRoom(chatRoomId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      
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

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages || []}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator()}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={null}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.GREY}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            {backgroundColor: inputText.trim() ? COLORS.PRIMARY : COLORS.GREY}
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}>
          <Icon name="send" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>
      
      <FlashMessage position="top" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  callButton: {
    marginLeft: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    color: COLORS.BLACK,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  doctorMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#DCF8C6', // WhatsApp user message color
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.BLACK,
  },
  doctorMessageText: {
    color: COLORS.BLACK,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    marginRight: 4,
  },
  userTimeText: {
    color: 'rgba(0,0,0,0.6)',
  },
  doctorTimeText: {
    color: 'rgba(0,0,0,0.5)',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.GREY,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHTER,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: COLORS.WHITE,
    color: COLORS.BLACK,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;
