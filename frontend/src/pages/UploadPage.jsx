import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu
} from 'lucide-react';
import { uploadInvoiceFile } from '../services/api';
import NexusGenerateButton from '../components/NexusGenerateButton';
import NexusSpotlightCard from '../components/NexusSpotlightCard';
import { NexusPipelineLoader } from '../components/NexusLoaders';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const presets = [
    {
      id: 'DOC-ASTR-8841',
      title: 'Astraea Quantum Labs (Defect Test)',
      tag: 'Critical Discrepancy',
      tagColor: 'text-[#ff5147] border-[#ff3b2f]/40 bg-[#ff3b2f]/10',
      description: 'Contains OCR character ambiguity ("B" read as "8") and an $80.00 mathematical balance error (Subtotal + Tax != Total).'
    },
    {
      id: 'DOC-CYBR-9012',
      title: 'Cyberdyne Neural Robotics',
      tag: 'Chronology & Layout Flag',
      tagColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      description: 'Features inverted dates (Due date occurs before invoice date) and spatial column offset anomaly.'
    },
    {
      id: 'DOC-NXOS-1049',
      title: 'Nexus Orbital Dynamics',
      tag: 'Pristine 100% Pass',
      tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      description: 'Flawless invoice passing 100% of mathematical constraints with 99.2% OCR confidence.'
    }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);
      setProgress(20);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 250);

      const result = await uploadInvoiceFile(file);
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        navigate(`/workspace/${result.document_id}`);
      }, 600);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] border border-[rgba(255,59,47,0.3)] mb-4">
          <UploadCloud className="w-3.5 h-3.5 text-[#ff3b2f]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff3b2f] font-semibold">
            Stage 1 &bull; Document Ingestion
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">
          Upload Invoice for Verification
        </h1>
        <p className="text-sm text-[#a1a1aa] max-w-lg mx-auto mt-2">
          Submit any PDF or scan. The engine will inspect Perception, Layout geometry,
          and mathematical constraints simultaneously.
        </p>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div className="nexus-card mb-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`upload-dropzone ${isDragging ? 'active' : ''}`}
        >
          <input
            type="file"
            id="file-input"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#09090b] border border-[rgba(255,59,47,0.4)] shadow-[0_0_20px_rgba(255,59,47,0.25)] flex items-center justify-center text-[#ff3b2f] mb-4 hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <p className="text-base font-bold font-heading text-white mb-1">
              Drag & Drop your invoice here, or <span className="text-[#ff3b2f] underline">browse</span>
            </p>
            <p className="text-xs text-[#a1a1aa] font-mono">
              Supported Formats: PDF, PNG, JPG &bull; Maximum file size: 25MB
            </p>
          </label>
        </div>

        {/* Selected File Card & Signature Generate Button */}
        {file && (
          <div className="file-preview-card mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="p-3 rounded-xl bg-[#18181b] text-[#ff3b2f] border border-[rgba(255,59,47,0.3)] shadow-[0_0_15px_rgba(255,59,47,0.2)]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white font-mono">{file.name}</p>
                <p className="text-xs text-[#a1a1aa] font-mono mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB &bull; {file.type || 'Document'}
                </p>
              </div>
            </div>

            <NexusGenerateButton
              onClick={handleUploadSubmit}
              loading={uploading}
              size="md"
              className="w-full sm:w-auto"
            >
              Execute Constraint Analysis
            </NexusGenerateButton>
          </div>
        )}

        {/* Multi-Stage Verification Pipeline Loader */}
        {uploading && (
          <div className="mt-8 space-y-4">
            <NexusPipelineLoader activeStage={progress > 66 ? 3 : progress > 33 ? 2 : 1} />
            <div className="w-full max-w-md mx-auto">
              <div className="w-full h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 via-[#ff5147] to-[#ff3b2f]"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <p className="text-[11px] font-mono text-[#a1a1aa] mt-2 text-center animate-pulse">
                Multi-tier constraint verification active ({progress}% complete)
              </p>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 p-3 rounded-lg bg-[#ff3b2f]/10 border border-[#ff3b2f]/30 text-xs text-[#ff5147] flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Preset Testing Documents Option with Spotlight Cards */}
      <div className="pt-8 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">
              Instant Test Invoices (Ideate Phase Scenarios)
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Don't have a document on hand? Click any preset challenge to test the constraint engine instantly.
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-[#ff3b2f]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {presets.map((preset) => (
            <NexusSpotlightCard
              key={preset.id}
              onClick={() => navigate(`/workspace/${preset.id}`)}
              className="p-6 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[9px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full border group-hover:scale-105 transition-transform ${preset.tagColor}`}>
                    {preset.tag}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#ff3b2f] group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-sm font-bold font-heading text-white group-hover:text-[#ff3b2f] transition-colors mb-2">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-[#a1a1aa] group-hover:text-zinc-200 transition-colors leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,59,47,0.3)] text-[11px] font-mono text-[#ff3b2f] font-semibold flex items-center justify-between transition-colors">
                <span>Launch Preset Workspace</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </NexusSpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
}
