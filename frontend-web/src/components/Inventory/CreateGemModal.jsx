import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createGemstone } from '../../services/api';

const CreateGemModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    gem_type: 'Ruby',
    color: '',
    weight_carats: '',
    base_price: '',
    is_negotiable: true,
    listing_type: 'Direct_Sale',
    description: '',
    origin: '',
    clarity: '',
    ngja_cert: '',
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const gemTypes = ['Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Topaz', 'Tourmaline', 'Other'];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Gem name is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.weight_carats || parseFloat(formData.weight_carats) < 0.01) {
      newErrors.weight_carats = 'Weight must be at least 0.01 carats';
    }
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Price must be greater than 0';
    }
    if (!formData.image) newErrors.image = 'Gem image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Only JPG, PNG, and GIF images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setFormData({ ...formData, image: file });
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('gem_type', formData.gem_type);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('weight_carats', parseFloat(formData.weight_carats));
      formDataToSend.append('base_price', parseFloat(formData.base_price));
      formDataToSend.append('is_negotiable', formData.is_negotiable);
      formDataToSend.append('listing_type', formData.listing_type);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.origin) formDataToSend.append('origin', formData.origin);
      if (formData.clarity) formDataToSend.append('clarity', formData.clarity);
      if (formData.ngja_cert) formDataToSend.append('ngja_cert', formData.ngja_cert);
      if (formData.image) formDataToSend.append('image', formData.image);

      const newGem = await createGemstone(formDataToSend);
      toast.success('Gem listing created! Awaiting admin approval.');
      onSuccess(newGem);
    } catch (error) {
      console.error('Error creating gem:', error);
      toast.error(error.response?.data?.message || 'Failed to create gem listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900">Create New Gem Listing</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gem Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Royal Blue Sapphire"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gem Type *</label>
                  <select
                    value={formData.gem_type}
                    onChange={(e) => setFormData({ ...formData, gem_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {gemTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Color *</label>
                  <input
                    type="text"
                    placeholder="e.g., Deep Blue"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.color ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                  {errors.color && <p className="text-red-600 text-xs mt-1">{errors.color}</p>}
                </div>
              </div>
            </div>

            {/* Price & Weight */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Pricing & Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Weight (Carats) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 4.5"
                    value={formData.weight_carats}
                    onChange={(e) => setFormData({ ...formData, weight_carats: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.weight_carats ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                  {errors.weight_carats && <p className="text-red-600 text-xs mt-1">{errors.weight_carats}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Base Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 15000"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.base_price ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  />
                  {errors.base_price && <p className="text-red-600 text-xs mt-1">{errors.base_price}</p>}
                </div>
              </div>
            </div>

            {/* Listing Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Listing Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Listing Type *</label>
                  <select
                    value={formData.listing_type}
                    onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Direct_Sale">Direct Sale (Fixed Price)</option>
                    <option value="Auction">Auction</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_negotiable}
                      onChange={(e) => setFormData({ ...formData, is_negotiable: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-slate-700">Price is Negotiable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the gem's characteristics, history, or special features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Origin</label>
                  <input
                    type="text"
                    placeholder="e.g., Sri Lanka"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Clarity</label>
                  <input
                    type="text"
                    placeholder="e.g., Very Clean"
                    value={formData.clarity}
                    onChange={(e) => setFormData({ ...formData, clarity: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">NGJA Certificate</label>
                  <input
                    type="text"
                    placeholder="e.g., NGJ-2024-001"
                    value={formData.ngja_cert}
                    onChange={(e) => setFormData({ ...formData, ngja_cert: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900">Gem Image *</h3>

              <div className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                errors.image
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
              }`}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                
                {imagePreview ? (
                  <div className="space-y-3">
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-500 cursor-pointer transition-colors"
                    >
                      Change Image
                    </label>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer space-y-2">
                    <Upload size={32} className="mx-auto text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-900">Click to upload gem image</p>
                      <p className="text-xs text-slate-600 mt-1">JPG, PNG, GIF (Max 2MB)</p>
                    </div>
                  </label>
                )}
              </div>
              {errors.image && <p className="text-red-600 text-xs">{errors.image}</p>}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-1">Heads up!</p>
                <p>Your gem listing will be submitted for admin review. Once approved, it will appear on the marketplace.</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateGemModal;
