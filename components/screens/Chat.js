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
import io from 'socket.io-client';
import DataResultsContext from '../contexts/DataResultsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS} from '../constants/styles';
import CustomHeader from '../ui/custom-header';
import Icon from 'react-native-vector-icons/Feather';

const Chat = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const {userNames} = useContext(DataResultsContext);
  const {phoneNumber} = route.params;
  const {name} = route.params;

  const chatIdentifier = phoneNumber; // Unique identifier for this chat

  useEffect(() => {
    const loadMessages = async () => {
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
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:4304');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', ({sender, messageContent}) => {
        const message = {
          content: messageContent,
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages(prevMessages => [...prevMessages, {sender, message}]);
        setMessageStatus(prevStatus => ({
          ...prevStatus,
          [messageContent]: 'unread',
        }));
        saveMessagesToStorage([
          ...messages,
          {sender: userNames, message: inputMessage},
        ]);
        setMessages([...messages, {sender: userNames, message: inputMessage}]);
      });
    }
  }, [socket, messages]);

  const sendMessage = () => {
    if (socket && inputMessage.trim() !== '') {
      socket.emit('message', {phoneNumber, message: inputMessage});
      setMessages(prevMessages => [
        ...prevMessages,
        {sender: userNames, message: inputMessage},
      ]);
      setMessageStatus(prevStatus => ({
        ...prevStatus,
        [inputMessage]: 'sent',
      }));
      saveMessagesToStorage(messages); // Save messages to storage when sending a message
      setInputMessage('');
    }
  };

  const saveMessagesToStorage = async messagesToSave => {
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
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View
            style={[
              styles.message,
              {
                backgroundColor:
                  messageStatus[item.message] === 'sent'
                    ? '#DCF8C6'
                    : '#ffffff',
              },
            ]}>
            <Text style={styles.messageContent}>
              {`${item.sender}: ${item.message}`}
            </Text>
            {messageStatus[item.message] === 'sent' && (
              <Text style={styles.messageTick}>&#10003;</Text>
            )}
            {messageStatus[item.message] === 'read' && (
              <Text style={styles.messageTick}>&#10003;&#10003;</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputSection}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          style={styles.inputField}
          placeholder="Type a message..."
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
    backgroundColor: '#DCF8C6',
    marginVertical: 5,
  },
  messageContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  messageTick: {
    fontSize: 12,
    marginLeft: 5,
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
  },
  header: {
    // padding: 10,
    backgroundColor: COLORS.WHITE,
    borderBottomColor: 1,
    borderColor: COLORS.GREY,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 15,
  },
});
export default Chat;
