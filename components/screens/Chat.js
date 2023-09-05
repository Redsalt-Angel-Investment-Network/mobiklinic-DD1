import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Realtime} from 'ably'; // Import Ably library
import DataResultsContext from '../contexts/DataResultsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';
import {useChat} from '../contexts/ChatContext';

const Chat = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ablyChannel, setAblyChannel] = useState(null);
  const {userNames} = useContext(DataResultsContext);
  const {setLastMessages, lastMessages, addChatMessage} = useChat();
  const {name, phoneNumber} = route.params;
  const chatIdentifier = phoneNumber;

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatIdentifier) {
        return; // Exit early if chatIdentifier is undefined
      }

      try {
        const storedMessages = await AsyncStorage.getItem(chatIdentifier);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [chatIdentifier]);

  useEffect(() => {
    const ably = new Realtime({
      key: 'ihV9jA.Kzjl9g:Iy4pvjQbZyde1N0ER5JgjDsgKpg0FUa6YIm_f7l1ju0', // Replace with your Ably API key
    });
    const channel = ably.channels.get(`chat-room-${phoneNumber}`);
    setAblyChannel(channel);
    return () => {
      ably.close();
    };
  }, []);

  const sendMessage = () => {
    if (ablyChannel && inputMessage.trim() !== '') {
      const message = {
        sender: userNames,
        messageContent: inputMessage,
        status: 'sent', 
      };
  
      // Log the message before publishing it
      console.log('Sending message:', message);
  
      ablyChannel.publish('message', message);
  
      // Update the UI with the sent message
      setMessages(prevMessages => [...prevMessages, message]);
  
      // Save messages to storage
      saveMessagesToStorage([...messages, message]);
  
      // Add the message to ChatContext with phone number
      addChatMessage(phoneNumber, inputMessage);
  
      setInputMessage('');
    }
  };
  
  const markMessageAsRead = index => {
    const updatedMessages = [...messages];
    updatedMessages[index].status = 'received';
    setMessages(updatedMessages);
    saveMessagesToStorage(updatedMessages);
  };

  const saveMessagesToStorage = async messagesToSave => {
    if (!chatIdentifier) {
      return; // Exit early if chatIdentifier is undefined
    }

    try {
      await AsyncStorage.setItem(
        chatIdentifier,
        JSON.stringify(messagesToSave),
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomHeader
          left={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
            </TouchableOpacity>
          }
          title={
            <Text style={styles.headerText}>
              {'\t'}Chatting with: {phoneNumber}
            </Text>
          }
        />
      </View>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => `${index}`} // Use index as the key
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onLongPress={() => markMessageAsRead(index)} // Mark message as read on long press
          >
            <View
              style={[
                styles.message,
                {
                  backgroundColor:
                    item.sender === userNames ? '#DCF8C6' : '#ffffff',
                },
              ]}
            >
              <Text style={styles.messageContent}>
                {`${item.sender}: ${item.messageContent}`}
              </Text>
              {item.status === 'received' ? (
                // Display double black ticks for received messages
                <Text style={styles.receivedTicks}>✓✓</Text>
              ) : (
                // Display single black tick for sent messages
                <Text style={styles.sentTick}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputSection}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          style={styles.inputField}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.GREY}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
    borderRadius: 8,
    maxWidth: '50%',
    marginVertical: 5,
    color: COLORS.BLACK,
  },
  messageContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 10,
    color: COLORS.BLACK,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  inputField: {
    flex: 1,
    marginRight: 10,
    padding: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.BLACK,
  },
  header: {
    backgroundColor: COLORS.WHITE,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 15,
    color: COLORS.BLACK,
  },
});

export default Chat;
