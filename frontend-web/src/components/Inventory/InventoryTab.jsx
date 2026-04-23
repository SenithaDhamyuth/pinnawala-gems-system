import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, AlertCircle, Package, Loader, Edit2, X, Check } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import axios from 'axios';

const GEM_TYPES = ['Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Topaz', 'Tourmaline', 'Spinel', 'Garnet', 'Peridot', 'Tanzanite', 'Aquamarine', 'Opal', 'Other'];
const ORIGINS = ['Sri Lanka', 'Myanmar', 'Madagascar', 'Thailand', 'Tanzania', 'Brazil', 'Colombia', 'Zambia', 'Kenya', 'Australia', 'Afghanistan', 'Vietnam'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'White', 'Black', 'Brown', 'Gray', 'Multi-color', 'Colorless'];

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#cbd5e1',
    borderRadius: '0.75rem',
    padding: '4px',
    minHeight: '44px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#64748b' },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
  }),
};

const InventoryTab = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customGemType, setCustomGemType] = useState('');
  const [editingGemId, setEditingGemId] = useState(null);
  const [editingData, setEditingData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gem_type: null,
    color: null,
    origin: null,
    weight_carats: '',
  });

  const [errors, setErrors] = useState({});
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Fetch internal inventory gems on mount
  useEffect(() => {
    fetchInternalGems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInternalGems = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Fetch inventory items (private stock)
      const response = await axios.get(
        `${apiUrl}/api/inventory/my`,
        { headers }
      );
      
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch internal inventory:', error);
      toast.error('Failed to load internal inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomGemTypeChange = (e) => {
    setCustomGemType(e.target.value);
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption
    }));
    
    // Clear custom gem type if "Other" is not selected
    if (name === 'gem_type' && selectedOption?.value !== 'Other') {
      setCustomGemType('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Gem name required';
    if (!formData.gem_type) newErrors.gem_type = 'Gem type required';
    if (formData.gem_type?.value === 'Other' && !customGemType.trim()) {
      newErrors.customGemType = 'Please specify the gem type';
    }
    if (!formData.color) newErrors.color = 'Color required';
    if (!formData.origin) newErrors.origin = 'Origin required';
    if (!formData.weight_carats || parseFloat(formData.weight_carats) < 0.01) {
      newErrors.weight_carats = 'Weight must be ≥ 0.01 carats';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    setSubmitting(true);
    try {
      // Inventory items don't need FormData, just plain JSON
      const gemTypeValue = formData.gem_type?.value === 'Other' ? customGemType : formData.gem_type?.value;
      
      const payload = {
        name: formData.name,
        gem_type: gemTypeValue,
        color: formData.color.value,
        origin: formData.origin.value,
        weight_carats: parseFloat(formData.weight_carats),
      };
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(
        `${apiUrl}/api/inventory`,
        payload,
        { headers }
      );

      toast.success('✓ Stock added to internal inventory!');
      setItems([response.data, ...items]);
      
      // Reset form
      setFormData({
        name: '',
        gem_type: null,
        color: null,
        origin: null,
        weight_carats: '',
      });
      setCustomGemType('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create stock:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (gem) => {
    if (!window.confirm(`Delete "${gem.name}" from inventory?`)) return;
    
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(
        `${apiUrl}/api/inventory/${gem._id}`,
        { headers }
      );
      
      toast.success('✓ Stock deleted');
      setItems(items.filter(g => g._id !== gem._id));
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete stock');
    }
  };

  // NEW: Handle Edit button click
  const handleEdit = (gem) => {
    setEditingGemId(gem._id);
    setEditingData({
      name: gem.name,
      gem_type: { value: gem.gem_type, label: gem.gem_type },
      color: { value: gem.color, label: gem.color },
      origin: { value: gem.origin, label: gem.origin },
      weight_carats: gem.weight_carats.toString(),
    });
  };

  // NEW: Save updated stock
  const handleUpdateStock = async () => {
    if (!editingData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editingData.gem_type || !editingData.color || !editingData.origin || !editingData.weight_carats) {
      toast.error('All fields are required');
      return;
    }

    const weight = parseFloat(editingData.weight_carats);
    if (!Number.isFinite(weight) || weight <= 0) {
      toast.error('Weight must be greater than 0');
      return;
    }

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const updatePayload = {
        name: editingData.name.trim(),
        gem_type: editingData.gem_type.value,
        color: editingData.color.value,
        origin: editingData.origin.value,
        weight_carats: weight
      };

      const response = await axios.put(
        `${apiUrl}/api/inventory/${editingGemId}`,
        updatePayload,
        { headers }
      );

      // Update items list with new data
      setItems(items.map(item => item._id === editingGemId ? response.data : item));
      setEditingGemId(null);
      setEditingData(null);
      toast.success('✓ Stock updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  // NEW: Cancel edit
  const handleCancelEdit = () => {
    setEditingGemId(null);
    setEditingData(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: '',
      gem_type: null,
      color: null,
      origin: null,
      weight_carats: '',
    });
    setCustomGemType('');
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const gemTypeOptions = GEM_TYPES.map(t => ({ value: t, label: t }));
  const colorOptions = COLORS.map(c => ({ value: c, label: c }));
  const originOptions = ORIGINS.map(o => ({ value: o, label: o }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">🔒 Internal Inventory</h2>
          <p className="text-slate-600 font-medium">Quick stock registration - Private, not on marketplace. Publish to marketplace when ready.</p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-500 transition-all"
          >
            <Plus size={18} />
            Register Gem
          </motion.button>
        )}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border-2 border-blue-200 p-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Register New Gem</h3>
              <p className="text-xs font-medium text-slate-500">BASIC INFO ONLY • No images or prices needed yet</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Gem Name */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Gemstone Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Premium Burmese Ruby"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.name && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.name}</p>}
              </div>

              {/* Grid: Type, Color, Origin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Gem Type *</label>
                  <Select
                    options={gemTypeOptions}
                    value={formData.gem_type}
                    onChange={(opt) => handleSelectChange('gem_type', opt)}
                    styles={customSelectStyles}
                    placeholder="Select type..."
                    isSearchable
                  />
                  {errors.gem_type && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.gem_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Color *</label>
                  <Select
                    options={colorOptions}
                    value={formData.color}
                    onChange={(opt) => handleSelectChange('color', opt)}
                    styles={customSelectStyles}
                    placeholder="Select color..."
                    isSearchable
                  />
                  {errors.color && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Origin *</label>
                  <Select
                    options={originOptions}
                    value={formData.origin}
                    onChange={(opt) => handleSelectChange('origin', opt)}
                    styles={customSelectStyles}
                    placeholder="Select origin..."
                    isSearchable
                  />
                  {errors.origin && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.origin}</p>}
                </div>
              </div>

              {/* Custom Gem Type Input (shown when "Other" is selected) */}
              {formData.gem_type?.value === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-bold text-slate-900 mb-2">Specify Gem Type *</label>
                  <input
                    type="text"
                    value={customGemType}
                    onChange={handleCustomGemTypeChange}
                    placeholder="e.g., Moonstone, Jade, Morganite"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-50"
                  />
                  {errors.customGemType && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.customGemType}</p>}
                </motion.div>
              )}

              {/* Weight */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Weight (Carats) *</label>
                <input
                  type="number"
                  name="weight_carats"
                  value={formData.weight_carats}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.weight_carats && <p className="text-red-600 text-xs font-medium mt-1">✗ {errors.weight_carats}</p>}
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-medium">
                  💡 <strong>Tip:</strong> After registering, go to the "Marketplace" tab to add prices, images, and publish this gem to the marketplace.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    '✓ Register to Internal Inventory'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-slate-100 shadow-sm">
          <Package size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No gems in internal inventory</h3>
          <p className="text-slate-600 mb-6">Register gems here first, then promote them to marketplace</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md"
          >
            <Plus size={18} />
            Register Your First Gem
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((gem) => (
            <motion.div
              key={gem._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border-2 border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              {/* EDIT MODE */}
              {editingGemId === gem._id && editingData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Name *</label>
                    <input
                      type="text"
                      value={editingData.name}
                      onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Type *</label>
                      <Select
                        options={gemTypeOptions}
                        value={editingData.gem_type}
                        onChange={(opt) => setEditingData({...editingData, gem_type: opt})}
                        styles={customSelectStyles}
                        isSearchable
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Color *</label>
                      <Select
                        options={colorOptions}
                        value={editingData.color}
                        onChange={(opt) => setEditingData({...editingData, color: opt})}
                        styles={customSelectStyles}
                        isSearchable
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Origin *</label>
                      <Select
                        options={originOptions}
                        value={editingData.origin}
                        onChange={(opt) => setEditingData({...editingData, origin: opt})}
                        styles={customSelectStyles}
                        isSearchable
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Weight (ct) *</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editingData.weight_carats}
                        onChange={(e) => setEditingData({...editingData, weight_carats: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateStock}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-300 text-slate-700 rounded text-xs font-bold hover:bg-slate-400"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* NORMAL VIEW MODE */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{gem.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{gem.gem_type} • {gem.color}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleEdit(gem)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(gem)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weight:</span>
                      <span className="font-bold text-slate-900">{gem.weight_carats} ct</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Origin:</span>
                      <span className="font-bold text-slate-900">{gem.origin}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded">
                      🔒 Private • Ready to promote to marketplace
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      {items.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <p className="text-sm font-bold text-slate-900">
            📊 You have <span className="text-blue-600">{items.length}</span> gem{items.length !== 1 ? 's' : ''} in internal inventory
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Go to the "Marketplace" tab to select any gem and add pricing, images, and publish it.
          </p>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
