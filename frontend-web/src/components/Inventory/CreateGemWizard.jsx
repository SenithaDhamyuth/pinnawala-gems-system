import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { createGemstone } from '../../services/api';

const GEM_TYPES = ['Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Topaz', 'Tourmaline', 'Spinel', 'Garnet', 'Peridot', 'Tanzanite', 'Aquamarine', 'Opal'];
const ORIGINS = ['Sri Lanka', 'Myanmar', 'Madagascar', 'Thailand', 'Tanzania', 'Brazil', 'Colombia', 'Zambia', 'Kenya', 'Australia', 'Afghanistan', 'Vietnam'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'White', 'Black', 'Brown', 'Gray', 'Multi-color', 'Colorless'];
const CLARITY_GRADES = [
  { value: 'FL', label: 'FL - Flawless' },
  { value: 'IF', label: 'IF - Internally Flawless' },
  { value: 'VVS1', label: 'VVS1 - Very Very Slightly Included' },
  { value: 'VVS2', label: 'VVS2 - Very Very Slightly Included' },
  { value: 'VS1', label: 'VS1 - Very Slightly Included' },
  { value: 'VS', label: 'VS - Very Slightly Included' },
  { value: 'VS2', label: 'VS2 - Very Slightly Included' },
  { value: 'SI1', label: 'SI1 - Slightly Included' },
  { value: 'SI2', label: 'SI2 - Slightly Included' },
  { value: 'I1', label: 'I1 - Included' },
];
const TREATMENTS = ['Unheated', 'Heated', 'Treated', 'Irradiated', 'Oil-Treated', 'Resin-Filled', 'Coated', 'None'];

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#cbd5e1',
    borderRadius: '0.75rem',
    padding: '4px',
    minHeight: '44px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#64748b' },
    '&:focus': { borderColor: '#2563eb', boxShadow: '0 0 0 1px #2563eb' },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  }),
};

