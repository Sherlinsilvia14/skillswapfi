# 🌟 SkillSwap - Skill Bartering Platform

SkillSwap is a full-stack web application where users can exchange skills, teach and learn from each other through video sessions, real-time chat, and structured courses.

## 🚀 Features

### Core Features
- ✅ **Authentication System** - JWT-based auth with bcrypt password hashing
- ✅ **Multi-Step Onboarding** - Skills selection and schedule preferences
- ✅ **Dashboard** - User statistics, achievements, and rewards
- ✅ **Real-Time Chat** - Socket.IO powered messaging with chatbot
- ✅ **Video Calls** - WebRTC integration for live sessions
- ✅ **Skill Matching** - Smart matching algorithm
- ✅ **Session Booking** - Request and accept teaching sessions
- ✅ **Gamification** - Points, badges, and leaderboards
- ✅ **Quizzes & Assessments** - Test your knowledge
- ✅ **Skill Endorsements** - LinkedIn-style endorsements
- ✅ **Micro-Courses** - Upload and share learning content
- ✅ **Session Reminders** - Email and push notifications
- ✅ **Speech-to-Text** - Auto-generate session notes
- ✅ **Admin Dashboard** - Manage users and content

## 🛠️ Tech Stack

**Frontend:**
- React.js
- CSS3 (Responsive Design)
- Socket.IO Client
- WebRTC / PeerJS
- Web Speech API
- jsPDF

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Multer (File Upload)
- Nodemailer (Email)
- PDFKit (PDF Generation)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

5. Start the server:
```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend runs on: `http://localhost:3000`

## 📱 Usage

### First Time Setup

1. **Sign Up**: Create an account with name, email, password, contact, and city
2. **Onboarding Step 1**: Select skills you want to learn
3. **Onboarding Step 2**: Select skills you can teach
4. **Onboarding Step 3**: Choose your preferred schedule
5. **Dashboard**: View your profile and start exploring!

### Finding a Teacher/Learner

1. Go to **Search Users** from sidebar
2. Filter by skills, city, or availability
3. Click **Request to Learn** on matching profiles
4. Wait for acceptance notification

### Starting a Session

1. Once a session is accepted, both users are notified
2. Go to **Book Sessions** to see active sessions
3. Click **Start Video Call** when ready
4. Use screen sharing and whiteboard features during the call
5. Session notes are auto-generated from speech

### Gamification

- Earn points by teaching sessions
- Unlock badges for milestones (10, 50, 100 hours)
- Climb the leaderboard
- Use points to book expert sessions

### Chat

- Real-time messaging with Socket.IO
- See typing indicators
- Chat history stored in database
- Chatbot assistant for FAQs

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation and sanitization
- CORS enabled

## 📊 Database Models

- **User**: Profile, skills, schedule, stats
- **Session**: Booking details, status
- **Message**: Chat history
- **Notification**: User notifications
- **Quiz**: Questions and answers
- **Course**: Micro-courses with files
- **Endorsement**: Skill endorsements
- **Achievement**: Badges and rewards

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/search` - Search users by skills

### Sessions
- `POST /api/sessions` - Create session request
- `GET /api/sessions` - Get user sessions
- `PUT /api/sessions/:id` - Update session status

### Chat
- `GET /api/messages/:userId` - Get chat history
- `POST /api/messages` - Send message

### Quizzes
- `GET /api/quizzes/:skill` - Get quizzes for skill
- `POST /api/quizzes/submit` - Submit quiz answers

### Courses
- `POST /api/courses` - Upload course
- `GET /api/courses` - Get all courses
- `POST /api/courses/:id/enroll` - Enroll in course

## 🎨 UI/UX Features

- Fully responsive design (mobile, tablet, desktop)
- Modern color scheme and gradients
- Interactive buttons with hover effects
- Loading states and animations
- Toast notifications
- Modal dialogs
- Progress bars and stats visualization

## 🔄 Real-Time Features

- Live chat with Socket.IO
- Session notifications
- Typing indicators
- Online/offline status
- Session status updates

## 📈 Future Enhancements

- Mobile app (React Native)
- AI-powered recommendations
- Advanced analytics
- Payment integration for premium features
- Group sessions
- Recording sessions
- Calendar integration
- Social media sharing

## 👨‍💻 Development

### File Structure
```
skillswapfinal1/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       └── App.jsx
└── README.md
```

## 🐛 Known Issues

- WebRTC may require HTTPS in production
- Email service requires valid SMTP credentials
- MongoDB must be running for backend to start

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@skillswap.com or open an issue.

---

Built with ❤️ by the SkillSwap Team
