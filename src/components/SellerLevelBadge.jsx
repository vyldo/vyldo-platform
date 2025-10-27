import React from 'react';

const SellerLevelBadge = ({ level, size = 'md', showNewSeller = false }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const getLevelConfig = () => {
    // If no level or new_seller, show New Seller badge if showNewSeller is true
    if (!level || level === 'new_seller') {
      if (showNewSeller) {
        return {
          badge: 'New Seller',
          color: '#6b7280',
          bgColor: '#f3f4f6',
          borderColor: '#d1d5db'
        };
      }
      return null;
    }

    switch (level) {
      case 'level_1':
        return {
          badge: 'Level 1',
          color: '#059669',
          bgColor: '#d1fae5',
          borderColor: '#10b981'
        };
      case 'level_2':
        return {
          badge: 'Level 2',
          color: '#7c3aed',
          bgColor: '#f3e8ff',
          borderColor: '#a855f7'
        };
      case 'top_rated':
        return {
          badge: '🔵 Top Rated Seller',
          color: '#1e40af',
          bgColor: '#dbeafe',
          borderColor: '#3b82f6'
        };
      default:
        return null;
    }
  };

  const config = getLevelConfig();
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses[size]}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
    >
      {config.badge}
    </span>
  );
};

export default SellerLevelBadge;
