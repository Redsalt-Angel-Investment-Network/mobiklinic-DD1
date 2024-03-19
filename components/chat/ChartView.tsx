import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import {
  Chat,
  MessageList,
  MessageInput,
  TypingIndicator
} from '@pubnub/react-native-chat-components';
import Constants from 'expo-constants';
import DataResultsContext from '../contexts/DataResultsContext';

export function ChatView(): JSX.Element {
  const {userLog} = useContext(DataResultsContext);
  const {userNames} = useContext(DataResultsContext);
  const [pubnubInstance, setPubNubInstance] = useState<PubNub | null>(null);

  useEffect(() => {
    // Initialize PubNub instance when userLog changes
    if (userLog) {
      const newPubNubInstance = new PubNub({
        publishKey: 'pub-c-c9eab6f5-0232-4d25-88f2-8c6de320d091',
        subscribeKey: 'sub-c-547e7070-2c74-406e-834d-5fcdf72324ab',
        userId: '' + userNames,
      });
      setPubNubInstance(newPubNubInstance);
    }
  }, [userLog]);


  return (
    <View style={styles.container}>
      {pubnubInstance && ( // Render Chat components only when pubnubInstance is available
        <PubNubProvider client={pubnubInstance}>
          <Chat currentChannel={'Default'} theme={'light'}>
          <MessageList fetchMessages={10} />
          <TypingIndicator showAsMessage={false} />
            <MessageInput typingIndicator={true} senderInfo={true} 
              placeholder={'What is your message?'}
              onBeforeSend={message => {
                let newMsg = message;
                newMsg.text += '**';
                return newMsg;
              }}
            />
          </Chat>
        </PubNubProvider>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
