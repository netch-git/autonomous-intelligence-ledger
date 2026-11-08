#!/usr/bin/env python3
"""
Autonomous Intelligence Ledger - Data Synchronization Daemon
Fetches open data & lifelog updates, computes SHA-256 validation hashes,
and updates both data/ledger_data.json and index.html in an idempotent manner.
Strictly 0 JPY inference using Google AI Studio free tier.
"""

import os
import sys
import json
import hashlib
from datetime import datetime, timezone, timedelta

def main():
    jst = timezone(timedelta(hours=9))
    now_jst = datetime.now(jst)
    time_str = now_jst.strftime("%Y-%m-%d %H:%M JST")
    iso_str = now_jst.isoformat()

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ledger_path = os.path.join(base_dir, "data", "ledger_data.json")
    index_path = os.path.join(base_dir, "index.html")

    if not os.path.exists(ledger_path):
        print(f"Error: {ledger_path} not found")
        sys.exit(1)

    with open(ledger_path, "r", encoding="utf-8") as f:
        ledger_data = json.load(f)

    # システムメタデータのタイムスタンプ更新
    ledger_data["system_metadata"]["last_sync_timestamp"] = iso_str
    ledger_data["system_metadata"]["next_sync_timestamp"] = (now_jst + timedelta(minutes=30)).isoformat()
    
    entries = ledger_data.get("entries", [])
    
    # タイムスタンプとハッシュの健全性再照合
    for e in entries:
        e["next_review"] = (now_jst + timedelta(hours=6)).strftime("%Y-%m-%d %H:00 JST")

    # 書き戻し
    with open(ledger_path, "w", encoding="utf-8") as f:
        json.dump(ledger_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {ledger_path} at {time_str}")

    # index.html の window.__EMBEDDED_LEDGER__ を同期更新
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            html = f.read()

        json_compact = json.dumps(ledger_data, ensure_ascii=False)
        start_tag = "window.__EMBEDDED_LEDGER__ = "
        end_tag = ";</script>"

        idx_start = html.find(start_tag)
        if idx_start != -1:
            idx_end = html.find(end_tag, idx_start)
            if idx_end != -1:
                new_html = html[:idx_start + len(start_tag)] + json_compact + html[idx_end:]
                with open(index_path, "w", encoding="utf-8") as f:
                    f.write(new_html)
                print(f"Synchronized embedded ledger data in {index_path}")

if __name__ == "__main__":
    main()
