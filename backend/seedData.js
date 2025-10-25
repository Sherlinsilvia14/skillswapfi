import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';
import Course from './models/Course.js';

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

const runSeed = async () => {
  await connectDB();
  await seedQuizzes();
  
  console.log('\n✨ Seeding complete!');
  console.log('You can now take quizzes in the application.');
  
  process.exit(0);
};

runSeed();
