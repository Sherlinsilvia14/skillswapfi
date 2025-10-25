# 🚀 SkillSwap Quick Start Guide

Get SkillSwap up and running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js installed (v16+)
- ✅ MongoDB installed and running

## Step 1: Install Dependencies

Open **two terminals** in the project root directory.

### Terminal 1 - Backend:
```bash
cd backend
npm install
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
```

## Step 2: Start MongoDB

Make sure MongoDB is running. On Windows, it usually runs as a service automatically.

To verify:
```bash
mongod --version
```

## Step 3: Seed Sample Data (Optional)

In Terminal 1 (backend), add sample quizzes:
```bash
npm run seed
```

You should see: "✨ Seeding complete!"

## Step 4: Start the Servers

### Terminal 1 - Start Backend:
```bash
npm run dev
```

Wait for:
```
✅ MongoDB Connected
🚀 SkillSwap Server Running
📡 Port: 5000
```

### Terminal 2 - Start Frontend:
```bash
npm start
```

The app will open automatically at `http://localhost:3000`

## Step 5: Create Your Account

1. Click **"Sign up"**
2. Fill in your details
3. Complete the 3-step onboarding:
   - Select skills to learn
   - Select skills to teach
   - Choose your schedule
4. Welcome to SkillSwap! 🎉

## Quick Feature Tour

### 🔍 Find a Teacher
1. Click **"Search Users"** in sidebar
2. Filter by skill, city, or time
3. Click **"Request to Learn"** on any user

### 💬 Start Chatting
1. Click **"Chat"** in sidebar
2. Select a conversation or try the **🤖 Chatbot**
3. Type a message and send

### 📅 Manage Sessions
1. Click **"Sessions"** in sidebar
2. Accept incoming requests (if you're a teacher)
3. Start video calls for accepted sessions

### 📝 Take a Quiz
1. Click **"Quizzes"** in sidebar
2. Choose a quiz
3. Answer questions and submit
4. See your score!

### 🏆 Check Leaderboard
1. Click **"Leaderboard"** in sidebar
2. View top teachers and learners
3. See where you rank!

## Troubleshooting

**Can't connect to MongoDB?**
- Make sure MongoDB service is running
- Check Windows Services for "MongoDB"

**Port 5000 already in use?**
- Change PORT in `backend/.env` to 5001
- Update frontend `.env` to match

**Frontend won't start?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Testing Tips

### Create Multiple Users
To test the full experience:
1. Create 2-3 user accounts (use different emails)
2. Complete onboarding with different skills
3. Search for each other
4. Request and accept sessions
5. Test chat and video calls

### Sample Credentials
Use these patterns for testing:
- Email: `user1@test.com`, `user2@test.com`
- Password: `password123`
- City: `New York`, `San Francisco`, `London`

## Next Steps

✨ **You're all set!** Here's what you can do:

1. **Customize**: Update colors, logos, and branding
2. **Explore**: Try all features (chat, video, quizzes)
3. **Add Content**: Create more quizzes and courses
4. **Deploy**: Follow deployment guide in README.md
5. **Share**: Invite friends to join your platform

## Need Help?

- 📖 See `SETUP.md` for detailed setup instructions
- 📚 Check `README.md` for full documentation
- 🐛 Look at browser console for errors
- 💻 Check terminal output for server logs

---

**Happy Learning! 🎓**

Built with ❤️ using React, Node.js, MongoDB, and Socket.IO
