import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
  Layout,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
  Scale,
  ShieldAlert,
  SearchCheck,
  ChevronDown
} from 'lucide-react';
import DocumentPipelineVisualizer from '../components/DocumentPipelineVisualizer';

export default function LandingPage() {
  const navigate = useNavigate();

  const samplePerception = { perception_score: 0.95 };
  const sampleLayout = { layout_score: 0.86, layout_anomalies: [] };
  const sampleValidation = { constraint_score: 0.80, is_valid: false };

  const pillars = [
    {
      title: '1. Perception Checking',
      tag: 'OCR Readability & Noise',
      icon: Eye,
      description:
        'Examines document readability, contrast decay, and optical blur via OpenCV. Identifies character confusion risks like "B" mistaken for numeral "8" or "O" for "0" before errors reach ledger records.',
      metrics: 'Character Ambiguity Engine &bull; Laplacian Blur Variance'
    },
    {
      title: '2. Layout Verification',
      tag: 'Spatial Geometry & BBoxes',
      icon: Layout,
      description:
        'Analyzes spatial relationships and coordinate bounding boxes. Prevents catastrophic field swapping—such as confusing a $142.00 tax fee or shipping cost with the final invoice total.',
      metrics: 'Label-to-Value Proximity &bull; Grid Baseline Analysis'
    },
    {
      title: '3. Constraint-Based Validation',
      tag: 'Deterministic Arithmetic',
      icon: CheckCircle2,
      description:
        'Enforces mathematical and logical constraints. Verifies Subtotal + Tax == Total, sums individual line item multiplications, and guarantees payment due dates follow invoice issuance chronologically.',
      metrics: 'Subtotal + Tax = Total &bull; Chronological Date Logic &bull; Indian GST'
    }
  ];

  const comparisonRows = [
    {
      aspect: 'Extracted Value Trust',
      traditional: 'Blindly accepts OCR output if confidence looks decent',
      nexus: 'Examines perception, spatial layout, and mathematical balance before acceptance'
    },
    {
      aspect: 'Optical Ambiguities',
      traditional: 'Silent errors when "B" is OCR’d as "8" or "O" as "0"',
      nexus: 'Explicitly flags character confusion in numeric and GSTIN contexts'
    },
    {
      aspect: 'Field Misidentification',
      traditional: 'Often swaps tax amount, shipping fee, or subtotal with invoice total',
      nexus: 'Layout proximity checks verify label-to-value geometric alignment'
    },
    {
      aspect: 'Mathematical Errors',
      traditional: 'Zero mathematical verification; propagates wrong totals into ERPs',
      nexus: '100% deterministic arithmetic validation: Subtotal + Tax == Total'
    },
    {
      aspect: 'Duplicate Invoices',
      traditional: 'Checks only simple invoice number string, easily bypassed',
      nexus: 'Multi-attribute matching: Vendor GSTIN + Invoice# + Date + Total'
    },
    {
      aspect: 'Human-in-the-Loop',
      traditional: 'All invoices manually checked or none checked',
      nexus: 'Prioritizes review queue using composite risk matrix: Critical issues first'
    }
  ];

  const handleLaunchWorkspace = () => {
    navigate('/workspace/DOC-ASTR-8841');
  };

  const scrollToOverview = () => {
    const el = document.getElementById('nexus-main-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Spotlights */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[#ff3b2f]/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* ========================================================================= */}
      {/* 1. THE BIG OPENING SCREEN (NEXUS DOC AI)                                  */}
      {/* ========================================================================= */}
      <section className="min-h-[92vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 relative z-10 pt-10 pb-16">
        {/* Holographic Spinning Emblem */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Outer Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-dashed border-[#ff3b2f]/40 flex items-center justify-center shadow-[0_0_35px_rgba(255,59,47,0.2)]"
          >
            {/* Inner Counter-Rotating Ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="w-20 h-20 sm:w-26 sm:h-26 rounded-full border border-[var(--border-subtle)] flex items-center justify-center"
            >
              <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-[var(--bg-card)] border-2 border-[#ff3b2f] flex items-center justify-center shadow-[0_0_25px_rgba(255,59,47,0.4)]">
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-[#ff3b2f]">
                  N
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Corner HUD Markers */}
          <div className="absolute -top-2 -left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#ff3b2f]" />
          <div className="absolute -top-2 -right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#ff3b2f]" />
          <div className="absolute -bottom-2 -left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#ff3b2f]" />
          <div className="absolute -bottom-2 -right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#ff3b2f]" />
        </motion.div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[rgba(255,59,47,0.3)] shadow-[0_0_20px_rgba(255,59,47,0.15)] mb-5"
        >
          <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-ping"></span>
          <span className="text-xs font-mono font-bold tracking-widest text-[#ff3b2f] uppercase">
            CONSTRAINT-AWARE ERROR DETECTION ARCHITECTURE
          </span>
        </motion.div>

        {/* GIANT TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black font-heading tracking-tight text-[var(--text-primary)] mb-6 leading-none"
        >
          NEXUS <span className="gradient-text-red">DOC AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-base sm:text-xl text-[var(--text-secondary)] font-body max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Extracting invoice data is not enough. Nexus Doc AI validates extracted values across{' '}
          <strong className="text-[var(--text-primary)]">Perception</strong>,{' '}
          <strong className="text-[var(--text-primary)]">Layout</strong>, and{' '}
          <strong className="text-[#ff5147]">Deterministic Constraints</strong> before accounting ingestion.
        </motion.p>

        {/* 3 Pillars Overview Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mb-10 text-left"
        >
          <div className="nexus-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-[rgba(255,59,47,0.3)] flex items-center justify-center text-[#ff3b2f] flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-heading font-bold text-[var(--text-primary)] block">1. Perception</span>
              <span className="text-[11px] text-[var(--text-secondary)]">OCR & Ambiguity (8/B, 0/O)</span>
            </div>
          </div>

          <div className="nexus-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-[rgba(255,59,47,0.3)] flex items-center justify-center text-[#ff3b2f] flex-shrink-0">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-heading font-bold text-[var(--text-primary)] block">2. Layout</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Bounding-Box Alignment</span>
            </div>
          </div>

          <div className="nexus-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-emerald-500/30 flex items-center justify-center text-emerald-500 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-heading font-bold text-[var(--text-primary)] block">3. Constraints</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Subtotal + Tax == Total</span>
            </div>
          </div>
        </motion.div>

        {/* BIG ACTION GATEWAY BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 w-full"
        >
          {/* THE BIG OPEN BUTTON */}
          <motion.button
            onClick={handleLaunchWorkspace}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="btn-primary text-sm sm:text-base font-heading font-bold uppercase tracking-wider py-4 px-8 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(255,59,47,0.4)] cursor-pointer group"
          >
            <Cpu className="w-5 h-5 text-white" />
            <span>OPEN VERIFICATION WORKSPACE</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </motion.button>

          <Link
            to="/upload"
            className="btn-secondary text-sm uppercase tracking-wider py-4 px-6 rounded-xl flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#ff3b2f]" />
            <span>Upload Invoice</span>
          </Link>

          <Link
            to="/dashboard"
            className="btn-secondary text-sm uppercase tracking-wider py-4 px-6 rounded-xl flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Telemetry Dashboard</span>
          </Link>
        </motion.div>

        {/* Scroll hint */}
        <motion.button
          onClick={scrollToOverview}
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12 text-xs font-mono text-[var(--text-secondary)] hover:text-[#ff3b2f] flex flex-col items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Explore 3-Dimension Architecture</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE EXPANDED APPLICATION SCREEN                                        */}
      {/* ========================================================================= */}
      <div id="nexus-main-workspace" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16 pb-24">
        {/* Section Divider Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>INTERACTIVE MULTI-STAGE VERIFICATION CORE</span>
          </div>
          <h2 className="section-title text-[var(--text-primary)]">
            Document Intelligence & Verification Flow
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2">
            Watch an invoice transition through Perception, Spatial Geometry, and Mathematical Constraints.
          </p>
        </div>

        {/* Signature Visual Feature - Interactive Flow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-24"
        >
          <DocumentPipelineVisualizer
            documentId="DOC-ASTR-8841"
            perceptionData={samplePerception}
            layoutData={sampleLayout}
            validationData={sampleValidation}
          />
        </motion.div>

        {/* 3 Core Dimensions Grid */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff3b2f] font-bold block mb-2">
              Three-Dimensional Defense
            </span>
            <h2 className="section-title text-[var(--text-primary)]">
              Why Extraction Alone is Never Sufficient
            </h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mt-2">
              Even with high OCR confidence, extracted values can still contain fatal accounting errors.
              We examine every document across three independent vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  whileHover={{ y: -8, scale: 1.018 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="nexus-card flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[rgba(255,59,47,0.3)] group-hover:border-[#ff3b2f] group-hover:scale-110 flex items-center justify-center text-[#ff3b2f] shadow-md transition-all duration-300">
                        <Icon className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] group-hover:text-[#ff3b2f] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] group-hover:border-[rgba(255,59,47,0.3)] transition-all">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-[#ff3b2f] transition-colors mb-2">
                      {p.title}
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 group-hover:text-[var(--text-primary)] transition-colors">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] group-hover:border-[rgba(255,59,47,0.2)] text-[11px] font-mono text-[var(--text-secondary)] group-hover:text-[#ff3b2f] transition-colors">
                    <span dangerouslySetInnerHTML={{ __html: p.metrics }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Architectural Comparison Matrix */}
        <div className="mb-24">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff3b2f] font-bold block mb-2">
              Architectural Contrast
            </span>
            <h2 className="section-title text-[var(--text-primary)]">
              Conventional OCR vs. Nexus Constraint AI
            </h2>
          </div>

          <div className="nexus-table-wrapper">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th className="w-1/4">Evaluation Vector</th>
                  <th className="w-3/8 text-[var(--text-secondary)]">Traditional OCR Systems</th>
                  <th className="w-3/8 text-[#ff5147]">Nexus Constraint-Aware Detection</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((r, i) => (
                  <tr key={i}>
                    <td className="font-heading font-semibold text-[var(--text-primary)]">{r.aspect}</td>
                    <td className="text-[var(--text-secondary)] text-xs">{r.traditional}</td>
                    <td className="text-[var(--text-primary)] text-xs font-medium bg-[#ff3b2f]/[0.02]">
                      <span className="text-emerald-500 font-bold mr-1">&bull;</span>
                      {r.nexus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="relative rounded-3xl bg-[var(--bg-card)] border border-[rgba(255,59,47,0.3)] p-10 md:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff3b2f]/10 rounded-full blur-[80px] pointer-events-none"></div>

          <h3 className="text-2xl md:text-3xl font-bold font-heading text-[var(--text-primary)] mb-3">
            Ready to inspect real document constraints?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
            Test the live constraint engine with sample documents exhibiting tax math mismatches,
            character ambiguities, and layout shifts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/workspace/DOC-ASTR-8841"
              className="btn-primary text-xs uppercase tracking-wider py-3 px-6 rounded-xl"
            >
              Open Sample Invoice (DOC-ASTR-8841)
            </Link>
            <Link
              to="/upload"
              className="btn-secondary text-xs uppercase tracking-wider py-3 px-6 rounded-xl"
            >
              Upload Custom PDF
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
