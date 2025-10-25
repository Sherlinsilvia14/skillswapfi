import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a contact number']
  },
  city: {
    type: String,
    required: [true, 'Please provide a city']
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: {
    type: String,
    default: ''
  },
  skillsToLearn: [{
    type: String
  }],
  skillsToTeach: [{
    type: String
  }],
  schedule: {
    timePreferences: [{
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night']
    }],
    daysOfWeek: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },
  stats: {
    totalHoursTaught: {
      type: Number,
      default: 0
    },
    totalHoursLearned: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    name: String,
    description: String,
    badge: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  endorsements: [{
    skill: String,
    endorsedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    endorsedAt: {
      type: Date,
      default: Date.now
    }
  }],
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedOnboarding: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update user level based on hours taught
userSchema.methods.updateLevel = function() {
  const hours = this.stats.totalHoursTaught;
  if (hours >= 51) {
    this.level = 'Expert';
  } else if (hours >= 21) {
    this.level = 'Intermediate';
  } else {
    this.level = 'Beginner';
  }
};

const User = mongoose.model('User', userSchema);

export default User;
