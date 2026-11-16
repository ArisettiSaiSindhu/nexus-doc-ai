import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import RiskBadge from '../components/RiskBadge';
import { getDocumentById, getDocuments, getReportDownloadUrl } from '../services/api';
import { FileText, ArrowLeft, Download, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export default function WorkspaceLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const docId = id || 'DOC-ASTR-8841';

  const loadDocData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [docData, docsList] = await Promise.all([
        getDocumentById(docId),
        getDocuments()
      ]);
      setDocument(docData);
      setAllDocs(docsList.documents || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocData();
  }, [docId]);

  const handleDocChange = (newId) => {
    // Keep current sub-path but swap doc id
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/');
    if (segments.length >= 3) {
      segments[2] = newId;
      navigate(segments.join('/'));
    } else {
      navigate(`/workspace/${newId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Context Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[var(--border-subtle)] gap-4">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.93 }}>
            <Link
              to="/dashboard"
              className="p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] text-[var(--text-secondary)] hover:text-[#ff3b2f] hover:shadow-[0_0_12px_rgba(255,59,47,0.2)] transition-all duration-200 group flex items-center justify-center shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4 group-hover:text-[#ff3b2f] transition-colors" />
            </Link>
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff3b2f] font-semibold">
                DOCUMENT VERIFICATION CONTEXT
              </span>
              <span className="text-[10px] font-mono text-[#a1a1aa]">&bull;</span>
              <span className="text-[10px] font-mono text-[#a1a1aa]">{docId}</span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              {/* Document Switcher Dropdown */}
              <select
                value={docId}
                onChange={(e) => handleDocChange(e.target.value)}
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-heading font-bold rounded-lg px-3 py-1.5 focus:border-[#ff3b2f] outline-none cursor-pointer shadow-sm"
              >
                {allDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.invoice_number || d.id} — {d.vendor_name?.substring(0, 24)}... ({d.risk_level})
                  </option>
                ))}
              </select>

              {document && <RiskBadge level={document.risk_level} />}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={loadDocData}
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#ff3b2f] text-[var(--text-secondary)] hover:text-[#ff3b2f] hover:shadow-[0_0_10px_rgba(255,59,47,0.2)] transition-all duration-200 shadow-sm cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.a
            href={getReportDownloadUrl(docId)}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary text-xs uppercase tracking-wider py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#ff3b2f]" />
            <span>Download Audit PDF</span>
          </motion.a>

          <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={`/human-review/${docId}`}
              className="btn-primary text-xs uppercase tracking-wider py-2 px-3.5 rounded-lg flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Human Review</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Workspace Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Verification Engine Sidebar */}
        <Sidebar document={document} />

        {/* Content View */}
        <div className="flex-1 w-full min-w-0">
          <Outlet context={{ document, reloadDoc: loadDocData, loading }} />
        </div>
      </div>
    </div>
  );
}
