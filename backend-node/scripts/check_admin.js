const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/pinnawala-gems')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check for admin users
      const adminUsers = await User.find({ role: 'admin' });
      console.log('Admin users found:', adminUsers.length);
      
      if (adminUsers.length === 0) {
        console.log('No admin users found. Creating one...');
        
        // Check if there's any user we can promote to admin
        const anyUser = await User.findOne();
        if (anyUser) {
          anyUser.role = 'admin';
          await anyUser.save();
          console.log('Promoted existing user to admin:', anyUser.email);
        } else {
          console.log('No users found in database');
        }
      } else {
        console.log('Admin users:');
        adminUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
      }
      
      // Check all users
      const allUsers = await User.find({});
      console.log('Total users in database:', allUsers.length);
      console.log('All users:');
      allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
      
    } catch (error) {
      console.error('Error:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
