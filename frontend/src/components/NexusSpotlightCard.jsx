import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export default function NexusSpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 59, 47, 0.15)',
  onClick
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`nexus-card-spotlight ${className}`}
    >
      {/* Corner HUD Markers */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 group-hover:border-[#ff3b2f] transition-colors pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 group-hover:border-[#ff3b2f] transition-colors pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 group-hover:border-[#ff3b2f] transition-colors pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 group-hover:border-[#ff3b2f] transition-colors pointer-events-none" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
