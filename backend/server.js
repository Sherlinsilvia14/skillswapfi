import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import Message from './models/Message.js';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increased limit for image uploads
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SkillSwap API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins
  socket.on('user-online', async (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;

    // Update user status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Broadcast online status
    io.emit('user-status-changed', { userId, isOnline: true });
    console.log(`👤 User ${userId} is online`);
  });

  // Private message
  socket.on('send-message', async (data) => {
    try {
      const { senderId, receiverId, content, messageType, fileUrl } = data;

      // Save message to database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType: messageType || 'text',
        fileUrl
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage');

      // Send to receiver if online
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', populatedMessage);
      }

      // Send back to sender
      socket.emit('message-sent', populatedMessage);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        userId: data.senderId,
        isTyping: true
      });
    }
  });

  socket.on('stop-typing', (data) => {
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        userId: data.senderId,
        isTyping: false
      });
    }
  });

  // Video call signaling
  socket.on('call-user', (data) => {
    const { userId, offer, roomId } = data;
    const userSocketId = connectedUsers.get(userId);
    
    if (userSocketId) {
      io.to(userSocketId).emit('incoming-call', {
        from: socket.userId,
        offer,
        roomId
      });
    }
  });

  socket.on('answer-call', (data) => {
    const { userId, answer } = data;
    const userSocketId = connectedUsers.get(userId);
    
    if (userSocketId) {
      io.to(userSocketId).emit('call-answered', {
        from: socket.userId,
        answer
      });
    }
  });

  socket.on('ice-candidate', (data) => {
    const { userId, candidate } = data;
    const userSocketId = connectedUsers.get(userId);
    
    if (userSocketId) {
      io.to(userSocketId).emit('ice-candidate', {
        from: socket.userId,
        candidate
      });
    }
  });

  socket.on('end-call', (data) => {
    const { userId } = data;
    const userSocketId = connectedUsers.get(userId);
    
    if (userSocketId) {
      io.to(userSocketId).emit('call-ended', {
        from: socket.userId
      });
    }
  });

  // Join video room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.userId);
    console.log(`👥 User ${socket.userId} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', socket.userId);
    console.log(`👋 User ${socket.userId} left room ${roomId}`);
  });

  // Chatbot
  socket.on('chatbot-message', (data) => {
    const { message } = data;
    const response = getChatbotResponse(message);
    socket.emit('chatbot-response', { response });
  });

  // Notification
  socket.on('send-notification', (data) => {
    const { userId, notification } = data;
    const userSocketId = connectedUsers.get(userId);
    
    if (userSocketId) {
      io.to(userSocketId).emit('new-notification', notification);
    }
  });

  // Disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status
      io.emit('user-status-changed', { userId: socket.userId, isOnline: false });
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

// Simple chatbot responses
function getChatbotResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello! How can I help you with SkillSwap today?';
  } else if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
    return 'SkillSwap allows you to exchange skills with others. You can search for people who teach what you want to learn, request sessions, and connect via video calls!';
  } else if (lowerMessage.includes('book') || lowerMessage.includes('session')) {
    return 'To book a session, go to Search Users, find someone teaching the skill you want, and click "Request to Learn". Once they accept, you can schedule your session!';
  } else if (lowerMessage.includes('video') || lowerMessage.includes('call')) {
    return 'Video calls are available for accepted sessions. Once a session is active, you\'ll see a "Start Video Call" button. Make sure you\'ve granted camera and microphone permissions!';
  } else if (lowerMessage.includes('points') || lowerMessage.includes('rewards')) {
    return 'You earn points by teaching sessions. Points can be used to unlock sessions with expert teachers. Check the leaderboard to see top teachers!';
  } else if (lowerMessage.includes('quiz')) {
    return 'Take quizzes to test your knowledge in different skills. You can find quizzes in the Quizzes section. Pass with 70% or higher!';
  } else {
    return 'I\'m here to help! You can ask me about how SkillSwap works, booking sessions, video calls, points, or quizzes.';
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 SkillSwap Server Running        ║
  ║   📡 Port: ${PORT}                      ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}    ║
  ║   💾 Database: Connected              ║
  ║   ⚡ Socket.IO: Active                 ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
