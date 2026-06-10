import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RxCross2 } from 'react-icons/rx';

/**
 * Centered modal component that uses React Portals to escape parent animations 
 * and layout constraints, ensuring the backdrop covers the full viewport.
 */
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => { 
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div 
        className={`
          relative bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full ${sizes[size]} 
          flex flex-col border border-slate-200 z-10 max-h-[90vh] animate-modal-in
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl shrink-0">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <RxCross2 className="text-xl" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto no-scrollbar flex-1 text-slate-700 text-sm font-medium">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
