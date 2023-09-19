// ChatContext.js
import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({}); // Add state for last messages
const {messageContent, sender} = useState();
  const addChatMessage = (message) => {
    setChatMessages((prevMessages) => [...prevMessages, message]);

    // Update the last message for the chat
    setLastMessages((prevLastMessages) => ({
      ...prevLastMessages,
      [message.phoneNumber]: message.messageContent,
    }));
  };

  return (
    <ChatContext.Provider value={{ chatMessages, addChatMessage, lastMessages,messageContent }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
