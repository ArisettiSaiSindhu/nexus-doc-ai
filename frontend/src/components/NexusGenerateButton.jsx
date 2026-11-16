import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Loader2 } from 'lucide-react';

export default function NexusGenerateButton({
  children = 'Generate AI Verification',
  onClick,
  loading = false,
  success = false,
  disabled = false,
  className = '',
  icon: Icon = Sparkles,
  size = 'md' // 'sm', 'md', 'lg'
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button
      onClick={!loading && !disabled ? onClick : undefined}
      whileHover={!disabled && !loading ? { scale: 1.025, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97, y: 0 } : {}}
      disabled={disabled || loading}
      className={`btn-nexus-generate ${sizeClasses[size] || sizeClasses.md} ${
        disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#ff3b2f]" />
            <span className="tracking-widest animate-pulse font-mono text-xs">
              SYNTHESIZING...
            </span>
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 text-emerald-400 font-bold"
          >
            <motion.div
              initial={{ rotate: -45, scale: 0 }}
              animate={{ rotate: 0, scale: 1.2 }}
              transition={{ type: 'spring', damping: 10, stiffness: 300 }}
            >
              <Check className="w-4 h-4 text-emerald-400" />
            </motion.div>
            <span>VERIFIED &bull; PASSED</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            {Icon && (
              <Icon className="w-4 h-4 icon-sparkle text-[#ff5147] transition-transform duration-300 group-hover:rotate-45" />
            )}
            <span>{children}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
