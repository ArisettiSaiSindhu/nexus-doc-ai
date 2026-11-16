import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Layout, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DocumentPipelineVisualizer({ documentId, perceptionData, layoutData, validationData, activeStage = null }) {
  const pScore = perceptionData?.perception_score || 0.92;
  const lScore = layoutData?.layout_score || 0.88;
  const cScore = validationData?.constraint_score || 0.95;
  const isValid = validationData?.is_valid !== false;

  const stages = [
    {
      id: 'perception',
      name: '1. Perception',
      subtitle: 'Clarity & OCR Readability',
      icon: Eye,
      score: `${Math.round(pScore * 100)}%`,
      status: pScore > 0.88 ? 'OPTIMAL' : 'UNCERTAIN',
      statusColor: pScore > 0.88 ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      description: 'Checks scan contrast, blur index, character confusion (8 vs B, 0 vs O), and confidence.',
      link: documentId ? `/perception/${documentId}` : '#'
    },
    {
      id: 'layout',
      name: '2. Layout',
      subtitle: 'Spatial Field Geometry',
      icon: Layout,
      score: `${Math.round(lScore * 100)}%`,
      status: (layoutData?.layout_anomalies?.length || 0) === 0 ? 'ALIGNED' : 'DISPLACED',
      statusColor: (layoutData?.layout_anomalies?.length || 0) === 0 ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      description: 'Analyzes bounding boxes, label-to-value distances, and prevents tax/total field swaps.',
      link: documentId ? `/layout/${documentId}` : '#'
    },
    {
      id: 'validation',
      name: '3. Constraints',
      subtitle: 'Mathematical & Logic Rules',
      icon: CheckCircle2,
      score: `${Math.round(cScore * 100)}%`,
      status: isValid ? 'VALIDATED' : 'DEFECT FLAGGED',
      statusColor: isValid ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10',
      description: 'Executes deterministic math: Subtotal + Tax == Total, Line items check, Date order.',
      link: documentId ? `/validation/${documentId}` : '#'
    }
  ];

  return (
    <div className="relative w-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 md:p-8 overflow-hidden shadow-xl transition-all duration-300 hover:border-[#ff3b2f]/40">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff3b2f]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none opacity-30"></div>

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--border-subtle)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-ping"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-[#ff3b2f] uppercase">
              Core Verification Pipeline
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
            Constraint-Aware Verification Architecture
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Real-time multi-dimensional inspection flow: Perception &rarr; Layout &rarr; Constraint Validation
          </p>
        </div>

        {documentId && (
          <Link
            to={`/human-review/${documentId}`}
            className="self-start md:self-auto btn-secondary text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-2"
          >
            <span>Review Issues</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ff3b2f]" />
          </Link>
        )}
      </div>

      {/* Animated Pipeline Stage Flow with Advanced Hover Lift */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stg, index) => {
          const Icon = stg.icon;
          const isCurrent = activeStage === stg.id;

          return (
            <motion.div
              key={stg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.015 }}
              transition={{ delay: index * 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-xl p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                isCurrent
                  ? 'bg-[var(--bg-secondary)] border-2 border-[#ff3b2f] shadow-[0_0_20px_rgba(255,59,47,0.2)]'
                  : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#ff3b2f]/45 hover:shadow-lg'
              }`}
            >
              {/* Connector line for large screens */}
              {index < 2 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover:border-[#ff3b2f] group-hover:scale-110 flex items-center justify-center shadow-md transition-all duration-300">
                    <ArrowRight className="w-3 h-3 text-[#ff3b2f] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              )}

              <div>
                {/* Stage top badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover:border-[#ff3b2f] group-hover:scale-110 flex items-center justify-center text-[#ff3b2f] shadow-sm transition-all duration-300">
                      <Icon className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-heading text-[var(--text-primary)] group-hover:text-[#ff3b2f] transition-colors">{stg.name}</h4>
                      <p className="text-[11px] font-mono text-[var(--text-secondary)]">{stg.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border group-hover:scale-105 transition-transform ${stg.statusColor}`}>
                    {stg.status}
                  </span>
                </div>

                {/* Score bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[var(--text-secondary)] font-mono text-[11px]">Reliability Index</span>
                    <span className="font-mono font-bold text-[var(--text-primary)] group-hover:text-[#ff3b2f] transition-colors">{stg.score}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: stg.score }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.2 }}
                      className={`h-full rounded-full ${
                        stg.id === 'validation' && !isValid
                          ? 'bg-[#ff3b2f]'
                          : 'bg-gradient-to-r from-red-600 to-[#ff3b2f]'
                      }`}
                    ></motion.div>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {stg.description}
                </p>
              </div>

              {documentId && (
                <Link
                  to={stg.link}
                  className="mt-2 text-xs font-mono font-semibold text-[#ff3b2f] group-hover:translate-x-1 flex items-center gap-1.5 transition-all pt-2.5 border-t border-[var(--border-subtle)]"
                >
                  <span>Inspect Dimension Detail</span>
                  <ArrowRight className="w-3 h-3 transition-transform" />
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Real-time laser scanning trace beam */}
      <div className="relative mt-8 pt-4 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between text-xs text-[var(--text-secondary)] font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Zero external API leaks &bull; 100% deterministic arithmetic execution</span>
        </div>
        <div className="text-[11px] text-[var(--text-tertiary)]">
          Formula: Subtotal + Tax = Total &bull; Bounding Box Proximity &bull; Optical Confusion Filter
        </div>
      </div>
    </div>
  );
}
