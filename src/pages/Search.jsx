import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import GigCard from '../components/GigCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    deliveryTime: searchParams.get('deliveryTime') || '',
    sort: searchParams.get('sort') || '-createdAt',
    search: searchParams.get('search') || '',
  });

  // Check if any filter is active
  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || 
                          filters.deliveryTime || filters.search;

  const { data, isLoading } = useQuery(
    ['gigs', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await api.get(`/gigs?${params}`);
      return res.data;
    }
  );

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      deliveryTime: '',
      sort: '-createdAt',
      search: '',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {filters.search ? `Results for "${filters.search}"` : 'Browse All Gigs'}
        </h1>
      </div>

      {/* Filters - Horizontal Top Layout */}
      <div className="mb-6 card">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field text-sm"
            >
              <option value="-rating.average">Recommended</option>
              <option value="-totalOrders">Best Selling</option>
              <option value="-createdAt">Newest</option>
              <option value="packages.basic.price">Price: Low to High</option>
              <option value="-packages.basic.price">Price: High to Low</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Budget (HIVE)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="input-field text-sm w-20"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="input-field text-sm w-20"
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Time</label>
            <select
              value={filters.deliveryTime}
              onChange={(e) => updateFilter('deliveryTime', e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Any Time</option>
              <option value="1">1 Day</option>
              <option value="3">Up to 3 Days</option>
              <option value="7">Up to 7 Days</option>
              <option value="14">Up to 14 Days</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 mt-5"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Gigs Grid - Full Width */}
      <div>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <div className="skeleton h-48 mb-0"></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="skeleton h-6 w-6 rounded-full"></div>
                      <div className="skeleton h-4 w-24"></div>
                    </div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                    <div className="flex items-center justify-between">
                      <div className="skeleton h-4 w-20"></div>
                      <div className="skeleton h-6 w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        ) : data?.gigs?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.gigs.map((gig) => (
              <GigCard key={gig._id} gig={gig} />
            ))}
          </div>
          ) : (
          <div className="text-center py-16">
            <SlidersHorizontal className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No gigs match your filters' : 'No gigs available yet'}
              </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results' 
                : 'Be the first to create a gig on Vyldo!'}
              </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-primary">
                Clear All Filters
                </button>
            ) : (
              <Link to="/gigs/create" className="btn-primary">
                Create Your First Gig
              </Link>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
