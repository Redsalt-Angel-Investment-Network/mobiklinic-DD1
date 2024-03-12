import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TextInput, Button} from 'react-native';
import {CometChat} from '@cometchat-pro/react-native-chat';

const Cometchat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [UID, setUID] = useState(''); // Remove the initial UID

  useEffect(() => {
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
            'superhero1',
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

      // Set the UID to "superhero2" to fetch messages for that user
      const targetUID = 'superhero3';

      var messagesRequest = new CometChat.MessagesRequestBuilder()
        .setUID(targetUID)
        .setMessageId(latestId)
        .setLimit(limit)
        .build();

      messagesRequest.fetchNext().then(
        fetchedMessages => {
          console.log('Message list fetched:', fetchedMessages);
          setMessages(prevMessages => [...prevMessages, ...fetchedMessages]);
        },
        error => {
          console.log('Message fetching failed with error:', error);
        },
      );
    } catch (error) {
      console.log('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    const targetUID = 'superhero3'; // Set the UID of the recipient (superhero2)

    if (text.trim() !== '' && targetUID.trim() !== '') {
      const message = new CometChat.TextMessage(
        targetUID,
        text,
        CometChat.RECEIVER_TYPE.USER,
      );

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
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ 
            alignItems: item.sender.uid === UID ? 'flex-end' : 'flex-start', 
            margin: 10
          }}>
            <View style={{
              backgroundColor: item.sender.uid === UID ? '#4CAF50' : '#2196F3',
              padding: 10,
              borderRadius: 5
            }}>
              <Text style={{ color: 'white' }}>{item.text}</Text>
            </View>
          </View>
        )}
      />
  
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' }}>
        <TextInput
          style={{ flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginRight: 10, padding: 8 }}
          value={text}
          onChangeText={(value) => setText(value)}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
  
};

export default Cometchat;
