import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Upload, X, Plus, Save } from 'lucide-react';
import ChangePassword from '../components/ChangePassword';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    tagline: user?.tagline || '',
    skills: user?.skills || [],
    languages: user?.languages || [],
    education: user?.education || [],
    experience: user?.experience || [],
    hiveAccount: user?.hiveAccount || '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'basic' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.put('/users/profile', formData);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user.username}`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateUser(res.data.user);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('cover', file);

    try {
      const res = await api.post('/users/cover', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      updateUser(res.data.user);
      setSuccess('Cover image updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload cover image');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setFormData({ ...formData, languages: [...formData.languages, newLanguage] });
      setNewLanguage({ language: '', proficiency: 'basic' });
    }
  };

  const removeLanguage = (index) => {
    setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', yearFrom: '', yearTo: '', description: '' }]
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { title: '', company: '', location: '', yearFrom: '', yearTo: '', current: false, description: '' }]
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index][field] = value;
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== index) });
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.displayName) score += 10;
    if (user?.avatar) score += 10;
    if (user?.coverImage) score += 5;
    if (formData.bio && formData.bio.length >= 50) score += 10;
    if (formData.tagline) score += 5;
    if (formData.skills.length >= 3) score += 10;
    if (formData.languages.length >= 1) score += 10;
    if (formData.education.length >= 1) score += 15;
    if (formData.experience.length >= 1) score += 15;
    if (user?.portfolio?.length >= 1) score += 10;
    return score;
  };

  const completion = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Complete your profile to start selling</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">Profile Completion</p>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${completion}%` }}></div>
            </div>
            <span className="text-2xl font-bold text-primary-600">{completion}%</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Images</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatar || '/avatar.jpg'}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="btn-outline cursor-pointer inline-block">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Avatar
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="flex items-center gap-4">
                {user?.coverImage && (
                  <img
                    src={user.coverImage}
                    alt="Cover"
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="btn-outline cursor-pointer inline-block">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Cover
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
              <input
                type="text"
                maxLength={100}
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="input-field"
                placeholder="Professional Web Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio (min 50 characters)</label>
              <textarea
                rows={4}
                maxLength={600}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/600</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hive Account</label>
              <input
                type="text"
                value={formData.hiveAccount}
                onChange={(e) => setFormData({ ...formData, hiveAccount: e.target.value })}
                className="input-field"
                placeholder="your-hive-username"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Skills (min 3 required)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input-field flex-1"
              placeholder="Add a skill"
            />
            <button type="button" onClick={addSkill} className="btn-primary">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-primary-900">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Languages (min 1 required)</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newLanguage.language}
              onChange={(e) => setNewLanguage({ ...newLanguage, language: e.target.value })}
              className="input-field flex-1"
              placeholder="Language"
            />
            <select
              value={newLanguage.proficiency}
              onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
              className="input-field w-40"
            >
              <option value="basic">Basic</option>
              <option value="conversational">Conversational</option>
              <option value="fluent">Fluent</option>
              <option value="native">Native</option>
            </select>
            <button type="button" onClick={addLanguage} className="btn-primary">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-semibold">{lang.language}</span>
                  <span className="text-gray-600 text-sm ml-2">({lang.proficiency})</span>
                </div>
                <button type="button" onClick={() => removeLanguage(index)} className="text-red-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Education (min 1 required)</h2>
          
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  className="input-field"
                  placeholder="Institution"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="input-field"
                  placeholder="Degree"
                />
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  className="input-field"
                  placeholder="Field of Study"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={edu.yearFrom}
                    onChange={(e) => updateEducation(index, 'yearFrom', e.target.value)}
                    className="input-field"
                    placeholder="From"
                  />
                  <input
                    type="number"
                    value={edu.yearTo}
                    onChange={(e) => updateEducation(index, 'yearTo', e.target.value)}
                    className="input-field"
                    placeholder="To"
                  />
                </div>
              </div>
              <textarea
                value={edu.description}
                onChange={(e) => updateEducation(index, 'description', e.target.value)}
                className="input-field mb-2"
                rows={2}
                placeholder="Description"
              />
              <button type="button" onClick={() => removeEducation(index)} className="text-red-600 text-sm">
                Remove Education
              </button>
            </div>
          ))}
          
          <button type="button" onClick={addEducation} className="btn-outline">
            <Plus className="w-4 h-4 inline mr-2" /> Add Education
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Experience (min 1 required)</h2>
          
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  className="input-field"
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="input-field"
                  placeholder="Company"
                />
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  className="input-field"
                  placeholder="Location"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={exp.yearFrom}
                    onChange={(e) => updateExperience(index, 'yearFrom', e.target.value)}
                    className="input-field"
                    placeholder="From"
                  />
                  <input
                    type="number"
                    value={exp.yearTo}
                    onChange={(e) => updateExperience(index, 'yearTo', e.target.value)}
                    className="input-field"
                    placeholder="To"
                    disabled={exp.current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Currently working here</span>
              </label>
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(index, 'description', e.target.value)}
                className="input-field mb-2"
                rows={2}
                placeholder="Description"
              />
              <button type="button" onClick={() => removeExperience(index)} className="text-red-600 text-sm">
                Remove Experience
              </button>
            </div>
          ))}
          
          <button type="button" onClick={addExperience} className="btn-outline">
            <Plus className="w-4 h-4 inline mr-2" /> Add Experience
          </button>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            <Save className="w-5 h-5 inline mr-2" />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <div className="mt-8">
        <ChangePassword />
      </div>
    </div>
  );
}
