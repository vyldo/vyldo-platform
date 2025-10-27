import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Video, Image, Save, AlertCircle, Upload, X } from 'lucide-react';
import api from '../../lib/axios';

export default function HeroSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    videoUrl: '',
    posterUrl: '',
    stats: {
      freelancers: { value: '10K+', label: 'Active Freelancers' },
      projects: { value: '50K+', label: 'Projects Completed' },
      satisfaction: { value: '98%', label: 'Satisfaction Rate' },
    },
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery('heroSettings', async () => {
    const res = await api.get('/settings/hero');
    return res.data.settings;
  }, {
    onSuccess: (data) => {
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        videoUrl: data.videoUrl || '',
        posterUrl: data.posterUrl || '',
        stats: data.stats || {
          freelancers: { value: '10K+', label: 'Active Freelancers' },
          projects: { value: '50K+', label: 'Projects Completed' },
          satisfaction: { value: '98%', label: 'Satisfaction Rate' },
        },
      });
    },
  });

  // Update settings mutation
  const updateMutation = useMutation(
    async (data) => {
      console.log('💾 Saving settings:', data);
      const res = await api.put('/settings/hero', data);
      console.log('✅ Settings saved:', res.data);
      return res.data;
    },
    {
      onSuccess: (data) => {
        console.log('🔄 Invalidating cache...');
        queryClient.invalidateQueries('heroSettings');
        queryClient.refetchQueries('heroSettings');
        setSuccess('Hero settings updated successfully!');
        setError('');
        setTimeout(() => setSuccess(''), 3000);
      },
      onError: (err) => {
        console.error('❌ Save error:', err);
        setError(err.response?.data?.message || 'Failed to update settings');
        setSuccess('');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    updateMutation.mutate(formData);
  };

  // Handle video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📤 Uploading video:', file.name, file.size, 'bytes');

    setUploadingVideo(true);
    setError('');
    setSuccess('');

    const formDataUpload = new FormData();
    formDataUpload.append('video', file);

    try {
      const res = await api.post('/settings/hero/upload-video', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ Video uploaded:', res.data.videoUrl);
      setFormData({ ...formData, videoUrl: res.data.videoUrl });
      setSuccess('Video uploaded successfully! Click Save Changes to apply.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
      e.target.value = ''; // Reset input
    }
  };

  // Handle poster upload
  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📤 Uploading poster:', file.name, file.size, 'bytes');

    setUploadingPoster(true);
    setError('');
    setSuccess('');

    const formDataUpload = new FormData();
    formDataUpload.append('poster', file);

    try {
      const res = await api.post('/settings/hero/upload-poster', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('✅ Poster uploaded:', res.data.posterUrl);
      setFormData({ ...formData, posterUrl: res.data.posterUrl });
      setSuccess('Poster uploaded successfully! Click Save Changes to apply.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload poster');
    } finally {
      setUploadingPoster(false);
      e.target.value = ''; // Reset input
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hero Video Settings</h1>
        <p className="text-gray-600">Manage the hero section video and content on the home page</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="Find Perfect Freelance Services"
          />
          <p className="text-xs text-gray-500 mt-1">Main heading text for the hero section</p>
        </div>

        {/* Subtitle */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subtitle
          </label>
          <textarea
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="input-field"
            rows="3"
            placeholder="Secure, transparent, instant payments with zero fees"
          />
          <p className="text-xs text-gray-500 mt-1">Subtitle text below the main heading</p>
        </div>

        {/* Video Upload */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Hero Video
          </label>
          
          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                  <Upload className="w-5 h-5" />
                  {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                MP4, WebM, AVI, MKV formats supported. Max 100MB. Old video will be automatically deleted.
              </p>
            </div>

            {/* Current Video Preview */}
            {formData.videoUrl && (
              <div className="relative">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Video:</p>
                <div className="relative">
                  <video
                    src={formData.videoUrl.startsWith('http') ? formData.videoUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.videoUrl}`}
                    className="w-full max-w-md rounded-lg shadow-lg"
                    controls
                    muted
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, videoUrl: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {uploadingVideo && (
              <div className="flex items-center gap-2 text-primary-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="text-sm">Uploading video...</span>
              </div>
            )}
          </div>
        </div>

        {/* Poster Upload */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Poster Image
          </label>
          
          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  <Upload className="w-5 h-5" />
                  {uploadingPoster ? 'Uploading...' : 'Upload Poster'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  disabled={uploadingPoster}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, WebP, GIF formats supported. Max 100MB. Shown before video loads.
              </p>
            </div>

            {/* Current Poster Preview */}
            {formData.posterUrl && (
              <div className="relative">
                <p className="text-sm font-medium text-gray-700 mb-2">Current Poster:</p>
                <div className="relative">
                  <img
                    src={formData.posterUrl.startsWith('http') ? formData.posterUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.posterUrl}`}
                    alt="Poster preview"
                    className="w-full max-w-md rounded-lg shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, posterUrl: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="Remove poster"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {uploadingPoster && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="text-sm">Uploading poster...</span>
              </div>
            )}
          </div>
        </div>

        {/* Trust Stats */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Trust Indicators</h3>
          <p className="text-sm text-gray-600 mb-4">Statistics displayed below the hero section</p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Freelancers Stat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Value</label>
              <input
                type="text"
                value={formData.stats.freelancers.value}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    freelancers: { ...formData.stats.freelancers, value: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="10K+"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Stat 1 Label</label>
              <input
                type="text"
                value={formData.stats.freelancers.label}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    freelancers: { ...formData.stats.freelancers, label: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="Active Freelancers"
              />
            </div>

            {/* Projects Stat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Value</label>
              <input
                type="text"
                value={formData.stats.projects.value}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    projects: { ...formData.stats.projects, value: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="50K+"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Stat 2 Label</label>
              <input
                type="text"
                value={formData.stats.projects.label}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    projects: { ...formData.stats.projects, label: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="Projects Completed"
              />
            </div>

            {/* Satisfaction Stat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Value</label>
              <input
                type="text"
                value={formData.stats.satisfaction.value}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    satisfaction: { ...formData.stats.satisfaction, value: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="98%"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-2">Stat 3 Label</label>
              <input
                type="text"
                value={formData.stats.satisfaction.label}
                onChange={(e) => setFormData({
                  ...formData,
                  stats: {
                    ...formData.stats,
                    satisfaction: { ...formData.stats.satisfaction, label: e.target.value }
                  }
                })}
                className="input-field"
                placeholder="Satisfaction Rate"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Video Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use MP4 format for best compatibility</li>
            <li>Recommended resolution: 1920x1080 (Full HD)</li>
            <li>Keep file size under 50MB for faster loading</li>
            <li>Video will loop automatically and play muted</li>
            <li>Ensure video content is appropriate and professional</li>
            <li>Test on mobile devices for responsive display</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: settings.title || '',
                subtitle: settings.subtitle || '',
                videoUrl: settings.videoUrl || '',
                posterUrl: settings.posterUrl || '',
                stats: settings.stats || {
                  freelancers: { value: '10K+', label: 'Active Freelancers' },
                  projects: { value: '50K+', label: 'Projects Completed' },
                  satisfaction: { value: '98%', label: 'Satisfaction Rate' },
                },
              });
              setError('');
              setSuccess('');
            }}
            className="btn-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
