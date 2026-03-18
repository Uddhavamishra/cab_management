require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Driver
    let driver = await User.findOne({ username: 'driver' });
    if (!driver) {
      await User.create({
        username: 'driver',
        password: 'driver123',
        role: 'driver',
        name: 'Test Driver',
        phone: '1234567890'
      });
      console.log('Created driver / driver123');
    } else {
      console.log('Driver already exists');
    }

    // Employee
    let emp = await User.findOne({ username: 'employee' });
    if (!emp) {
      await User.create({
        username: 'employee',
        password: 'employee123',
        role: 'employee',
        name: 'Test Employee',
        phone: '0987654321',
        address: 'Test Address 123'
      });
      console.log('Created employee / employee123');
    } else {
      console.log('Employee already exists');
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

createTestUsers();
