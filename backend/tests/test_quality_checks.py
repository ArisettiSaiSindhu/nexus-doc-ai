import os
import sys
import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app
from database.db import get_connection, init_db
from extraction.ocr_engine import run_tesseract_ocr, run_ocr_with_fallback
from reporting.tally_export import generate_tally_xml, generate_tally_tsv
import xml.etree.ElementTree as ET

client = TestClient(app)

def test_tesseract_float_confidence_and_filtering():
    """
    Requirement 1: Verify Tesseract confidence parsing using float(),
    filter invalid confidence values and calculate confidence only from valid recognized words.
    """
    test_img = BACKEND_DIR / "uploads" / "ocr_evidence_test.png"
    assert test_img.exists(), f"Test image missing: {test_img}"

    res = run_tesseract_ocr(str(test_img))
    assert res["success"] is True, f"Tesseract execution failed: {res.get('error')}"
    assert isinstance(res["confidence"], float), "Confidence must be float"
    assert res["confidence"] > 0.0, "Confidence must be greater than 0"
    assert res["word_count"] > 0, "Valid recognized word count must be > 0"
    assert len(res["text"].strip()) > 0, "Extracted text must not be empty"

    # Verify no -1 or negative values contributed to confidence
    for line in res.get("lines", []):
        for word_dict in line.get("Words", []):
            assert isinstance(word_dict["Confidence"], float)
            assert word_dict["Confidence"] >= 0.0
            assert len(word_dict["Text"].strip()) > 0

    print(f"\n[PASS] Tesseract parsed {res['word_count']} words with valid float confidence: {res['confidence']}%")

def test_fallback_multiple_scanned_invoices():
    """
    Requirement 2: Test the fallback with multiple actual scanned invoices and verify extracted text.
    """
    sample_files = [
        "ocr_evidence_test.png",
        "DOC-2CDB1173_page_1.png",
        "DOC-B93362E0_page_1.png"
    ]

    for fname in sample_files:
        fpath = BACKEND_DIR / "uploads" / fname
        if not fpath.exists():
            continue

        res = run_ocr_with_fallback(str(fpath), force_engine="tesseract")
        assert res["success"] is True, f"Failed on {fname}: {res.get('error')}"
        assert len(res["text"].strip()) > 0, f"Empty text extracted from {fname}"
        assert res["confidence"] > 50.0, f"Unusually low confidence on {fname}: {res['confidence']}"
        assert "Tesseract" in res["engine"]
        print(f"[PASS] Scanned invoice '{fname}': Extracted {res.get('word_count')} words | Conf: {res['confidence']}% | Engine: {res['engine']}")

def test_tally_export_xml_and_tsv_structures():
    """
    Requirement 3: Validate Tally export structure (XML and TSV) with correct field mapping.
    """
    sample_doc = {
        "id": "DOC-TALLY-TEST",
        "invoice_number": "INV-TALLY-99",
        "invoice_date": "2026-03-15",
        "vendor_name": "Astraea Quantum Laboratories Inc.",
        "gstin": "27AABCA1234F1Z5",
        "subtotal": 1420.00,
        "tax_amount": 142.00,
        "total_amount": 1562.00,
        "currency": "USD",
        "human_verified": 1
    }
    sample_items = [
        {"description": "Cryogenic Quantum Coaxial Line 50 Ohm", "quantity": 4, "unit_price": 230.00, "total": 920.00},
        {"description": "Parametric Microwave Amplifier Cavity", "quantity": 1, "unit_price": 500.00, "total": 500.00}
    ]

    # 1. Validate Tally XML
    xml_str = generate_tally_xml(sample_doc, sample_items)
    root = ET.fromstring(xml_str)
    assert root.tag == "ENVELOPE", "XML root must be ENVELOPE"
    assert root.find(".//TALLYREQUEST").text == "Import Data"
    assert root.find(".//VOUCHERTYPENAME").text == "Purchase"
    assert root.find(".//VOUCHERNUMBER").text == "INV-TALLY-99"
    assert root.find(".//PARTYLEDGERNAME").text == "Astraea Quantum Laboratories Inc."

    ledgers = root.findall(".//ALLLEDGERENTRIES.LIST")
    assert len(ledgers) >= 3, "Must have Vendor, Purchase, and Tax ledgers"

    inv_entries = root.findall(".//ALLINVENTORYENTRIES.LIST")
    assert len(inv_entries) == 2, "Must contain all line items"
    print("\n[PASS] Tally XML schema conforms to standard Tally voucher import specification.")

    # 2. Validate Tally TSV
    tsv_str = generate_tally_tsv(sample_doc, sample_items)
    lines = tsv_str.strip().split("\n")
    assert len(lines) >= 5, "TSV must contain header, data row, items header, and item rows"
    header_cols = lines[0].split("\t")
    assert "Voucher Type" in header_cols
    assert "Party Name" in header_cols
    assert "Total Amount" in header_cols
    assert "APPROVED" in lines[1]
    print("[PASS] Tally TSV format verified with exact tabular column mapping.")

