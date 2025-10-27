import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function forceResetAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const email = 'admin@vyldo.com';
    const newPassword = 'Admin@123';

    console.log('🔍 Finding admin user...');
    let user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Admin user not found. Creating new admin...');
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      user = await User.create({
        email: 'admin@vyldo.com',
        username: 'admin',
        displayName: 'Admin',
        password: hashedPassword,
        role: 'admin',
        permissions: {
          manageUsers: true,
          suspendUsers: true,
          manageGigs: true,
          suspendGigs: true,
          manageOrders: true,
          cancelOrders: true,
          manageWithdrawals: true,
          manageWallets: true,
          viewAnalytics: true,
          manageTeam: true
        },
        profileCompletion: 100,
        isActive: true,
        isSuspended: false
      });
      
      console.log('✅ New admin created!');
    } else {
      console.log('✅ Admin user found!');
      console.log('📧 Email:', user.email);
      console.log('👤 Username:', user.username);
      console.log('🎭 Role:', user.role);
      
      console.log('\n🔄 Resetting password with direct hash...');
      
      // Direct password hash without using pre-save hook
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update directly in database
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            password: hashedPassword,
            role: 'admin',
            permissions: {
              manageUsers: true,
              suspendUsers: true,
              manageGigs: true,
              suspendGigs: true,
              manageOrders: true,
              cancelOrders: true,
              manageWithdrawals: true,
              manageWallets: true,
              viewAnalytics: true,
              manageTeam: true
            },
            isActive: true,
            isSuspended: false
          }
        }
      );
      
      console.log('✅ Password reset complete!');
    }

    // Verify the password works
    console.log('\n🔐 Verifying password...');
    const verifyUser = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(newPassword, verifyUser.password);
    
    if (isMatch) {
      console.log('✅ Password verification SUCCESSFUL!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@vyldo.com');
      console.log('   Password: Admin@123');
      console.log('\n🌐 Login URL: http://localhost:5173/login');
      console.log('\n🎉 You can now login!');
    } else {
      console.log('❌ Password verification FAILED!');
      console.log('⚠️ Something went wrong. Please contact support.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

forceResetAdmin();
