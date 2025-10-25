# SkillSwap Setup Guide

Complete step-by-step guide to set up and run the SkillSwap application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js) or **yarn**

## Installation Steps

### 1. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from the official website
2. Run the installer and follow the installation wizard
3. MongoDB will automatically start as a Windows service

#### Verify MongoDB is Running:
```powershell
mongod --version
```

Or check if MongoDB service is running in Windows Services.

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

#### Install Dependencies:
```bash
npm install
```

#### Configure Environment Variables:
The `.env` file has already been created with default values. Update these values if needed:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=skillswap_secret_key_2024_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**For Email Features (Optional):**
To enable email notifications, update these values in `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

**Note:** For Gmail, you need to generate an "App Password" from your Google Account settings.

#### Start the Backend Server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 SkillSwap Server Running
📡 Port: 5000
```

The backend API will be running at `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
```

#### Install Dependencies:
```bash
npm install
```

#### Configure Environment Variables:
The `.env` file has already been created. Verify the values:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### Start the Frontend Development Server:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, navigate to `http://localhost:3000` in your browser.

## First Time Usage

### 1. Create an Account

1. Click on "Sign up" from the login page
2. Fill in your details:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
   - Contact Number
   - City
3. Click "Create Account"

### 2. Complete Onboarding

After registration, you'll be guided through a 3-step onboarding:

**Step 1: Skills to Learn**
- Select technical and/or non-technical skills you want to learn
- You can also add custom skills
- Click "Next Step"

**Step 2: Skills to Teach**
- Select skills you can teach others
- Add custom skills if needed
- Click "Next Step"

**Step 3: Schedule Preferences**
- Select your preferred time slots (Morning, Afternoon, Evening, Night)
- Select days of the week you're available
- Click "Complete Setup"

### 3. Explore the Dashboard

You'll be redirected to your dashboard where you can:
- View your statistics
- Search for teachers/learners
- Book sessions
- Start chatting
- Take quizzes
- And much more!

## Features Overview

### 🔐 Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes

### 👤 User Profile
- Complete profile management
- Skills showcase
- Achievements and badges
- Endorsements system

### 🔍 Search & Match
- Advanced search filters
- Skill-based matching
- Location and availability filtering

### 📅 Session Management
- Request learning sessions
- Accept/reject session requests
- Track session history
- Rate and review teachers

### 💬 Real-Time Chat
- Socket.IO powered messaging
- Typing indicators
- Online/offline status
- AI Chatbot assistant

### 🎥 Video Calls
- WebRTC video conferencing
- Screen sharing
- Speech-to-text notes generation
- Session recording capabilities

### 📝 Quizzes & Assessments
- Skill-based quizzes
- Randomized questions
- Progress tracking
- Pass/fail scoring

### 📚 Micro-Courses
- Structured learning content
- Progress tracking
- Enrollment system

### 🏆 Gamification
- Points and rewards system
- Achievement badges
- Leaderboards (teaching & learning)
- Reputation levels (Beginner, Intermediate, Expert)

### 🔔 Notifications
- Real-time notifications
- Session reminders
- Achievement alerts
- Message notifications

## Testing the Application

### Create Multiple Users

To fully test the application features:

1. Create at least 2 user accounts (use different email addresses)
2. Complete onboarding for both with different skills
3. Use one account to search for the other
4. Request a learning session
5. Accept the session from the other account
6. Start a video call
7. Test the chat feature

### Test Different Features

1. **Chat**: Send messages between users
2. **Chatbot**: Click the chatbot button in chat
3. **Sessions**: Request, accept, and complete sessions
4. **Quizzes**: Take available quizzes (if any exist in database)
5. **Profile**: Update your profile information
6. **Endorsements**: Endorse skills of other users
7. **Follow**: Follow other users

## Troubleshooting

### MongoDB Connection Issues

**Error: "failed to connect to server"**

Solution:
1. Make sure MongoDB is running
2. Check Windows Services for MongoDB service
3. Verify `MONGODB_URI` in backend `.env`

### Port Already in Use

**Error: "Port 5000 is already in use"**

Solution:
1. Change the PORT in backend `.env` to another port (e.g., 5001)
2. Update `REACT_APP_API_URL` in frontend `.env` accordingly

**Error: "Port 3000 is already in use"**

Solution:
- The terminal will ask if you want to run on another port, type 'Y'

### CORS Errors

If you see CORS errors in browser console:
1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Restart the backend server

### Dependencies Installation Issues

If `npm install` fails:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

Or try using yarn:
```bash
yarn install
```

### WebRTC/Video Call Issues

If video calls don't work:
1. Make sure you've granted camera/microphone permissions in your browser
2. Use HTTPS in production (WebRTC requires secure context)
3. Check browser console for specific errors

### Speech Recognition Not Working

Speech-to-text uses the Web Speech API which:
- Only works in Chrome/Edge browsers
- Requires HTTPS in production
- Needs microphone permissions

## Production Deployment

### Environment Variables

Update these for production:

**Backend:**
```
NODE_ENV=production
JWT_SECRET=generate_a_strong_random_secret
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend:**
```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy Backend

Deploy to platforms like:
- Heroku
- DigitalOcean
- AWS
- Railway
- Render

### Database

Use MongoDB Atlas for production database:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in production environment

## Additional Notes

### Default Features

The application includes:
- Complete authentication system
- Multi-step onboarding
- Dashboard with statistics
- Real-time chat with chatbot
- Video calling with screen share
- Session management
- Profile management
- Notifications system
- Leaderboards
- Quiz system (requires quiz data to be added)
- Course system

### Adding Sample Data

To add sample quizzes, you can use the admin endpoints or directly insert into MongoDB.

### Security Considerations

For production:
1. Change all default secrets
2. Use HTTPS
3. Enable rate limiting
4. Add input validation
5. Implement proper error handling
6. Use environment-specific configurations

## Support

For issues or questions:
- Check the troubleshooting section
- Review browser console for errors
- Check backend terminal for server errors
- Ensure all services are running

## Next Steps

1. Explore all features
2. Customize the UI to match your brand
3. Add more quiz content
4. Create sample courses
5. Invite users to test
6. Gather feedback and improve

---

**Happy Learning and Teaching! 🎓✨**
