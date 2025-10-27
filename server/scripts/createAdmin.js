import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Admin details - CHANGE THESE!
    const adminData = {
      email: 'admin@vyldo.com',
      username: 'admin',
      displayName: 'Admin',
      password: await bcrypt.hash('Admin@123', 10),
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
      isActive: true
    };

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🎭 Current Role:', existingAdmin.role);
      
      // Update user to admin with new password
      console.log('\n🔄 Updating user to admin with new password...');
      existingAdmin.role = 'admin';
      existingAdmin.permissions = adminData.permissions;
      existingAdmin.password = adminData.password; // Update password
      existingAdmin.profileCompletion = 100;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ User updated to admin successfully!\n');
      
      console.log('📋 Login Credentials:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Username:', existingAdmin.username);
      console.log('   Password: Admin@123');
      console.log('\n⚠️  IMPORTANT: Password has been reset to Admin@123');
    } else {
      // Create new admin
      console.log('🔨 Creating new admin user...');
      const admin = await User.create(adminData);
      console.log('✅ Admin created successfully!\n');
      
      console.log('📋 Login Credentials:');
      console.log('   Email:', admin.email);
      console.log('   Username:', admin.username);
      console.log('   Password: Admin@123');
      console.log('   Role:', admin.role);
      console.log('\n⚠️  IMPORTANT: Change password after first login!');
    }

    console.log('\n🎉 Done! You can now login as admin.');
    console.log('🌐 Admin Panel: http://localhost:5173/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
