import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  socket = null;
  
  connect() {
    this.socket = io('https://mk-be-strapi-production.up.railway.app', {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('joinRoom', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', roomId);
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('newMessage', messageData);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback);
    }
  }

  emitTyping(roomId, userPhone) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, userPhone });
    }
  }

  emitStopTyping(roomId, userPhone) {
    if (this.socket) {
      this.socket.emit('stopTyping', { roomId, userPhone });
    }
  }

  onDoctorStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('doctorStatusUpdate', callback);
    }
  }
}

export default new SocketService();
