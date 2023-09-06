
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ReceivedChats = ({ route }) => {
  const { receivedMessages } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Received Chats</Text>
      <FlatList
        data={receivedMessages}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.sender}>{item.sender}</Text>
            <Text style={styles.message}>{item.messageContent}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  sender: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
  },
});

export default ReceivedChats;
