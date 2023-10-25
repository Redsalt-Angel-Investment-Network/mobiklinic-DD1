import React, {useState, useRef} from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {COLORS, DIMENS} from '../constants/styles';

import Icon from 'react-native-vector-icons/FontAwesome';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

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
        'Bearer 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',
    },
  });

  const generateResponse = async message => {
    setIsTyping(true); // Set typing state to true

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
        max_tokens: 300,
        temperature: 0.1,
      });

      const assistantMessage = response.data.choices[0].message.content;
      setIsTyping(false); // Set typing state to false

      return assistantMessage;
    } catch (error) {
      setIsTyping(false); // Set typing state to false in case of an error
      console.error('Error:', error);
      return 'An error occurred while generating a response.';
    }
  };

  const sendMessage = async () => {
    if (!userInput) return;

    setMessages(prevMessages => [
      ...prevMessages,
      {role: 'user', content: userInput},
    ]);
    setUserInput('');

    setIsTyping(true); // Set typing state to true before generating a response

    const botResponse = await generateResponse(userInput);

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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Chat with Moby</Text>
      {/* Predefined Questions */}

      <ScrollView
        ref={chatRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}>
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
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
    textAlign: 'center',
    alignSelf: 'center',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    paddingVertical: 2,
  },
  chatContent: {
    justifyContent: 'flex-end',
  },
  predefinedQuestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  predefinedQuestionButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 12,
    margin: 8,
    borderRadius: 12,
    borderColor: COLORS.GREY,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  predefinedQuestionText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    color: COLORS.BLACK,
    marginTop: 10,
    marginBottom: 30,
    borderColor: COLORS.GREY,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    justifyContent: 'center',
    color: COLORS.BLACK,
    fontWeight: 'medium',
    fontSize: 13,
    paddingHorizontal: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#075E54',
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    fontSize: 15,
    color: COLORS.WHITE,
    borderBottomRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#25283C',
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    color: COLORS.WHITE,
    fontSize: 15,
    borderTopLeftRadius: 0,
  },
  sendButton: {
    // backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
};

export default ChatBot;
