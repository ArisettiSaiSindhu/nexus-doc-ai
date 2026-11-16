import React from 'react';
import { motion } from 'framer-motion';

export default function NexusSwitch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md'
}) {
  const toggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={toggle}
      className={`flex items-center justify-between gap-4 select-none cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-heading font-semibold text-white group-hover:text-[#ff5147] transition-colors">
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

      {/* Switch Track */}
      <div
        className={`nexus-toggle-track relative flex-shrink-0 ${
          checked ? 'active' : ''
        }`}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="nexus-toggle-thumb"
        />
      </div>
    </div>
  );
}
