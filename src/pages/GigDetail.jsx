import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Star, Clock, RefreshCw, Check, Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import SellerLevelBadge from '../components/SellerLevelBadge';
import VerifiedBadge from '../components/VerifiedBadge';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: gigData, isLoading } = useQuery(['gig', id], async () => {
    const res = await api.get(`/gigs/${id}`);
    return res.data.gig;
  });

  const { data: reviewsData } = useQuery(['reviews', id], async () => {
    const res = await api.get(`/reviews/gig/${id}`);
    return res.data.reviews;
  });

  const { data: relatedGigs } = useQuery(['related-gigs', id], async () => {
    const res = await api.get(`/gigs/${id}/related`);
    return res.data.gigs;
  });

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders', {
        gigId: id,
        packageType: selectedPackage,
        requirements
      });
      navigate(`/orders/${res.data.order._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="skeleton h-96 mb-8"></div>
          <div className="skeleton h-8 w-3/4 mb-4"></div>
          <div className="skeleton h-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!gigData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Gig not found</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  // Get available packages
  const availablePackages = [];
  if (gigData.packages?.basic) availablePackages.push('basic');
  if (gigData.packages?.standard) availablePackages.push('standard');
  if (gigData.packages?.premium) availablePackages.push('premium');

  // Set default selected package to first available
  if (selectedPackage && !gigData.packages?.[selectedPackage]) {
    setSelectedPackage(availablePackages[0] || 'basic');
  }

  const pkg = gigData.packages?.[selectedPackage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={gigData.seller?.avatar || '/avatar.jpg'}
                alt={gigData.seller?.displayName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${gigData.seller?.username}`} className="font-semibold text-gray-900 hover:text-primary-600">
                    {gigData.seller?.displayName}
                  </Link>
                  <SellerLevelBadge level={gigData.seller?.sellerLevel} size="sm" showNewSeller={true} />
                  <VerifiedBadge 
                    isVerified={gigData.seller?.isVerified} 
                    verifiedText={gigData.seller?.verifiedText}
                    badgeType={gigData.seller?.verifiedBadgeType}
                    customImage={gigData.seller?.verifiedBadgeImage}
                    size="sm" 
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{gigData.seller?.rating?.average?.toFixed(1) || '0.0'}</span>
                  <span>({gigData.seller?.rating?.count || 0} reviews)</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{gigData.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{gigData.rating?.average?.toFixed(1) || '0.0'}</span>
                <span>({gigData.rating?.count || 0})</span>
              </div>
              <span>•</span>
              <span>{gigData.totalOrders || 0} orders</span>
            </div>

            <div className="relative mb-8">
              <img
                src={gigData.images?.[selectedImageIndex] || '/placeholder.jpg'}
                alt={gigData.title}
                className="w-full h-96 object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {gigData.images?.length > 1 && (
              <div className="grid grid-cols-5 gap-4 mb-8">
                {gigData.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${gigData.title} ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-blue-500 opacity-100'
                        : 'hover:opacity-80 opacity-60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">About This Gig</h2>
            <p className="text-gray-700 whitespace-pre-line">{gigData.description}</p>
          </div>

          {gigData.servicesInclude?.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">My Services Include</h2>
              <ul className="space-y-2">
                {gigData.servicesInclude.map((service, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gigData.whyChooseMe && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">Why Choose Me?</h2>
              <p className="text-gray-700 whitespace-pre-line">{gigData.whyChooseMe}</p>
            </div>
          )}

          {gigData.whatsIncluded?.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">What's Included</h2>
              <ul className="space-y-2">
                {gigData.whatsIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {gigData.faqs?.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-4">FAQ</h2>
              <div className="space-y-4">
                {gigData.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewsData && reviewsData.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">Reviews ({reviewsData.length})</h2>
              <div className="space-y-6">
                {reviewsData.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <img
                        src={review.buyer?.avatar || '/avatar.jpg'}
                        alt={review.buyer?.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{review.buyer?.displayName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        {review.sellerResponse && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <p className="text-sm font-semibold text-gray-900 mb-1">Seller Response:</p>
                            <p className="text-sm text-gray-700">{review.sellerResponse.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">About The Seller</h2>
            <div className="flex items-start gap-4">
              <img
                src={gigData.seller?.avatar || '/avatar.jpg'}
                alt={gigData.seller?.displayName}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/profile/${gigData.seller?.username}`} className="text-xl font-bold text-gray-900 hover:text-primary-600">
                    {gigData.seller?.displayName}
                  </Link>
                  <SellerLevelBadge level={gigData.seller?.sellerLevel} size="md" showNewSeller={true} />
                  <VerifiedBadge 
                    isVerified={gigData.seller?.isVerified} 
                    verifiedText={gigData.seller?.verifiedText}
                    badgeType={gigData.seller?.verifiedBadgeType}
                    customImage={gigData.seller?.verifiedBadgeImage}
                    size="md" 
                  />
                </div>
                <p className="text-gray-600 mb-2">@{gigData.seller?.username}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{gigData.seller?.rating?.average?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span>•</span>
                  <span>{gigData.seller?.totalOrders || 0} orders completed</span>
                </div>
                {gigData.seller?.bio && (
                  <p className="text-gray-700 mb-4">{gigData.seller.bio}</p>
                )}
                <Link to={`/profile/${gigData.seller?.username}`} className="btn-outline">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card">
              {availablePackages.length > 1 && (
                <div className="flex border-b border-gray-200 mb-4">
                  {availablePackages.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedPackage(type)}
                      className={`flex-1 py-3 text-sm font-semibold capitalize ${
                        selectedPackage === type
                          ? 'border-b-2 border-primary-600 text-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{pkg?.title}</h3>
              <p className="text-gray-600 mb-4">{pkg?.description}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-gray-900">{pkg?.price}</span>
                <span className="text-gray-600">HIVE</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{pkg?.deliveryTime} days delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>{pkg?.revisions} revisions</span>
                </div>
              </div>

              {pkg?.features?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {user && user._id !== gigData.seller?._id ? (
                <>
                  <Link
                    to={`/gigs/${id}/checkout?package=${selectedPackage}`}
                    className="btn-primary w-full mb-3 text-center block"
                  >
                    Continue ({pkg?.price} HIVE)
                  </Link>
                  <Link
                    to={`/messages?user=${gigData.seller?._id}`}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact Seller
                  </Link>
                </>
              ) : user?._id === gigData.seller?._id ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">This is your gig</p>
                  <Link to={`/gigs/${id}/edit`} className="btn-primary mt-2 inline-block">
                    Edit Gig
                  </Link>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="btn-primary w-full">
                  Login to Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {relatedGigs && relatedGigs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Gigs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {relatedGigs.map((gig) => (
              <Link key={gig._id} to={`/gigs/${gig._id}`} className="card hover:shadow-lg transition-shadow p-0 overflow-hidden">
                <img src={gig.images?.[0]} alt={gig.title} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{gig.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{gig.rating?.average?.toFixed(1) || '0.0'}</span>
                    </div>
                    <span className="font-bold">{gig.packages?.basic?.price} HIVE</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Order Requirements</h3>
            <p className="text-gray-600 mb-4">Please provide details about your requirements</p>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="input-field mb-4"
              rows={6}
              placeholder="Describe what you need..."
            />
            <div className="flex gap-4">
              <button
                onClick={handleOrder}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Processing...' : `Place Order (${pkg?.price} HIVE)`}
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
