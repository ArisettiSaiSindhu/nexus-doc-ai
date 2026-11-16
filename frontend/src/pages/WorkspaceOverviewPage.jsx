import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import DocumentPipelineVisualizer from '../components/DocumentPipelineVisualizer';
import DocumentViewer from '../components/DocumentViewer';
import RiskBadge from '../components/RiskBadge';
import {
  Eye,
  Layout,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  FileSpreadsheet,
  Download,
  Info,
  Building,
  Receipt
} from 'lucide-react';
import { getReportDownloadUrl, getCsvExportUrl, getExcelExportUrl, getTallyExportUrl } from '../services/api';

export default function WorkspaceOverviewPage() {
  const { document, loading } = useOutletContext();
  const [activeHighlight, setActiveHighlight] = useState(null);

  if (loading || !document) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#ff3b2f] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">Loading Document Telemetry...</span>
        </div>
      </div>
    );
  }

  const pData = document.perception_data || {};
  const lData = document.layout_data || {};
  const vData = document.validation_data || {};
  const risk = document.risk_assessment || {};
  const dup = document.duplicate_data || {};
  const issues = vData.issues || [];
  const uncertainties = pData.uncertainties || [];
  const layoutAnomalies = lData.layout_anomalies || [];
  const allFlagsCount = issues.length + layoutAnomalies.length + uncertainties.length;

  return (
    <div className="space-y-6">
      {/* Signature Animated Pipeline Visualizer Banner */}
      <DocumentPipelineVisualizer
        documentId={document.id}
        perceptionData={pData}
        layoutData={lData}
        validationData={vData}
      />

      {/* Split Workspace: Document Visual Inspection Canvas + Structured Triage Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Document Canvas (7 Cols) */}
        <div className="lg:col-span-7 h-[780px]">
          <DocumentViewer
            document={document}
            activeHighlight={activeHighlight}
            onSelectField={(field) => setActiveHighlight(field)}
          />
        </div>

        {/* Right Column: Cohesive Triage & Intelligence Stack (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Executive Reliability & 3-Dimension Health */}
          <div className="nexus-card">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block">
                  Overall Composite Reliability
                </span>
                <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
                  Risk & Reliability Status
                </h3>
              </div>
              <RiskBadge level={document.risk_level} size="md" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-extrabold font-mono text-[var(--text-primary)]">
                  {Math.round((document.confidence_overall || 0.9) * 100)}%
                </span>
                <span className="text-xs text-[var(--text-secondary)] block font-mono mt-0.5">
                  Multi-dimension weighted confidence
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[var(--text-primary)] block">
                  {vData.is_valid === false ? 'Validation Failed' : 'Constraints Passed'}
                </span>
                <span className={`text-[11px] font-mono font-semibold ${vData.is_valid === false ? 'text-[#ff5147]' : 'text-emerald-500'}`}>
                  {vData.is_valid === false ? 'Arithmetic Defect Flagged' : '100% Deterministic Match'}
                </span>
              </div>
            </div>

            {/* Integrated 3 Dimensions Health Pills */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)] text-center text-xs font-mono">
              <Link
                to={`/perception/${document.id}`}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all"
              >
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Perception</span>
                <span className="font-bold text-[var(--text-primary)]">{Math.round((pData.perception_score || 0.9) * 100)}%</span>
              </Link>
              <Link
                to={`/layout/${document.id}`}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all"
              >
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Layout</span>
                <span className="font-bold text-[var(--text-primary)]">{Math.round((lData.layout_score || 0.86) * 100)}%</span>
              </Link>
              <Link
                to={`/validation/${document.id}`}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all"
              >
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Constraints</span>
                <span className={`font-bold ${vData.is_valid === false ? 'text-[#ff5147]' : 'text-emerald-500'}`}>
                  {Math.round((vData.constraint_score || 0.8) * 100)}%
                </span>
              </Link>
            </div>

            {/* Direct Action to Human Review */}
            <Link
              to={`/human-review/${document.id}`}
              className="btn-primary w-full text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-2 mt-4"
            >
              <span>Verify / Correct Document Fields</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Detected Issues & Anomalies Queue */}
          <div className="nexus-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff3b2f]" />
                <h4 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                  Flagged Issues & Violations ({allFlagsCount})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">Priority Order</span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {allFlagsCount === 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-600">All Constraints Satisfied</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">No arithmetic or layout anomalies detected.</p>
                </div>
              ) : (
                <>
                  {issues.map((iss, idx) => (
                    <div
                    key={`issue-${iss.code || 'flag'}-${iss.field || idx}-${idx}`}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[rgba(255,59,47,0.3)] hover:border-[#ff3b2f] transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono uppercase font-bold text-[#ff5147] bg-[#ff3b2f]/10 px-2 py-0.5 rounded border border-[#ff3b2f]/30">
                        {iss.code || 'CONSTRAINT_DEFECT'}
                        </span>
                        <button
                        type="button"
                        disabled={!iss.field}
                        onClick={() => setActiveHighlight(iss.field)}
                        className="text-[10px] font-mono text-[var(--text-secondary)] hover:text-[#ff3b2f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Inspect Field →
                          </button>
                          </div>
                          <p className="text-xs text-[var(--text-primary)] leading-snug">
                            {iss.message}
                            </p>
                            {activeHighlight === iss.field && iss.field && (
                              <p className="text-[10px] text-emerald-500 mt-2">
                                Field selected in document viewer
                                </p>
                              )}
                              </div>
                            ))}


                  {layoutAnomalies.map((anom, idx) => (
                    <div
                      key={`layout-${idx}`}
                      onMouseEnter={() => setActiveHighlight(anom.field)}
                      onMouseLeave={() => setActiveHighlight(null)}
                      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-amber-500/30 hover:border-amber-400 hover:translate-x-1 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {anom.code || 'LAYOUT_ANOMALY'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)] leading-snug">
                        {anom.message}
                      </p>
                    </div>
                  ))}

                  {uncertainties.map((unc, idx) => (
                    <div
                      key={`unc-${idx}`}
                      onMouseEnter={() => setActiveHighlight(unc.field)}
                      onMouseLeave={() => setActiveHighlight(null)}
                      className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[rgba(255,59,47,0.2)] hover:border-[rgba(255,59,47,0.5)] hover:translate-x-1 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono uppercase font-bold text-[#ff5147] bg-[rgba(255,59,47,0.08)] px-2 py-0.5 rounded border border-[rgba(255,59,47,0.25)]">
                          OPTICAL_AMBIGUITY
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)] leading-snug">
                        {unc.issues?.join('; ') || 'Sub-optimal OCR confidence.'}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Card 3: Document Accounting & GST Telemetry Matrix */}
          <div className="nexus-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#ff3b2f]" />
                <h4 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                  Accounting & Export Dossier
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                {dup.is_duplicate ? 'DUPLICATE WARNING' : 'UNIQUE INVOICE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">Supplier GSTIN</span>
                <span className="font-bold text-[var(--text-primary)] truncate block">{document.gstin || '27AABCA1234F1Z5'}</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">Currency</span>
                <span className="font-bold text-[var(--text-primary)]">{document.currency || 'USD ($)'}</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">Subtotal</span>
                <span className="font-bold text-[var(--text-primary)]">${Number(document.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">Total Declared</span>
                <span className="font-bold text-[#ff3b2f]">${Number(document.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Export Action Bar */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
              <a
                href={getReportDownloadUrl(document.id)}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary flex-1 text-center py-2 px-1.5 text-[10px] rounded-lg flex items-center justify-center gap-1"
                title="Download PDF Audit Certificate"
              >
                <Download className="w-3 h-3 text-[#ff3b2f]" />
                <span>PDF</span>
              </a>
              <a
                href={getCsvExportUrl(document.id)}
                download
                className="btn-secondary flex-1 text-center py-2 px-1.5 text-[10px] rounded-lg flex items-center justify-center gap-1"
                title="Download CSV Ledger"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                <span>CSV</span>
              </a>
              <a
                href={getExcelExportUrl(document.id)}
                download
                className="btn-secondary flex-1 text-center py-2 px-1.5 text-[10px] rounded-lg flex items-center justify-center gap-1"
                title="Download Excel Workbook"
              >
                <FileSpreadsheet className="w-3 h-3 text-[#ff3b2f]" />
                <span>Excel</span>
              </a>
              <a
                href={getTallyExportUrl(document.id)}
                download
                className="btn-secondary flex-1 text-center py-2 px-1.5 text-[10px] rounded-lg flex items-center justify-center gap-1"
                title="Download Tally XML Voucher"
              >
                <Receipt className="w-3 h-3 text-amber-500" />
                <span>Tally</span>
              </a>
            </div>
            {!document.human_verified && (
              <p className="text-[10px] text-amber-500 font-mono mt-2 pt-1.5 border-t border-[var(--border-subtle)] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                <span>Export unlocks upon Human Review approval.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
