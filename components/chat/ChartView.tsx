import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import {
  Chat,
  MessageList,
  MessageInput,
  TypingIndicator
} from '@pubnub/react-native-chat-components';
import Constants from 'expo-constants';
import DataResultsContext from '../contexts/DataResultsContext';

export function ChatView(): JSX.Element {
  const { userLog, userNames } = useContext(DataResultsContext);
  const [pubnubInstance, setPubNubInstance] = useState<PubNub | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null); // To keep track of active chat

  useEffect(() => {
    // Initialize PubNub instance when userLog or userNames changes
    if (userLog && userNames) {
      const newPubNubInstance = new PubNub({
        publishKey: 'pub-c-c9eab6f5-0232-4d25-88f2-8c6de320d091',
        subscribeKey: 'sub-c-547e7070-2c74-406e-834d-5fcdf72324ab',
        userId: userNames, // Sender's userId
      });
      setPubNubInstance(newPubNubInstance);
    }
  }, [userLog, userNames]); // Make sure userLog and userNames are included in the dependency array

  const handleChatSelection = (chatName: string) => {
    setActiveChat(chatName);
  };

  const handleSendMessage = () => {
    // Logic to send message
  };

  return (
    <View style={styles.container}>
      {pubnubInstance && (
        <PubNubProvider client={pubnubInstance}>
          {activeChat ? (
            <ChatRoom
              key={activeChat}
              title={activeChat}
              onSendMessage={handleSendMessage}
              onCloseChat={() => setActiveChat(null)}
            />
          ) : (
            <UserList onSelectChat={handleChatSelection} />
          )}
        </PubNubProvider>
      )}
    </View>
  );
}

function UserList({ onSelectChat }: { onSelectChat: (chatName: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <TouchableOpacity onPress={() => onSelectChat('Ibrahim')}>
        <Text style={styles.userName}>Ibrahim</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSelectChat('John')}>
        <Text style={styles.userName}>John</Text>
      </TouchableOpacity>
      {/* Add more users here */}
    </ScrollView>
  );
}

function ChatRoom({
  title,
  onSendMessage,
  onCloseChat,
}: {
  title: string;
  onSendMessage: () => void;
  onCloseChat: () => void;
}) {
  return (
    <View style={styles.chatRoomContainer}>
      <TouchableOpacity onPress={onCloseChat}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.chatRoomTitle}>{title}</Text>
      <Chat currentChannel={title} theme={'light'}>
        <MessageList fetchMessages={10} />
        <MessageInput fileUpload="image" onSend={onSendMessage} />
        <TypingIndicator showAsMessage={false} />
      </Chat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  userName: {
    fontSize: 18,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingBottom: 5,
  },
  chatRoomContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatRoomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 10,
  },
});
