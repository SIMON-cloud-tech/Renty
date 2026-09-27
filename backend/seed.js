require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const NAME = 'Simon';
const EMAIL = 'simonmbithi143@gmail.com';
const PASSWORD = 'simon318@2018'; // change this after your first login

(async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI; // use whichever name your .env has
  if (!uri) {
    console.error('No MongoDB connection string found in .env (expected MONGO_URI)');
    process.exit(1);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected.');

    const users = client.db().collection('users');

    const { deletedCount } = await users.deleteMany({});
    console.log(`Deleted ${deletedCount} existing user(s).`);

    const now = new Date();
    await users.insertOne({
      name: NAME,
      email: EMAIL.toLowerCase(),
      password: await bcrypt.hash(PASSWORD, 10),
      role: 'business',
      createdAt: now,
      updatedAt: now,
    });

    console.log(`Business account created for ${EMAIL}. Log in at /admin.`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();