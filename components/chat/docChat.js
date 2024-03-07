import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useChatClient } from './useChatClient';
import { AppProvider } from "./AppContext";
import {
  OverlayProvider,
  Chat,
  ChannelList,
  Channel,
  MessageList,
  MessageInput,
} from 'stream-chat-react-native'; 
import { StreamChat } from 'stream-chat';
import { chatApiKey, chatUserId } from './chatConfig';
import { useAppContext } from './AppContext';

const Stack = createStackNavigator();

const ChannelScreen = props => {
  const { channel } = useAppContext();
  return (
    <Channel channel={channel}>
      <MessageList />
      <MessageInput />
    </Channel>
  );
}

const ChannelListScreen = (props) => {
  const { setChannel } = useAppContext();
  
  return (
    <ChannelList
      onSelect={(channel) => {
        const { navigation } = props;
        setChannel(channel);
        navigation.navigate('ChannelScreen');
      }}
      filters={filters}
      sort={sort}
    />
  );
}


const filters = {
  members: {
    '$in': [chatUserId]
  },
};

const sort = {
  last_message_at: -1,
};
const chatClient = StreamChat.getInstance(chatApiKey);

const NavigationStack = () => {
  const { clientIsReady } = useChatClient();

  if (!clientIsReady) {
    return <Text>Loading chat ...</Text>;
  }

  return (
    <Chat client={chatClient}>
      <Stack.Navigator>
        <Stack.Screen name="ChannelList" component={ChannelListScreen} />
      </Stack.Navigator>
    </Chat>
  );
};

const ChatDoc = () => {
  return (
    <AppProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Pass independent={true} to the stream-chat-native NavigationContainer */}
        <NavigationContainer independent={true}>
          <NavigationStack />
        </NavigationContainer>
      </SafeAreaView>
    </AppProvider>
  );
};

export default ChatDoc;