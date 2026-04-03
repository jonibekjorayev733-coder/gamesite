#!/usr/bin/env python3
"""Test JSON serialization of endpoint response"""

import json
import sys
sys.path.insert(0, "c:\\react Jonibek\\new04\\gamesite\\backend")

from main import get_all_games_with_tests

result = get_all_games_with_tests()

# Try to serialize
try:
    json_str = json.dumps(result)
    print(f"✓ JSON serialization OK: {len(json_str)} bytes")
except Exception as e:
    print(f"❌ JSON serialization error: {e}")
    import traceback
    traceback.print_exc()
