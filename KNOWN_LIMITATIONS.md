# NEXUS DOC AI — Technical Boundaries and Known Limitations

**NEXUS DOC AI — Constraint-Aware Error Detection for Document Extraction**  
This document outlines the technical boundaries, architectural constraints, and operating assumptions of the system.

---

## 1. Statutory GSTN Live Verification Boundary

### Capability
- Validates the complete 15-character statutory format of Indian Goods and Services Tax Identification Numbers (GSTIN) conforming to `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
- Validates the 2-digit State/UT prefix (e.g. `07` for Delhi, `27` for Maharashtra, `29` for Karnataka, `36` for Telangana).
- Validates embedded PAN consistency against taxpayer entity types.

### Boundary & Honest Disclosure
- Local algorithmic validation verifies syntactic and structural validity. It **does not prove** that the GSTIN is actively registered, in good standing, or that the vendor has filed GSTR-1/GSTR-3B returns.
- Real-time portal verification requires paid access to licensed GST Suvidha Provider (GSP) or Government of India API gateway credentials (NIC/GSTN). The system does not simulate or fake live portal responses.

---

## 2. OCR Engine Platform Dependencies

### Capability
- **Primary Engine:** Windows.Media.Ocr (hardware-accelerated WinRT engine with high Latin character recognition accuracy and coordinate anchoring).
- **Secondary Engine & Cross-Platform Fallback:** Tesseract OCR 5.4.0 (LSTM neural network OCR with word-level bounding boxes and float confidences parsed from `pytesseract.image_to_data`).

### Boundary
- `Windows.Media.Ocr` requires Windows 10 or Windows 11 host environments.
- On Linux (Ubuntu/Debian) or macOS deployments, the backend automatically transitions to `Tesseract OCR` as its primary engine. On non-Windows containers, dual-OCR execution requires configuring two distinct cross-platform engines (e.g. Tesseract + PaddleOCR) rather than Windows.Media.Ocr.

---

## 3. Line-Item Table Extraction Topologies

### Capability
- Conservative extraction of standard invoice tables with column layouts containing Item Description, Quantity, Unit Rate, and Line Total.
- Validates every candidate row with arithmetic reconciliation:
  $$\text{Quantity} \times \text{Unit Rate} \approx \text{Line Total}$$
- Rejects non-product text (business addresses, phone numbers, state codes, bank IFSC codes, email IDs, subtotal summaries).
- Flags math discrepancies with `math_discrepancy: True` so human verifiers can inspect billed versus computed amounts.

### Boundary
- **Complex Nested Structures:** Multi-level parent-child hierarchy rows, merged multi-line product descriptions spanning across page breaks without explicit horizontal borders, and multi-tax split sub-tables may require operator adjustment in the interactive Human Verification UI.
- **Headerless Invoices:** Invoices that completely omit column headers and align text irregularly rely on fallback heuristic line grouping.

---

## 4. Multi-Engine OCR Comparison Footprint

### Capability
- Fully independent extraction comparison between Engine 1 (Windows.Media.Ocr) and Engine 2 (Tesseract OCR).
- Computes empirical field-by-field agreement scores and itemizes disagreements without simulated confidence scores.

### Boundary
- Heavyweight deep learning models (such as PyTorch-based EasyOCR or TrOCR) require 2.5 GB+ of CUDA/PyTorch dependencies and model weights.
- To maintain a lightweight footprint compatible with standard workstations and testing environments without GPU requirements, the system leverages native WinRT OCR and C++ Tesseract. Teams with dedicated GPU clusters can seamlessly register additional engine plugins.

---

## 5. Document Quality & Handwriting

### Capability
- Detects image degradation via Laplacian variance (blur detection), histogram contrast ratio, and DPI spatial metrics.
- Automatically normalizes image skew across angles between $-45^\circ$ and $+45^\circ$.

### Boundary
- Invoices with severe physical tearing, extreme watermarking masking numeric totals, or cursive handwritten amounts are flagged as high risk (`RISK: HIGH`). The system strictly refuses to invent values for illegible fields, delegating them to human sign-off.

---

## 6. Currency and Taxation Variations

### Capability
- Optimized for Indian domestic invoicing (CGST, SGST, IGST, UTGST) in Indian Rupees (INR / ₹).
- Verifies dual-tax balance:
  $$\text{Subtotal} + \text{CGST} + \text{SGST} = \text{Grand Total}$$
  $$\text{Subtotal} + \text{IGST} = \text{Grand Total}$$

### Boundary
- Multi-currency transactions (e.g. invoices billed in USD or EUR with GST calculated in INR at fluctuating custom exchange rates) require human review to confirm the exchange rate ledger mapping.
