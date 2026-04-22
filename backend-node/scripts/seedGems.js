const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Gem = require('./models/Gem');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/PinnawalaGems';

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Ensure an Admin exists
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        full_name: 'System Admin',
        email: 'admin@pinnawalagems.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log("Created default admin: admin@pinnawalagems.com / admin123");
    }

    // 2. Ensure a Seller exists
    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      const hashedPassword = await bcrypt.hash('seller123', 10);
      seller = await User.create({
        full_name: 'Gem Merchant',
        email: 'seller@pinnawalagems.com',
        password: hashedPassword,
        role: 'seller'
      });
      console.log("Created default seller: seller@pinnawalagems.com / seller123");
    }

    // 3. Prepare sample gems with correct model fields
    const sampleGems = [
      {
        seller_id: seller._id,
        name: "Royal Blue Sapphire",
        color: "Blue",
        gem_type: "Sapphire",
        base_price: 15000,
        weight_carats: 4.5,
        listing_type: "Direct_Sale",
        seller_type: "Company",
        status: "Active",
        description: "A stunning natural royal blue sapphire with exceptional clarity and brilliance.",
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
        ngja_cert: "NGJA-CERT-12345"
      },
      {
        seller_id: seller._id,
        name: "Vivid Green Emerald",
        color: "Green",
        gem_type: "Emerald",
        base_price: 8500,
        weight_carats: 2.2,
        listing_type: "Auction",
        seller_type: "ThirdParty",
        status: "Active",
        description: "Deep green emerald with minor inclusions, perfect for a high-end ring setting.",
        image_url: "https://images.unsplash.com/photo-1615484477771-3183778a8782?q=80&w=1000&auto=format&fit=crop",
        ngja_cert: "NGJA-CERT-67890"
      },
      {
        seller_id: seller._id,
        name: "Blood Red Ruby",
        color: "Red",
        gem_type: "Ruby",
        base_price: 22000,
        weight_carats: 5.1,
        listing_type: "Direct_Sale",
        seller_type: "Company",
        status: "Active",
        description: "Rare pigeon blood red ruby, ethically sourced and precision cut.",
        image_url: "https://images.unsplash.com/photo-1551028711-20948923d8c4?q=80&w=1000&auto=format&fit=crop",
        ngja_cert: "NGJA-CERT-54321"
      },
      {
        seller_id: seller._id,
        name: "Golden Topaz",
        color: "Yellow",
        gem_type: "Topaz",
        base_price: 3200,
        weight_carats: 8.4,
        listing_type: "Direct_Sale",
        seller_type: "ThirdParty",
        status: "Active",
        description: "Large golden topaz with fire-like reflections and excellent transparency.",
        image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop",
        ngja_cert: "NGJA-CERT-99999"
      }
    ];

    // Optional: Clear existing gems to avoid duplicates during testing
    // await Gem.deleteMany({});
    // console.log("Cleared existing gems.");

    await Gem.insertMany(sampleGems);
    console.log("Seed complete: 4 sample gems inserted successfully!");
    
    mongoose.connection.close();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedDB();
