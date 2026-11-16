import React from 'react';
import { motion } from 'framer-motion';

export default function NexusSegmentedControl({
  options = [],
  value,
  onChange,
  className = '',
  size = 'md'
}) {
  return (
    <div className={`nexus-segmented-container relative ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`nexus-segmented-item relative z-10 flex items-center gap-1.5 transition-colors duration-200 ${
              isSelected ? 'active text-white' : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            {/* Sliding Pill Indicator */}
            {isSelected && (
              <motion.div
                layoutId="segmented-active-pill"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-[#18181b] border border-[rgba(255,59,47,0.4)] rounded-lg shadow-[0_0_15px_rgba(255,59,47,0.25)] z-[-1]"
              />
            )}

            {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#ff3b2f]' : 'text-zinc-500'}`} />}
            <span>{opt.label}</span>

            {opt.badge !== undefined && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-[#ff3b2f]/20 text-[#ff5147] border border-[#ff3b2f]/40'
                    : 'bg-white/5 text-zinc-500'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
