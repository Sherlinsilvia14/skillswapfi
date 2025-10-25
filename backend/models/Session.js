import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  duration: {
    type: Number,
    default: 1
  },
  actualDuration: {
    type: Number
  },
  notes: {
    type: String
  },
  sessionNotes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
  roomId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
