const mongoose = require('mongoose');
const User = require('./path/to/user/model');
const Thought = require('./path/to/thought/model');
const Reaction = require('./path/to/reaction/model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// Define an array of user data to seed the database
const userData = [
  {
    username: 'user1',
    email: 'user1@example.com',
    thoughts: [],
    friends: [],
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    thoughts: [],
    friends: [],
  },
  // Add more user data as needed
];

// Define an array of thought data to seed the database
const thoughtData = [
  {
    thoughtText: 'Thought 1',
    username: 'user1',
    reactions: [],
  },
  {
    thoughtText: 'Thought 2',
    username: 'user2',
    reactions: [],
  },
  // Add more thought data as needed
];

// Define an array of reaction data to seed the database
const reactionData = [
  {
    reactionBody: 'Reaction 1',
    username: 'user1',
  },
  {
    reactionBody: 'Reaction 2',
    username: 'user2',
  },
  // Add more reaction data as needed
];

// Function to seed the database with user, thought, and reaction data
const seedDatabase = async () => {
  try {
    // Clear the existing collections
    await User.deleteMany();
    await Thought.deleteMany();
    await Reaction.deleteMany();

    // Insert the user data into the database
    const createdUsers = await User.insertMany(userData);

    // Insert the thought data into the database
    const createdThoughts = await Thought.insertMany(thoughtData);

    // Insert the reaction data into the database and associate with respective thoughts
    for (let i = 0; i < reactionData.length; i++) {
      const reaction = reactionData[i];
      const thought = createdThoughts[i % createdThoughts.length];
      const createdReaction = await Reaction.create(reaction);
      thought.reactions.push(createdReaction);
      await thought.save();
    }

    // Update the user's thoughts array with the created thought references
    for (let i = 0; i < createdThoughts.length; i++) {
      const thought = createdThoughts[i];
      const user = createdUsers.find((user) => user.username === thought.username);
      user.thoughts.push(thought);
      await user.save();
    }

    console.log('Database seeded successfully');
    db.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    db.close();
  }
};

// Call the seedDatabase function to seed the database
seedDatabase();