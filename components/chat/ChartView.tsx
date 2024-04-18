import React, {useContext, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import {
  Chat,
  MessageList,
  MessageInput,
  TypingIndicator,
} from '@pubnub/react-native-chat-components';
import Constants from 'expo-constants';
import DataResultsContext from '../contexts/DataResultsContext';
import {COLORS, DIMENS} from '../constants/styles';
import CopyRight from '../copyright';
import Icon from 'react-native-vector-icons/Feather';
import Loader from '../ui/loader';
import CustomHeader from '../ui/custom-header';
import {useNavigation} from '@react-navigation/native';

export function ChatView(): JSX.Element {
  const {userLog, userNames} = useContext(DataResultsContext);
  const [pubnubInstance, setPubNubInstance] = useState<PubNub | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  useEffect(() => {
    if (userLog && userNames) {
      const newPubNubInstance = new PubNub({
        publishKey: 'pub-c-c9eab6f5-0232-4d25-88f2-8c6de320d091',
        subscribeKey: 'sub-c-547e7070-2c74-406e-834d-5fcdf72324ab',
        userId: userNames,
      });
      setPubNubInstance(newPubNubInstance);
    }
  }, [userLog, userNames]);

  const handleChatSelection = (doctorName: string) => {
    if (pubnubInstance) {
      const channel = `${doctorName}-${userNames}`;
      console.log('Subscribing to channel:', channel);
      setActiveChat(channel);
      pubnubInstance.subscribe({
        channels: [channel],
        withPresence: true,
      });
    }
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
            <DoctorList onSelectChat={handleChatSelection} />
          )}
        </PubNubProvider>
      )}
    </View>
  );
}

export function DoctorList({
  onSelectChat,
}: {
  onSelectChat: (doctorName: string) => void;
}) {
  const [doctors, setDoctors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(
        'https://mk-be-strapi-production.up.railway.app/api/doctors',
      );
      const data = await response.json();
      const doctorInfo = data.data.map((doctor: any) => ({
        name: doctor.attributes.name,
        contact: doctor.attributes.contact,
        email: doctor.attributes.email,
      }));
      setDoctors(doctorInfo);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleCallDoctor = (contact: string) => {
    Linking.openURL(`tel:${contact}`);
  };

  const _header = () => (
    <CustomHeader
      left={
        <TouchableOpacity
          style={{
            marginHorizontal: 4,
            width: 35,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color={COLORS.BLACK} />
        </TouchableOpacity>
      }
      title={<Text style={styles.title}>Back</Text>}
    />
  );

  return (
    <View style={styles.wrapper}>
      {_header()}

      <Text style={styles.userListHeader}>
        Contact One The Mobiklinic Doctors
      </Text>
      {loading ? (
        <Loader size="large" backgroundColor={COLORS.WHITE} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {doctors.map((doctor, index) => (
            <View key={index}>
              <View style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{doctor.name}</Text>
                  <TouchableOpacity onPress={() => onSelectChat(doctor.name)}>
                    <Icon name="message-circle" size={25} color={'green'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCallDoctor(doctor.contact)}>
                    <Icon name="phone" size={25} color="rgba(0,0,0,.3)" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.contactInfo}>
                  Contact: {doctor.contact}
                </Text>
                <Text style={styles.contactInfo}>Email: {doctor.email}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <CopyRight />
    </View>
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
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={onCloseChat}>
          <Text>
            <Icon name="arrow-left" size={20} color={COLORS.BLACK} />
          </Text>
        </TouchableOpacity>
        <View>
          <Image
            source={require('../../assets/adaptive-icon.png')} 
            style={styles.avatarIcon}
          />
        </View>
        <Text style={styles.chatRoomTitle}>{title}</Text>
        <View>
          <Icon name="phone" size={20} color={COLORS.BLACK} />
        </View>
      </View>
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
    backgroundColor: COLORS.WHITE,
  },
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  userListHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 10,
    color: COLORS.WHITE,
  },
  scrollViewContent: {
    paddingHorizontal: 10,
  },
  userItem: {
    marginBottom: 10,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    color: COLORS.BLACK,
    opacity: 0.8,
    fontWeight: 'bold',
  },
  chatRoomContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatRoomTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    // opacity: 0.5,
    flex: 1,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.BLACK,
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'bold',
    opacity: 0.5,
    alignContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  contactInfo: {
    color: COLORS.BLACK,
    fontSize: 14,
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.WHITE,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.BLACK,
    alignItems: 'center',
    flexGrow: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    justifyContent: 'space-between',
  },

  avatarIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginHorizontal:18,
  },
});