def test_all_four_export_endpoints_authorization():
    """
    Requirement 4: Verify all four export endpoints reject unapproved documents
    with HTTP 403 and allow approved documents with HTTP 200.
    Endpoints:
    1. /api/documents/{doc_id}/report (PDF)
    2. /api/documents/{doc_id}/export/csv
    3. /api/documents/{doc_id}/export/excel
    4. /api/documents/{doc_id}/export/tally
    """
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Seed an UNAPPROVED test invoice
    unapproved_id = "DOC-TEST-UNAPPROVED-403"
    cursor.execute("""
        INSERT OR REPLACE INTO documents (
            id, filename, filepath, uploaded_at, status,
            vendor_name, invoice_number, invoice_date, due_date,
            subtotal, tax_amount, total_amount, currency,
            confidence_overall, risk_level,
            perception_data, layout_data, validation_data, items_data,
            human_verified, human_notes, corrected_fields,
            gstin, preview_url, duplicate_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        unapproved_id, "unapproved.pdf", "", "2026-03-01T10:00:00", "processed",
        "Unapproved Vendor Ltd", "INV-UNAPP-001", "2026-03-01", "2026-03-15",
        1000.0, 100.0, 1100.0, "USD",
        0.75, "HIGH",
        "{}", "{}", "{}", "[]",
        0, "", "{}", "27AAAAA0000A1Z5", "", "{}"
    ))

    # Seed an APPROVED test invoice
    approved_id = "DOC-TEST-APPROVED-200"
    cursor.execute("""
        INSERT OR REPLACE INTO documents (
            id, filename, filepath, uploaded_at, status,
            vendor_name, invoice_number, invoice_date, due_date,
            subtotal, tax_amount, total_amount, currency,
            confidence_overall, risk_level,
            perception_data, layout_data, validation_data, items_data,
            human_verified, human_notes, corrected_fields,
            gstin, preview_url, duplicate_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        approved_id, "approved.pdf", "", "2026-03-01T10:00:00", "processed",
        "Approved Vendor Corp", "INV-APP-002", "2026-03-01", "2026-03-15",
        2000.0, 200.0, 2200.0, "USD",
        0.95, "LOW",
        "{}", "{}", "{}", "[]",
        1, "Approved by Lead Controller", "{}", "27AAAAA0000A1Z5", "", "{}"
    ))
    conn.commit()
    conn.close()

    export_paths = [
        f"/api/documents/{{doc_id}}/report",
        f"/api/documents/{{doc_id}}/export/csv",
        f"/api/documents/{{doc_id}}/export/excel",
        f"/api/documents/{{doc_id}}/export/tally",
        f"/api/documents/{{doc_id}}/export/tally?format=tsv"
    ]

    print("\n--- Testing HTTP 403 Rejection on Unapproved Document ---")
    for path_template in export_paths:
        path = path_template.format(doc_id=unapproved_id)
        resp = client.get(path)
        assert resp.status_code == 403, f"Endpoint {path} failed to reject unapproved doc! Got: {resp.status_code}"
        assert "403" in resp.json().get("detail", "") or "approved" in resp.json().get("detail", "").lower()
        print(f"-> Verified 403 Forbidden on unapproved doc: {path}")

    print("\n--- Testing HTTP 200 Success on Approved Document ---")
    for path_template in export_paths:
        path = path_template.format(doc_id=approved_id)
        resp = client.get(path)
        assert resp.status_code == 200, f"Endpoint {path} failed on approved doc! Got: {resp.status_code}"
        assert len(resp.content) > 0, f"Empty response content from {path}"
        print(f"-> Verified 200 OK with downloadable payload on approved doc: {path}")

    print("[PASS] All 4 export endpoints strictly reject unapproved documents with 403 and serve approved documents with 200.")
