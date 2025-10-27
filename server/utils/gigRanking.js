/**
 * Gig Ranking Algorithm
 * Ranks gigs based on multiple factors for fair distribution and quality
 */

export const calculateGigScore = (gig, seller) => {
  let score = 0;
  
  // Safety checks
  if (!gig || !seller) return 0;
  
  // 1. COMPLETION RATE (25 points max)
  // Higher completion rate = better ranking
  if (seller.totalOrders && seller.totalOrders > 0) {
    const completionRate = (seller.completedOrders || 0) / seller.totalOrders;
    score += completionRate * 25;
  }
  
  // 2. RATING (25 points max)
  // Higher rating = better ranking
  if (gig.rating && gig.rating.average) {
    score += (gig.rating.average / 5) * 25;
  }
  
  // 3. SELLER LEVEL (20 points max)
  // Higher level = better ranking, but not too dominant
  const levelScores = {
    'new_seller': 5,
    'level_1': 10,
    'level_2': 15,
    'top_rated': 20
  };
  score += levelScores[seller.sellerLevel] || 5;
  
  // 4. VERIFIED BADGE (10 points max)
  // Verified sellers get bonus
  if (seller.isVerified) {
    score += 10;
  }
  
  // 5. RECENT ACTIVITY (10 points max)
  // Recently active gigs get boost
  const daysSinceCreation = (Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 30) {
    score += 10; // New gigs get full boost
  } else if (daysSinceCreation <= 90) {
    score += 5; // Medium age gigs get half boost
  }
  
  // 6. RESPONSE TIME (5 points max)
  // Faster response = better ranking
  if (gig.deliveryTime) {
    if (gig.deliveryTime <= 1) score += 5;
    else if (gig.deliveryTime <= 3) score += 3;
    else if (gig.deliveryTime <= 7) score += 1;
  }
  
  // 7. REVIEW COUNT (5 points max)
  // More reviews = more trust
  if (gig.rating && gig.rating.count) {
    const reviewScore = Math.min(gig.rating.count / 10, 5);
    score += reviewScore;
  }
  
  // 8. DIVERSITY BOOST (randomization for fairness)
  // Add small random factor to prevent same gigs always on top
  const diversityBoost = Math.random() * 5;
  score += diversityBoost;
  
  // 9. PENALTY FOR CANCELLATIONS
  // High cancellation rate = penalty
  if (seller.totalOrders && seller.totalOrders > 0) {
    const cancellationRate = (seller.cancelledOrders || 0) / seller.totalOrders;
    if (cancellationRate > 0.1) { // More than 10% cancellations
      score -= cancellationRate * 20;
    }
  }
  
  // 10. PENALTY FOR SUSPENDED GIGS
  if (gig.isSuspended) {
    score = 0; // Suspended gigs don't show
  }
  
  return Math.max(0, score); // Ensure non-negative score
};

export const rankGigs = (gigs) => {
  if (!gigs || !Array.isArray(gigs)) return [];
  
  return gigs
    .filter(gig => gig && gig.seller) // Filter out invalid gigs
    .map(gig => ({
      ...gig,
      rankScore: calculateGigScore(gig, gig.seller)
    }))
    .sort((a, b) => {
      // Primary sort: by score
      if (b.rankScore !== a.rankScore) {
        return b.rankScore - a.rankScore;
      }
      // Secondary sort: by creation date (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

export const getSearchRankingFactors = (searchQuery) => {
  // Adjust weights based on search context
  return {
    relevanceWeight: 40, // Title/description match
    qualityWeight: 30,   // Rating + completion rate
    levelWeight: 15,     // Seller level
    verifiedWeight: 10,  // Verified badge
    diversityWeight: 5   // Random factor
  };
};

export const calculateSearchScore = (gig, seller, searchQuery) => {
  let score = 0;
  
  // Safety checks
  if (!gig || !seller || !searchQuery) return 0;
  
  const weights = getSearchRankingFactors(searchQuery);
  
  // 1. RELEVANCE SCORE (40 points max)
  const query = searchQuery.toLowerCase();
  let relevanceScore = 0;
  
  // Title match (most important)
  if (gig.title.toLowerCase().includes(query)) {
    relevanceScore += 20;
    // Exact match bonus
    if (gig.title.toLowerCase() === query) {
      relevanceScore += 10;
    }
  }
  
  // Description match
  if (gig.description.toLowerCase().includes(query)) {
    relevanceScore += 5;
  }
  
  // Tags match
  if (gig.tags && gig.tags.some(tag => tag.toLowerCase().includes(query))) {
    relevanceScore += 5;
  }
  
  score += Math.min(relevanceScore, weights.relevanceWeight);
  
  // 2. QUALITY SCORE (30 points max)
  let qualityScore = 0;
  
  // Rating
  if (gig.rating && gig.rating.average) {
    qualityScore += (gig.rating.average / 5) * 15;
  }
  
  // Completion rate
  if (seller.totalOrders && seller.totalOrders > 0) {
    const completionRate = (seller.completedOrders || 0) / seller.totalOrders;
    qualityScore += completionRate * 15;
  }
  
  score += Math.min(qualityScore, weights.qualityWeight);
  
  // 3. LEVEL SCORE (15 points max)
  const levelScores = {
    'new_seller': 3,
    'level_1': 7,
    'level_2': 11,
    'top_rated': 15
  };
  score += levelScores[seller.sellerLevel] || 3;
  
  // 4. VERIFIED SCORE (10 points max)
  if (seller.isVerified) {
    score += weights.verifiedWeight;
  }
  
  // 5. DIVERSITY SCORE (5 points max)
  score += Math.random() * weights.diversityWeight;
  
  return score;
};

export const rankSearchResults = (gigs, searchQuery) => {
  if (!gigs || !Array.isArray(gigs) || !searchQuery) return gigs || [];
  
  return gigs
    .filter(gig => gig && gig.seller) // Filter out invalid gigs
    .map(gig => ({
      ...gig,
      searchScore: calculateSearchScore(gig, gig.seller, searchQuery)
    }))
    .sort((a, b) => b.searchScore - a.searchScore);
};
