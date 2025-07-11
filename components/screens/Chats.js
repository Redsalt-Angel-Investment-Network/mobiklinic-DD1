import React, { useContext, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { openDatabase } from 'react-native-sqlite-storage';
import DataResultsContext from '../contexts/DataResultsContext';
import { COLORS } from '../constants/styles';
import { OPEN_API_KEY } from '@env';

const db = openDatabase({ name: 'chatHistory.db' });

const ChatBot = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const { userLog } = useContext(DataResultsContext);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, role TEXT, content TEXT)',
        [],
        null,
        error => console.error('Error creating chat_history table:', error)
      );
    });
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM chat_history WHERE user_id = ?',
        [userLog],
        (_, results) => {
          const chats = [];
          for (let i = 0; i < results.rows.length; i++) {
            chats.push(results.rows.item(i));
          }
          setMessages(chats);
        },
        error => console.error('Error loading chat history:', error)
      );
    });
  };

  const saveChatHistory = (role, content) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)',
        [userLog, role, content],
        null,
        error => console.error('Error saving chat:', error)
      );
    });
  };

  const generateResponse = async message => {
    setIsTyping(true);
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 1000; // Start with 1 second delay

    const attemptRequest = async attempt => {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful medical assistant.' },
              { role: 'user', content: message },
            ],
            max_tokens: 3000,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPEN_API_KEY}`,
            },
          }
        );

        const botMessage = response.data.choices[0].message.content;
        setIsTyping(false);
        return botMessage;
      } catch (error) {
        if (error.response?.status === 429 && attempt < maxRetries) {
          // Calculate exponential backoff delay
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptRequest(attempt + 1);
        }

        setIsTyping(false);
        if (error.response?.status === 429) {
          return 'I\'m currently handling too many requests. Please try again in a few moments.';
        }
        console.error('Error generating response:', error);
        return 'I apologize, but I encountered an error while processing your request. Please try again.';
      }
    };

    return attemptRequest(0);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    saveChatHistory('user', userInput);
    setUserInput('');

    const botResponse = await generateResponse(userInput);
    const botMessage = { role: 'assistant', content: botResponse };
    setMessages(prev => [...prev, botMessage]);
    saveChatHistory('assistant', botResponse);

    chatRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with Moby</Text>
        <TouchableOpacity>
          <Icon name="info-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={chatRef}
        style={styles.chatContainer}
        contentContainerStyle={{ paddingVertical: 10 }}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.botBubble,
            ]}>
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}
        {isTyping && <Text style={styles.typingText}>Moby is typing...</Text>}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="How can i help you?"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#075E54',
    padding: 15,
  },
  headerTitle: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  chatContainer: { flex: 1, paddingHorizontal: 10 },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: { fontSize: 16, color: '#000' },
  typingText: { fontStyle: 'italic', color: '#777', marginLeft: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
    borderTopWidth: 1,
    borderColor: '#DDD',
  },
  input: { flex: 1, fontSize: 16, paddingHorizontal: 10 },
  sendButton: {
    backgroundColor: '#075E54',
    padding: 10,
    borderRadius: 20,
  },
});

export default ChatBot;
