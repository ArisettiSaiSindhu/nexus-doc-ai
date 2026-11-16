const API_BASE = '/api';

export async function getDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocumentById(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch document ${id}`);
  return res.json();
}

export async function uploadInvoiceFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function submitHumanVerification(id, updateData) {
  const res = await fetch(`${API_BASE}/documents/${id}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw new Error('Verification submission failed');
  return res.json();
}

export async function runOcrComparison(id) {
  const res = await fetch(`${API_BASE}/documents/${id}/ocr-compare`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Dual OCR comparison failed');
  return res.json();
}

export function getReportDownloadUrl(id) {
  return `${API_BASE}/documents/${id}/report`;
}

export function getCsvExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/csv`;
}

export function getExcelExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/excel`;
}

export function getTallyExportUrl(id) {
  return `${API_BASE}/documents/${id}/export/tally`;
}

export async function getBenchmarkMetrics() {
  const res = await fetch(`${API_BASE}/evaluation/benchmark`);
  if (!res.ok) throw new Error('Failed to run benchmark');
  return res.json();
}

export async function getDashboardMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function reseedSampleData() {
  const res = await fetch(`${API_BASE}/documents/seed`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed preset invoices');
  return res.json();
}
