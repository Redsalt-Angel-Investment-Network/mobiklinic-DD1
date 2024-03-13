import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
import DataResultsContext from '../contexts/DataResultsContext';
import { COLORS } from '../constants/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import CopyRight from '../copyright';

const db = openDatabase({ name: 'chatHistory2.db' });

const ChatScreen2 = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatRef = useRef(null);
  const { userLog } = useContext(DataResultsContext);

  useEffect(() => {
    db.transaction(txn => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, role TEXT, content TEXT)',
        [],
        () => {
          console.log('Table created successfully or already exists');
        },
        error => {
          console.error('Error creating table:', error);
        },
      );
    });

    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    db.transaction(txn => {
      txn.executeSql(
        'SELECT * FROM chat_history WHERE user_id = ?',
        [userLog],
        (tx, results) => {
          const chatHistory = [];
          for (let i = 0; i < results.rows.length; i++) {
            chatHistory.push(results.rows.item(i));
          }
          setMessages(chatHistory);
          if (chatRef.current) {
            chatRef.current.scrollToEnd({ animated: true });
          }
        },
        error => {
          console.error('Error loading chat history:', error);
        },
      );
    });
  };

  const saveChatHistory = (role, content) => {
    db.transaction(txn => {
      txn.executeSql(
        'INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)',
        [userLog, role, content],
        () => {
          console.log('Chat history saved successfully');
        },
        error => {
          console.error('Error saving chat history:', error);
        },
      );
    });
  };

  const sendMessage = () => {
    if (!userInput) return;

    const userMessage = { role: 'user', content: userInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    saveChatHistory('user', userInput);
    setUserInput('');

    if (chatRef.current) {
      chatRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Dr Ibra</Text>
      </View>

      <ScrollView
        ref={chatRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}>
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={
              msg.role === 'user' ? styles.userMessage : styles.botMessage
            }>
            {msg.content}
          </Text>
         
        ))}
         <Text> </Text>
       </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholderTextColor="black"
        />
        
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={25} color="black" />
        </TouchableOpacity>
      </View>

      <CopyRight />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginBottom:-100
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  chatContainer: {
    flex: 2,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 0,
  },
  chatContent: {
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
   
   
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: COLORS.WHITE,
  },
  input: {
    flex: 1,
    paddingLeft: 16,
    color: COLORS.BLACK,
    fontSize: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
    fontSize: 15,
    color: COLORS.WHITE,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#25283C',
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    color: COLORS.WHITE,
    fontSize: 15,
  },
  sendButton: {
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
};

export default ChatScreen2;
