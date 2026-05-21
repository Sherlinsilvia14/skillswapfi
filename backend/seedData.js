import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const sampleUsers = [
  {
    name: 'Alice Smith',
    email: 'alice@test.com',
    password: 'password123',
    contactNumber: '1234567890',
    city: 'New York',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Frontend developer with 5+ years of experience. Love teaching React and JavaScript!',
    skillsToLearn: ['Python', 'Machine Learning'],
    skillsToTeach: ['JavaScript', 'React', 'UI/UX Design'],
    schedule: {
      timePreferences: ['Morning', 'Evening'],
      daysOfWeek: ['Monday', 'Wednesday', 'Friday']
    },
    completedOnboarding: true,
    stats: {
      totalHoursTaught: 35,
      totalHoursLearned: 10,
      rating: 4.8,
      totalRatings: 8,
      points: 350
    },
    level: 'Intermediate'
  },
  {
    name: 'Bob Jones',
    email: 'bob@test.com',
    password: 'password123',
    contactNumber: '9876543210',
    city: 'San Francisco',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: "Python enthusiast, data scientist, and tech mentor. Let's swap some knowledge!",
    skillsToLearn: ['React', 'UI/UX Design'],
    skillsToTeach: ['Python', 'Machine Learning', 'Data Science'],
    schedule: {
      timePreferences: ['Evening', 'Night'],
      daysOfWeek: ['Tuesday', 'Thursday', 'Saturday']
    },
    completedOnboarding: true,
    stats: {
      totalHoursTaught: 60,
      totalHoursLearned: 15,
      rating: 4.9,
      totalRatings: 12,
      points: 600
    },
    level: 'Expert'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@test.com',
    password: 'password123',
    contactNumber: '5551234567',
    city: 'New York',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Public speaker and communication coach. Here to help you master presentation and interview skills!',
    skillsToLearn: ['Web Development', 'Python'],
    skillsToTeach: ['Communication', 'Leadership', 'Public Speaking'],
    schedule: {
      timePreferences: ['Afternoon', 'Evening'],
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
    },
    completedOnboarding: true,
    stats: {
      totalHoursTaught: 15,
      totalHoursLearned: 5,
      rating: 4.5,
      totalRatings: 4,
      points: 150
    },
    level: 'Beginner'
  }
];

const sampleQuizzes = [
  {
    skill: 'JavaScript',
    title: 'JavaScript Fundamentals',
    difficulty: 'beginner',
    passingScore: 70,
    questions: [
      {
        question: 'What is the correct syntax for referring to an external script called "app.js"?',
        options: [
          '<script src="app.js">',
          '<script name="app.js">',
          '<script href="app.js">',
          '<script file="app.js">'
        ],
        correctAnswer: 0,
        explanation: 'The src attribute specifies the URL of an external script file.'
      },
      {
        question: 'How do you create a function in JavaScript?',
        options: [
          'function myFunction()',
          'function:myFunction()',
          'function = myFunction()',
          'create myFunction()'
        ],
        correctAnswer: 0,
        explanation: 'Functions are defined using the function keyword followed by the function name.'
      },
      {
        question: 'How do you call a function named "myFunction"?',
        options: [
          'call myFunction()',
          'myFunction()',
          'call function myFunction()',
          'Call.myFunction()'
        ],
        correctAnswer: 1,
        explanation: 'Functions are called by their name followed by parentheses.'
      },
      {
        question: 'How to write an IF statement in JavaScript?',
        options: [
          'if i = 5 then',
          'if i == 5 then',
          'if (i == 5)',
          'if i = 5'
        ],
        correctAnswer: 2,
        explanation: 'If statements use parentheses around the condition.'
      },
      {
        question: 'Which operator is used to assign a value to a variable?',
        options: [
          '*',
          '=',
          '-',
          'x'
        ],
        correctAnswer: 1,
        explanation: 'The = operator assigns values to variables.'
      }
    ]
  },
  {
    skill: 'Python',
    title: 'Python Basics',
    difficulty: 'beginner',
    passingScore: 70,
    questions: [
      {
        question: 'What is the correct file extension for Python files?',
        options: [
          '.pyth',
          '.pt',
          '.py',
          '.python'
        ],
        correctAnswer: 2,
        explanation: 'Python files use the .py extension.'
      },
      {
        question: 'How do you insert COMMENTS in Python code?',
        options: [
          '/* This is a comment */',
          '// This is a comment',
          '# This is a comment',
          '<!-- This is a comment -->'
        ],
        correctAnswer: 2,
        explanation: 'Python uses # for single-line comments.'
      },
      {
        question: 'Which one is NOT a legal variable name?',
        options: [
          'my_var',
          '_myvar',
          '2myvar',
          'myVar'
        ],
        correctAnswer: 2,
        explanation: 'Variable names cannot start with a number.'
      },
      {
        question: 'How do you create a variable with the numeric value 5?',
        options: [
          'x = 5',
          'x = int(5)',
          'Both A and B',
          'var x = 5'
        ],
        correctAnswer: 2,
        explanation: 'Both methods create a numeric variable with value 5.'
      },
      {
        question: 'What is the correct syntax to output "Hello World" in Python?',
        options: [
          'echo "Hello World"',
          'p("Hello World")',
          'print("Hello World")',
          'console.log("Hello World")'
        ],
        correctAnswer: 2,
        explanation: 'print() is the function used to output text in Python.'
      }
    ]
  },
  {
    skill: 'React',
    title: 'React Fundamentals',
    difficulty: 'intermediate',
    passingScore: 70,
    questions: [
      {
        question: 'What is React?',
        options: [
          'A JavaScript framework',
          'A JavaScript library',
          'A programming language',
          'A database'
        ],
        correctAnswer: 1,
        explanation: 'React is a JavaScript library for building user interfaces.'
      },
      {
        question: 'What is JSX?',
        options: [
          'A JavaScript extension',
          'A syntax extension for JavaScript',
          'A new programming language',
          'A CSS framework'
        ],
        correctAnswer: 1,
        explanation: 'JSX is a syntax extension for JavaScript that looks similar to HTML.'
      },
      {
        question: 'How do you create a React component?',
        options: [
          'Using functions or classes',
          'Using HTML only',
          'Using CSS only',
          'Using databases'
        ],
        correctAnswer: 0,
        explanation: 'React components can be created using functions or classes.'
      },
      {
        question: 'What is the correct way to update state in React?',
        options: [
          'this.state = newState',
          'setState(newState)',
          'updateState(newState)',
          'changeState(newState)'
        ],
        correctAnswer: 1,
        explanation: 'State should be updated using the setState() method or useState hook.'
      },
      {
        question: 'What are props in React?',
        options: [
          'Properties passed to components',
          'A type of state',
          'CSS styles',
          'HTML attributes'
        ],
        correctAnswer: 0,
        explanation: 'Props are properties that are passed from parent to child components.'
      }
    ]
  },
  {
    skill: 'Communication',
    title: 'Effective Communication Skills',
    difficulty: 'beginner',
    passingScore: 70,
    questions: [
      {
        question: 'What is active listening?',
        options: [
          'Waiting for your turn to speak',
          'Fully concentrating on what is being said',
          'Interrupting to add your thoughts',
          'Thinking about your response while someone speaks'
        ],
        correctAnswer: 1,
        explanation: 'Active listening means fully concentrating, understanding, and responding thoughtfully.'
      },
      {
        question: 'Which of these is a barrier to effective communication?',
        options: [
          'Clear language',
          'Active listening',
          'Distractions',
          'Eye contact'
        ],
        correctAnswer: 2,
        explanation: 'Distractions prevent effective communication by reducing focus and attention.'
      },
      {
        question: 'What percentage of communication is non-verbal?',
        options: [
          '10-20%',
          '30-40%',
          '50-60%',
          '70-93%'
        ],
        correctAnswer: 3,
        explanation: 'Studies show that 70-93% of communication is non-verbal, including body language and tone.'
      },
      {
        question: 'What is empathy in communication?',
        options: [
          'Agreeing with everything someone says',
          'Understanding and sharing feelings of others',
          'Giving advice immediately',
          'Solving problems for others'
        ],
        correctAnswer: 1,
        explanation: 'Empathy is the ability to understand and share the feelings of another person.'
      },
      {
        question: 'Which is the best way to handle disagreements?',
        options: [
          'Avoid the conversation',
          'Raise your voice to make your point',
          'Listen and find common ground',
          'Insist you are right'
        ],
        correctAnswer: 2,
        explanation: 'Effective conflict resolution involves listening and seeking mutual understanding.'
      }
    ]
  }
];

