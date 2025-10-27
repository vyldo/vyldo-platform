import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const clearHeroSettings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vyldo-platform');
    console.log('✅ Connected to MongoDB');

    const HeroSettings = mongoose.model('HeroSettings', new mongoose.Schema({}, { strict: false }));
    
    const result = await HeroSettings.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} hero settings`);
    
    console.log('✅ Hero settings cleared successfully!');
    console.log('📝 Now upload video and poster again from admin panel');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearHeroSettings();
