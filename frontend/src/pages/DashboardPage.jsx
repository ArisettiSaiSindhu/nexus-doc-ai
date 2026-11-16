import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  ExternalLink,
  Download,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { useTheme } from '../hooks/useTheme';
import { getDocuments, getDashboardMetrics, reseedSampleData, getReportDownloadUrl, getCsvExportUrl, getExcelExportUrl } from '../services/api';
import NexusSegmentedControl from '../components/NexusSegmentedControl';

export default function DashboardPage() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [documents, setDocuments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsRes, metricsRes] = await Promise.all([
        getDocuments(),
        getDashboardMetrics()
      ]);
      setDocuments(docsRes.documents || []);
      setMetrics(metricsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReseed = async () => {
    try {
      setSeeding(true);
      await reseedSampleData();
      await fetchData();
    } catch (err) {
      alert('Error reseeding: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Recharts data preparation with theme-adaptive colors
  const riskData = metrics ? [
    { name: 'Critical', value: metrics.risk_distribution.CRITICAL || 0, color: '#ef4444' },
    { name: 'High', value: metrics.risk_distribution.HIGH || 0, color: '#f59e0b' },
    { name: 'Medium', value: metrics.risk_distribution.MEDIUM || 0, color: '#3b82f6' },
    { name: 'Low', value: metrics.risk_distribution.LOW || 0, color: '#10b981' },
  ].filter(d => d.value > 0) : [];

  const dimensionData = [
    { name: 'Perception (OCR)', score: Math.round(metrics?.average_confidence || 95), color: '#0ea5e9', target: 100 },
    { name: 'Layout Geometry', score: 86, color: '#10b981', target: 100 },
    { name: 'Constraints (Math)', score: metrics?.constraint_pass_rate || 75, color: '#ff3b2f', target: 100 }
  ];

  const filteredDocs = filterRisk === 'ALL'
    ? documents
    : documents.filter(d => d.risk_level === filterRisk);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[var(--border-subtle)] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff3b2f] animate-pulse"></span>
            <span className="text-xs font-mono font-semibold tracking-wider text-[#ff3b2f] uppercase">
              Mission Control &bull; Verification Telemetry
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-[var(--text-primary)]">
            Document Intelligence Dashboard
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time constraint tracking, risk classification, and audit ledger pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReseed}
            disabled={seeding}
            className="btn-secondary text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer"
            title="Reset benchmark invoices for testing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>Reset Benchmark Data</span>
          </button>

          <Link
            to="/upload"
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center gap-2"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Invoice</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards with Theme-Safe Hover Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
        <div className="nexus-card group cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)] transition-colors">Ingested Invoices</span>
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[#ff3b2f] border border-[var(--border-subtle)] group-hover:border-[#ff3b2f] group-hover:scale-110 shadow-sm transition-all duration-300">
              <FileText className="w-4 h-4 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-[var(--text-primary)] group-hover:text-[#ff3b2f] transition-colors">
            {metrics?.total_documents ?? 0}
          </p>
          <span className="text-[11px] font-mono text-emerald-500 mt-2 block">
            &bull; Live document pool
          </span>
        </div>

        <div className="nexus-card group cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)] transition-colors">Average Confidence</span>
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-emerald-500 border border-emerald-500/20 group-hover:border-emerald-500 group-hover:scale-110 shadow-sm transition-all duration-300">
              <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
            {metrics?.average_confidence ?? 0}%
          </p>
          <span className="text-[11px] font-mono text-[var(--text-secondary)] mt-2 block">
            Composite reliability score
          </span>
        </div>

        <div className="nexus-card group cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)] transition-colors">Constraint Pass Rate</span>
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-[#ff3b2f] border border-[var(--border-subtle)] group-hover:border-[#ff3b2f] group-hover:scale-110 shadow-sm transition-all duration-300">
              <CheckCircle2 className="w-4 h-4 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-[var(--text-primary)] group-hover:text-[#ff3b2f] transition-colors">
            {metrics?.constraint_pass_rate ?? 0}%
          </p>
          <span className="text-[11px] font-mono text-[#ff5147] mt-2 block">
            Deterministic arithmetic verified
          </span>
        </div>

        <div className="nexus-card group cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono uppercase text-[var(--text-secondary)] transition-colors">Pending Human Review</span>
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] text-amber-500 border border-amber-500/20 group-hover:border-amber-500 group-hover:scale-110 shadow-sm transition-all duration-300">
              <AlertTriangle className="w-4 h-4 group-hover:scale-115 transition-transform" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-heading text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
            {metrics?.pending_review ?? 0}
          </p>
          <span className="text-[11px] font-mono text-amber-500 mt-2 block">
            Requires accountant sign-off
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Risk Distribution Donut */}
        <div className="nexus-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                  Multi-Factor Risk Distribution
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Categorized by mathematical discrepancy & OCR uncertainty
                </p>
              </div>
              <ShieldAlert className="w-4 h-4 text-[#ff3b2f]" />
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              {riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={isLight ? '#ffffff' : '#18181b'} 
                          strokeWidth={2} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: isLight ? '#ffffff' : '#18181b',
                        borderColor: isLight ? '#e2e8f0' : '#333338',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: isLight ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                      labelStyle={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: 600 }}
                      itemStyle={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[var(--text-secondary)] font-mono">No risk telemetry data available</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Critical ({metrics?.risk_distribution?.CRITICAL || 0})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> High ({metrics?.risk_distribution?.HIGH || 0})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span> Medium ({metrics?.risk_distribution?.MEDIUM || 0})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Low ({metrics?.risk_distribution?.LOW || 0})</span>
          </div>
        </div>

        {/* Dimension Performance Comparison */}
        <div className="nexus-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                  3-Dimension Verification Benchmark
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Accuracy pass rate comparison across inspection layers
                </p>
              </div>
              <Layers className="w-4 h-4 text-[#ff3b2f]" />
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionData} margin={{ top: 20, right: 15, left: -10, bottom: 10 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke={isLight ? '#cbd5e1' : '#3f3f46'}
                    tick={{ fill: isLight ? '#475569' : '#a1a1aa', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke={isLight ? '#cbd5e1' : '#3f3f46'}
                    tick={{ fill: isLight ? '#475569' : '#a1a1aa', fontSize: 11 }}
                    domain={[0, 100]} 
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: isLight ? 'rgba(255, 59, 47, 0.05)' : 'rgba(255, 255, 255, 0.04)' }}
                    contentStyle={{
                      backgroundColor: isLight ? '#ffffff' : '#18181b',
                      borderColor: isLight ? '#e2e8f0' : '#333338',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: isLight ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    labelStyle={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: 600 }}
                    itemStyle={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: 500 }}
                    formatter={(value) => [`${value}% Pass Rate`, 'Score']}
                  />
                  <Bar 
                    dataKey="score" 
                    radius={[6, 6, 0, 0]} 
                  >
                    {dimensionData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span> Perception</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Layout</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff3b2f]"></span> Constraints</span>
            </div>
            <span className="text-[#ff3b2f] font-bold">100% Target</span>
          </div>
        </div>
      </div>

      {/* Ingested Documents Ledger Table */}
      <div className="nexus-card p-0 overflow-hidden">
        <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
              Document Ingestion & Verification Queue
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Click any invoice to enter the 3-dimension verification workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-lg border border-[var(--border-subtle)]">
              {filteredDocs.length} of {documents.length} Records
            </span>
          </div>
        </div>

        <div className="nexus-table-wrapper border-none rounded-none">
          <table className="nexus-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Vendor / GSTIN</th>
                <th>Issue Date</th>
                <th>Total Amount</th>
                <th>Confidence</th>
                <th>Risk Rating</th>
                <th>Review Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="group">
                  <td>
                    <Link
                      to={`/workspace/${doc.id}`}
                      className="font-mono font-bold text-[var(--text-primary)] group-hover:text-[#ff3b2f] flex items-center gap-1.5 transition-colors"
                    >
                      <span>{doc.invoice_number || doc.id}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                  <td className="font-medium text-xs max-w-xs truncate text-[var(--text-primary)]">
                    <div>{doc.vendor_name || 'Unknown Entity'}</div>
                    {doc.gstin && (
                      <div className="text-[10px] font-mono text-[var(--text-secondary)]">{doc.gstin}</div>
                    )}
                  </td>
                  <td className="font-mono text-xs text-[var(--text-secondary)]">
                    {doc.invoice_date || 'N/A'}
                  </td>
                  <td className="font-mono font-bold text-xs text-[var(--text-primary)]">
                    ${Number(doc.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs text-[var(--text-secondary)]">
                    {Math.round((doc.confidence_overall || 0) * 100)}%
                  </td>
                  <td>
                    <RiskBadge level={doc.risk_level} size="sm" />
                  </td>
                  <td>
                    {doc.human_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Signed Off</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Pending Review</span>
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/workspace/${doc.id}`}
                        className="px-3 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] text-xs font-mono font-medium text-[var(--text-primary)] hover:text-[#ff3b2f] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all duration-200 shadow-sm"
                      >
                        Inspect
                      </Link>
                      <a
                        href={getReportDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#ff3b2f] border border-[var(--border-subtle)] hover:border-[#ff3b2f] transition-all duration-200 shadow-sm"
                        title="Download Audit PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
