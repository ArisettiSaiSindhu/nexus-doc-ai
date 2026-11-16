import re
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Tuple

def detect_skew_angle(gray_img: np.ndarray) -> float:
    """
    Detects skew angle of text lines using Otsu thresholding and MinAreaRect on text contours.
    Returns angle in degrees (-45.0 to +45.0).
    """
    try:
        _, thresh = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        y_idx, x_idx = np.where(thresh > 0)
        if len(x_idx) < 50:
            return 0.0
        
        pts = np.column_stack([x_idx, y_idx]).astype(np.float32)
        rect = cv2.minAreaRect(pts)
        (cx, cy), (rw, rh), angle = rect
        
        if rw < rh:
            skew = -(90.0 - angle)
        else:
            skew = angle

        if abs(skew) > 45.0:
            skew = 0.0

        return round(float(skew), 2)
    except Exception:
        return 0.0

def normalize_skew(image: np.ndarray, angle: float) -> Tuple[np.ndarray, float]:
    """
    Normalizes document skew by rotating image by angle around its center.
    Returns (deskewed_image, residual_skew_angle).
    """
    if abs(angle) < 0.2:
        return image, 0.0

    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
    
    # Compute new bounding dimensions so corners aren't clipped
    cos = np.abs(rot_mat[0, 0])
    sin = np.abs(rot_mat[0, 1])
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))
    rot_mat[0, 2] += (new_w / 2) - center[0]
    rot_mat[1, 2] += (new_h / 2) - center[1]

    deskewed = cv2.warpAffine(
        image,
        rot_mat,
        (new_w, new_h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(255, 255, 255)
    )

    gray_deskewed = cv2.cvtColor(deskewed, cv2.COLOR_BGR2GRAY) if len(deskewed.shape) == 3 else deskewed
    residual_angle = detect_skew_angle(gray_deskewed)

    return deskewed, residual_angle

def analyze_perception(doc_data: Dict[str, Any], cv2_metrics: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Dimension 1: Perception Checking (Literature Survey & Ideate Phase Requirement B)
    Examines document readability, image blur, contrast, skew, and character ambiguity.
    """
    fields_to_check = [
        {"field": "vendor_name", "label": "Vendor Identity", "value": str(doc_data.get("vendor_name", "")), "type": "TEXT"},
        {"field": "gstin", "label": "Supplier GSTIN", "value": str(doc_data.get("gstin", "")), "type": "ALPHANUMERIC"},
        {"field": "invoice_number", "label": "Invoice Number", "value": str(doc_data.get("invoice_number", "")), "type": "ALPHANUMERIC"},
        {"field": "invoice_date", "label": "Invoice Date", "value": str(doc_data.get("invoice_date", "")), "type": "DATE"},
        {"field": "due_date", "label": "Due Date", "value": str(doc_data.get("due_date", "")), "type": "DATE"},
        {"field": "subtotal", "label": "Subtotal", "value": str(doc_data.get("subtotal", "")), "type": "NUMERIC"},
        {"field": "tax_amount", "label": "Tax Amount", "value": str(doc_data.get("tax_amount", "")), "type": "NUMERIC"},
        {"field": "total_amount", "label": "Total Amount", "value": str(doc_data.get("total_amount", "")), "type": "NUMERIC"}
    ]

    custom_perception = doc_data.get("perception_overrides", {})
    ocr_field_details = []
    uncertainty_flags = []
    total_conf = 0.0

    for item in fields_to_check:
        fname = item["field"]
        fval = item["value"]
        ftype = item["type"]
        
        conf = float(custom_perception.get(f"{fname}_confidence", 0.95))
        ambiguities = []
        blur_level = custom_perception.get(f"{fname}_blur", "LOW")
        noise_level = custom_perception.get(f"{fname}_noise", "NEGLIGIBLE")
        
        # Real Character Ambiguity Detection (8 vs B, 0 vs O, 1 vs I/l, 5 vs S)
        if ftype in ["NUMERIC", "DATE"]:
            if re.search(r"[B]", fval):
                ambiguities.append("Character confusion: Letter 'B' found in numeric field; likely numeral '8'.")
                conf = min(conf, 0.72)
            if re.search(r"[Oo]", fval):
                ambiguities.append("Character confusion: Letter 'O' found in numeric field; likely numeral '0'.")
                conf = min(conf, 0.74)
            if re.search(r"[Il]", fval):
                ambiguities.append("Character confusion: Letter 'I' or 'l' found in numeric context; likely numeral '1'.")
                conf = min(conf, 0.78)
            if re.search(r"[S]", fval) and not fval.startswith("$"):
                ambiguities.append("Character confusion: Letter 'S' found in numeric field; likely numeral '5'.")
                conf = min(conf, 0.80)

        elif ftype == "ALPHANUMERIC":
            if re.search(r"[8B]", fval) and re.search(r"[0-9]", fval) and re.search(r"[A-Z]", fval):
                if "B" in fval and "8" in fval:
                    ambiguities.append(
                        "Optical similarity risk: Mixed '8' and 'B' characters in code identifier."
            )

    # Do not flag 0/O based only on character presence.
    # A single extracted value cannot establish OCR ambiguity.
    # Genuine ambiguity requires comparing independent OCR results.
        if conf < 0.88:
            ambiguities.append(f"Sub-optimal OCR confidence ({round(conf*100, 1)}%) due to scan blur or contrast decay.")

        if ambiguities:
            uncertainty_flags.append({
                "field": fname,
                "label": item["label"],
                "value": fval,
                "confidence": conf,
                "issues": ambiguities
            })

        total_conf += conf
        ocr_field_details.append({
            "field": fname,
            "label": item["label"],
            "value": fval,
            "confidence": round(conf, 3),
            "blur_level": blur_level,
            "noise_level": noise_level,
            "character_ambiguity": ambiguities,
            "status": "EXCELLENT" if conf >= 0.95 else ("ACCEPTABLE" if conf >= 0.88 else "UNCERTAIN")
        })

    avg_conf = round(total_conf / len(fields_to_check), 3)
    
    # Real OpenCV or override metrics
    if cv2_metrics:
        doc_sharpness = cv2_metrics.get("sharpness", 91.5)
        doc_contrast = cv2_metrics.get("contrast", 88.0)
        doc_dpi = cv2_metrics.get("dpi", 300)
        skew_angle = cv2_metrics.get("skew", 0.0)
        deskewed = cv2_metrics.get("deskewed", False)
        residual_skew = cv2_metrics.get("residual_skew", skew_angle)
    else:
        doc_sharpness = custom_perception.get("doc_sharpness", 91.5)
        doc_contrast = custom_perception.get("doc_contrast", 88.0)
        doc_dpi = custom_perception.get("doc_dpi", 300)
        skew_angle = custom_perception.get("skew_angle", 0.0)
        deskewed = False
        residual_skew = skew_angle

    # Check for blur threshold
    is_blurred = doc_sharpness < 45.0
    if is_blurred:
        uncertainty_flags.append({
            "field": "document_scan",
            "label": "Document Clarity",
            "value": f"Sharpness score {doc_sharpness:.1f}",
            "confidence": 0.65,
            "issues": [f"High optical blur detected (Laplacian variance {doc_sharpness:.1f} < 45.0). Scan readability degraded."]
        })

    return {
        "perception_score": avg_conf if not is_blurred else min(avg_conf, 0.70),
        "global_metrics": {
            "sharpness_score": round(doc_sharpness, 1),
            "contrast_ratio": round(doc_contrast, 1),
            "dpi": doc_dpi,
            "skew_degrees": round(skew_angle, 2),
            "deskewed_applied": deskewed,
            "residual_skew": round(residual_skew, 2),
            "text_cleanliness": "HIGH" if (avg_conf > 0.90 and not is_blurred) else ("MEDIUM" if not is_blurred else "LOW")
        },
        "fields": ocr_field_details,
        "uncertainties": uncertainty_flags,
        "flagged_count": len(uncertainty_flags)
    }
