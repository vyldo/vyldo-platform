import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Star, MapPin, Calendar, Briefcase, Award, MessageCircle, Edit } from 'lucide-react';
import GigCard from '../components/GigCard';
import SellerLevelBadge from '../components/SellerLevelBadge';
import VerifiedBadge from '../components/VerifiedBadge';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();

  const { data: profileData, isLoading } = useQuery(['profile', username], async () => {
    const res = await api.get(`/users/profile/${username}`);
    return res.data.user;
  });

  const { data: gigsData } = useQuery(['user-gigs', username], async () => {
    if (!profileData) return [];
    const res = await api.get(`/gigs/seller/${profileData._id}`);
    return res.data.gigs;
  }, { enabled: !!profileData });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="skeleton h-64 mb-8"></div>
          <div className="skeleton h-8 w-1/2 mb-4"></div>
          <div className="skeleton h-4 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profileData._id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="relative mb-8">
        {profileData.coverImage && (
          <img
            src={profileData.coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-xl"
          />
        )}
        {!profileData.coverImage && (
          <div className="w-full h-64 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl"></div>
        )}
        
        <div className="absolute -bottom-16 left-8">
          <img
            src={profileData.avatar || '/avatar.jpg'}
            alt={profileData.displayName}
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>

      <div className="mt-20 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{profileData.displayName}</h1>
              <SellerLevelBadge level={profileData.sellerLevel} size="lg" showNewSeller={true} />
              <VerifiedBadge 
                isVerified={profileData.isVerified} 
                verifiedText={profileData.verifiedText}
                badgeType={profileData.verifiedBadgeType}
                customImage={profileData.verifiedBadgeImage}
                size="lg" 
              />
            </div>
            <p className="text-gray-600">@{profileData.username}</p>
            {profileData.tagline && (
              <p className="text-lg text-gray-700 mt-2">{profileData.tagline}</p>
            )}
          </div>
          
          {isOwnProfile ? (
            <Link to="/profile/edit" className="btn-primary">
              <Edit className="w-5 h-5 inline mr-2" />
              Edit Profile
            </Link>
          ) : (
            <Link to={`/messages?user=${profileData._id}`} className="btn-primary">
              <MessageCircle className="w-5 h-5 inline mr-2" />
              Contact
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{profileData.rating?.average?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-600">({profileData.rating?.count || 0} reviews)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{profileData.totalOrders || 0} orders completed</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Member since {new Date(profileData.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          {profileData.bio && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{profileData.bio}</p>
            </div>
          )}

          {profileData.skills && profileData.skills.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profileData.experience && profileData.experience.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Experience</h2>
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary-600 pl-4">
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                    <p className="text-sm text-gray-600">
                      {exp.yearFrom} - {exp.current ? 'Present' : exp.yearTo}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.education && profileData.education.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Education</h2>
              <div className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary-600 pl-4">
                    <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.yearFrom} - {edu.yearTo}</p>
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gigsData && gigsData.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Active Gigs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {gigsData.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          {profileData.languages && profileData.languages.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Languages</h2>
              <div className="space-y-2">
                {profileData.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm text-gray-600 capitalize">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.portfolio && profileData.portfolio.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Portfolio</h2>
              <div className="space-y-4">
                {profileData.portfolio.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                          View Project →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Profile Completion</span>
                <span className="font-semibold text-primary-600">{profileData.profileCompletion}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold">{profileData.totalOrders || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
