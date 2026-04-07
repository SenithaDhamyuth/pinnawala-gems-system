const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pinnawala-gems');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('🔥 CONNECTED TO MONGODB - STARTING COMPLETE NUCLEAR WIPE...');
  
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Empty ALL collections completely
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🗑️  NUKING collection: ${collectionName}`);
      await mongoose.connection.db.collection(collectionName).deleteMany({});
    }
    
    console.log('✅ ALL COLLECTIONS NUKED SUCCESSFULLY');
    
    // Delete ALL uploaded files recursively
    const uploadsDir = path.join(__dirname, 'uploads');
    const publicImagesDir = path.join(__dirname, 'public', 'images');
    
    // Function to recursively delete all files and subdirectories
    const deleteRecursively = (dir) => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            // Recursively delete subdirectories
            deleteRecursively(filePath);
            fs.rmdirSync(filePath);
          } else {
            // Delete files
            fs.unlinkSync(filePath);
            console.log(`🗑️  Deleted file: ${filePath}`);
          }
        });
        console.log(`✅ Cleaned directory: ${dir}`);
      } else {
        console.log(`📁 Directory not found: ${dir}`);
      }
    };
    
    // Clean uploads directory
    deleteRecursively(uploadsDir);
    
    // Clean public/images directory
    deleteRecursively(publicImagesDir);
    
    console.log('\n🎉 COMPLETE NUCLEAR WIPE SUCCESSFUL!');
    console.log('📊 Database: ALL collections completely emptied');
    console.log('📁 Files: ALL uploaded images deleted');
    console.log('🚀 System is 100% clean and ready for fresh setup!');
    
  } catch (error) {
    console.error('❌ ERROR DURING NUCLEAR WIPE:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});
