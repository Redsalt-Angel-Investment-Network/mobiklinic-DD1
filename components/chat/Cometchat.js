import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TextInput, Button} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';
import SQLite from 'react-native-sqlite-storage';

const Cometchat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [UID, setUID] = useState('');
  // SQLite initialization
  const db = SQLite.openDatabase({
    name: 'cometchat.db',
    location: 'default',
  });

  // Create a table for messages if it doesn't exist
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, senderUid TEXT, receiverUid TEXT, text TEXT, timestamp INTEGER)',
      [],
      (tx, results) => {
        console.log('Table created successfully');
      },
      error => {
        console.log('Error creating table:', error);
      },
    );
  });

  const fetchMessagesFromSQLite = () => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?',
          [30], // Adjust the limit as needed
          (tx, results) => {
            const fetchedMessages = results.rows.raw();
            console.log('Messages fetched from SQLite:', fetchedMessages);
            setMessages(prevMessages => [...prevMessages, ...fetchedMessages]);
          },
          error => {
            console.log('Error fetching messages from SQLite:', error);
          },
        );
      });
    } catch (error) {
      console.log('Error in fetchMessagesFromSQLite:', error);
    }
  };

  useEffect(() => {
    setMessages([]);
    fetchMessagesFromSQLite();
    let appId = '254111884f11d223';
    let region = 'in';
    let appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();

    CometChat.init(appId, appSetting)
      .then(
        () => {
          console.log('CometChat Initialized');
          CometChat.login(
            'superhero3',
            '1c44a2213f9beb5d37c805beb0985275d2be788e',
          ).then(
            user => {
              console.log('Login Successful:', {user});

              setUID(user.uid); // Set the UID dynamically based on the logged-in user's UID

              let listenerID = user.uid; // Set the listenerID dynamically based on the logged-in user's UID
              CometChat.addMessageListener(
                listenerID,
                new CometChat.MessageListener({
                  onTextMessageReceived: textMessage => {
                    console.log(
                      'Text message received successfully',
                      textMessage,
                    );
                    setMessages(prevMessages => [...prevMessages, textMessage]);
                  },
                  onMediaMessageReceived: mediaMessage => {
                    console.log(
                      'Media message received successfully',
                      mediaMessage,
                    );
                    setMessages(prevMessages => [
                      ...prevMessages,
                      mediaMessage,
                    ]);
                  },
                  onCustomMessageReceived: customMessage => {
                    console.log(
                      'Custom message received successfully',
                      customMessage,
                    );
                    setMessages(prevMessages => [
                      ...prevMessages,
                      customMessage,
                    ]);
                  },
                }),
              );

              // Fetch previous messages for the one-to-one conversation
              fetchMessages();
            },
            error => {
              console.log('Login failed with error:', {error});
            },
          );
        },
        error => {
          console.log('CometChat Initialization failed with error:', {error});
        },
      )
      .catch(error => {
        console.log('Unhandled Promise Rejection during initialization:', {
          error,
        });
      });

    return () => {
      CometChat.removeMessageListener(listenerID);
      CometChat.logout()
        .then(() => {
          console.log('CometChat Logout Successful');
        })
        .catch(error => {
          console.log('Logout failed with error:', {error});
        });
    };
  }, []);

  const fetchMessages = async () => {
    try {
      let limit = 30;
      let latestId = await CometChat.getLastDeliveredMessageId();
      const targetUID = 'superhero1';
  
      // Fetch messages from SQLite
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM messages WHERE receiverUid = ? ORDER BY timestamp DESC LIMIT ?',
          [targetUID, limit],
          (tx, results) => {
            const fetchedSQLiteMessages = results.rows.raw();
            console.log('Messages fetched from SQLite:', fetchedSQLiteMessages);
  
            // Filter out duplicates before setting the state
            const uniqueSQLiteMessages = fetchedSQLiteMessages.filter((sqliteMessage) => {
              return !messages.some((message) => message.id === sqliteMessage.id.toString());
            });
  
            setMessages((prevMessages) => [...prevMessages, ...uniqueSQLiteMessages]);
          },
          (error) => {
            console.log('Error fetching messages from SQLite:', error);
          }
        );
      });
  
      // Fetch messages from CometChat
      var messagesRequest = new CometChat.MessagesRequestBuilder()
        .setUID(targetUID)
        .setMessageId(latestId)
        .setLimit(limit)
        .build();
  
      messagesRequest.fetchNext().then(
        (fetchedCometChatMessages) => {
          console.log('Message list fetched from CometChat:', fetchedCometChatMessages);
  
          // Filter out duplicates before setting the state
          const uniqueCometChatMessages = fetchedCometChatMessages.filter((cometChatMessage) => {
            return !messages.some((message) => message.id === cometChatMessage.id);
          });
  
          setMessages((prevMessages) => [...prevMessages, ...uniqueCometChatMessages]);
        },
        (error) => {
          console.log('Message fetching failed with error:', error);
        }
      );
    } catch (error) {
      console.log('Error fetching messages:', error);
    }
  };
  
  

  const sendMessage = () => {
    const targetUID = 'superhero1'; // Set the UID of the recipient (superhero2)

    if (text.trim() !== '' && targetUID.trim() !== '') {
      const message = new CometChat.TextMessage(
        targetUID,
        text,
        CometChat.RECEIVER_TYPE.USER,
      );

      // Save the message in SQLite
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO messages (senderUid, receiverUid, text, timestamp) VALUES (?, ?, ?, ?)',
          [UID, targetUID, text, Math.floor(Date.now() / 1000)],
          (tx, results) => {
            console.log('Message saved in SQLite:', results);
          },
          error => {
            console.log('Error saving message in SQLite:', error);
          },
        );
      });

      // Send the message using CometChat
      CometChat.sendMessage(message).then(
        message => {
          console.log('Message sent successfully:', {message});
          setMessages(prevMessages => [...prevMessages, message]);
          setText('');
        },
        error => {
          console.log('Message sending failed with error:', {error});
        },
      );
    }
  };

  return (
    <View style={{flex: 1}}>
     <FlatList
  data={messages}
  keyExtractor={(item) => item.id.toString()} // Ensure the key is a string
  renderItem={({ item }) => (
    <View style={{ 
      alignItems: item.sender && item.sender.uid === UID ? 'flex-end' : 'flex-start', 
      margin: 10
    }}>
      <View style={{
        backgroundColor: item.sender && item.sender.uid === UID ? '#4CAF50' : '#2196F3',
        padding: 10,
        borderRadius: 5
      }}>
        <Text style={{ color: 'white' }}>{item.text}</Text>
      </View>
    </View>
  )}
/>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderTopWidth: 1,
          borderTopColor: '#ccc',
        }}>
        <TextInput
          style={{
            flex: 1,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 5,
            marginRight: 10,
            padding: 8,
          }}
          value={text}
          onChangeText={value => setText(value)}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default Cometchat;
