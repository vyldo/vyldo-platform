import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { Search, Shield, Zap, TrendingUp, Star, ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../lib/axios';

export default function Home() {
  const { user } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Fetch top gigs
  const { data: topGigs } = useQuery('topGigs', async () => {
    const res = await api.get('/gigs?limit=10&sort=-rating');
    return res.data.gigs;
  });

  // Fetch hero video settings
  const { data: heroSettings } = useQuery('heroSettings', async () => {
    const res = await api.get('/settings/hero');
    console.log('🎬 Hero Settings:', res.data.settings);
    return res.data.settings;
  }, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Use window.location.origin directly for production
    return `${window.location.origin}${path}`;
  };

  useEffect(() => {
    console.log('🎥 Video URL:', heroSettings?.videoUrl);
    console.log('🖼️ Poster URL:', heroSettings?.posterUrl);
    if (videoRef.current && heroSettings?.videoUrl) {
      const fullVideoUrl = getAssetUrl(heroSettings.videoUrl);
      console.log('🔗 Full Video URL:', fullVideoUrl);
      videoRef.current.play().catch((err) => {
        console.log('⚠️ Autoplay blocked:', err);
        setIsPlaying(false);
      });
    }
  }, [heroSettings?.videoUrl]);

  return (
    <div>
      {/* Hero Video Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          {heroSettings?.videoUrl ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                autoPlay
                poster={getAssetUrl(heroSettings?.posterUrl)}
                onError={(e) => console.error('❌ Video error:', e)}
                onLoadedData={() => console.log('✅ Video loaded')}
              >
                <source src={getAssetUrl(heroSettings.videoUrl)} type="video/mp4" />
              </video>
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800/70 to-primary-900/80"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"></div>
          )}
        </div>

        {/* Video Controls */}
        {heroSettings?.videoUrl && (
          <div className="absolute bottom-8 right-8 z-20 flex gap-3">
            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-2xl"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            
            {/* Play/Pause Button */}
            <button
              onClick={toggleVideo}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-2xl"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center min-h-[600px] md:min-h-[700px] lg:min-h-[800px]">
          <div className="text-center max-w-5xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full mb-8 animate-fade-in-down shadow-2xl">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">Powered by Hive Blockchain</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight text-white animate-fade-in-up">
              {heroSettings?.title || (
                <>
                  Find Perfect <span className="text-yellow-300 animate-pulse">Freelance</span>
                  <br className="hidden sm:block" />
                  Services
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-10 sm:mb-12 animate-fade-in-up animation-delay-200 max-w-3xl mx-auto leading-relaxed">
              {heroSettings?.subtitle || 'Secure, transparent, instant payments with zero fees'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-fade-in-up animation-delay-400">
              <Link
                to="/search"
                className="group inline-flex items-center justify-center gap-3 bg-white text-primary-600 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                Browse Services
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 bg-yellow-400 text-gray-900 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl hover:bg-yellow-300 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {heroSettings?.stats?.freelancers?.value || '10K+'}
                </div>
                <div className="text-sm sm:text-base text-white/80">
                  {heroSettings?.stats?.freelancers?.label || 'Active Freelancers'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {heroSettings?.stats?.projects?.value || '50K+'}
                </div>
                <div className="text-sm sm:text-base text-white/80">
                  {heroSettings?.stats?.projects?.label || 'Projects Completed'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {heroSettings?.stats?.satisfaction?.value || '98%'}
                </div>
                <div className="text-sm sm:text-base text-white/80">
                  {heroSettings?.stats?.satisfaction?.label || 'Satisfaction Rate'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Top Gigs Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Top Rated Services</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">Discover our most popular and highly-rated gigs</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {topGigs?.slice(0, 10).map((gig) => (
              <Link
                key={gig._id}
                to={`/gigs/${gig._id}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                  <img
                    src={gig.images?.[0] || '/placeholder.jpg'}
                    alt={gig.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs sm:text-sm font-bold">{gig.rating?.average?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <img
                      src={gig.seller?.avatar || '/avatar.jpg'}
                      alt={gig.seller?.displayName}
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 truncate">{gig.seller?.displayName}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 text-xs sm:text-sm md:text-base min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[3rem]">
                    {gig.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-primary-600">
                      {gig.packages?.basic?.price} HIVE
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              View All Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16">Why Choose Vyldo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Secure Payments</h3>
              <p className="text-gray-600 text-lg">Escrow system with Hive blockchain ensures safe transactions</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Transactions</h3>
              <p className="text-gray-600 text-lg">Lightning-fast HIVE token payments with zero delays</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Grow Your Business</h3>
              <p className="text-gray-600 text-lg">Connect with talented freelancers worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if not logged in */}
      {!user && (
        <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-2xl text-primary-100 mb-10">Join thousands of freelancers and clients today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-yellow-400 text-gray-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-xl">
                Sign Up Now - It's Free
              </Link>
              <Link to="/search" className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all">
                Browse Services
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
