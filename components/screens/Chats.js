import React, {useContext, useState, useRef, useEffect} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS, DIMENS} from '../constants/styles';
import {OPEN_API_KEY} from '@env'


import Icon from 'react-native-vector-icons/FontAwesome';
const db = openDatabase({name: 'chatHistory.db'});

const ChatBot = ({navigation}) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);
  const {userLog} = useContext(DataResultsContext);

  useEffect(() => {
    // Create a table for chat history when the component mounts
    db.transaction(txn => {
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, role TEXT, content TEXT)',
        [],
        () => {
          // Table created successfully or already exists
        },
        error => {
          console.error('Error creating table:', error);
        },
      );
    });

    // Load chat history from the database when the component mounts
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
  const predefinedQuestions = [
    'How can I prevent the spread of infectious diseases?',
    'Tell me about the importance of handwashing.',
    'What are the common symptoms of COVID-19?',
    'Explain the benefits of vaccination.',
    'How can I maintain a healthy diet?',
    // Add more questions here
  ];
  const instance = axios.create({
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        `Bearer ${OPEN_API_KEY}`,
    },
  });

  const generateResponse = async message => {
    setIsTyping(true);

    try {
      const response = await instance.post('', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant medical assistant.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const assistantMessage = response.data.choices[0].message.content;
      setIsTyping(false);

      return assistantMessage;
    } catch (error) {
      setIsTyping(false);
      console.error('Error:', error);
      return 'An error occurred while generating a response.';
    }
  };

  const sendMessage = async () => {
    if (!userInput) return;

    const userMessage = {role: 'user', content: userInput};
    setMessages(prevMessages => [...prevMessages, userMessage]);
    saveChatHistory('user', userInput);
    setUserInput('');

    setIsTyping(true);

    try {
      const botResponse = await generateResponse(userInput);
      const assistantMessage = {role: 'assistant', content: botResponse};

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      saveChatHistory('assistant', botResponse);

      setIsTyping(false);

      if (chatRef.current) {
        chatRef.current.scrollToEnd({animated: true});
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handlePredefinedQuestionClick = async question => {
    setUserInput(question); // Set the predefined question as user input

    // Send the predefined question as a message
    setMessages(prevMessages => [
      ...prevMessages,
      {role: 'user', content: question},
    ]);

    setIsTyping(true); // Set typing state to true before generating a response

    const botResponse = await generateResponse(question);

    setIsTyping(false); // Set typing state to false after generating a response

    setMessages(prevMessages => [
      ...prevMessages,
      {role: 'assistant', content: botResponse},
    ]);

    // Scroll to the bottom of the chat
    if (chatRef.current) {
      chatRef.current.scrollToEnd({animated: true});
    }
  };
  const refreshChats = () => {
    setMessages([]);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.heading}>Chat with Moby</Text>
        <TouchableOpacity>
          <Icon name="info-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {messages.length > 0 && (
        <TouchableOpacity style={styles.refreshButton} onPress={refreshChats}>
          <Icon name="refresh" size={24} color="black" />
        </TouchableOpacity>
      )}

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

        {isTyping && (
          <Text style={[styles.botMessage, {fontStyle: 'italic'}]}>
            Moby is typing...
          </Text>
        )}
        {messages.length === 0 && (
          <View style={styles.predefinedQuestionsContainer}>
            {predefinedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.predefinedQuestionButton}
                onPress={() => handlePredefinedQuestionClick(question)}>
                <Text style={styles.predefinedQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Ask me anything"
          placeholderTextColor="black"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={25} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,

  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
    // textAlign: 'center',
    // alignSelf: 'center',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
    padding: 16,
    // backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingVertical: 16,
  },
  chatContent: {
    justifyContent: 'flex-end',
  },
  predefinedQuestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'center',
  },
  predefinedQuestionButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    margin: 8,
    borderRadius: 12,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  predefinedQuestionText: {
    fontSize: 15,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
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
    fontSize: 16, // In
  },
  userMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
    fontSize: 15,
    color: COLORS.WHITE,
    borderBottomRightRadius: 0,
    marginRight: 8,
    marginBottom: 8,
  },
  botMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#25283C',
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    color: COLORS.WHITE,
    fontSize: 15,
    borderTopLeftRadius: 0,
    marginLeft: 8,
    marginBottom: 8,
    padding:12,
  },
  sendButton: {
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  refreshButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default ChatBot;
