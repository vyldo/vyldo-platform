import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import SellerLevelBadge from './SellerLevelBadge';
import VerifiedBadge from './VerifiedBadge';

export default function GigCard({ gig }) {
  return (
    <Link to={`/gigs/${gig._id}`} className="card hover:shadow-lg transition-all duration-200 p-0 overflow-hidden group">
      <div className="relative">
        <img
          src={gig.images?.[0] || '/placeholder.jpg'}
          alt={gig.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={gig.seller?.avatar || '/avatar.jpg'}
            alt={gig.seller?.displayName}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">{gig.seller?.displayName}</span>
          <SellerLevelBadge level={gig.seller?.sellerLevel} size="sm" showNewSeller={true} />
          <VerifiedBadge 
            isVerified={gig.seller?.isVerified} 
            verifiedText={gig.seller?.verifiedText} 
            badgeType={gig.seller?.verifiedBadgeType}
            customImage={gig.seller?.verifiedBadgeImage}
            size="sm" 
          />
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {gig.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-gray-900">{gig.rating?.average?.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-gray-500">({gig.rating?.count || 0})</span>
          </div>
          {gig.totalOrders > 0 && (
            <span className="text-xs text-gray-500">{gig.totalOrders} orders</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Starting at</span>
          <span className="text-lg font-bold text-gray-900">{gig.packages?.basic?.price} HIVE</span>
        </div>
      </div>
    </Link>
  );
}
