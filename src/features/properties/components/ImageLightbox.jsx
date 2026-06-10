import React from 'react';
import PropTypes from 'prop-types';
import { FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const ImageLightbox = ({ activeImageIndex, imageUrls, onClose, onPrev, onNext }) => {
  if (activeImageIndex === null || !imageUrls || imageUrls.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 z-50"
        onClick={onClose}
      >
        <FaXmark size={32} />
      </button>

      <button 
        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-50"
        onClick={onPrev}
      >
        <FaChevronLeft size={24} />
      </button>

      <div className="relative max-w-full max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img 
          src={imageUrls[activeImageIndex]} 
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl transition-all duration-500"
          alt={`Property Preview ${activeImageIndex + 1}`}
        />
      </div>

      <button 
        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-50"
        onClick={onNext}
      >
        <FaChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/70 text-xs font-black tracking-widest uppercase">
        {activeImageIndex + 1} / {imageUrls.length}
      </div>
    </div>
  );
};

ImageLightbox.propTypes = {
  activeImageIndex: PropTypes.number,
  imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default ImageLightbox;
