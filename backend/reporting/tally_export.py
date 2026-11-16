import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import Dict, Any, List
import io
import re

def clean_xml_text(val: Any) -> str:
    """Escapes and sanitizes string values for Tally XML schema."""
    if val is None:
        return ""
    text = str(val).strip()
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")

def generate_tally_xml(doc: Dict[str, Any], items: List[Dict[str, Any]]) -> str:
    """
    Generates genuine Tally XML for accounting voucher import (Tally Prime / Tally.ERP 9).
    Follows standard Tally XML schema: ENVELOPE -> HEADER -> BODY -> IMPORTDATA -> REQUESTDATA -> VOUCHER.
    Target Voucher Type: Purchase (with party credit ledger, purchase debit ledger, and tax ledger).
    """
    raw_date = doc.get("invoice_date") or "2026-01-01"
    # Format YYYYMMDD for Tally
    date_clean = re.sub(r"[^0-9]", "", str(raw_date))
    if len(date_clean) != 8:
        date_clean = "20260101"

    inv_num = clean_xml_text(doc.get("invoice_number") or "INV-UNKNOWN")
    vendor_name = clean_xml_text(doc.get("vendor_name") or "Sundry Creditors")
    gstin = clean_xml_text(doc.get("gstin") or "")
    total_amt = float(doc.get("total_amount") or 0.0)
    subtotal = float(doc.get("subtotal") or 0.0)
    tax_amt = float(doc.get("tax_amount") or 0.0)

    # Build XML
    envelope = ET.Element("ENVELOPE")
    header = ET.SubElement(envelope, "HEADER")
    ET.SubElement(header, "TALLYREQUEST").text = "Import Data"

    body = ET.SubElement(envelope, "BODY")
    import_data = ET.SubElement(body, "IMPORTDATA")
    
    req_desc = ET.SubElement(import_data, "REQUESTDESC")
    ET.SubElement(req_desc, "REPORTNAME").text = "Vouchers"
    static_vars = ET.SubElement(req_desc, "STATICVARIABLES")
    ET.SubElement(static_vars, "SVCURRENTCOMPANY").text = "##SVCURRENTCOMPANY"

    req_data = ET.SubElement(import_data, "REQUESTDATA")
    tally_msg = ET.SubElement(req_data, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"})

    voucher = ET.SubElement(tally_msg, "VOUCHER", {
        "VCHTYPE": "Purchase",
        "ACTION": "Create",
        "OBJVIEW": "Accounting Voucher View"
    })

    ET.SubElement(voucher, "DATE").text = date_clean
    ET.SubElement(voucher, "VOUCHERTYPENAME").text = "Purchase"
    ET.SubElement(voucher, "VOUCHERNUMBER").text = inv_num
    ET.SubElement(voucher, "REFERENCE").text = inv_num
    ET.SubElement(voucher, "REFERENCEDATE").text = date_clean
    ET.SubElement(voucher, "PARTYLEDGERNAME").text = vendor_name
    if gstin:
        ET.SubElement(voucher, "PARTYGSTIN").text = gstin
    ET.SubElement(voucher, "PERSISTEDVIEW").text = "Accounting Voucher View"
    ET.SubElement(voucher, "ISINVOICE").text = "Yes"

    # Ledger 1: Vendor (Credit entry, DeemedPositive = No)
    leg_vendor = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
    ET.SubElement(leg_vendor, "LEDGERNAME").text = vendor_name
    ET.SubElement(leg_vendor, "ISDEEMEDPOSITIVE").text = "No"
    ET.SubElement(leg_vendor, "AMOUNT").text = f"{total_amt:.2f}"

    # Ledger 2: Purchase Account (Debit entry, DeemedPositive = Yes, negative sign in Tally)
    leg_pur = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
    ET.SubElement(leg_pur, "LEDGERNAME").text = "Purchase Account"
    ET.SubElement(leg_pur, "ISDEEMEDPOSITIVE").text = "Yes"
    ET.SubElement(leg_pur, "AMOUNT").text = f"-{subtotal:.2f}"

    # Ledger 3: Input Tax (Debit entry, DeemedPositive = Yes)
    if tax_amt > 0:
        leg_tax = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(leg_tax, "LEDGERNAME").text = "Input Tax Account"
        ET.SubElement(leg_tax, "ISDEEMEDPOSITIVE").text = "Yes"
        ET.SubElement(leg_tax, "AMOUNT").text = f"-{tax_amt:.2f}"

    # Inventory line items (if present)
    for it in items:
        desc = clean_xml_text(it.get("description") or "Inventory Item")
        qty = float(it.get("quantity") or 1.0)
        rate = float(it.get("unit_price") or 0.0)
        line_tot = float(it.get("total") or (qty * rate))

        inv_entry = ET.SubElement(voucher, "ALLINVENTORYENTRIES.LIST")
        ET.SubElement(inv_entry, "STOCKITEMNAME").text = desc
        ET.SubElement(inv_entry, "ISDEEMEDPOSITIVE").text = "Yes"
        ET.SubElement(inv_entry, "RATE").text = f"{rate:.2f}/nos"
        ET.SubElement(inv_entry, "ACTUALQTY").text = f"{qty:.0f} nos"
        ET.SubElement(inv_entry, "BILLEDQTY").text = f"{qty:.0f} nos"
        ET.SubElement(inv_entry, "AMOUNT").text = f"-{line_tot:.2f}"

    xml_str = ET.tostring(envelope, encoding="utf-8")
    parsed = minidom.parseString(xml_str)
    return parsed.toprettyxml(indent="  ")

def generate_tally_tsv(doc: Dict[str, Any], items: List[Dict[str, Any]]) -> str:
    """
    Generates genuine Tally-compatible TSV (Tab-Separated Values) format
    for Tally Prime 4.0+ Excel/CSV/TSV Import wizard.
    """
    lines = []
    # Header block
    lines.append("\t".join([
        "Voucher Type", "Voucher Number", "Invoice Date", "Party Name", "GSTIN",
        "Subtotal", "Tax Amount", "Total Amount", "Currency", "Approval Status", "Verification Method"
    ]))
    lines.append("\t".join([
        "Purchase",
        str(doc.get("invoice_number", "")),
        str(doc.get("invoice_date", "")),
        str(doc.get("vendor_name", "")),
        str(doc.get("gstin", "")),
        f"{float(doc.get('subtotal') or 0.0):.2f}",
        f"{float(doc.get('tax_amount') or 0.0):.2f}",
        f"{float(doc.get('total_amount') or 0.0):.2f}",
        str(doc.get("currency", "USD")),
        "APPROVED" if doc.get("human_verified") else "UNAPPROVED",
        "Deterministic Constraints + Human Review"
    ]))
    lines.append("")
    # Inventory items block
    lines.append("\t".join(["Item Description", "Billed Quantity", "Unit Rate", "Item Amount"]))
    for it in items:
        lines.append("\t".join([
            str(it.get("description", "")),
            str(it.get("quantity", "")),
            f"{float(it.get('unit_price') or 0.0):.2f}",
            f"{float(it.get('total') or 0.0):.2f}"
        ]))
    return "\n".join(lines)
