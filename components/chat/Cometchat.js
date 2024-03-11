import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';

const Cometchat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // Initialize CometChat SDK
    CometChat.init("in", "254111884f11d223").then(
      () => {
        console.log('CometChat Initialized');
        // Login user
        CometChat.login("87", "1c44a2213f9beb5d37c805beb0985275d2be788e").then(
          (user) => {
            console.log('Login Successful:', { user });
            // Fetch previous messages
            CometChat.getPreviousMessages().then(
              (fetchedMessages) => {
                console.log('Previous Messages:', { fetchedMessages });
                setMessages(fetchedMessages);
              },
              (error) => {
                console.log('Error fetching previous messages:', { error });
              }
            );
          },
          (error) => {
            console.log('Login failed with error:', { error });
          }
        );
      },
      (error) => {
        console.log('CometChat Initialization failed with error:', { error });
      }
    );

    // Cleanup on component unmount
    return () => {
      CometChat.logout().then(() => {
        console.log('CometChat Logout Successful');
      });
    };
  }, []);

  const sendMessage = () => {
    if (text.trim() !== '') {
      const message = new CometChat.TextMessage(
        UID,
        text,
        CometChat.MESSAGE_TYPE.TEXT,
        CometChat.RECEIVER_TYPE.USER
      );

      CometChat.sendMessage(message).then(
        (message) => {
          console.log('Message sent successfully:', { message });
          setMessages((prevMessages) => [...prevMessages, message]);
          setText('');
        },
        (error) => {
          console.log('Message sending failed with error:', { error });
        }
      );
    }
  };

  return (
    <View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <TextInput
        value={text}
        onChangeText={(value) => setText(value)}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

export default Cometchat;
