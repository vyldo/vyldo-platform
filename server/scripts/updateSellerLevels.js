import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { calculateSellerLevel } from '../utils/sellerLevel.js';

dotenv.config();

async function updateSellerLevels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vyldo-platform');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to update`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Calculate stats for each user
        const completedOrders = await Order.countDocuments({
          seller: user._id,
          status: 'completed'
        });

        const orders = await Order.find({
          seller: user._id,
          status: 'completed'
        });

        const totalEarnings = orders.reduce((sum, order) => sum + (order.sellerEarnings || 0), 0);

        const ratings = orders.filter(o => o.rating).map(o => o.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
          : 0;

        const stats = {
          totalOrders: completedOrders,
          totalEarnings,
          rating: {
            average: averageRating,
            count: ratings.length
          }
        };

        // Calculate level
        const levelInfo = calculateSellerLevel(user, stats);

        // Update user
        user.sellerLevel = levelInfo.level;
        await user.save();

        console.log(`✅ Updated ${user.username}: ${levelInfo.level} (${completedOrders} orders, ${totalEarnings.toFixed(2)} HIVE)`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${user.username}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${updated} users`);
    console.log(`⚠️  Skipped: ${skipped} users`);
    console.log('✨ Done!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

updateSellerLevels();
