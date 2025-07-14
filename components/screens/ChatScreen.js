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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import {COLORS} from '../constants/styles';
import ChatService from '../services/ChatService';
import SocketService from '../services/SocketService';
import FlashMessage, {showMessage} from 'react-native-flash-message';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {doctorPhone, doctorName, userPhone, userName} = route.params || {};
  
  // Validate required parameters
  if (!doctorPhone || !userPhone) {
    console.error('Missing required route parameters:', {doctorPhone, userPhone, doctorName, userName});
    return (
      <View style={styles.container}>
        <Text>Error: Missing chat parameters</Text>
      </View>
    );
  }

  console.log('All route params:', route.params);
  console.log('Route params validation:', {
    doctorPhone: doctorPhone,
    doctorName: doctorName,
    userPhone: userPhone,
    userName: userName,
    userPhoneLength: userPhone?.length,
    doctorPhoneLength: doctorPhone?.length
  });
  
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
  console.log('Chat room ID:', chatRoomId);
  console.log('User phone:', userPhone);
  console.log('Doctor phone:', doctorPhone);

  // Create additional storage keys for fallback
  const alternativeStorageKeys = [
    `chat_messages_${chatRoomId}`,
    `chat_messages_${doctorPhone}-${userPhone}`,
    `chat_messages_${userPhone}-${doctorPhone}`,
    `chat_messages_${doctorPhone}`,
    // In case userPhone was different before
    `chat_messages_+256785796401-+256${userPhone}`,
    `chat_messages_+256${userPhone}-+256785796401`
  ];
  console.log('Will try storage keys:', alternativeStorageKeys);

  // ===== LOCAL STORAGE HELPERS =====
  // These functions handle message persistence to AsyncStorage for offline access
  // Messages are stored per chat room and automatically synced with server data
  
  // Local storage helpers
  const getStorageKey = () => {
    const key = `chat_messages_${chatRoomId}`;
    console.log('Storage key:', key);
    return key;
  };
  
  const saveMessagesToStorage = async (messagesToSave) => {
    try {
      const storageKey = getStorageKey();
      console.log('Saving messages to storage:', messagesToSave.length, 'key:', storageKey);
      await AsyncStorage.setItem(storageKey, JSON.stringify(messagesToSave));
      console.log('Messages saved successfully');
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  };

  const loadMessagesFromStorage = async () => {
    try {
      const storageKey = getStorageKey();
      console.log('Loading messages from storage, key:', storageKey);
      const storedMessages = await AsyncStorage.getItem(storageKey);
      const messages = storedMessages ? JSON.parse(storedMessages) : [];
      console.log('Loaded messages from storage:', messages.length);
      return messages;
    } catch (error) {
      console.error('Error loading messages from storage:', error);
      return [];
    }
  };

  const clearStoredMessages = async () => {
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing stored messages:', error);
    }
  };

  // Debug function to check all stored data
  const debugStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);
      
      const chatKeys = allKeys.filter(key => key.startsWith('chat_messages_'));
      console.log('Chat message keys:', chatKeys);
      
      for (const key of chatKeys) {
        const data = await AsyncStorage.getItem(key);
        const messages = data ? JSON.parse(data) : [];
        console.log(`Messages in ${key}:`, messages.length);
      }
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  };

  useEffect(() => {
    // Debug storage on mount
    debugStorage();
    
    initializeChat();
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

  // Clear stored messages (optional feature for privacy/storage management)
  const clearChatHistory = async () => {
    try {
      setLoading(true);
      console.log('Clearing chat history for:', chatRoomId);
      await clearStoredMessages();
      setMessages([]); // Clear messages from UI
      showMessage({
        message: 'Messages cleared',
        description: 'Chat history has been cleared from local storage',
        type: 'success',
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to clear chat history',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize chat by loading from storage first, then syncing with server
  const initializeChat = async () => {
    try {
      // Load messages from local storage first for instant display
      const cachedMessages = await loadMessagesFromStorage();
      console.log('Loaded cached messages:', cachedMessages.length);
      
      // If no messages found with current key, try alternative keys
      let alternativeMessages = [];
      if (cachedMessages.length === 0) {
        console.log('No cached messages found, trying alternative storage keys...');
        alternativeMessages = await tryAlternativeStorageKeys();
        if (alternativeMessages.length > 0) {
          console.log('Found messages in alternative storage:', alternativeMessages.length);
          setMessages(alternativeMessages);
          // Save to current storage key for future use
          await saveMessagesToStorage(alternativeMessages);
          setTimeout(() => scrollToBottom(), 100);
        }
      } else {
        setMessages(cachedMessages);
        setTimeout(() => scrollToBottom(), 100);
      }
      
      // Then fetch fresh messages from server and merge with cached
      await fetchAndMergeMessages(cachedMessages.length > 0 ? cachedMessages : alternativeMessages);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Fallback to server-only fetch
      await fetchMessages();
    }
  };

  // Try alternative storage keys in case the chatRoomId generation changed
  const tryAlternativeStorageKeys = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All storage keys:', allKeys);
      
      // First try our predefined alternative keys
      for (const alternativeKey of alternativeStorageKeys) {
        if (allKeys.includes(alternativeKey)) {
          try {
            const data = await AsyncStorage.getItem(alternativeKey);
            const messages = data ? JSON.parse(data) : [];
            if (messages.length > 0) {
              console.log(`Found ${messages.length} messages in predefined key: ${alternativeKey}`);
              console.log('Sample message:', messages[0]);
              return messages;
            }
          } catch (error) {
            console.error(`Error reading predefined key ${alternativeKey}:`, error);
          }
        }
      }
      
      // If predefined keys don't work, search all chat keys
      const chatKeys = allKeys.filter(key => 
        key.startsWith('chat_messages_') && 
        (key.includes(userPhone) || key.includes(doctorPhone) || 
         key.includes('256785796401') || key.includes('88'))
      );
      
      console.log('Found alternative chat keys:', chatKeys);
      console.log('Looking for keys containing:', {userPhone, doctorPhone});
      
      for (const key of chatKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          const messages = data ? JSON.parse(data) : [];
          console.log(`Key: ${key} has ${messages.length} messages`);
          if (messages.length > 0) {
            console.log(`Found ${messages.length} messages in key: ${key}`);
            console.log('Sample message:', messages[0]);
            return messages;
          }
        } catch (error) {
          console.error(`Error reading key ${key}:`, error);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error trying alternative storage keys:', error);
      return [];
    }
  };

  // Fetch messages from server and merge with existing cached messages
  const fetchAndMergeMessages = async (cachedMessages = []) => {
    try {
      console.log('Calling ChatService.getMessages with:', {userPhone, doctorPhone});
      const messagesData = await ChatService.getMessages(userPhone, doctorPhone);
      console.log('Raw server response:', messagesData);
      
      // Check if the response indicates an error
      if (!messagesData) {
        console.warn('Server returned null/undefined for messages');
      }
      
      const serverMessages = (messagesData || []);
      console.log('Server messages:', serverMessages.length);
      console.log('Cached messages:', cachedMessages.length);
      
      // If server returns no messages but we have cached messages, prefer cached
      if (serverMessages.length === 0 && cachedMessages.length > 0) {
        console.log('Server has no messages, keeping cached messages');
        setMessages(cachedMessages);
        await saveMessagesToStorage(cachedMessages);
        return;
      }
      
      // Create a map of existing cached messages by ID for faster lookup
      const cachedMessageMap = new Map();
      cachedMessages.forEach(msg => {
        if (msg.id) {
          cachedMessageMap.set(msg.id.toString(), msg);
        }
      });
      
      // Merge server messages with cached messages, preserving local-only messages
      const mergedMessages = [...cachedMessages];
      
      serverMessages.forEach(serverMsg => {
        const existingIndex = mergedMessages.findIndex(cachedMsg => {
          // Try to match by ID first
          if (cachedMsg.id && serverMsg.id && cachedMsg.id.toString() === serverMsg.id.toString()) {
            return true;
          }
          
          // If no ID match, try to match by message content and timestamp (for temp messages)
          if (cachedMsg.message === serverMsg.message && 
              cachedMsg.senderPhone === serverMsg.senderPhone) {
            const timeDiff = Math.abs(new Date(cachedMsg.createdAt) - new Date(serverMsg.createdAt));
            return timeDiff < 10000; // 10 second tolerance
          }
          
          return false;
        });
        
        if (existingIndex >= 0) {
          // Update existing message with server data but preserve the structure
          mergedMessages[existingIndex] = {
            ...mergedMessages[existingIndex], // Keep cached message structure
            ...serverMsg, // Apply server updates
            sending: false,
            sent: true,
            failed: false
          };
        } else {
          // Add new message from server if it doesn't exist in cache
          mergedMessages.push({
            ...serverMsg,
            sending: false,
            sent: true,
            failed: false
          });
        }
      });
      
      // Sort by creation date
      const sortedMessages = mergedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Remove any potential duplicates based on content and timestamp
      const deduplicatedMessages = [];
      const seenMessages = new Set();
      
      sortedMessages.forEach(msg => {
        const messageKey = `${msg.message}_${msg.senderPhone}_${new Date(msg.createdAt).getTime()}`;
        if (!seenMessages.has(messageKey)) {
          seenMessages.add(messageKey);
          deduplicatedMessages.push(msg);
        }
      });
      
      console.log('Final merged messages:', deduplicatedMessages.length);
      setMessages(deduplicatedMessages);
      
      // Save merged messages to local storage
      await saveMessagesToStorage(deduplicatedMessages);
      
      // Mark messages as read
      await ChatService.markAsRead(chatRoomId, correctedUserPhone);
    } catch (error) {
      console.error('Error fetching and merging messages:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to sync messages',
        type: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages from server (fallback method)
  const fetchMessages = async () => {
    try {
      // Check for invalid userPhone and try to fix it
      let correctedUserPhone = userPhone;
      if (userPhone && userPhone.length < 5) {
        correctedUserPhone = `+256${userPhone}`;
        console.warn(`UserPhone "${userPhone}" seems invalid for fallback API call, trying "${correctedUserPhone}"`);
      }

      const messagesData = await ChatService.getMessages(correctedUserPhone, doctorPhone);
      // Add null check before sorting
      const sortedMessages = (messagesData || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sortedMessages);
      
      // Save to local storage for future use
      await saveMessagesToStorage(sortedMessages);
      
      // Mark messages as read
      await ChatService.markAsRead(chatRoomId, correctedUserPhone);
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
    SocketService.onNewMessage(async (newMessage) => {
      if (newMessage && newMessage.chatRoomId === chatRoomId) {
        setMessages(prevMessages => {
          const updatedMessages = [...(prevMessages || []), newMessage];
          // Save to local storage with updated messages
          saveMessagesToStorage(updatedMessages).catch(console.error);
          return updatedMessages;
        });
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

    // Check for invalid userPhone and try to fix it
    let correctedUserPhone = userPhone;
    if (userPhone && userPhone.length < 5) {
      // If userPhone is too short (like "88"), try to construct a proper number
      correctedUserPhone = `+256${userPhone}`;
      console.warn(`UserPhone "${userPhone}" seems invalid, trying "${correctedUserPhone}"`);
    }

    const messageData = {
      message: inputText.trim(),
      senderPhone: correctedUserPhone,
      receiverPhone: doctorPhone,
      senderType: 'user',
      chatRoomId,
    };

    console.log('Sending message with data:', messageData);

    // Optimistically add message to UI
    const tempMessage = {
      ...messageData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      sending: true,
    };

    console.log('Adding temp message:', tempMessage);
    const updatedMessages = [...(messages || []), tempMessage];
    setMessages(updatedMessages);
    setInputText('');
    scrollToBottom();

    try {
      // Send message to server
      const sentMessage = await ChatService.sendMessage(messageData);
      console.log('Server response:', sentMessage);
      
      // Update the temp message with server response, preserving our structure
      const finalMessages = updatedMessages.map(msg =>
        msg.id === tempMessage.id ? {
          ...msg, // Keep our temporary message structure
          ...sentMessage, // Merge server response
          id: msg.id, // Keep our temporary ID
          message: msg.message, // Keep our message text
          sending: false, 
          sent: true,
          failed: false
        } : msg
      );
      console.log('Final messages after send:', finalMessages);
      setMessages(finalMessages);
      
      // Save updated messages to local storage
      await saveMessagesToStorage(finalMessages);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark message as failed
      const failedMessages = updatedMessages.map(msg =>
        msg.id === tempMessage.id ? {...msg, sending: false, failed: true} : msg
      );
      setMessages(failedMessages);
      
      // Save even failed messages to local storage for retry
      await saveMessagesToStorage(failedMessages);
      
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

  const handleLongPress = () => {
    Alert.alert(
      'Chat Options',
      'Would you like to clear this chat history from local storage?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear History',
          style: 'destructive',
          onPress: clearChatHistory,
        },
      ]
    );
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
          <TouchableOpacity 
            onLongPress={handleLongPress}
            activeOpacity={0.8}
            style={[
              styles.messageBubble,
              isFromUser ? styles.userBubble : styles.doctorBubble
            ]}
          >
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
                    <Icon name="clock" size={12} color="#999" />
                  )}
                  {item.sent && !item.sending && (
                    <Icon name="check" size={12} color="#666" />
                  )}
                  {item.failed && (
                    <Icon name="alert-circle" size={12} color="#FF5252" />
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
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
