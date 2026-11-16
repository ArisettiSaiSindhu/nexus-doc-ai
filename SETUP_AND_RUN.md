# NEXUS DOC AI — Setup, Installation and Operation Guide

**NEXUS DOC AI — Constraint-Aware Error Detection for Document Extraction**  
A production-ready intelligent document processing (IDP) and verification platform for Indian GST financial documents.

---

## 1. System Requirements

### Operating System
- **Primary / Recommended:** Windows 10 / Windows 11 (Supports both Windows.Media.Ocr hardware-accelerated WinRT engine and Tesseract OCR).
- **Secondary / Cross-Platform:** Ubuntu 20.04+, Debian 11+, macOS Sonoma 14+ (Automatically routes OCR requests to Tesseract OCR).

### Runtimes & Compilers
- **Python:** Version 3.10, 3.11, or 3.12 (Tested on Python 3.12.5 64-bit).
- **Node.js:** Version 18.x or 20.x LTS.
- **Tesseract-OCR:** Version 5.0.0 or higher.

---

## 2. OCR Engine Installation & Prerequisites

### A. Windows.Media.Ocr (Primary Windows Engine)
- Pre-installed natively with Windows 10/11 WinRT API.
- Leveraged via PowerShell bridge script (`backend/extraction/win_ocr.ps1`). No separate API keys or external downloads required.

### B. Tesseract OCR (Cross-Platform / Secondary Independent Engine)
- **Windows Installation:**
  1. Download the official 64-bit installer from UB-Mannheim:  
     `https://github.com/UB-Mannheim/tesseract/wiki`
  2. Install to standard location (e.g. `C:\Program Files\Tesseract-OCR` or `%LOCALAPPDATA%\Programs\Tesseract-OCR`).
  3. Ensure `tesseract.exe` is added to your System `PATH`, or verified at `C:\Users\<User>\AppData\Local\Programs\Tesseract-OCR\tesseract.exe`.
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt-get update
  sudo apt-get install -y tesseract-ocr tesseract-ocr-eng libtesseract-dev
  ```
- **macOS (Homebrew):**
  ```bash
  brew install tesseract
  ```

---

## 3. Backend Setup & Configuration

1. **Navigate to the Backend Directory:**
   ```powershell
   cd "D:\Documents\port'\nexus-doc-ai\backend"
   ```

2. **Create and Activate a Virtual Environment:**
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On Linux/macOS:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

   *Core Python packages:* `fastapi`, `uvicorn`, `pymupdf` (fitz), `pytesseract`, `opencv-python-headless`, `numpy`, `pillow`, `pydantic`, `reportlab`, `openpyxl`, `pytest`, `httpx`.

4. **Verify Database Initialization:**
   The SQLite database (`nexus_doc_ai.db`) initializes automatically when starting the backend. To verify manually:
   ```bash
   python -c "from database.db import init_db; init_db(); print('Database schema ready.')"
   ```

5. **Start Backend Server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - API Root: `http://localhost:8000`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`
   - OpenAPI Specification: `http://localhost:8000/openapi.json`

---

## 4. Frontend Setup & Configuration

1. **Navigate to the Frontend Directory:**
   ```powershell
   cd "D:\Documents\port'\nexus-doc-ai\frontend"
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The application will launch at `http://localhost:3000` (or `http://localhost:5173` depending on port configuration).

4. **Build Production Bundle:**
   ```bash
   npm run build
   ```
   The compiled static assets are output to `frontend/dist/`.

---

## 5. Running the Complete Automated Test Suite

To run all automated verification tests, from the project root:

```powershell
python -m pytest "D:\Documents\port'\nexus-doc-ai\backend\tests" -v
```

### Running Specific Test Suites:
- **Complete 22-Step Integration Lifecycle:**
  ```powershell
  python -m pytest "D:\Documents\port'\nexus-doc-ai\backend\tests\test_end_to_end_workflow.py" -s
  ```
- **Line Items & Dual-OCR Suite:**
  ```powershell
  python -m pytest "D:\Documents\port'\nexus-doc-ai\backend\tests\test_line_items_and_dual_ocr.py" -v
  ```
- **Ground-Truth Dynamic Benchmark:**
  ```powershell
  python -m pytest "D:\Documents\port'\nexus-doc-ai\backend\tests\test_audit_evidence.py" -k "test_5_ground_truth_benchmark" -s
  ```
- **Export Security & Authorization Tests:**
  ```powershell
  python -m pytest "D:\Documents\port'\nexus-doc-ai\backend\tests\test_quality_checks.py" -v
  ```

---

## 6. Document Processing Workflow

```
[ Document Upload ] (PDF/JPG/PNG)
        │
        ▼
[ Preprocessing & Deskew ] (Hough Transform, Rotation Correction)
        │
        ▼
[ Primary OCR Extraction ] (Windows.Media.Ocr / Tesseract)
        │
        ▼
[ Constraint-Aware Validation Engine ]
  ├── 1. Perception Analysis (Laplacian Blur, Contrast, Resolution)
  ├── 2. Layout Spatial Verification (Bounding box anchor geometry)
  ├── 3. Semantic & Math Constraints (Subtotal + Tax = Total, Qty × Rate = Line Total, GSTIN)
  └── 4. Duplicate Check (Hash & Metadata matching)
        │
        ▼
[ Dual-OCR Cross Comparison ] (Empirical Disagreement Detection)
        │
        ▼
[ Human Verification & Sign-Off ] (Review, Edit Line-Items, Approve/Reject)
        │
        ▼
[ Certified ERP Export ] (CSV / Excel / PDF Audit Dossier / Tally XML & TSV)
```

---

## 7. Exporting to Tally ERP9 / Tally Prime

1. **Mandatory Approval Requirement:**  
   Invoices cannot be exported while in `pending` or `flagged` status. The operator must complete human verification and sign-off on the document via `/verify` or the Web UI. Attempting to export an unapproved document will return **HTTP 403 Forbidden**.

2. **Export Formats Supported:**
   - **Tally XML Voucher (`.xml`):** Compatible with Tally standard XML Gateway import (`Import Data -> Vouchers`). Maps Ledger heads: `Sales / Purchase Account`, `Input CGST`, `Input SGST`, `Input IGST`, and Vendor party ledger.
   - **Tally TSV (`.tsv`):** Tab-separated values file compatible with batch transaction import utilities.
   - **PDF Audit Dossier (`.pdf`):** Cryptographic timestamped report detailing extracted metadata, OCR confidences, math reconciliation checks, and human sign-off history.
   - **Excel (`.xlsx`) & CSV (`.csv`):** Comprehensive tabular data with line items.
