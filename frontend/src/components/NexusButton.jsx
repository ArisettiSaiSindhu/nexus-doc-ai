import React from 'react';
import { motion } from 'framer-motion';

export default function NexusButton({
  children,
  onClick,
  variant = 'primary', // 'generate', 'border-trace', 'glow-outline', 'shimmer', 'destructive', 'ghost', 'primary', 'secondary'
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base'
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'border-trace':
        return 'btn-border-trace';
      case 'glow-outline':
        return 'btn-glow-outline';
      case 'shimmer':
        return 'btn-shimmer-sweep';
      case 'destructive':
        return 'btn-glow-danger';
      case 'ghost':
        return 'btn-ghost';
      case 'secondary':
        return 'btn-secondary';
      default:
        return 'btn-primary';
    }
  };

  return (
    <motion.button
      onClick={!disabled && !loading ? onClick : undefined}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      disabled={disabled || loading}
      className={`${getVariantClass()} ${sizeClasses[size] || sizeClasses.md} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </motion.button>
  );
}
