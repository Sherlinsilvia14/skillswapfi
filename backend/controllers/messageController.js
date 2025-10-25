import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get chat history
// @route   GET /api/messages/:userId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType, fileUrl } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      messageType: messageType || 'text',
      fileUrl
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:userId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'name profileImage isOnline')
      .populate('receiver', 'name profileImage isOnline')
      .sort('-createdAt');

    // Get unique users
    const conversationsMap = new Map();
    
    for (const message of messages) {
      const otherUser = message.sender._id.toString() === req.user._id.toString() 
        ? message.receiver 
        : message.sender;
      
      const userId = otherUser._id.toString();
      
      if (!conversationsMap.has(userId)) {
        conversationsMap.set(userId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0
        });
      }
    }

    // Count unread messages
    for (const [userId, conversation] of conversationsMap) {
      const unreadCount = await Message.countDocuments({
        sender: userId,
        receiver: req.user._id,
        isRead: false
      });
      conversation.unreadCount = unreadCount;
    }

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
