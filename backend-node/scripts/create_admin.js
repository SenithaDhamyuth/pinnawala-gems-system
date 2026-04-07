const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/pinnawala-gems')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        full_name: 'System Administrator',
        email: 'admin@pinnawala.com',
        password: hashedPassword,
        role: 'admin',
        kycStatus: 'Approved',
        shopName: 'Pinnawala Admin',
        bio: 'System administrator for Pinnawala Gems platform'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@pinnawala.com');
      console.log('Password: admin123');
      console.log('Role: admin');
      
      // Also create a test seller for testing
      const sellerPassword = await bcrypt.hash('seller123', 10);
      const sellerUser = new User({
        full_name: 'Test Seller',
        email: 'seller@pinnawala.com',
        password: sellerPassword,
        role: 'seller',
        kycStatus: 'Approved',
        shopName: 'Test Gem Shop',
        bio: 'A test seller account for the platform'
      });
      
      await sellerUser.save();
      console.log('\nTest seller user created!');
      console.log('Email: seller@pinnawala.com');
      console.log('Password: seller123');
      console.log('Role: seller');
      
      // Also create a test buyer
      const buyerPassword = await bcrypt.hash('buyer123', 10);
      const buyerUser = new User({
        full_name: 'Test Buyer',
        email: 'buyer@pinnawala.com',
        password: buyerPassword,
        role: 'buyer',
        kycStatus: 'Approved'
      });
      
      await buyerUser.save();
      console.log('\nTest buyer user created!');
      console.log('Email: buyer@pinnawala.com');
      console.log('Password: buyer123');
      console.log('Role: buyer');
      
      console.log('\nSetup complete! You can now test the admin support feature.');
      
    } catch (error) {
      console.error('Error creating users:', error);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
