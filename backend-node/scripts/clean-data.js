const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pinnawala-gems';

// Import Chat model
const Chat = require('./models/Chat');

async function cleanupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Clean up Chat collection (this will delete all chat rooms, messages, and notes)
    console.log('🗑️ Cleaning up Chat collection...');
    const chatResult = await Chat.deleteMany({});
    console.log(`✅ Deleted ${chatResult.deletedCount} chat room documents`);

    console.log('🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

function cleanupUploads() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const publicImagesDir = path.join(__dirname, 'public', 'images');
    
    // Clean up uploads directory
    if (fs.existsSync(uploadsDir)) {
      console.log('📁 Cleaning up uploads directory...');
      const files = fs.readdirSync(uploadsDir);
      let deletedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted: ${file}`);
        }
      });
      
      console.log(`✅ Deleted ${deletedCount} files from uploads directory`);
    } else {
      console.log('📁 Uploads directory does not exist, skipping...');
    }

    // Clean up public/images directory
    if (fs.existsSync(publicImagesDir)) {
      console.log('📁 Cleaning up public/images directory...');
      const files = fs.readdirSync(publicImagesDir);
      let deletedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(publicImagesDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted: ${file}`);
        }
      });
      
      console.log(`✅ Deleted ${deletedCount} files from public/images directory`);
    } else {
      console.log('📁 Public/images directory does not exist, skipping...');
    }

    console.log('🎉 File cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ File cleanup error:', error);
  }
}

async function main() {
  console.log('🚀 Starting cleanup process...\n');
  
  // Clean up database
  await cleanupDatabase();
  console.log('');
  
  // Clean up local files
  cleanupUploads();
  console.log('');
  
  console.log('🎯 Environment is now clean and ready for a fresh start!');
}

// Run the cleanup
main().catch(console.error);
