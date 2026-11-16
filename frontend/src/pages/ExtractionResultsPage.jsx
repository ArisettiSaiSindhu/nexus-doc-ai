import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Code,
  ArrowRight,
  Check,
  Copy,
  DollarSign,
  Calendar,
  Building,
  Hash,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { runOcrComparison } from '../services/api';

export default function ExtractionResultsPage() {
  const { document, reloadDoc, loading } = useOutletContext();
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(document?.cross_model_data || null);
  const [compareError, setCompareError] = useState(null);

  if (loading || !document) return null;

  const items = document.items_data || [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(document, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunOcrCompare = async () => {
    try {
      setComparing(true);
      setCompareError(null);
      const res = await runOcrComparison(document.id);
      setComparisonResult(res);
      if (reloadDoc) await reloadDoc();
    } catch (err) {
      setCompareError(err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-[#ff3b2f]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
              Raw Extracted Representation
            </span>
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Document Extraction Results
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Structured entities extracted via OCR & multimodal ingestion models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJson(!showJson)}
            className="btn-secondary text-xs uppercase tracking-wider py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5 text-[#ff3b2f]" />
            <span>{showJson ? 'View Fields Table' : 'View Raw JSON'}</span>
          </button>

          <Link
            to={`/perception/${document.id}`}
            className="btn-primary text-xs uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Proceed to Perception Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {showJson ? (
        /* Raw JSON Inspector */
        <div className="nexus-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-[#a1a1aa]">Raw Extraction JSON Payload</span>
            <button
              onClick={handleCopyJson}
              className="text-xs font-mono text-[#ff3b2f] hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#09090b] text-[#f5f5f5] font-mono text-xs overflow-x-auto border border-[rgba(255,255,255,0.06)] max-h-[500px]">
            {JSON.stringify(document, null, 2)}
          </pre>
        </div>
      ) : (
        <>
          {/* Header Key Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="nexus-card p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] mb-1">
                <Building className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Vendor Identity</span>
              </div>
              <p className="text-sm font-bold font-heading text-white truncate">
                {document.vendor_name || 'N/A'}
              </p>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Entity Identified</span>
            </div>

            <div className="nexus-card p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] mb-1">
                <Hash className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Invoice Identifier</span>
              </div>
              <p className="text-sm font-mono font-bold text-white truncate">
                {document.invoice_number || 'N/A'}
              </p>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Format Match</span>
            </div>

            <div className="nexus-card p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Invoice Date</span>
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {document.invoice_date || 'N/A'}
              </p>
              <span className="text-[10px] font-mono text-[#a1a1aa] mt-1 block">Due: {document.due_date || 'N/A'}</span>
            </div>

            <div className="nexus-card p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa] mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#ff3b2f]" />
                <span>Extracted Total</span>
              </div>
              <p className="text-base font-mono font-extrabold text-[#ff3b2f]">
                ${Number(document.total_amount || 0).toFixed(2)}
              </p>
              <span className="text-[10px] font-mono text-[#a1a1aa] mt-1 block">Currency: {document.currency || 'USD'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="nexus-card p-0 overflow-hidden">
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <h3 className="text-sm font-bold font-heading text-white">
                Extracted Line Items ({items.length})
              </h3>
              <span className="text-[11px] font-mono text-[#a1a1aa]">Tabular Extraction Engine</span>
            </div>

            <div className="nexus-table-wrapper border-none rounded-none">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="font-medium text-xs text-white">{it.description}</td>
                        <td className="text-center font-mono text-xs text-zinc-300">{it.quantity}</td>
                        <td className="text-right font-mono text-xs text-zinc-300">${Number(it.unit_price).toFixed(2)}</td>
                        <td className="text-right font-mono font-bold text-xs text-white">${Number(it.total).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-xs text-[#a1a1aa] py-6">
                        No individual line items parsed from document scan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Footer */}
            <div className="p-5 bg-[#111113] border-t border-[rgba(255,255,255,0.06)] flex justify-end">
              <div className="w-72 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">${Number(document.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tax Amount:</span>
                  <span className="font-bold text-white">${Number(document.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.08)] text-sm font-bold text-white">
                  <span>Declared Total:</span>
                  <span className="text-[#ff3b2f]">${Number(document.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Independent Dual-Engine OCR Comparison Panel (Task 4) */}
          <div className="nexus-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)] gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#ff3b2f]" />
                <h3 className="text-sm font-bold font-heading text-white">
                  Independent Dual-Engine OCR Comparison
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff3b2f]/10 text-[#ff5147] border border-[#ff3b2f]/30">
                  Zero Simulation &bull; Genuine Outputs Only
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunOcrCompare}
                disabled={comparing}
                className="btn-secondary text-xs uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#ff3b2f] ${comparing ? 'animate-spin' : ''}`} />
                <span>{comparing ? 'Running Comparison...' : 'Run Dual-Engine Comparison'}</span>
              </button>
            </div>

            {compareError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
                Error: {compareError}
              </div>
            )}

            {comparisonResult && comparisonResult.engine_1 ? (
              <div className="space-y-4">
                {/* Engines side-by-side summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Engine 1: Windows.Media.Ocr */}
                  <div className="p-3.5 rounded-xl bg-[#09090b] border border-[rgba(255,255,255,0.06)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#ff3b2f]" />
                        <span className="text-xs font-bold text-white">Primary Engine</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {comparisonResult.engine_1.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#a1a1aa] bg-[#18181b] p-2 rounded max-h-24 overflow-y-auto">
                      {comparisonResult.engine_1.sample_text || 'No text output available'}
                    </div>
                  </div>

                  {/* Engine 2: Tesseract OCR */}
                  <div className="p-3.5 rounded-xl bg-[#09090b] border border-[rgba(255,255,255,0.06)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#ff3b2f]" />
                        <span className="text-xs font-bold text-white">Secondary Engine</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {comparisonResult.engine_2.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#a1a1aa] bg-[#18181b] p-2 rounded max-h-24 overflow-y-auto">
                      {comparisonResult.engine_2.sample_text || 'No text output available'}
                    </div>
                    {comparisonResult.engine_2.confidence > 0 && (
                      <div className="text-[10px] font-mono text-zinc-400">
                        Avg Confidence: <strong className="text-white">{comparisonResult.engine_2.confidence}%</strong> ({comparisonResult.engine_2.word_count} words)
                      </div>
                    )}
                  </div>
                </div>

                {/* Consensus & Disagreements Table */}
                <div className="p-3.5 rounded-xl bg-[#09090b] border border-[rgba(255,255,255,0.06)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">Consensus Agreement Index:</span>
                      <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded ${
                        (comparisonResult.agreement_score || 0) >= 0.85
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {((comparisonResult.agreement_score || 0) * 100).toFixed(1)}% Agreement
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#a1a1aa]">
                      {comparisonResult.fields_agreed} of {comparisonResult.fields_compared} fields agreed
                    </span>
                  </div>

                  {comparisonResult.disagreements && comparisonResult.disagreements.length > 0 ? (
                    <div>
                      <span className="text-[11px] font-mono text-[#ff5147] font-semibold block mb-2">
                        Detected Extraction Disagreements ({comparisonResult.disagreements.length}):
                      </span>
                      <div className="overflow-x-auto rounded border border-[rgba(255,255,255,0.06)]">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="bg-[#18181b] text-[#a1a1aa] text-[10px] uppercase">
                              <th className="p-2">Field</th>
                              <th className="p-2">Primary Engine Output</th>
                              <th className="p-2">Secondary Engine Output</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-zinc-300">
                            {comparisonResult.disagreements.map((d, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="p-2 text-[#ff5147] font-bold">{d.field}</td>
                                <td className="p-2 text-white">{String(d.engine_1_value || 'None')}</td>
                                <td className="p-2 text-white">{String(d.engine_2_value || 'None')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Full consensus verified: Both OCR engines extracted matching entities across all compared fields.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-[#a1a1aa] bg-[#09090b] rounded-xl border border-[rgba(255,255,255,0.04)]">
                <p>Dual-engine comparison evaluates independent extraction outputs from Windows.Media.Ocr and Tesseract OCR.</p>
                <p className="mt-1 text-zinc-400">Click &ldquo;Run Dual-Engine Comparison&rdquo; above to execute live cross-model comparison on this document scan.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
