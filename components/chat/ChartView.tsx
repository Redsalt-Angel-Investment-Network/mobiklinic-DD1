import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { Chat, MessageList, MessageInput } from '@pubnub/react-native-chat-components';
import Constants from 'expo-constants'

const pubnub = new PubNub({
  publishKey: 'pub-c-c9eab6f5-0232-4d25-88f2-8c6de320d091',
  subscribeKey: 'sub-c-547e7070-2c74-406e-834d-5fcdf72324ab',
  // userId: 'myFirstUser',
  userId: "user_" + Constants.installationId
});
const currentChannel = 'Default';
const theme = 'light';

export function ChatView(): JSX.Element {
  return (
    <PubNubProvider client={pubnub}>
      <View style={styles.container}>
        <Chat currentChannel={currentChannel} theme={theme}>
          <MessageList>
           
          </MessageList>
          <MessageInput />
        </Chat>
      </View>
    </PubNubProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
