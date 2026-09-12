import re
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple

MONTH_MAP = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12
}

def parse_relative_time(query: str, ref_date: Optional[datetime] = None) -> Optional[Dict[str, str]]:
    """
    Parses natural language relative or month-based time expressions.
    Our synthetic dataset spans 2026-01-10 to 2026-07-10.
    Default reference date is mid-chat context (e.g. 2026-07-10).
    Returns dict with ISO strings {'start': '...', 'end': '...'} or None.
    """
    if not ref_date:
        ref_date = datetime(2026, 7, 10, 23, 59, 59)
        
    query_lower = query.lower()
    
    # Month search (e.g., "in January", "around February", "in March 2026")
    for month_name, month_num in MONTH_MAP.items():
        if month_name in query_lower:
            start_dt = datetime(2026, month_num, 1, 0, 0, 0)
            if month_num == 12:
                end_dt = datetime(2026, 12, 31, 23, 59, 59)
            else:
                next_month = datetime(2026, month_num + 1, 1, 0, 0, 0)
                end_dt = next_month - timedelta(seconds=1)
            return {
                "start": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                "end": end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                "label": month_name.capitalize()
            }

    # "last month" (If ref_date is July 2026, last month is June 2026)
    if "last month" in query_lower or "previous month" in query_lower:
        first_of_curr = datetime(ref_date.year, ref_date.month, 1)
        last_month_end = first_of_curr - timedelta(seconds=1)
        last_month_start = datetime(last_month_end.year, last_month_end.month, 1)
        return {
            "start": last_month_start.strftime("%Y-%m-%dT%H:%M:%S"),
            "end": last_month_end.strftime("%Y-%m-%dT%H:%M:%S"),
            "label": "Last Month"
        }
        
    # "last week"
    if "last week" in query_lower:
        end_dt = ref_date
        start_dt = ref_date - timedelta(days=7)
        return {
            "start": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "end": end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "label": "Last Week"
        }
        
    # "yesterday"
    if "yesterday" in query_lower:
        yesterday = ref_date - timedelta(days=1)
        start_dt = datetime(yesterday.year, yesterday.month, yesterday.day, 0, 0, 0)
        end_dt = datetime(yesterday.year, yesterday.month, yesterday.day, 23, 59, 59)
        return {
            "start": start_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "end": end_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "label": "Yesterday"
        }
        
    # "early in the chat" or "beginning"
    if "early" in query_lower or "beginning" in query_lower or "start" in query_lower:
        return {
            "start": "2026-01-10T00:00:00",
            "end": "2026-01-31T23:59:59",
            "label": "Early Chat (Jan)"
        }
        
    return None
