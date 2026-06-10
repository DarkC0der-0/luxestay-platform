import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Premium Shared Dropdown Component v2
 * Features: High-contrast floating design, click-outside detection, 
 * smooth spring-like animations, and flexible alignment.
 */
const Dropdown = ({ 
  children, 
  isOpen, 
  onClose, 
  className = '', 
  align = 'left',
  width = 'w-full',
  maxHeight = 'max-h-[400px]'
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // If the click is inside the trigger element (parent of the dropdown),
        // let the parent's onClick handle the toggle.
        if (dropdownRef.current.parentNode && dropdownRef.current.parentNode.contains(event.target)) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      // Small delay to prevent immediate closure from the trigger click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={`
        absolute top-[calc(100%+12px)] z-[300]
        ${width} ${alignmentClasses[align]}
        bg-white rounded-[24px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] 
        border border-slate-200/60 p-2
        animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out
        ${className}
      `}
    >
      <div className={`${maxHeight} overflow-y-auto custom-scrollbar rounded-[18px]`}>
        {children}
      </div>
    </div>
  );
};

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'right', 'center']),
  width: PropTypes.string,
  maxHeight: PropTypes.string,
};

export default Dropdown;
