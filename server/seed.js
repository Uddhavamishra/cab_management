const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'System Admin',
      phone: '0000000000',
    });

    console.log('✅ Admin user created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