export default function CreateGemWizard({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Custom option states
  const [customGemType, setCustomGemType] = useState('');
  const [customOrigin, setCustomOrigin] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    gem_type: null,
    color: null,
    origin: null,
    treatment: null,
    weight_carats: '',
    base_price: '',
    clarity: null,
    description: '',
    is_negotiable: false,
    ngja_cert: '',
    image: null,
  });

  const [errors, setErrors] = useState({});

  // Convert array options to react-select format
  const gemTypeOptions = GEM_TYPES.map(t => ({ value: t, label: t }));
  const originOptions = ORIGINS.map(o => ({ value: o, label: o }));
  const colorOptions = COLORS.map(c => ({ value: c, label: c }));
  const treatmentOptions = TREATMENTS.map(t => ({ value: t, label: t }));

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption
    }));
    // Clear custom field when a standard option is selected
    if (selectedOption?.value !== 'Other') {
      if (name === 'gem_type') setCustomGemType('');
      if (name === 'origin') setCustomOrigin('');
      if (name === 'color') setCustomColor('');
      if (name === 'treatment') setCustomTreatment('');
    }
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
      if (!formData.name.trim()) newErrors.name = 'Gem name required';
      if (!formData.gem_type) newErrors.gem_type = 'Gem type required';
      if (!formData.color) newErrors.color = 'Color required';
      if (!formData.origin) newErrors.origin = 'Origin required';
    } else if (stepNum === 2) {
      if (!formData.weight_carats || parseFloat(formData.weight_carats) < 0.01) {
        newErrors.weight_carats = 'Weight must be ≥ 0.01 carats';
      }
      if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
        newErrors.base_price = 'Price must be > 0';
      }
      if (formData.is_negotiable && formData.base_price) {
        const minOffer = parseFloat(formData.base_price) * 0.5;
        if (minOffer < 0) {
          newErrors.base_price = 'Invalid price for negotiable gem';
        }
      }
      if (!formData.image) newErrors.image = 'Gem image required';
    } else if (stepNum === 3) {
      if (!formData.treatment) newErrors.treatment = 'Treatment status required';
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
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('gem_type', formData.gem_type?.value || customGemType);
      fd.append('color', formData.color?.value || customColor);
      fd.append('origin', formData.origin?.value || customOrigin);
      fd.append('treatment', formData.treatment?.value || customTreatment);
      fd.append('weight_carats', parseFloat(formData.weight_carats));
      fd.append('base_price', parseFloat(formData.base_price));
      fd.append('clarity', formData.clarity?.value || 'VS');
      fd.append('description', formData.description);
      fd.append('is_negotiable', formData.is_negotiable);
      fd.append('ngja_cert', formData.ngja_cert || '');
      fd.append('image', formData.image);

      const newGem = await createGemstone(fd);
      toast.success('✓ Gem listing created successfully!');
      onSuccess?.(newGem);
      onClose();
    } catch (err) {
      console.error('Create gem error:', err);
      toast.error(err?.response?.data?.message || 'Failed to create gem listing');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const minNegotiableOffer = formData.base_price ? (parseFloat(formData.base_price) * 0.5).toFixed(2) : '0.00';

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          onClick={e => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-550 to-indigo-600 text-white px-8 py-7 flex items-center justify-between border-b border-blue-400/20">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Marketplace Listing Wizard</h2>
              <p className="text-blue-100 text-sm font-medium mt-2">Step {step} of 3 • {['Identity Details', 'Commercials & Media', 'Verification'][step - 1]}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/20 rounded-full transition-all"
            >
              <X size={26} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-slate-100 flex">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                className={`flex-1 transition-colors origin-left ${
                  i <= step ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-7"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Gemstone Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Premium Burmese Ruby"
                      className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.name && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Gemstone Type *</label>
                      <Select
                        options={gemTypeOptions}
                        value={formData.gem_type}
                        onChange={(opt) => handleSelectChange('gem_type', opt)}
                        styles={customSelectStyles}
                        placeholder="Select gem type..."
                        isSearchable
                      />
                      {errors.gem_type && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.gem_type}</p>}
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
                      {errors.color && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.color}</p>}
                    </div>
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
                    {errors.origin && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.origin}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add detailed description of the gemstone (characteristics, condition, special features)..."
                      rows={5}
                      className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-7"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Weight (carats) *</label>
                      <input
                        type="number"
                        name="weight_carats"
                        value={formData.weight_carats}
                        onChange={handleInputChange}
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      {errors.weight_carats && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.weight_carats}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Base Price (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-5 top-3.5 text-slate-500 font-bold">$</span>
                        <input
                          type="number"
                          name="base_price"
                          value={formData.base_price}
                          onChange={handleInputChange}
                          min="1"
                          placeholder="0.00"
                          className="w-full pl-8 pr-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                      {errors.base_price && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.base_price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Clarity Grade</label>
                      <Select
                        options={CLARITY_GRADES}
                        value={formData.clarity}
                        onChange={(opt) => handleSelectChange('clarity', opt)}
                        styles={customSelectStyles}
                        placeholder="Select grade..."
                        isSearchable
                      />
                    </div>
                  </div>

                  {/* Negotiable Price Warning */}
                  {formData.is_negotiable && formData.base_price && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex gap-4"
                    >
                      <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={22} />
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 text-sm mb-1">Negotiation Rules</h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          With negotiation enabled, buyers can place offers from <strong>$0 to ${minNegotiableOffer}</strong> (50% of your base price). Offers below this threshold will be blocked.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-4">Upload High-Resolution Image *</label>
                    <div
                      className="border-3 border-dashed border-blue-300 rounded-2xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
                      onClick={() => document.getElementById('imageInput').click()}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-md" />
                          <p className="text-sm font-semibold text-slate-600 mt-4">Click to replace image</p>
                        </div>
                      ) : (
                        <div>
                          <Upload size={48} className="mx-auto text-blue-400 mb-3" />
                          <p className="font-bold text-slate-900 text-lg">Click to upload or drag & drop</p>
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
                    {errors.image && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.image}</p>}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-7"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">Treatment Status *</label>
                    <Select
                      options={treatmentOptions}
                      value={formData.treatment}
                      onChange={(opt) => handleSelectChange('treatment', opt)}
                      styles={customSelectStyles}
                      placeholder="Select treatment..."
                      isSearchable
                    />
                    {errors.treatment && <p className="text-red-600 text-xs font-medium mt-1.5">✗ {errors.treatment}</p>}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm">
                      <CheckCircle size={20} className="text-blue-600" />
                      NGJA Certification
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      All gemstones listed on Pinnawala Gems marketplace comply with National Gem & Jewelry Authority (NGJA) standards. Upon purchase, buyers will receive official certification documents.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">NGJA Certificate Number (Optional)</label>
                    <input
                      type="text"
                      name="ngja_cert"
                      value={formData.ngja_cert}
                      onChange={handleInputChange}
                      placeholder="e.g., NGJA-2024-001234"
                      className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_negotiable: !prev.is_negotiable }))}>
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
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Allow buyers to make offers. Minimum acceptable offer will be 50% of your base price.
                      </p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-7 text-center"
                  >
                    <CheckCircle size={32} className="text-emerald-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-emerald-900 mb-2">Ready to Publish!</p>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your gem will appear in the public marketplace once published and approved by our admin team (typically within 2 hours).
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 p-8 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-7 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-200 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <div className="flex-1" />
            {step < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </span>
                ) : (
                  '✓ Publish Listing'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}