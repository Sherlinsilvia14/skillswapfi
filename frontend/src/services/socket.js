import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket || !this.socket.connected) {
      if (this.socket && !this.socket.connected) {
        // Socket exists but disconnected, try to reconnect
        this.socket.connect();
      } else {
        // Create new socket connection
        this.socket = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 10
        });

        this.socket.on('connect', () => {
          console.log('✅ Socket connected');
          if (userId) {
            this.socket.emit('user-online', userId);
          }
        });

        this.socket.on('disconnect', () => {
          console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
      }
      
      // Emit user-online if userId is provided and socket is connected
      if (userId && this.socket.connected) {
        this.socket.emit('user-online', userId);
      }
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Message events
  sendMessage(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send-message', data);
    } else {
      console.warn('Socket not connected. Cannot send message.');
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  // Typing events
  sendTyping(receiverId, senderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { receiverId, senderId });
    }
  }

  stopTyping(receiverId, senderId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop-typing', { receiverId, senderId });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Video call events
  callUser(userId, offer, roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('call-user', { userId, offer, roomId });
    }
  }

  answerCall(userId, answer) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('answer-call', { userId, answer });
    }
  }

  sendIceCandidate(userId, candidate) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('ice-candidate', { userId, candidate });
    }
  }

  endCall(userId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('end-call', { userId });
    }
  }

  onIncomingCall(callback) {
    if (this.socket) {
      this.socket.on('incoming-call', callback);
    }
  }

  onCallAnswered(callback) {
    if (this.socket) {
      this.socket.on('call-answered', callback);
    }
  }

  onIceCandidate(callback) {
    if (this.socket) {
      this.socket.on('ice-candidate', callback);
    }
  }

  onCallEnded(callback) {
    if (this.socket) {
      this.socket.on('call-ended', callback);
    }
  }

  // Room events
  joinRoom(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-room', roomId);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  // Chatbot events
  sendChatbotMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('chatbot-message', { message });
    }
  }

  onChatbotResponse(callback) {
    if (this.socket) {
      this.socket.on('chatbot-response', callback);
    }
  }

  // Notification events
  sendNotification(userId, notification) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send-notification', { userId, notification });
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  // User status events
  onUserStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('user-status-changed', callback);
    }
  }

  // Clean up all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;
