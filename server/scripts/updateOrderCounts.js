import mongoose from 'mongoose';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateOrderCounts() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Update Gig totalOrders
    console.log('\n📊 Updating gig order counts...');
    const gigs = await Gig.find();
    
    for (const gig of gigs) {
      const completedOrders = await Order.countDocuments({
        gig: gig._id,
        status: 'completed'
      });
      
      gig.totalOrders = completedOrders;
      await gig.save();
      
      console.log(`✅ Gig "${gig.title}": ${completedOrders} orders`);
    }

    // Update User (Seller) totalOrders
    console.log('\n👥 Updating seller order counts...');
    const users = await User.find();
    
    for (const user of users) {
      const completedOrders = await Order.countDocuments({
        seller: user._id,
        status: 'completed'
      });
      
      user.totalOrders = completedOrders;
      await user.save();
      
      if (completedOrders > 0) {
        console.log(`✅ User "${user.displayName}": ${completedOrders} orders`);
      }
    }

    console.log('\n🎉 All counts updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateOrderCounts();
