import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'session_request', 'session_accepted', 'session_rejected', 'session_started', 'achievement', 'endorsement', 'follow'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, {
  timestamps: true
});

notificationSchema.post('save', async function(doc) {
  try {
    if (global.io && global.connectedUsers) {
      const receiverSocketId = global.connectedUsers.get(doc.user.toString());
      if (receiverSocketId) {
        let populated = doc;
        if (doc.relatedUser) {
          populated = await doc.populate('relatedUser', 'name profileImage');
        }
        global.io.to(receiverSocketId).emit('new-notification', populated);
        console.log(`📡 Real-time notification sent to user ${doc.user}: ${doc.title}`);
      }
    }
  } catch (error) {
    console.error('Error sending real-time notification via socket:', error);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
