import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/axios';
import { Trash2, ArrowLeft } from 'lucide-react';

export default function EditGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    isPaused: false
  });

  const { data: gig, isLoading } = useQuery(['gig', id], async () => {
    const res = await api.get(`/gigs/${id}`);
    return res.data.gig;
  });

  // Load gig data into form
  useState(() => {
    if (gig) {
      setFormData({
        title: gig.title || '',
        description: gig.description || '',
        category: gig.category || '',
        subcategory: gig.subcategory || '',
        isPaused: gig.isPaused || false
      });
    }
  }, [gig]);

  const updateMutation = useMutation(
    async (data) => await api.put(`/gigs/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['gig', id]);
        alert('Gig updated successfully!');
        navigate(`/gigs/${id}`);
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to update gig');
      }
    }
  );

  const deleteMutation = useMutation(
    async () => await api.delete(`/gigs/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('gigs');
        alert('Gig deleted successfully');
        navigate('/dashboard');
      },
      onError: (error) => {
        alert(error.response?.data?.message || 'Failed to delete gig');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-64"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Gig not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/gigs/${id}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Gig
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Gig</h1>
          <p className="text-gray-600">Update your gig information</p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Gig
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gig Title</label>
              <input
                type="text"
                required
                maxLength={80}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/80</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="programming">Programming & Tech</option>
                <option value="design">Graphics & Design</option>
                <option value="video">Video & Animation</option>
                <option value="writing">Writing & Translation</option>
                <option value="marketing">Digital Marketing</option>
                <option value="music">Music & Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <input
                type="text"
                required
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                maxLength={1200}
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1200</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPaused"
                checked={formData.isPaused}
                onChange={(e) => setFormData({ ...formData, isPaused: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPaused" className="text-sm font-medium text-gray-700">
                Pause this gig (temporarily hide from search)
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="btn-primary flex-1"
          >
            {updateMutation.isLoading ? 'Updating...' : 'Update Gig'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/gigs/${id}`)}
            className="btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Gig</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this gig? This action cannot be undone.
              All orders associated with this gig will remain, but the gig will no longer be visible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex-1"
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete Gig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
