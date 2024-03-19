// ChatScreen.js
import React, { useState, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';

const socket = io('YOUR_SOCKET_SERVER_URL'); // Replace with your Socket.io server URL

const ChatScreen2 = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('message', handleReceiveMessage);

    return () => {
      socket.off('message', handleReceiveMessage);
    };
  }, []);

  const handleReceiveMessage = (newMessage) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessage)
    );
  };

  const handleSend = (newMessages) => {
    socket.emit('message', newMessages[0]);
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => handleSend(newMessages)}
      user={{
        _id: 1, // Replace with the user's ID
      }}
    />
  );
};

export default ChatScreen2;
