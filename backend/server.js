// backend/server.js
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
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// ⚡ Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// ========== API Routes ==========
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);

// Health route
app.get('/health', (req, res) => {
  res.json({ message: "SkillSwap API Running", version: "1.0.0" });
});

// ====================== SERVE REACT FRONTEND ======================

// FRONTEND BUILD SHOULD BE INSIDE: backend/build
const FRONTEND_PATH = path.join(__dirname, "build");

if (fs.existsSync(FRONTEND_PATH)) {
  console.log("✅ React build found. Serving frontend...");

  app.use(express.static(FRONTEND_PATH));

  // Send index.html for non-API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
  });

} else {
  console.log("⚠️ No React build found at backend/build. Frontend not served.");
}

// ====================== SOCKET.IO LOGIC ======================
const connectedUsers = new Map();
global.io = io;
global.connectedUsers = connectedUsers;

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on("user-online", async (userId) => {
    try {
      socket.userId = userId;
      connectedUsers.set(userId, socket.id);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      io.emit("user-status-changed", { userId, isOnline: true });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("send-message", async (data) => {
    try {
      const { senderId, receiverId, content, messageType, fileUrl } = data;

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType: messageType || "text",
        fileUrl
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name profileImage")
        .populate("receiver", "name profileImage");

      const receiverSocket = connectedUsers.get(receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", populated);
      }

      socket.emit("message-sent", populated);

      // 🤖 Mock User Auto-Reply Logic
      const receiver = await User.findById(receiverId);
      if (receiver && ['alice@test.com', 'bob@test.com', 'charlie@test.com'].includes(receiver.email)) {
        // Send a typing event first
        setTimeout(() => {
          socket.emit("user-typing", { userId: receiverId, isTyping: true });
        }, 400);

        setTimeout(async () => {
          // Stop typing event
          socket.emit("user-typing", { userId: receiverId, isTyping: false });

          let replyContent = `Hey! Thanks for messaging me. I'm a seeded tutor on SkillSwap. Feel free to request a learning session with me via the Search tab, and we can test the WebRTC video calling!`;
          const msg = content.toLowerCase();
          
          if (receiver.email === 'alice@test.com') {
            if (msg.includes('react') || msg.includes('javascript') || msg.includes('js') || msg.includes('frontend')) {
              replyContent = `Hi! I saw you are interested in React/JavaScript. I can definitely help you with that! Just request a session with me from the 'Search Users' page.`;
            } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
              replyContent = `Hello there! I am Alice, a frontend developer. How can I help you with web development today?`;
            }
          } else if (receiver.email === 'bob@test.com') {
            if (msg.includes('python') || msg.includes('data science') || msg.includes('machine learning') || msg.includes('ml')) {
              replyContent = `Hey! Python and Data Science are my specialties. Let's do a swap! Request a session and let's get started.`;
            } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
              replyContent = `Hey! I'm Bob, a data scientist. Ready to learn some Python?`;
            }
          } else if (receiver.email === 'charlie@test.com') {
            if (msg.includes('communication') || msg.includes('leadership') || msg.includes('speaking')) {
              replyContent = `Hi! Soft skills are extremely important. I can help you with public speaking and mock interviews. Request a session on my profile!`;
            } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
              replyContent = `Hello! Charlie here, communication coach. How can I help you improve your speaking today?`;
            }
          }

          // Create the auto-reply message in DB
          const replyMessage = await Message.create({
            sender: receiverId,
            receiver: senderId,
            content: replyContent,
            messageType: "text"
          });

          const populatedReply = await Message.findById(replyMessage._id)
            .populate("sender", "name profileImage")
            .populate("receiver", "name profileImage");

          // Send to the user's socket
          socket.emit("receive-message", populatedReply);
        }, 1800); // 1.8 seconds delay to feel realistic
      }

    } catch (err) {
      socket.emit("message-error", { error: err.message });
    }
  });

  // 📝 Typing status handlers
  socket.on("typing", (data) => {
    const { receiverId, senderId } = data;
    const receiverSocket = connectedUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("user-typing", { userId: senderId, isTyping: true });
    }
  });

  socket.on("stop-typing", (data) => {
    const { receiverId, senderId } = data;
    const receiverSocket = connectedUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("user-typing", { userId: senderId, isTyping: false });
    }
  });

  // 🤖 AI Chatbot handler
  socket.on("chatbot-message", async (data) => {
    try {
      const { message } = data;
      let response = "I'm here to help you swap skills! Ask me about search, booking sessions, quizzes, or video calls.";
      const msg = message.toLowerCase();
      
      if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        response = "Hello! I'm SkillBot, your learning companion. How can I help you today?";
      } else if (msg.includes("search") || msg.includes("find")) {
        response = "You can search for people by clicking 'Search Users' in the sidebar. You can filter by skill, city, and availability to find the perfect learning partner!";
      } else if (msg.includes("session") || msg.includes("book") || msg.includes("request")) {
        response = "To book a session, find a user on the Search page and click 'Request to Learn'. Once they accept, it will appear under 'Sessions' where you can start a WebRTC video call.";
      } else if (msg.includes("video") || msg.includes("call") || msg.includes("webrtc")) {
        response = "Once a session is accepted, both users can join a WebRTC video call. You'll find the join button in the 'Sessions' tab. Video calls feature screen sharing and notes!";
      } else if (msg.includes("quiz") || msg.includes("test")) {
        response = "Test your skills with quizzes! Click 'Quizzes' in the sidebar, select a skill like JavaScript or Python, and submit your answers to see your score.";
      } else if (msg.includes("course")) {
        response = "Under the 'Courses' tab, you can view structured learning content created by experts and track your progress as you learn!";
      }

      setTimeout(() => {
        socket.emit("chatbot-response", { response });
      }, 800);
    } catch (err) {
      console.error("Chatbot error:", err);
    }
  });

  // 🎥 WebRTC Signaling handlers
  socket.on("call-user", (data) => {
    const { userId, offer, roomId } = data;
    const receiverSocket = connectedUsers.get(userId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("incoming-call", {
        from: socket.userId,
        offer,
        roomId
      });
    }
  });

  socket.on("answer-call", (data) => {
    const { userId, answer } = data;
    const receiverSocket = connectedUsers.get(userId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("call-answered", {
        from: socket.userId,
        answer
      });
    }
  });

  socket.on("ice-candidate", (data) => {
    const { userId, candidate } = data;
    const receiverSocket = connectedUsers.get(userId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("ice-candidate", {
        from: socket.userId,
        candidate
      });
    }
  });

  socket.on("end-call", (data) => {
    const { userId } = data;
    const receiverSocket = connectedUsers.get(userId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("call-ended", {
        from: socket.userId
      });
    }
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      io.emit("user-status-changed", { userId: socket.userId, isOnline: false });
    }
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ====================== ERROR HANDLING ======================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to DataBase first
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`
╔═════════════════════════════════════╗
║    🚀 SkillSwap Server Running      ║
║    🌍 Port: ${PORT}                     ║
║    💾 MongoDB Connected             ║
║    ⚡ Socket.IO Active              ║
╚═════════════════════════════════════╝
`);
    });
  } catch (error) {
    console.error("Failed to connect to DB, server not started:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
