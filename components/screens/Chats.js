import React, { useState, useContext } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { OPENAI_KEY } from '../../';
import { COLORS, DIMENS } from '../constants/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import DataResultsContext from '../contexts/DataResultsContext';

const predefinedQuestions = [
  "How can I prevent the spread of infectious diseases?",
  "Tell me about the importance of handwashing.",
  "What are the common symptoms of COVID-19?",
  "Explain the benefits of vaccination.",
  "How can I maintain a healthy diet?",
  // Add more questions here
];

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const { userNames } = useContext(DataResultsContext);
  const [isLoading, setIsLoading] = useState(false);

  const instance = axios.create({
    baseURL: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer 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',
    },
  });

  const generateResponse = async message => {
    setIsLoading(true);
    try {
      const response = await instance.post('', {
        model: 'gpt-3.5-turbo-0613', // Match the model name
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
      setIsLoading(false);

      return {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo-0613',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response.data.choices[0].message.content,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 9,
          completion_tokens: 12,
          total_tokens: 21,
        },
      };
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
      return '';
    }
  };

  const handlePredefinedQuestionClick = async question => {
    // Set the predefined question as user input
    setUserInput(question);

    // Send the predefined question as a message
    setMessages(prevMessages => [...prevMessages, `User: ${question}`]);

    // Generate and display the bot's response
    const botResponse = await generateResponse(question);

    if (
      botResponse &&
      botResponse.choices &&
      botResponse.choices[0] &&
      botResponse.choices[0].message
    ) {
      const assistantMessage = botResponse.choices[0].message.content;
      setMessages(prevMessages => [
        ...prevMessages,
        `Moby: ${assistantMessage}`,
      ]);
    }
  };

  const sendMessage = async () => {
    if (!userInput) return;

    setMessages(prevMessages => [...prevMessages, `User: ${userInput}`]); // Display user's message
    setUserInput('');

    // Generate and display the bot's response
    const botResponse = await generateResponse(userInput);

    if (
      botResponse &&
      botResponse.choices &&
      botResponse.choices[0] &&
      botResponse.choices[0].message
    ) {
      const assistantMessage = botResponse.choices[0].message.content;
      setMessages(prevMessages => [
        ...prevMessages,
        `Moby: ${assistantMessage}`,
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Chat With Moby</Text>
      <ScrollView style={styles.chatContainer}>
        {predefinedQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.predefinedQuestion}
            onPress={() => handlePredefinedQuestionClick(question)}
          >
            <Text style={styles.predefinedQuestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
        {messages.map((msg, index) => (
          <Text
            key={index}
            style={
              msg.startsWith('Moby') ? styles.botMessage : styles.userMessage
            }
          >
            {msg}
          </Text>
        ))}
        {isLoading && (
          <Text style={styles.botMessage}>Moby is typing .....</Text>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Ask me anything"
          placeholderTextColor={COLORS.GREY}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Icon
            name="send" // Name of the icon you want to use
            size={30} // Adjust the size as needed
            color="black"
          />
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
    color: 'black', // Set the color to light gray or another valid color value
    textAlign: 'center', // Center the text horizontally
    alignSelf: 'center', // Center the text vertically
    color: COLORS.PRIMARY,
  },

  chatContainer: {
    flex: 1,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
  },
  predefinedQuestion: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 12,
    margin: 8,
    borderRadius: 12,
    borderColor:COLORS.GREY,
    borderWidth: 1, 
    justifyContent: 'center',
    paddingHorizontal:10,
    // alignItems: 'center',
  },
  predefinedQuestionText: {
    fontSize: 15,
   
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 15,
    // paddingVertical: 10,
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
    backgroundColor: '#075E54', // Set the background color to your desired color
    padding: 8,
    borderRadius: 12, // Rounded corners
    marginVertical: 5,
    fontSize: 15,
    color: COLORS.WHITE,
    borderBottomRightRadius: 0, // Truncate the bottom-right corner
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#25283C', // Set the background color for bot messages
    padding: 8,
    borderRadius: 12,
    marginVertical: 5,
    color: COLORS.WHITE, // Set the text color for bot messages
    fontSize: 15,
    borderTopLeftRadius: 0, // Truncate the bottom-right corner
  },
  button: {
    // backgroundColor: COLORS.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    // marginBottom: 10,
    // marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    color: COLORS.GREY,
    fontSize: 14,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
};

export default ChatBot;
