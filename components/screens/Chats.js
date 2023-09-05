import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import {dummyData} from './doctors';
import CustomHeader from '../ui/custom-header';
import {COLORS} from '../constants/styles';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useChat} from '../contexts/ChatContext';

const Chats = ({navigation}) => {
  const [chatContacts, setChatContacts] = useState([]);
  const {chatMessages, lastMessages} = useChat();

  useEffect(() => {
    fetchChatContacts();
  }, []);

  const fetchChatContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('chatContacts');
      if (storedContacts) {
        setChatContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error('Error fetching chat contacts:', error);
    }
  };

  const getLastMessage = (phoneNumber) => {
    return lastMessages[phoneNumber];
  };

  const handlePhoneNumberPress = phoneNumber => {
    navigation.navigate('Chat', {phoneNumber});
  };

  const renderChatItem = ({item}) => (
    <TouchableOpacity onPress={() => handlePhoneNumberPress(item.phone)}>
      <View style={styles.contactItem}>
        <MIcon
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
          name="account-circle-outline"
          size={50}
          color="rgba(0,0,0,.3)"
        />
        <View>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.lastMessage}>{getLastMessage(item.phone)}</Text>
        </View>
        {item.status === 1 ? (
          <View style={styles.onlineIndicator} />
        ) : (
          <View style={styles.offlineIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>No chats available</Text>
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.newChatButtonText}>Start a New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>CHAT WITH A DOCTOR</Text>
      </View>

      {dummyData.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={dummyData}
          keyExtractor={item => item._id}
          renderItem={renderChatItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 20,
  },
  newChatButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  newChatButtonText: {
    color: 'white',
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 20,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'light',
    margin: 10,
    color: COLORS.BLACK,
  },
  lastMessage: {
    color: '#555',
    marginHorizontal: 15,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginRight: 8,
  },
  offlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
    marginRight: 8,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 20,
    paddingVertical: 20,
  },
  headerText: {
    color: COLORS.WHITE,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Chats;
