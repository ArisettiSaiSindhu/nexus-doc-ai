import React from 'react';
import { motion } from 'framer-motion';

export default function NexusCheckbox({
  checked = false,
  onChange,
  label,
  description,
  disabled = false
}) {
  const toggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={toggle}
      className={`flex items-start gap-3 select-none cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className={`nexus-checkbox-box flex-shrink-0 mt-0.5 ${checked ? 'checked' : ''}`}>
        {checked && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-3.5 h-3.5 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.polyline
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              points="20 6 9 17 4 12"
            />
          </motion.svg>
        )}
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-heading font-medium text-white group-hover:text-[#ff5147] transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-[#a1a1aa] font-sans">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
