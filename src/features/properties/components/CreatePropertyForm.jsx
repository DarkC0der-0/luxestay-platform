import React, { useState, useRef } from 'react';
import { useCreateProperty } from '@/features/properties/hooks/useProperties';
import {
  FiHome,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiImage,
  FiX,
  FiUploadCloud,
  FiCheck,
  FiAlignLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

/* ── styled field wrapper ── */
const Field = ({ label, icon: Icon, required, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
      {required && <span className="text-indigo-500">*</span>}
    </label>
    {children}
  </div>
);

/* ── input styles ── */
const inputCls =
  'w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 text-sm text-slate-800 placeholder:text-slate-300 transition-all duration-200';

/* ── property types ── */
const PROPERTY_TYPES = ['Villa', 'Apartment', 'Mansion', 'Cabin', 'Penthouse', 'Chalet', 'Cottage'];

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const CreatePropertyForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title:         '',
    description:   '',
    location:      '',
    price_per_night: '',
    property_type: 'Villa',
    bedrooms:      '',
    bathrooms:     '',
    max_guests:    '',
    amenities:     '',
  });
  const [files, setFiles]           = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [step, setStep]             = useState(1);
  const fileInputRef                = useRef(null);

  const createMutation = useCreateProperty();

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 10);
    setFiles(selected);
    // build previews
    const urls = selected.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== '') data.append(key, val);
    });
    files.forEach((file) => data.append('images', file));

    createMutation.mutate(data, {
      onSuccess: () => onSuccess?.(),
    });
  };

  /* ── step validation ── */
  const step1Valid = formData.title.trim() && formData.location.trim() && formData.price_per_night;
  const step2Valid = formData.description.trim();

  /* ────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <button
              type="button"
              onClick={() => { if (s < step || (s === 2 && step1Valid) || (s === 3 && step1Valid && step2Valid)) setStep(s); }}
              className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                step === s
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : s < step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s < step ? <FiCheck className="w-4 h-4" /> : s}
            </button>
            {s < 3 && (
              <div className={`flex-1 h-px rounded-full transition-all duration-500 ${s < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        ))}
        <span className="ml-3 text-xs font-bold text-slate-400">
          {step === 1 && 'Basic Details'}
          {step === 2 && 'Description & Extras'}
          {step === 3 && 'Photos'}
        </span>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ═══════════ STEP 1: Basic Details ═══════════ */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="p-5 bg-gradient-to-r from-indigo-50/60 to-violet-50/40 rounded-2xl border border-indigo-100/60 mb-6">
              <p className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                <FiHome className="w-3.5 h-3.5" />
                Step 1 — Tell us about your property
              </p>
            </div>

            <Field label="Listing Title" icon={FiHome} required>
              <input
                name="title"
                className={inputCls}
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Oceanfront Villa with Infinity Pool"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location" icon={FiMapPin} required>
                <input
                  name="location"
                  className={inputCls}
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Malibu, California"
                />
              </Field>
              <Field label="Price per Night ($)" icon={FiDollarSign} required>
                <input
                  name="price_per_night"
                  type="number"
                  min="1"
                  className={inputCls}
                  value={formData.price_per_night}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 850"
                />
              </Field>
            </div>

            {/* Property type chips */}
            <Field label="Property Type" icon={FiHome} required>
              <div className="flex flex-wrap gap-2 mt-1">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, property_type: type }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.property_type === type
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </Field>

            {/* Beds / Baths / Guests */}
            <div className="grid grid-cols-3 gap-4">
              <Field label="Bedrooms">
                <input name="bedrooms" type="number" min="1" className={inputCls} value={formData.bedrooms} onChange={handleChange} placeholder="4" />
              </Field>
              <Field label="Bathrooms">
                <input name="bathrooms" type="number" min="1" className={inputCls} value={formData.bathrooms} onChange={handleChange} placeholder="3" />
              </Field>
              <Field label="Max Guests">
                <input name="max_guests" type="number" min="1" className={inputCls} value={formData.max_guests} onChange={handleChange} placeholder="8" />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-200/70 transition-all active:scale-95 text-sm disabled:pointer-events-none disabled:shadow-none"
              >
                Next: Description
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: Description & Amenities ═══════════ */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="p-5 bg-gradient-to-r from-violet-50/60 to-purple-50/40 rounded-2xl border border-violet-100/60 mb-6">
              <p className="text-xs font-bold text-violet-600 flex items-center gap-1.5">
                <FiAlignLeft className="w-3.5 h-3.5" />
                Step 2 — Describe your space
              </p>
            </div>

            <Field label="Description" icon={FiFileText} required>
              <textarea
                name="description"
                rows={6}
                className={`${inputCls} resize-none`}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the ambiance, architecture, views, and what makes your property special..."
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {formData.description.length} characters — aim for 150+ for better visibility
              </p>
            </Field>

            <Field label="Amenities (comma-separated)">
              <input
                name="amenities"
                className={inputCls}
                value={formData.amenities}
                onChange={handleChange}
                placeholder="Pool, Hot Tub, WiFi, Kitchen, Gym, Concierge..."
              />
            </Field>

            {/* Amenity preview chips */}
            {formData.amenities && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.split(',').map((a) => a.trim()).filter(Boolean).map((a) => (
                  <span key={a} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                    {a}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                ← Back
              </button>
              <button
                type="button"
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-200/70 transition-all active:scale-95 text-sm disabled:pointer-events-none disabled:shadow-none"
              >
                Next: Photos
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: Photos ═══════════ */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="p-5 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 rounded-2xl border border-emerald-100/60 mb-6">
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <FiImage className="w-3.5 h-3.5" />
                Step 3 — Add photos (up to 10)
              </p>
            </div>

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-indigo-50/30 rounded-2xl p-10 text-center transition-all group"
            >
              <FiUploadCloud className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
              <p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                Click to upload photos
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — up to 10 images</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                    {i === 0 && (
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded-md uppercase tracking-wide">
                        Cover
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                ← Back
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || files.length === 0}
                className="group relative overflow-hidden flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-200/70 transition-all active:scale-95 text-sm disabled:pointer-events-none disabled:shadow-none"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {createMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiHome className="w-4 h-4" />
                )}
                {createMutation.isPending ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default CreatePropertyForm;
