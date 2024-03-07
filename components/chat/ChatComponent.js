import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { CometChat } from '@cometchat-pro/react-native-chat';
import { COMETCHAT_CONSTANTS } from '../../constants';

const ChatComponent = () => {
  useEffect(() => {
    // Setup App Settings and call CometChat init() method.
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(COMETCHAT_CONSTANTS.REGION)
      .build();

    CometChat.init(COMETCHAT_CONSTANTS.APP_ID, appSetting).then(
      () => {
        console.warn('Initialization completed successfully');
        // You can now perform other actions related to CometChat.
      },
      error => {
        console.log('Initialization failed with error:', error);
        // Check the reason for error and take appropriate action.
      },
    );

    // Cleanup function to handle unmounting or dependencies change.
    return () => {
      // Cleanup logic if needed.
    };
  }, []); // Empty dependency array ensures the effect runs only once on mount.

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <Text>Chat App</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    paddingHorizontal: 10,
  },
});

export default ChatComponent;
