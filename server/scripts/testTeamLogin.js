import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testTeamLogin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Find team members
    const teamMembers = await User.find({ role: 'team' }).select('+password');
    
    if (teamMembers.length === 0) {
      console.log('❌ No team members found!');
      process.exit(1);
    }

    console.log(`Found ${teamMembers.length} team member(s):\n`);

    for (const member of teamMembers) {
      console.log('─────────────────────────────────');
      console.log('📧 Email:', member.email);
      console.log('👤 Username:', member.username);
      console.log('🎭 Role:', member.role);
      console.log('🔑 Password Hash:', member.password ? 'EXISTS' : 'MISSING');
      console.log('🔑 Hash Length:', member.password?.length || 0);
      console.log('🔑 Hash Preview:', member.password?.substring(0, 20) + '...');
      
      // Test password
      const testPassword = 'Team@123'; // Change this to your test password
      console.log('\n🔐 Testing password:', testPassword);
      
      try {
        const isMatch = await bcrypt.compare(testPassword, member.password);
        console.log('✅ Password match:', isMatch ? 'YES ✓' : 'NO ✗');
        
        if (!isMatch) {
          console.log('\n🔄 Resetting password to:', testPassword);
          member.password = testPassword;
          await member.save();
          console.log('✅ Password reset successful!');
          
          // Verify again
          const updatedMember = await User.findById(member._id).select('+password');
          const verifyMatch = await bcrypt.compare(testPassword, updatedMember.password);
          console.log('✅ Verification:', verifyMatch ? 'SUCCESS ✓' : 'FAILED ✗');
        }
      } catch (err) {
        console.log('❌ Password comparison error:', err.message);
      }
      
      console.log('');
    }

    console.log('\n📋 Login Instructions:');
    console.log('1. Go to http://localhost:5173/login');
    console.log('2. Use the email and password shown above');
    console.log('3. Password: Team@123 (if reset was done)');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testTeamLogin();
