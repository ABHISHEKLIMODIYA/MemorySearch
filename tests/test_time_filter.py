import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from app.services.time_parser import parse_relative_time

def test_parse_months():
    res = parse_relative_time("What did we discuss in January?")
    assert res is not None
    assert "2026-01-01" in res["start"]
    assert "2026-01-31" in res["end"]

    res_feb = parse_relative_time("around February")
    assert res_feb is not None
    assert "2026-02-01" in res_feb["start"]

def test_parse_last_month():
    res = parse_relative_time("What did Priya say last month?")
    assert res is not None
    assert res["label"] == "Last Month"
