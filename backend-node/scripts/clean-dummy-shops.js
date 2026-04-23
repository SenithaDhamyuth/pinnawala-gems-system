const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pinnawala-gems', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clean dummy shops script
const cleanDummyShops = async () => {
  try {
    console.log('🧹 Starting cleanup of dummy shops/sellers...\n');

    // Get database instance
    const db = mongoose.connection.db;
    
    // Check if collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Available collections:', collectionNames);

    let deletedUsers = 0;
    let deletedShops = 0;

    // Method 1: Clean from Users collection (role === 'seller' but exclude admin)
    if (collectionNames.includes('users')) {
      const Users = db.collection('users');
      
      // First, identify dummy sellers (exclude common admin patterns)
      const dummySellers = await Users.find({
        role: 'seller',
        // Exclude admin accounts (common patterns)
        $or: [
          { email: { $regex: /admin/i } },
          { email: { $regex: /test/i } },
          { role: 'admin' }
        ]
      }).toArray();
      
      console.log(`📊 Found ${dummySellers.length} potential admin/test accounts to preserve`);
      
      // Find actual dummy sellers (exclude admin-like accounts)
      const actualDummySellers = await Users.find({
        role: 'seller',
        $and: [
          { email: { $not: /admin/i } },
          { email: { $not: /test/i } },
          { name: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } } // Specific dummy names
        ]
      }).toArray();
      
      if (actualDummySellers.length > 0) {
        console.log(`🗑️  Found ${actualDummySellers.length} dummy sellers to delete:`);
        actualDummySellers.forEach(seller => {
          console.log(`   - ${seller.name} (${seller.email})`);
        });
        
        const deleteResult = await Users.deleteMany({
          role: 'seller',
          $and: [
            { email: { $not: /admin/i } },
            { email: { $not: /test/i } },
            { name: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } }
          ]
        });
        deletedUsers = deleteResult.deletedCount;
        console.log(`✅ Deleted ${deletedUsers} dummy sellers from Users collection`);
      } else {
        console.log('ℹ️  No dummy sellers found matching the specified names');
      }
    }

    // Method 2: Clean from Shops collection (if it exists)
    if (collectionNames.includes('shops')) {
      const Shops = db.collection('shops');
      
      // Find shops belonging to dummy sellers
      const dummyShops = await Shops.find({
        $or: [
          { sellerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
          { shopName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
          { ownerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } }
        ]
      }).toArray();
      
      if (dummyShops.length > 0) {
        console.log(`🏪 Found ${dummyShops.length} dummy shops to delete:`);
        dummyShops.forEach(shop => {
          console.log(`   - ${shop.shopName || shop.name || 'Unknown Shop'}`);
        });
        
        const deleteResult = await Shops.deleteMany({
          $or: [
            { sellerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
            { shopName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
            { ownerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } }
          ]
        });
        deletedShops = deleteResult.deletedCount;
        console.log(`✅ Deleted ${deletedShops} dummy shops from Shops collection`);
      } else {
        console.log('ℹ️  No dummy shops found matching the specified names');
      }
    }

    // Method 3: Clean from any other potential seller-related collections
    const potentialCollections = collectionNames.filter(name => 
      name.toLowerCase().includes('seller') || 
      name.toLowerCase().includes('shop') ||
      name.toLowerCase().includes('partner')
    );

    for (const collectionName of potentialCollections) {
      if (['users', 'shops'].includes(collectionName.toLowerCase())) continue;
      
      const Collection = db.collection(collectionName);
      
      // Try to find documents with dummy seller names
      try {
        const dummyDocs = await Collection.find({
          $or: [
            { name: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
            { sellerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
            { ownerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } }
          ]
        }).toArray();
        
        if (dummyDocs.length > 0) {
          console.log(`📁 Found ${dummyDocs.length} dummy documents in ${collectionName} collection`);
          
          const deleteResult = await Collection.deleteMany({
            $or: [
              { name: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
              { sellerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } },
              { ownerName: { $in: ['TESTDSADASDASD', 'MANIKA', 'T'] } }
            ]
          });
          console.log(`✅ Deleted ${deleteResult.deletedCount} documents from ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not process ${collectionName} collection:`, error.message);
      }
    }

    // Summary
    console.log('\n📋 CLEANUP SUMMARY:');
    console.log(`   - Users deleted: ${deletedUsers}`);
    console.log(`   - Shops deleted: ${deletedShops}`);
    console.log('   - Admin accounts and Chat Rooms preserved ✅');
    console.log('\n🎉 Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the cleanup
const main = async () => {
  console.log('🚀 Starting Dummy Shops Cleanup Script\n');
  console.log('⚠️  This script will ONLY delete dummy sellers with names:');
  console.log('   - TESTDSADASDASD');
  console.log('   - MANIKA');
  console.log('   - T');
  console.log('   Admin accounts and Chat Rooms will be preserved\n');
  
  await connectDB();
  await cleanDummyShops();
  
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

main();
