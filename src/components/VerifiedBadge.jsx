import React, { useState } from 'react';
import { CheckCircle, Award, Shield, Star, Crown } from 'lucide-react';

const VerifiedBadge = ({ 
  isVerified, 
  verifiedText = 'Verified Account', 
  badgeType = 'default',
  customImage = '',
  size = 'md' 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getBadgeIcon = () => {
    // If custom image exists, use it
    if (badgeType === 'custom' && customImage) {
      return (
        <img 
          src={customImage} 
          alt="Verified" 
          className={`${sizeClasses[size]} object-contain`}
          onError={(e) => {
            console.error('Failed to load custom badge image:', customImage);
            e.target.style.display = 'none';
          }}
        />
      );
    }

    // Pre-defined badge types
    switch (badgeType) {
      case 'gold':
        return <Award className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} strokeWidth={2} />;
      case 'premium':
        return <Crown className={`${sizeClasses[size]} text-purple-500 fill-purple-500`} strokeWidth={2} />;
      case 'official':
        return <Shield className={`${sizeClasses[size]} text-green-500 fill-green-500`} strokeWidth={2} />;
      case 'partner':
        return <Star className={`${sizeClasses[size]} text-orange-500 fill-orange-500`} strokeWidth={2} />;
      default:
        return <CheckCircle className={`${sizeClasses[size]} text-blue-500 fill-blue-500`} strokeWidth={2} />;
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className="cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {getBadgeIcon()}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
            {verifiedText}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedBadge;