const seedQuizzes = async () => {
  try {
    await Quiz.deleteMany({});
    console.log('🗑️  Cleared existing quizzes');

    await Quiz.insertMany(sampleQuizzes);
    console.log('✅ Sample quizzes added successfully!');
    console.log(`📝 Added ${sampleQuizzes.length} quizzes`);
  } catch (error) {
    console.error('❌ Error seeding quizzes:', error);
  }
};

const seedUsersAndCourses = async () => {
  try {
    // 1. Clean existing test users
    await User.deleteMany({ email: { $in: ['alice@test.com', 'bob@test.com', 'charlie@test.com'] } });
    console.log('🗑️  Cleared existing sample users');

    // 2. Insert new sample users (User.create runs save hooks to hash passwords)
    const createdUsers = await User.create(sampleUsers);
    console.log('✅ Sample users created successfully!');

    // Find instructors
    const alice = createdUsers.find(u => u.email === 'alice@test.com');
    const bob = createdUsers.find(u => u.email === 'bob@test.com');

    // 3. Clean existing courses
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing courses');

    // 4. Create sample courses
    const sampleCourses = [
      {
        title: 'React for Beginners',
        description: 'Learn the fundamentals of React, including components, props, state, and hooks.',
        instructor: alice._id,
        skill: 'React',
        level: 'beginner',
        content: [
          { type: 'video', title: 'Introduction to React', duration: 15 },
          { type: 'document', title: 'Setting up your development environment' },
          { type: 'video', title: 'Understanding JSX', duration: 20 }
        ]
      },
      {
        title: 'Python Data Science Masterclass',
        description: 'Dive deep into Python, NumPy, Pandas, and Matplotlib for data analysis and visualization.',
        instructor: bob._id,
        skill: 'Python',
        level: 'intermediate',
        content: [
          { type: 'video', title: 'Python Basics Recap', duration: 30 },
          { type: 'video', title: 'Introduction to Pandas', duration: 45 },
          { type: 'document', title: 'Pandas cheatsheet' }
        ]
      }
    ];

    await Course.insertMany(sampleCourses);
    console.log('✅ Sample courses added successfully!');

  } catch (error) {
    console.error('❌ Error seeding users and courses:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedQuizzes();
  await seedUsersAndCourses();
  
  console.log('\n✨ Seeding complete!');
  console.log('You can now search for users and take quizzes in the application.');
  
  process.exit(0);
};

runSeed();
