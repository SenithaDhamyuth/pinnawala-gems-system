const mongoose = require('mongoose');
const Ad = require('./models/Ad');
const Gem = require('./models/Gem');
require('dotenv').config();

const seedAds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/PinnawalaGems');
    console.log('Connected to MongoDB...');

    await Ad.deleteMany({});
    
    const gems = await Gem.find({ status: 'Active' }).limit(2);
    
    const ads = [
      {
        title: "Rare Blue Sapphires Collection 2025",
        image_url: "https://images.unsplash.com/photo-1551028150-64b9f390f9ca?q=80&w=2000&auto=format&fit=crop",
        target_gem_id: gems[0]?._id || null,
        status: 'Active'
      },
      {
        title: "Exclusive Emeralds from Pinnawala Mines",
        image_url: "https://images.unsplash.com/photo-1626245914510-82d3e9736575?q=80&w=2000&auto=format&fit=crop",
        target_gem_id: gems[1]?._id || null,
        status: 'Active'
      }
    ];

    await Ad.insertMany(ads);
    console.log('Sample Ads Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding ads:', error);
    process.exit(1);
  }
};

seedAds();
