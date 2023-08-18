import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import io from 'socket.io-client';
import DataResultsContext from '../contexts/DataResultsContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Chat = ({route}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const {userNames} = useContext(DataResultsContext);
  const {phoneNumber} = route.params;

  // Load stored messages when the component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('chatMessages');
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
        saveMessagesToStorage(messages); // Save messages to storage when new message arrives
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
        'chatMessages',
        JSON.stringify(messagesToSave),
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  return (
    <View style={styles.container}>
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
            <Text
              style={
                styles.messageContent
              }>{`${item.sender}: ${item.message}`}</Text>
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
    marginVertical: 5,
    borderRadius: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageTick: {
    fontSize: 18,
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
});

export default Chat;
