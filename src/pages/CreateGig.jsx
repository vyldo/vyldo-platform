import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { Upload, X, Plus } from 'lucide-react';

export default function CreateGig() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    servicesInclude: [''],
    whyChooseMe: '',
    whatsIncluded: [''],
    faqs: [{ question: '', answer: '' }],
    packages: {
      basic: { name: 'basic', title: '', description: '', price: '', deliveryTime: '', revisions: 0, features: [''] },
      standard: { name: 'standard', title: '', description: '', price: '', deliveryTime: '', revisions: 0, features: [''] },
      premium: { name: 'premium', title: '', description: '', price: '', deliveryTime: '', revisions: 0, features: [''] }
    }
  });

  const [showStandard, setShowStandard] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update selected category when category changes
  const handleCategoryChange = (categorySlug) => {
    const category = categories.find(cat => cat.slug === categorySlug);
    setSelectedCategory(category);
    setFormData({ ...formData, category: categorySlug, subcategory: '' });
  };

  if (user?.profileCompletion < 60) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Incomplete</h2>
          <p className="text-gray-600 mb-4">You need to complete your profile to at least 60% before creating a gig.</p>
          <p className="text-lg font-semibold mb-6">Current Progress: {user?.profileCompletion}%</p>
          <button onClick={() => navigate('/profile/edit')} className="btn-primary">
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addArrayField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayField = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayField = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const addFAQ = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData({ ...formData, faqs: updated });
  };

  const removeFAQ = (index) => {
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index)
    });
  };

  const updatePackage = (packageType, field, value) => {
    setFormData({
      ...formData,
      packages: {
        ...formData.packages,
        [packageType]: {
          ...formData.packages[packageType],
          [field]: value
        }
      }
    });
  };

  const addPackageFeature = (packageType) => {
    const pkg = formData.packages[packageType];
    updatePackage(packageType, 'features', [...pkg.features, '']);
  };

  const updatePackageFeature = (packageType, index, value) => {
    const pkg = formData.packages[packageType];
    const updated = [...pkg.features];
    updated[index] = value;
    updatePackage(packageType, 'features', updated);
  };

  const removePackageFeature = (packageType, index) => {
    const pkg = formData.packages[packageType];
    updatePackage(packageType, 'features', pkg.features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      images.forEach(img => data.append('images', img));
      data.append('data', JSON.stringify(formData));

      const res = await api.post('/gigs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/gigs/${res.data.gig._id}`);
    } catch (err) {
      console.error('Gig creation error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create gig';
      setError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Create New Gig</h1>
      <p className="text-gray-600 mb-8">Share your services with the world</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gig Title *</label>
              <input
                type="text"
                required
                maxLength={80}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="I will create a professional website"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/80</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                list="categories-list"
                required
                value={formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, category: value });
                  // Auto-select if exact match found
                  const matchedCat = categories.find(cat => 
                    cat.slug === value || cat.name.toLowerCase() === value.toLowerCase()
                  );
                  if (matchedCat) {
                    handleCategoryChange(matchedCat.slug);
                  }
                }}
                className="input-field"
                placeholder="Type or select category..."
              />
              <datalist id="categories-list">
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
              <input
                type="text"
                list="subcategories-list"
                required
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="input-field"
                disabled={!selectedCategory}
                placeholder={selectedCategory ? "Type or select subcategory..." : "Select category first"}
              />
              <datalist id="subcategories-list">
                {selectedCategory?.subcategories?.map((subcat) => (
                  <option key={subcat.slug} value={subcat.slug}>
                    {subcat.name}
                  </option>
                ))}
              </datalist>
              {!selectedCategory && (
                <p className="text-xs text-gray-500 mt-1">Please select a category first</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                maxLength={1200}
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Describe your service in detail..."
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 5) *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="btn-primary cursor-pointer inline-block">
                  Upload Images
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Services Include</h2>
          {formData.servicesInclude.map((service, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={service}
                onChange={(e) => updateArrayField('servicesInclude', index, e.target.value)}
                className="input-field flex-1"
                placeholder="e.g., Responsive Design"
              />
              {formData.servicesInclude.length > 1 && (
                <button type="button" onClick={() => removeArrayField('servicesInclude', index)} className="btn-secondary">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('servicesInclude')} className="btn-outline mt-2">
            <Plus className="w-4 h-4 inline mr-2" /> Add Service
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Why Choose Me?</h2>
          <textarea
            maxLength={800}
            rows={4}
            value={formData.whyChooseMe}
            onChange={(e) => setFormData({ ...formData, whyChooseMe: e.target.value })}
            className="input-field"
            placeholder="Tell clients why they should choose you..."
          />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">What's Included</h2>
          {formData.whatsIncluded.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayField('whatsIncluded', index, e.target.value)}
                className="input-field flex-1"
                placeholder="e.g., Source Files"
              />
              {formData.whatsIncluded.length > 1 && (
                <button type="button" onClick={() => removeArrayField('whatsIncluded', index)} className="btn-secondary">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('whatsIncluded')} className="btn-outline mt-2">
            <Plus className="w-4 h-4 inline mr-2" /> Add Item
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">FAQ</h2>
          {formData.faqs.map((faq, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                className="input-field mb-2"
                placeholder="Question"
              />
              <textarea
                value={faq.answer}
                onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Answer"
              />
              {formData.faqs.length > 1 && (
                <button type="button" onClick={() => removeFAQ(index)} className="text-red-600 text-sm mt-2">
                  Remove FAQ
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addFAQ} className="btn-outline">
            <Plus className="w-4 h-4 inline mr-2" /> Add FAQ
          </button>
        </div>

        {/* Basic Package - Always Visible */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Basic Package *</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
              <input
                type="text"
                required
                value={formData.packages.basic.title}
                onChange={(e) => updatePackage('basic', 'title', e.target.value)}
                className="input-field"
                placeholder="Basic Package"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows={3}
                value={formData.packages.basic.description}
                onChange={(e) => updatePackage('basic', 'description', e.target.value)}
                className="input-field"
                placeholder="Describe what's included in this package"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (HIVE)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.001"
                  value={formData.packages.basic.price}
                  onChange={(e) => updatePackage('basic', 'price', e.target.value)}
                  className="input-field"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.packages.basic.deliveryTime}
                  onChange={(e) => updatePackage('basic', 'deliveryTime', e.target.value)}
                  className="input-field"
                  placeholder="7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revisions</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.packages.basic.revisions}
                  onChange={(e) => updatePackage('basic', 'revisions', e.target.value)}
                  className="input-field"
                  placeholder="2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              {formData.packages.basic.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required={index === 0}
                    value={feature}
                    onChange={(e) => updatePackageFeature('basic', index, e.target.value)}
                    className="input-field flex-1"
                    placeholder="e.g., 5 Pages"
                  />
                  {formData.packages.basic.features.length > 1 && (
                    <button type="button" onClick={() => removePackageFeature('basic', index)} className="btn-secondary">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addPackageFeature('basic')} className="btn-outline mt-2">
                <Plus className="w-4 h-4 inline mr-2" /> Add Feature
              </button>
            </div>
          </div>
        </div>

        {/* Standard Package - Collapsible */}
        <div className="card">
          {!showStandard ? (
            <button
              type="button"
              onClick={() => setShowStandard(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <span className="text-lg font-semibold text-gray-700">+ Add Standard Package (Optional)</span>
              <Plus className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Standard Package (Optional)</h2>
                <button
                  type="button"
                  onClick={() => setShowStandard(false)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
                  <input
                    type="text"
                    value={formData.packages.standard.title}
                    onChange={(e) => updatePackage('standard', 'title', e.target.value)}
                    className="input-field"
                    placeholder="Standard Package"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.packages.standard.description}
                    onChange={(e) => updatePackage('standard', 'description', e.target.value)}
                    className="input-field"
                    placeholder="Describe what's included in this package"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (HIVE)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.001"
                      value={formData.packages.standard.price}
                      onChange={(e) => updatePackage('standard', 'price', e.target.value)}
                      className="input-field"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.packages.standard.deliveryTime}
                      onChange={(e) => updatePackage('standard', 'deliveryTime', e.target.value)}
                      className="input-field"
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Revisions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.packages.standard.revisions}
                      onChange={(e) => updatePackage('standard', 'revisions', e.target.value)}
                      className="input-field"
                      placeholder="3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  {formData.packages.standard.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updatePackageFeature('standard', index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="e.g., 10 Pages"
                      />
                      {formData.packages.standard.features.length > 1 && (
                        <button type="button" onClick={() => removePackageFeature('standard', index)} className="btn-secondary">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addPackageFeature('standard')} className="btn-outline mt-2">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Feature
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Premium Package - Collapsible */}
        <div className="card">
          {!showPremium ? (
            <button
              type="button"
              onClick={() => setShowPremium(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
            >
              <span className="text-lg font-semibold text-gray-700">+ Add Premium Package (Optional)</span>
              <Plus className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Premium Package (Optional)</h2>
                <button
                  type="button"
                  onClick={() => setShowPremium(false)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
                  <input
                    type="text"
                    value={formData.packages.premium.title}
                    onChange={(e) => updatePackage('premium', 'title', e.target.value)}
                    className="input-field"
                    placeholder="Premium Package"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.packages.premium.description}
                    onChange={(e) => updatePackage('premium', 'description', e.target.value)}
                    className="input-field"
                    placeholder="Describe what's included in this package"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (HIVE)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.001"
                      value={formData.packages.premium.price}
                      onChange={(e) => updatePackage('premium', 'price', e.target.value)}
                      className="input-field"
                      placeholder="200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.packages.premium.deliveryTime}
                      onChange={(e) => updatePackage('premium', 'deliveryTime', e.target.value)}
                      className="input-field"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Revisions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.packages.premium.revisions}
                      onChange={(e) => updatePackage('premium', 'revisions', e.target.value)}
                      className="input-field"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  {formData.packages.premium.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updatePackageFeature('premium', index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="e.g., 20 Pages"
                      />
                      {formData.packages.premium.features.length > 1 && (
                        <button type="button" onClick={() => removePackageFeature('premium', index)} className="btn-secondary">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addPackageFeature('premium')} className="btn-outline mt-2">
                    <Plus className="w-4 h-4 inline mr-2" /> Add Feature
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating Gig...' : 'Publish Gig'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
