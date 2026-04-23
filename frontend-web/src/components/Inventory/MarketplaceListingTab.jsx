import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import axios from 'axios';

const MarketplaceListingTab = ({ mode = 'all' }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internalGems, setInternalGems] = useState([]);
  const [marketplaceGems, setMarketplaceGems] = useState([]); // NEW: Track published gems
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingGemId, setEditingGemId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const [formData, setFormData] = useState({
    selectedGem: null,
    selectedInventoryItem: null,
    base_price: '',
    description: '',
    is_negotiable: false,
    image: null,
  });

  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch internal gems on mount
  useEffect(() => {
    fetchInternalGems();
    fetchMarketplaceGems(); // NEW: Fetch published gems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInternalGems = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${apiUrl}/api/inventory/available`,
        { headers }
      );
      
      setInternalGems(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load available stock');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch marketplace gems published by this user
  const fetchMarketplaceGems = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${apiUrl}/api/gems/my/listings`,
        { headers }
      );
      
      // Filter to show only Marketplace_Active gems
      const activeGems = response.data.filter(g => g.listing_status === 'Marketplace_Active');
      setMarketplaceGems(activeGems);
    } catch (error) {
      console.error('Failed to fetch marketplace gems:', error);
    }
  };

  const handleSelectGem = (gemOption) => {
    setFormData(prev => ({
      ...prev,
      selectedGem: gemOption
    }));
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result);
    reader.readAsDataURL(file);
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    
    if (stepNum === 1) {
      if (!formData.selectedGem) newErrors.selectedGem = 'Please select a gem from inventory';
    } else if (stepNum === 2) {
      if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
        newErrors.base_price = 'Price must be > 0';
      }
      if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    } else if (stepNum === 3) {
      if (!formData.image) newErrors.image = 'Gem image required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      
      // ===== CRITICAL: ALL REQUIRED SCHEMA FIELDS =====
      // Keep a strict link between internal inventory and published gem.
      fd.append('inventory_id', formData.selectedGem.value);
      fd.append('name', formData.selectedGem.gem.name);
      fd.append('gem_type', formData.selectedGem.gem.gem_type);
      fd.append('weight_carats', String(formData.selectedGem.gem.weight_carats));
      fd.append('color', formData.selectedGem.gem.color);
      fd.append('origin', formData.selectedGem.gem.origin || '');
      
      // From marketplace wizard form
      fd.append('base_price', String(parseFloat(formData.base_price)));
      fd.append('description', formData.description);
      fd.append('is_negotiable', String(formData.is_negotiable));
      
      // CRITICAL FIX: Set listing_status to Marketplace_Active (not Internal_Inventory!)
      fd.append('listing_status', 'Marketplace_Active');
      
      // Image file
      if (formData.image) {
        fd.append('image', formData.image);
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Submitting gem to marketplace...');
      
      // Create a new gem record in the Gem collection
      const gemResponse = await axios.post(
        `${apiUrl}/api/gems`,
        fd,
        { headers }
      );

      console.log('Gem created successfully:', gemResponse.data);

      // Mark the inventory item as "Listed"
      await axios.patch(
        `${apiUrl}/api/inventory/${formData.selectedGem.value}/mark-listed`,
        {},
        { headers }
      );

      toast.success('✓ Gem published to marketplace!');
      
      // Reset and refresh
      setFormData({
        selectedGem: null,
        base_price: '',
        description: '',
        is_negotiable: false,
        image: null,
      });
      setImagePreview(null);
      setStep(1);
      fetchInternalGems();
      fetchMarketplaceGems(); // NEW: Refresh published gems list
    } catch (error) {
      console.error('Publish failed:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to publish gem';
      toast.error(`✗ ${errorMsg}`);
      // DO NOT reset form on error - keep user's data for retry
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: Update gem price
  const handleUpdatePrice = async (gemId) => {
    if (!editPrice || parseFloat(editPrice) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(
        `${apiUrl}/api/gems/${gemId}`,
        { base_price: parseFloat(editPrice) },
        { headers }
      );
      
      toast.success('Price updated successfully!');
      setEditingGemId(null);
      setEditPrice('');
      fetchMarketplaceGems(); // Refresh list
    } catch (error) {
      console.error('Failed to update price:', error);
      toast.error(error.response?.data?.message || 'Failed to update price');
    }
  };

  // NEW: Delete marketplace gem
  const handleDeleteGem = async (gemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.delete(
        `${apiUrl}/api/gems/${gemId}`,
        { headers }
      );
      
      toast.success('Gem deleted successfully!');
      fetchMarketplaceGems(); // Refresh list
    } catch (error) {
      console.error('Failed to delete gem:', error);
      toast.error(error.response?.data?.message || 'Failed to delete gem');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  // Convert internal gems to select options
  const gemOptions = internalGems.map(gem => ({
    value: gem._id,
    label: `${gem.name} • ${gem.gem_type} • ${gem.weight_carats}ct • ${gem.color}`,
    gem
  }));

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#cbd5e1',
      borderRadius: '0.75rem',
      padding: '4px',
      minHeight: '48px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#64748b' },
      '&:focus': { borderColor: '#2563eb', boxShadow: '0 0 0 1px #2563eb' },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      cursor: 'pointer',
      padding: '12px 16px',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }),
  };

  const minNegotiableOffer = formData.base_price 
    ? (parseFloat(formData.base_price) * 0.5).toFixed(2)
    : '0.00';

  const showListings = mode === 'all' || mode === 'listings';
  const showWizard = mode === 'all' || mode === 'wizard';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">🌐 Marketplace Listing Wizard</h2>
        <p className="text-slate-600 font-medium">Select a gem from internal inventory, add details, and publish to marketplace</p>
      </div>

      {showListings && marketplaceGems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-slate-50 border-2 border-blue-200 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span>🎯 Your Active Listings ({marketplaceGems.length})</span>
          </h3>
          <div className="space-y-3">
            {marketplaceGems.map((gem) => (
              <motion.div
                key={gem._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-blue-100 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{gem.name}</h4>
                  <p className="text-xs text-slate-600">
                    {gem.gem_type} • {gem.weight_carats}ct • {gem.color}
                    {gem.is_negotiable && ' • 🤝 Negotiable'}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold text-blue-700">${gem.base_price}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit Price Button */}
                  {editingGemId === gem._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="New price"
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                      <button
                        onClick={() => handleUpdatePrice(gem._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingGemId(null);
                          setEditPrice('');
                        }}
                        className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingGemId(gem._id);
                          setEditPrice(gem.base_price.toString());
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold hover:bg-blue-200 transition-all"
                      >
                        ✎ Edit Price
                      </button>
                      <button
                        onClick={() => handleDeleteGem(gem._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-all"
                      >
                        🗑 Unlist
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No inventory check */}
      {showWizard && internalGems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 text-center"
        >
          <AlertCircle size={48} className="mx-auto text-amber-600 mb-4" />
          <h3 className="text-lg font-bold text-amber-900 mb-2">No Gems in Internal Inventory</h3>
          <p className="text-amber-800 mb-4">
            You need to register gems in the "Internal Inventory" tab first before you can publish them to the marketplace.
          </p>
          <p className="text-sm text-amber-700">Go back to the "Internal Inventory" tab and register your first gem.</p>
        </motion.div>
      )}

      {showWizard && internalGems.length > 0 && (
        <>
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: i <= step ? 1.1 : 1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {i < step ? '✓' : i}
                </motion.div>
                {i < 3 && (
                  <div className={`flex-1 h-1 transition-colors ${i < step ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {['Select Gem', 'Add Details', 'Upload & Publish'].map((label, i) => (
              <div
                key={i}
                className={`text-center text-xs font-bold transition-colors ${
                  i + 1 <= step ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Content */}
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-sm"
          >
            {/* STEP 1: Select Gem */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Gem to Promote</h3>
                  <p className="text-slate-600 text-sm mb-6">
                    Choose a gem from your internal inventory. The dropdown is searchable—type to filter.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Select Gem *</label>
                  <Select
                    options={gemOptions}
                    value={formData.selectedGem}
                    onChange={handleSelectGem}
                    styles={customSelectStyles}
                    placeholder="🔍 Search by name, type, weight, or color..."
                    isSearchable
                    isClearable
                    formatOptionLabel={(option) => (
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <strong>{option.gem.name}</strong>
                          <div className="text-xs text-slate-500">
                            {option.gem.gem_type} • {option.gem.weight_carats}ct • {option.gem.color} • {option.gem.origin}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                  {errors.selectedGem && (
                    <p className="text-red-600 text-xs font-medium mt-2">✗ {errors.selectedGem}</p>
                  )}
                </div>

                {/* Selected Gem Preview */}
                {formData.selectedGem && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6"
                  >
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      Selected Gem Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Name</p>
                        <p className="text-slate-900 font-bold">{formData.selectedGem.gem.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Type</p>
                        <p className="text-slate-900 font-bold">{formData.selectedGem.gem.gem_type}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Weight</p>
                        <p className="text-slate-900 font-bold">{formData.selectedGem.gem.weight_carats} carats</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Color</p>
                        <p className="text-slate-900 font-bold">{formData.selectedGem.gem.color}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Origin</p>
                        <p className="text-slate-900 font-bold">{formData.selectedGem.gem.origin}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 2: Add Commercials */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Add Marketplace Details</h3>
                  <p className="text-slate-600 text-sm mb-6">
                    Set the price, description, and negotiation options for <strong>{formData.selectedGem?.gem.name}</strong>
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Base Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-5 top-3.5 text-slate-500 font-bold text-lg">$</span>
                    <input
                      type="number"
                      name="base_price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="0.00"
                      className="w-full pl-8 pr-5 py-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-bold"
                    />
                  </div>
                  {errors.base_price && (
                    <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.base_price}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the gemstone's characteristics, condition, special features, etc. (minimum 10 characters)"
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    {formData.description.length} characters (at least 10 required)
                  </p>
                </div>

                {/* Negotiable Price Toggle */}
                <div
                  className="flex items-start gap-4 p-5 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setFormData(prev => ({ ...prev, is_negotiable: !prev.is_negotiable }))}
                >
                  <input
                    type="checkbox"
                    id="negotiable"
                    checked={formData.is_negotiable}
                    onChange={() => {}}
                    className="w-6 h-6 text-blue-600 rounded cursor-pointer mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <label htmlFor="negotiable" className="text-sm font-bold text-slate-900 cursor-pointer block">
                      Enable Price Negotiation
                    </label>
                    <p className="text-xs text-slate-600 mt-1">
                      Allow buyers to make offers. Minimum acceptable offer will be 50% of your base price.
                    </p>
                  </div>
                </div>

                {/* Negotiable Warning */}
                {formData.is_negotiable && formData.base_price && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 flex gap-4"
                  >
                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 text-sm mb-1">Negotiation Rules</h4>
                      <p className="text-xs text-amber-800">
                        Buyers can place offers from <strong>$0 to ${minNegotiableOffer}</strong> (50% of your base price). Offers below this threshold will be blocked.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* STEP 3: Upload Media & Publish */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Image & Publish</h3>
                  <p className="text-slate-600 text-sm mb-6">
                    Upload a high-resolution image of <strong>{formData.selectedGem?.gem.name}</strong> and publish it to the marketplace.
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">High-Resolution Image *</label>
                  <div
                    className="border-3 border-dashed border-blue-300 rounded-xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
                    onClick={() => document.getElementById('imageInput').click()}
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                        <p className="text-sm font-semibold text-slate-600 mt-4">Click to replace image</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} className="mx-auto text-blue-400 mb-3" />
                        <p className="font-bold text-slate-900">Click to upload or drag & drop</p>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG, WebP • Max 5MB • Recommended: 2000x2000px</p>
                      </div>
                    )}
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  {errors.image && (
                    <p className="text-red-600 text-xs font-medium mt-2">✗ {errors.image}</p>
                  )}
                </div>

                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg p-6"
                >
                  <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Summary Before Publishing
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-emerald-700">Gem</p>
                      <p className="font-bold text-emerald-900">{formData.selectedGem?.gem.name}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Price</p>
                      <p className="font-bold text-emerald-900">${formData.base_price}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Negotiable</p>
                      <p className="font-bold text-emerald-900">{formData.is_negotiable ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">Image</p>
                      <p className="font-bold text-emerald-900">{imagePreview ? 'Ready' : '—'}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <div className="flex-1" />
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    ✓ Publish to Marketplace
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplaceListingTab;
