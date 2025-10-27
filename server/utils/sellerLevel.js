// Seller Level System - Similar to Fiverr
export function calculateSellerLevel(user, stats) {
  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const completedOrders = stats?.totalOrders || 0;
  const averageRating = stats?.rating?.average || 0;
  const totalEarnings = stats?.totalEarnings || 0;

  // Top Rated Seller (Highest Level)
  if (
    accountAge >= 180 &&
    completedOrders >= 100 &&
    averageRating >= 4.7 &&
    totalEarnings >= 80000
  ) {
    return {
      level: 'top_rated',
      badge: '🔵 Top Rated Seller',
      color: '#1e40af',
      bgColor: '#dbeafe',
      requirements: {
        accountAge: 180,
        completedOrders: 100,
        averageRating: 4.7,
        totalEarnings: 80000
      }
    };
  }

  // Level 2
  if (
    accountAge >= 120 &&
    completedOrders >= 50 &&
    averageRating >= 4.7 &&
    totalEarnings >= 40000
  ) {
    return {
      level: 'level_2',
      badge: 'Level 2',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      requirements: {
        accountAge: 120,
        completedOrders: 50,
        averageRating: 4.7,
        totalEarnings: 40000
      }
    };
  }

  // Level 1
  if (
    accountAge >= 60 &&
    completedOrders >= 10 &&
    averageRating >= 4.7 &&
    totalEarnings >= 8000
  ) {
    return {
      level: 'level_1',
      badge: 'Level 1',
      color: '#059669',
      bgColor: '#d1fae5',
      requirements: {
        accountAge: 60,
        completedOrders: 10,
        averageRating: 4.7,
        totalEarnings: 8000
      }
    };
  }

  // New Seller (No level yet)
  return {
    level: 'new_seller',
    badge: 'New Seller',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    requirements: {
      accountAge: 60,
      completedOrders: 10,
      averageRating: 4.7,
      totalEarnings: 8000
    }
  };
}

export function getProgressToNextLevel(user, stats) {
  const currentLevel = calculateSellerLevel(user, stats);
  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const completedOrders = stats?.totalOrders || 0;
  const averageRating = stats?.rating?.average || 0;
  const totalEarnings = stats?.totalEarnings || 0;

  let nextLevel = null;
  let progress = {};

  if (currentLevel.level === 'new_seller') {
    nextLevel = {
      name: 'Level 1',
      requirements: {
        accountAge: 60,
        completedOrders: 10,
        averageRating: 4.7,
        totalEarnings: 8000
      }
    };
  } else if (currentLevel.level === 'level_1') {
    nextLevel = {
      name: 'Level 2',
      requirements: {
        accountAge: 120,
        completedOrders: 50,
        averageRating: 4.7,
        totalEarnings: 40000
      }
    };
  } else if (currentLevel.level === 'level_2') {
    nextLevel = {
      name: 'Top Rated Seller',
      requirements: {
        accountAge: 180,
        completedOrders: 100,
        averageRating: 4.7,
        totalEarnings: 80000
      }
    };
  }

  if (nextLevel) {
    progress = {
      accountAge: {
        current: accountAge,
        required: nextLevel.requirements.accountAge,
        percentage: Math.min((accountAge / nextLevel.requirements.accountAge) * 100, 100)
      },
      completedOrders: {
        current: completedOrders,
        required: nextLevel.requirements.completedOrders,
        percentage: Math.min((completedOrders / nextLevel.requirements.completedOrders) * 100, 100)
      },
      averageRating: {
        current: averageRating,
        required: nextLevel.requirements.averageRating,
        percentage: Math.min((averageRating / nextLevel.requirements.averageRating) * 100, 100)
      },
      totalEarnings: {
        current: totalEarnings,
        required: nextLevel.requirements.totalEarnings,
        percentage: Math.min((totalEarnings / nextLevel.requirements.totalEarnings) * 100, 100)
      }
    };
  }

  return {
    currentLevel,
    nextLevel,
    progress
  };
}
