import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testAdminLogin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const email = 'admin@vyldo.com';
    const password = 'Admin@123';

    console.log('🔍 Finding admin user...');
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🎭 Role:', user.role);
    console.log('🔑 Password Hash:', user.password.substring(0, 20) + '...');

    console.log('\n🔐 Testing password...');
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      console.log('✅ Password matches! Login should work!');
      console.log('\n📋 Use these credentials:');
      console.log('   Email: admin@vyldo.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('❌ Password does NOT match!');
      console.log('🔄 Resetting password...');
      
      const newHash = await bcrypt.hash('Admin@123', 10);
      user.password = newHash;
      await user.save();
      
      console.log('✅ Password reset successful!');
      console.log('\n📋 Try logging in with:');
      console.log('   Email: admin@vyldo.com');
      console.log('   Password: Admin@123');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminLogin();
