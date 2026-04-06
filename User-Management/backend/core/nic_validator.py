import re
from typing import Any, Dict, Optional

# Sri Lanka NIC patterns
# Old format: 9 digits + V or X (e.g. 892345678V)
# New format: 12 digits (e.g. 199023400123)
OLD_NIC_PATTERN = re.compile(r"\b\d{9}[VvXx]\b", re.IGNORECASE)
NEW_NIC_PATTERN = re.compile(r"\b(19|20)\d{10}\b")


def extract_nic_from_text(text: str) -> list[str]:
    old_matches = OLD_NIC_PATTERN.findall(text)
    new_matches = NEW_NIC_PATTERN.findall(text)
    return old_matches + new_matches


def validate_nic(nic: str) -> bool:
    clean = nic.strip().upper()

    # Old format: 892345678V
    if re.match(r"^\d{9}[VX]$", clean):
        year = int(clean[:2])
        days = int(clean[2:5])
        if days < 1 or (days > 366 and days < 501) or days > 866:
            return False
        return True

    # New format: 199023400123
    if re.match(r"^(19|20)\d{10}$", clean):
        year = int(clean[:4])
        days = int(clean[4:7])
        if year < 1900 or year > 2026:  # Adjust year as needed
            return False
        if days < 1 or (days > 366 and days < 501) or days > 866:
            return False
        return True

    return False


def validate_nic_text(text: str) -> Dict[str, Any]:
    found = extract_nic_from_text(text)
    valid_nics = [nic for nic in found if validate_nic(nic)]

    is_valid = len(valid_nics) > 0
    nic_number = valid_nics[0] if valid_nics else None

    return {
        "is_valid": is_valid,
        "nic_number": nic_number,
        "raw_text": text,
    }
