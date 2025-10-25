import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const clearUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const email = 'chandika@gmail.com';
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (user) {
      console.log(`\n📧 Found user: ${user.name} (${user.email})`);
      console.log(`Created at: ${user.createdAt}`);
      
      // Delete the user
      await User.deleteOne({ email });
      console.log(`\n✅ User deleted successfully!`);
      console.log(`You can now register with ${email}\n`);
    } else {
      console.log(`\n❌ No user found with email: ${email}`);
      console.log('The email might be case-sensitive or have extra spaces.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearUser();
