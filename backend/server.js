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

// Connect to MongoDB
connectDB();

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
    } catch (err) {
      socket.emit("message-error", { error: err.message });
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

export default app;
