import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.100.9:1337/api';

class ChatService {
  // Fetch all doctors
  async getDoctors() {
    try {
      const response = await fetch(`${API_URL}/doctors`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  }

  // Get messages between user and doctor
  async getMessages(userPhone, doctorPhone) {
    try {
      const response = await fetch(
        `${API_URL}/chat-messages?senderPhone=${userPhone}&receiverPhone=${doctorPhone}`
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(messageData) {
    try {
      const response = await fetch(`${API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: messageData }),
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(chatRoomId, userPhone) {
    try {
      const response = await fetch(`${API_URL}/chat-messages/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatRoomId, userPhone }),
      });
      return response.json();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Get chat rooms for a user
  async getChatRooms(userPhone) {
    try {
      const response = await fetch(`${API_URL}/chat-messages/rooms?userPhone=${userPhone}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  // Store message locally for offline support
  async storeMessageLocally(message) {
    try {
      const existingMessages = await AsyncStorage.getItem('offlineMessages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push({ ...message, timestamp: Date.now(), sent: false });
      await AsyncStorage.setItem('offlineMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing message locally:', error);
    }
  }

  // Get locally stored messages
  async getLocalMessages() {
    try {
      const messages = await AsyncStorage.getItem('offlineMessages');
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error getting local messages:', error);
      return [];
    }
  }

  // Clear local messages after successful sync
  async clearLocalMessages() {
    try {
      await AsyncStorage.removeItem('offlineMessages');
    } catch (error) {
      console.error('Error clearing local messages:', error);
    }
  }

  // Generate chat room ID
  generateChatRoomId(phone1, phone2) {
    return [phone1, phone2].sort().join('-');
  }

  // Get chat rooms for a doctor (patients who have messaged this doctor)
  async getDoctorChatRooms(doctorPhone) {
    try {
      const response = await fetch(`${API_URL}/doctors/chat-rooms?doctorPhone=${doctorPhone}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching doctor chat rooms:', error);
      throw error;
    }
  }

  // Update doctor online status
  async updateDoctorStatus(doctorPhone, isOnline) {
    try {
      const response = await fetch(`${API_URL}/doctors/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: doctorPhone, isOnline }),
      });
      return response.json();
    } catch (error) {
      console.error('Error updating doctor status:', error);
      throw error;
    }
  }

  // Doctor login
  async loginDoctor(phoneNumber) {
    try {
      const response = await fetch(`${API_URL}/doctors/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error logging in doctor:', error);
      throw error;
    }
  }

  // Get patient information for doctor
  async getPatientInfo(patientPhone) {
    try {
      const response = await fetch(`${API_URL}/patients?phoneNumber=${patientPhone}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching patient info:', error);
      throw error;
    }
  }
}

export default new ChatService();
